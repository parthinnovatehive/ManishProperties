"use client";

import { useEffect, useState } from "react";
import { ProfileCard } from "@/components/agent/ProfileCard";
import { estateApi } from "@/lib/api";
import { AgentRatingDisplay } from "@/components/ui/AgentRatingDisplay";
import { X, Sparkles, Award, ShieldCheck, CheckCircle2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAdminData } from "@/lib/utils/token";

interface AgentProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  rating?: number;
  totalRatings?: number;
  deals?: number;
  experience?: string;
  city?: string;
  joinedDate?: string;
  avatar?: string;
}

interface Subarea {
  id: string;
  name: string;
  city_id: string;
  agent_ids: string[];
  status: string;
  slug: string;
}

interface City {
  id: string;
  name: string;
  admin_id: string | null;
  status: string;
}

interface Property {
  id: string;
  title: string;
  status: string;
  lister_id: string;
  lister_type: string;
}

interface Appointment {
  id: string;
  agentId: string;
  status: string;
}

export default function AgentProfilePage() {
  const account = getAdminData();
  const [profile, setProfile] = useState<AgentProfile>({
    id: account?.id || "",
    name: account?.name || account?.username || "",
    email: account?.email || account?.username || "",
    phone: account?.phone || "",
    role: account?.role || "AGENT",
    status: account?.status || "active",
    rating: 0,
    totalRatings: 0,
    deals: 0,
    experience: "",
    city: "",
    joinedDate: "",
  });

  const [propertiesCount, setPropertiesCount] = useState(0);
  const [appointmentsCount, setAppointmentsCount] = useState(0);
  const [completedDeals, setCompletedDeals] = useState(0);
  const [assignedSubareas, setAssignedSubareas] = useState<Subarea[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formState, setFormState] = useState({ ...profile });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      // Get current agent ID
      let storedUser = localStorage.getItem("userData");
      let agentId = null;

      if (!storedUser) {
        storedUser = localStorage.getItem("adminData");
      }

      if (storedUser) {
        const userData = JSON.parse(storedUser);
        agentId = userData.id;
        
        // Update profile with stored data
        setProfile(prev => ({
          ...prev,
          id: userData.id,
          name: userData.name || prev.name,
          email: userData.email || prev.email,
          phone: userData.phone || prev.phone,
        }));
        setFormState(prev => ({
          ...prev,
          id: userData.id,
          name: userData.name || prev.name,
          email: userData.email || prev.email,
          phone: userData.phone || prev.phone,
        }));
      }

      if (!agentId) {
        setLoading(false);
        return;
      }

      // Fetch cities
      const allCities = await estateApi.cities.list<City>();
      setCities(allCities);

      // Fetch subareas and filter by agent_ids
      const allSubareas = await estateApi.content.subareas.list();
      const agentSubareas = allSubareas.filter(
        (s: Subarea) => s.agent_ids?.includes(agentId)
      );
      setAssignedSubareas(agentSubareas);

      // Get city name for the agent's assigned city
      if (agentSubareas.length > 0) {
        const firstCity = allCities.find(c => c.id === agentSubareas[0].city_id);
        if (firstCity && !profile.city) {
          setProfile(prev => ({ ...prev, city: firstCity.name }));
          setFormState(prev => ({ ...prev, city: firstCity.name }));
        }
      }

      // Fetch properties to count agent's listings
      const allProperties = await estateApi.adminProperties.list();
      const agentProperties = allProperties.filter(
        (p: Property) => p.lister_id === agentId && p.lister_type === "agent"
      );
      setPropertiesCount(agentProperties.length);
      
      // Calculate deals (completed/approved properties)
      const completedProps = agentProperties.filter(
        (p: Property) => p.status === "APPROVED" || p.status === "Active"
      ).length;
      setCompletedDeals(completedProps);
      setProfile(prev => ({ ...prev, deals: completedProps }));

      // Fetch appointments to count completed meetings
      const allAppointments = await estateApi.appointments.list();
      const agentAppointments = allAppointments.filter(
        (a: Appointment) => a.agentId === agentId
      );
      setAppointmentsCount(agentAppointments.length);

      // Compute real rating from all users' agentRatings
      let totalRatingSum = 0;
      let totalRatingCount = 0;
      const agentEmail = profile.email || account?.email || "";
      const allUsers = await estateApi.users.list<any>().catch(async () => {
        // Fallback: fetch each user who had a completed appointment with this agent
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
    return city?.name || "Unknown City";
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Update profile in the backend
      await estateApi.agents.update(profile.id, {
        name: formState.name,
        phone: formState.phone,
        city: formState.city,
        experience: formState.experience,
      });
      
      setProfile(formState);
      setShowEditModal(false);
      
      // Update localStorage
      const storedUser = localStorage.getItem("userData") || localStorage.getItem("adminData");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        userData.name = formState.name;
        userData.phone = formState.phone;
        localStorage.setItem("adminData", JSON.stringify(userData));
        localStorage.setItem("userData", JSON.stringify(userData));
      }
      
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-estate-navy">Loading profile data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-estate-navy tracking-tight font-serif">
          Agent Profile
        </h1>
        <p className="text-sm font-semibold text-estate-text-sec mt-1">
          Review your biography details, statistics, operating regions, and credentials.
        </p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Profile Card and Overview details */}
        <div className="lg:col-span-2 space-y-6">
          <ProfileCard 
            profile={{
              name: profile.name,
              email: profile.email,
              phone: profile.phone,
              city: profile.city,
              experience: profile.experience,
              propertiesCount: propertiesCount,
              rating: profile.rating || 0,
              totalRatings: profile.totalRatings,
              dealsCount: completedDeals,
            }} 
            onEditClick={() => setShowEditModal(true)} 
          />

          {/* About Bio Section */}
          <div className="bg-white border border-estate-border/80 rounded-[20px] p-6 shadow-estate space-y-4">
            <h3 className="font-extrabold text-lg text-estate-navy font-serif">Biography Overview</h3>
            <p className="text-xs font-semibold leading-relaxed text-estate-text-sec bg-estate-surface/30 p-4 rounded-xl border border-estate-border/40">
              {profile.name} has successfully listed and managed {propertiesCount} properties on Manish Properties.
              {completedDeals > 0 && ` With ${completedDeals} completed deals and a rating of ${profile.rating || 0} out of 5${profile.totalRatings ? ` (${profile.totalRatings} reviews)` : ""}, this agent has demonstrated excellence in real estate services.`}
              {profile.city && ` Operating primarily in ${profile.city},`} {profile.name} is dedicated to providing exceptional service to clients.
            </p>
          </div>

          {/* Assigned Subareas Section */}
          <div className="bg-white border border-estate-border/80 rounded-[20px] p-6 shadow-estate space-y-4">
            <h3 className="font-extrabold text-lg text-estate-navy font-serif">Assigned Subareas</h3>
            {assignedSubareas.length === 0 ? (
              <p className="text-xs text-estate-muted italic">No subareas assigned yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {assignedSubareas.map((subarea) => (
                  <div
                    key={subarea.id}
                    className="flex items-center gap-3 p-3 bg-estate-surface/40 rounded-xl border border-estate-border/30 hover:bg-estate-surface/60 transition"
                  >
                    <div className="p-2 bg-estate-blue-pale rounded-lg text-estate-navy-light flex-shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-estate-navy block">{subarea.name}</span>
                      <span className="text-[10px] text-estate-text-sec font-semibold">
                        {getCityName(subarea.city_id)} • {subarea.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {assignedSubareas.length > 0 && (
              <p className="text-[10px] text-estate-muted mt-2">
                Total {assignedSubareas.length} {assignedSubareas.length === 1 ? "subarea" : "subareas"} assigned
              </p>
            )}
          </div>
        </div>

        {/* Right Col: Badges & Qualifications */}
        <div className="space-y-6">
          {/* Credentials list */}
          <div className="bg-white border border-estate-border/80 rounded-[20px] p-6 shadow-estate space-y-4">
            <h3 className="font-extrabold text-base text-estate-navy font-serif">Credentials & Badges</h3>
            <div className="space-y-4">
              <div className="flex gap-3 items-start p-3 bg-estate-surface/40 rounded-xl border border-estate-border/30">
                <div className="p-2 bg-estate-blue-pale rounded-lg text-estate-navy-light flex-shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-extrabold text-estate-navy block">Property Portfolio</span>
                  <span className="text-[10px] text-estate-text-sec font-semibold mt-0.5 block">
                    {propertiesCount} {propertiesCount === 1 ? "listing" : "listings"} managed
                  </span>
                </div>
              </div>

              <div className="flex gap-3 items-start p-3 bg-estate-surface/40 rounded-xl border border-estate-border/30">
                <div className="p-2 bg-estate-blue-pale rounded-lg text-estate-navy-light flex-shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-extrabold text-estate-navy block">Verified Agent Account</span>
                  <span className="text-[10px] text-estate-text-sec font-semibold mt-0.5 block">
                    {profile.status === "active" ? "Active and verified agent" : "Agent account active"}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 items-start p-3 bg-estate-surface/40 rounded-xl border border-estate-border/30">
                <div className="p-2 bg-estate-blue-pale rounded-lg text-estate-navy-light flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-extrabold text-estate-navy block">Performance Rating</span>
                  <span className="mt-1 block">
                    {profile.rating && profile.rating > 0 ? (
                      <AgentRatingDisplay rating={profile.rating} totalRatings={profile.totalRatings} />
                    ) : (
                      <span className="text-[10px] text-estate-text-sec font-semibold">Rating will appear after client reviews</span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {showEditModal && (
        <>
          <div
            onClick={() => setShowEditModal(false)}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity"
          />
          <div className="fixed inset-x-4 top-20 max-w-xl mx-auto bg-white z-50 rounded-2xl shadow-estate-lg border border-estate-border overflow-hidden animate-fade-up">
            <div className="p-5 border-b border-estate-border flex justify-between items-center bg-estate-surface/10">
              <h3 className="font-extrabold text-base text-estate-navy font-serif">Edit Profile Details</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 hover:bg-estate-surface rounded-lg transition"
              >
                <X className="w-5 h-5 text-estate-text-sec" />
              </button>
            </div>
            <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <label className="col-span-2">
                  <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block mb-1">
                    Agent Full Name
                  </span>
                  <input
                    type="text"
                    required
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    className="w-full p-2.5 border border-estate-border rounded-xl focus:border-estate-navy outline-none text-xs font-semibold focus:ring-4 focus:ring-estate-blue-pale/50"
                  />
                </label>

                <label>
                  <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block mb-1">
                    Email address
                  </span>
                  <input
                    type="email"
                    required
                    value={formState.email}
                    disabled
                    className="w-full p-2.5 border border-gray-200 bg-gray-50 rounded-xl text-xs font-semibold text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-[8px] text-estate-muted mt-1">Email cannot be changed</p>
                </label>

                <label>
                  <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block mb-1">
                    Phone Number
                  </span>
                  <input
                    type="tel"
                    required
                    value={formState.phone}
                    onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                    className="w-full p-2.5 border border-estate-border rounded-xl focus:border-estate-navy outline-none text-xs font-semibold focus:ring-4 focus:ring-estate-blue-pale/50"
                  />
                </label>

                <label>
                  <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block mb-1">
                    Operating City
                  </span>
                  <input
                    type="text"
                    value={formState.city}
                    onChange={(e) => setFormState({ ...formState, city: e.target.value })}
                    placeholder="e.g., Mumbai, Pune, Bangalore"
                    className="w-full p-2.5 border border-estate-border rounded-xl focus:border-estate-navy outline-none text-xs font-semibold focus:ring-4 focus:ring-estate-blue-pale/50"
                  />
                </label>

                <label>
                  <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block mb-1">
                    Years of Experience
                  </span>
                  <input
                    type="text"
                    value={formState.experience}
                    onChange={(e) => setFormState({ ...formState, experience: e.target.value })}
                    placeholder="e.g., 5+ years"
                    className="w-full p-2.5 border border-estate-border rounded-xl focus:border-estate-navy outline-none text-xs font-semibold focus:ring-4 focus:ring-estate-blue-pale/50"
                  />
                </label>
              </div>

              <div className="pt-4 border-t border-estate-border flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 border border-estate-border text-xs font-bold text-estate-text-sec hover:bg-estate-surface rounded-xl transition"
                >
                  Cancel
                </button>
                <Button variant="primary" size="sm" type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}