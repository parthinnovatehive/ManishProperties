"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ProfileCard } from "@/components/agent/ProfileCard";
import { ChangePasswordModal } from "@/components/agent/ChangePasswordModal";
import { RequestSubareaModal } from "@/components/agent/RequestSubareaModal";
import { estateApi } from "@/lib/api";
import { MapPin, Award, ShieldCheck, Star, KeyRound, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAdminData } from "@/lib/utils/token";
import { toast } from "sonner";

interface Subarea {
  id: string;
  name: string;
  city_id: string;
  agent_ids: string[];
  status: string;
}

interface City {
  id: string;
  name: string;
}

interface Property {
  id: string;
  status: string;
  lister_id: string;
  lister_type: string;
}

interface Appointment {
  id: string;
  agentId: string;
}

export default function AgentProfilePage() {
  const account = getAdminData();
  const [profile, setProfile] = useState({
    name: account?.name || account?.username || "",
    email: account?.email || account?.username || "",
    phone: account?.phone || "",
    status: account?.status || "ACTIVE",
    city: "",
    rating: 0,
    totalRatings: 0,
  });

  const [propertiesCount, setPropertiesCount] = useState(0);
  const [appointmentsCount, setAppointmentsCount] = useState(0);
  const [completedDeals, setCompletedDeals] = useState(0);
  const [assignedSubareas, setAssignedSubareas] = useState<Subarea[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSubareaModal, setShowSubareaModal] = useState(false);
  const [formState, setFormState] = useState({ name: "", phone: "", city: "" });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      let storedUser = localStorage.getItem("userData");
      let agentId = null;

      if (!storedUser) {
        storedUser = localStorage.getItem("adminData");
      }

      if (storedUser) {
        const userData = JSON.parse(storedUser);
        agentId = userData.id;
        setProfile(prev => ({
          ...prev,
          name: userData.name || prev.name,
          email: userData.email || prev.email,
          phone: userData.phone || prev.phone,
        }));
        setFormState({
          name: userData.name || "",
          phone: userData.phone || "",
          city: "",
        });
      }

      if (!agentId) {
        setLoading(false);
        return;
      }

      const allCities = await estateApi.cities.list<City>();
      setCities(allCities || []);

      const allSubareas = await estateApi.content.subareas.list<Subarea>();
      const agentSubareas = allSubareas.filter(
        (s) => s.agent_ids?.includes(agentId)
      );
      setAssignedSubareas(agentSubareas);

      if (agentSubareas.length > 0) {
        const firstCity = allCities.find(c => c.id === agentSubareas[0].city_id);
        if (firstCity) {
          setProfile(prev => ({ ...prev, city: firstCity.name }));
          setFormState(prev => ({ ...prev, city: firstCity.name }));
        }
      }

      const allProperties = await estateApi.adminProperties.list();
      const agentProperties = allProperties.filter(
        (p: Property) => p.lister_id === agentId && p.lister_type === "agent"
      );
      setPropertiesCount(agentProperties.length);

      const completedProps = agentProperties.filter(
        (p: Property) => p.status === "APPROVED"
      ).length;
      setCompletedDeals(completedProps);

      const allAppointments = await estateApi.appointments.list();
      const agentAppointments = allAppointments.filter(
        (a: Appointment) => a.agentId === agentId
      );
      setAppointmentsCount(agentAppointments.length);

      let totalRatingSum = 0;
      let totalRatingCount = 0;
      const agentEmail = profile.email || account?.email || "";
      const allUsers = await estateApi.users.list<any>().catch(async () => {
        const completedAppts = agentAppointments.filter((a: any) => a.status === "Completed");
        const uniqueUserIds = [...new Set(completedAppts.map((a: any) => a.userId).filter(Boolean))] as string[];
        const userRecords: any[] = [];
        for (const uid of uniqueUserIds) {
          try {
            const u = await estateApi.users.getById<any>(uid);
            userRecords.push(u);
          } catch { /* skip */ }
        }
        return userRecords;
      });
      for (const user of allUsers) {
        const ratings = (user as any).agentRatings;
        if (!ratings) continue;
        for (const entry of Object.values(ratings) as any[]) {
          if (entry?.agentEmail === agentEmail && entry?.rating) {
            totalRatingSum += Number(entry.rating);
            totalRatingCount++;
          }
        }
      }
      const avgRating = totalRatingCount > 0
        ? Math.round((totalRatingSum / totalRatingCount) * 10) / 10
        : 0;
      setProfile(prev => ({ ...prev, rating: avgRating, totalRatings: totalRatingCount }));

    } catch (error) {
      console.error("Error fetching profile data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCityName = (cityId: string): string => {
    const city = cities.find(c => c.id === cityId);
    return city?.name || "Unknown";
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const agentId = account?.id || profile.name;
      await estateApi.agents.update(agentId, {
        name: formState.name,
        phone: formState.phone,
        city: formState.city,
      });

      setProfile(prev => ({ ...prev, name: formState.name, phone: formState.phone, city: formState.city }));
      setShowEditModal(false);

      const storedUser = localStorage.getItem("userData") || localStorage.getItem("adminData");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        userData.name = formState.name;
        userData.phone = formState.phone;
        localStorage.setItem("adminData", JSON.stringify(userData));
        localStorage.setItem("userData", JSON.stringify(userData));
      }

      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const agentId = account?.id || "";

  const handleSubareaSuccess = () => {
    fetchProfileData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-estate-navy font-semibold animate-pulse">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-estate-navy tracking-tight font-serif">Agent Profile</h1>
        <p className="text-sm text-estate-text-sec mt-1">Manage your profile and account settings</p>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Profile Card */}
        <div className="lg:col-span-2 space-y-6">
          <ProfileCard
            profile={{
              name: profile.name,
              email: profile.email,
              phone: profile.phone,
              city: profile.city,
              status: profile.status,
              propertiesCount,
              rating: profile.rating,
              totalRatings: profile.totalRatings,
              dealsCount: completedDeals,
              appointmentsCount,
            }}
            onEditClick={() => setShowEditModal(true)}
          />

          {/* Performance & Achievements */}
          <div className="bg-white border border-estate-border/80 rounded-[20px] p-6 shadow-sm">
            <h3 className="font-extrabold text-lg text-estate-navy font-serif mb-4">Performance & Achievements</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 bg-estate-surface/40 rounded-xl border border-estate-border/30">
                <div className="p-2.5 bg-estate-blue-pale rounded-lg">
                  <Award className="w-5 h-5 text-estate-navy" />
                </div>
                <div>
                  <span className="text-sm font-bold text-estate-navy block">{propertiesCount}</span>
                  <span className="text-[10px] font-bold text-estate-muted uppercase tracking-wider">Properties Listed</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-estate-surface/40 rounded-xl border border-estate-border/30">
                <div className="p-2.5 bg-emerald-50 rounded-lg">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <span className="text-sm font-bold text-estate-navy block">{profile.status === "ACTIVE" || profile.status === "active" ? "Verified" : "Pending"}</span>
                  <span className="text-[10px] font-bold text-estate-muted uppercase tracking-wider">Account Status</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-estate-surface/40 rounded-xl border border-estate-border/30">
                <div className="p-2.5 bg-amber-50 rounded-lg">
                  <Star className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <span className="text-sm font-bold text-estate-navy block">{profile.rating > 0 ? profile.rating.toFixed(1) : "—"}</span>
                  <span className="text-[10px] font-bold text-estate-muted uppercase tracking-wider">Rating</span>
                </div>
              </div>
            </div>
          </div>

          {/* Assigned Subareas */}
          <div className="bg-white border border-estate-border/80 rounded-[20px] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-lg text-estate-navy font-serif">Assigned Subareas</h3>
              {/* <button
                onClick={() => setShowSubareaModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-estate-navy text-white text-xs font-bold rounded-lg hover:bg-estate-navy-mid transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Request New
              </button> */}
            </div>
            {assignedSubareas.length === 0 ? (
              <p className="text-sm text-estate-muted italic">No subareas assigned yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {assignedSubareas.map((subarea) => (
                  <span
                    key={subarea.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-estate-blue-pale text-estate-navy text-xs font-bold rounded-full border border-estate-border/40"
                  >
                    <MapPin className="w-3 h-3" />
                    {subarea.name}
                    <span className="text-[10px] text-estate-muted font-semibold ml-0.5">
                      {getCityName(subarea.city_id)}
                    </span>
                  </span>
                ))}
              </div>
            )}
            {assignedSubareas.length > 0 && (
              <p className="text-[11px] text-estate-muted mt-3 font-semibold">
                {assignedSubareas.length} subarea{assignedSubareas.length > 1 ? "s" : ""} assigned
              </p>
            )}
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white border border-estate-border/80 rounded-[20px] p-6 shadow-sm">
            <h3 className="font-extrabold text-base text-estate-navy font-serif mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => setShowEditModal(true)}
                className="w-full flex items-center gap-3 p-3.5 bg-estate-surface/40 rounded-xl border border-estate-border/30 hover:bg-estate-surface/60 transition text-left"
              >
                <div className="p-2 bg-estate-blue-pale rounded-lg">
                  <Star className="w-4 h-4 text-estate-navy" />
                </div>
                <div>
                  <span className="text-sm font-bold text-estate-navy block">Edit Profile</span>
                  <span className="text-[10px] text-estate-muted font-semibold">Update your details</span>
                </div>
              </button>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="w-full flex items-center gap-3 p-3.5 bg-estate-surface/40 rounded-xl border border-estate-border/30 hover:bg-estate-surface/60 transition text-left"
              >
                <div className="p-2 bg-amber-50 rounded-lg">
                  <KeyRound className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <span className="text-sm font-bold text-estate-navy block">Change Password</span>
                  <span className="text-[10px] text-estate-muted font-semibold">Reset your password</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && createPortal(
        <>
          <div onClick={() => setShowEditModal(false)} className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />
          <div className="fixed inset-x-4 top-20 max-w-lg mx-auto bg-white z-50 rounded-2xl shadow-estate-lg border border-estate-border overflow-hidden animate-fade-up">
            <div className="p-5 border-b border-estate-border flex justify-between items-center">
              <h3 className="font-extrabold text-base text-estate-navy font-serif">Edit Profile</h3>
              <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-estate-surface rounded-lg transition">
                <svg className="w-5 h-5 text-estate-text-sec" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block mb-1.5">Full Name</span>
                  <input
                    type="text"
                    required
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    className="w-full p-2.5 border border-estate-border rounded-xl focus:border-estate-navy outline-none text-sm font-semibold focus:ring-4 focus:ring-estate-blue-pale/50"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block mb-1.5">Email</span>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full p-2.5 border border-gray-200 bg-gray-50 rounded-xl text-sm font-semibold text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-[10px] text-estate-muted mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block mb-1.5">Phone Number</span>
                  <input
                    type="tel"
                    value={formState.phone}
                    onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                    className="w-full p-2.5 border border-estate-border rounded-xl focus:border-estate-navy outline-none text-sm font-semibold focus:ring-4 focus:ring-estate-blue-pale/50"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block mb-1.5">Operating City</span>
                  <input
                    type="text"
                    value={formState.city}
                    onChange={(e) => setFormState({ ...formState, city: e.target.value })}
                    placeholder="e.g. Mumbai, Pune"
                    className="w-full p-2.5 border border-estate-border rounded-xl focus:border-estate-navy outline-none text-sm font-semibold focus:ring-4 focus:ring-estate-blue-pale/50"
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-estate-border flex gap-3 justify-end">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2.5 border border-estate-border text-sm font-bold text-estate-text-sec hover:bg-estate-surface rounded-xl transition">
                  Cancel
                </button>
                <Button variant="primary" size="sm" type="submit">Save Changes</Button>
              </div>
            </form>
          </div>
        </>,
        document.body
      )}

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />

      {/* Request Subarea Modal */}
      <RequestSubareaModal
        isOpen={showSubareaModal}
        onClose={() => setShowSubareaModal(false)}
        onSuccess={handleSubareaSuccess}
        agentId={agentId}
        currentSubareaIds={assignedSubareas.map((s) => s.id)}
      />
    </div>
  );
}
