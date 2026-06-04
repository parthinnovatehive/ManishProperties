"use client";

import { useEffect, useState } from "react";
import { ProfileCard } from "@/components/agent/ProfileCard";
import { estateApi } from "@/lib/api";
import { X, Sparkles, Award, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAdminData } from "@/lib/utils/token";

export default function AgentProfilePage() {
  const account = getAdminData();
  const [profile, setProfile] = useState({
    name: account?.name || account?.username || "Agent",
    email: account?.email || account?.username || "",
    phone: account?.phone || "",
    city: "",
    experience: "",
    propertiesCount: 0,
    rating: 0,
    dealsCount: 0,
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [formState, setFormState] = useState({ ...profile });

  useEffect(() => {
    estateApi.adminProperties.list().then((properties) => {
      setProfile((current) => ({ ...current, propertiesCount: properties.length }));
      setFormState((current) => ({ ...current, propertiesCount: properties.length }));
    });
  }, []);

  // Handle Save profile form
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(formState);
    setShowEditModal(false);
  };

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
          <ProfileCard profile={profile} onEditClick={() => setShowEditModal(true)} />

          {/* About Bio Section */}
          <div className="bg-white border border-estate-border/80 rounded-[20px] p-6 shadow-estate space-y-4">
            <h3 className="font-extrabold text-lg text-estate-navy font-serif">Biography Overview</h3>
            <p className="text-xs font-semibold leading-relaxed text-estate-text-sec bg-estate-surface/30 p-4 rounded-xl border border-estate-border/40">
              {profile.name} has {profile.propertiesCount} properties currently connected to the EstateElite backend.
              Update this profile to add biography, operating regions, experience, and credential details.
            </p>
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
                    {profile.propertiesCount} listings loaded from the property API.
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
                    Role and identity are read from the authenticated backend session.
                  </span>
                </div>
              </div>

              <div className="flex gap-3 items-start p-3 bg-estate-surface/40 rounded-xl border border-estate-border/30">
                <div className="p-2 bg-estate-blue-pale rounded-lg text-estate-navy-light flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-extrabold text-estate-navy block">Profile Completion</span>
                  <span className="text-[10px] text-estate-text-sec font-semibold mt-0.5 block">
                    Add profile details to keep this account ready for client-facing workflows.
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
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    className="w-full p-2.5 border border-estate-border rounded-xl focus:border-estate-navy outline-none text-xs font-semibold focus:ring-4 focus:ring-estate-blue-pale/50"
                  />
                </label>

                <label>
                  <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block mb-1">
                    Phone Number
                  </span>
                  <input
                    type="text"
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
                    required
                    value={formState.city}
                    onChange={(e) => setFormState({ ...formState, city: e.target.value })}
                    className="w-full p-2.5 border border-estate-border rounded-xl focus:border-estate-navy outline-none text-xs font-semibold focus:ring-4 focus:ring-estate-blue-pale/50"
                  />
                </label>

                <label>
                  <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block mb-1">
                    Years of Experience
                  </span>
                  <input
                    type="text"
                    required
                    value={formState.experience}
                    onChange={(e) => setFormState({ ...formState, experience: e.target.value })}
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
