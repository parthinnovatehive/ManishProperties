"use client";

import { useEffect, useState } from "react";
import { estateApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { getAdminData } from "@/lib/utils/token";

export default function UserProfilePage() {
  const { email } = useAuth();
  const [accountId, setAccountId] = useState<string | null>(null);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    occupation: "",
    newsletter: true,
    notifications: true,
  });
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const account = getAdminData();
    setAccountId(account?.id || null);
    setProfile((current) => ({
      ...current,
      name: account?.name || "",
      email: account?.email || account?.username || email || "",
      phone: account?.phone || "",
    }));
  }, [email]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = event.target;
    const nextValue = type === "checkbox" ? event.target.checked : value;
    setProfile((current) => ({ ...current, [name]: nextValue }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!accountId) {
      setError("Unable to find the authenticated user profile.");
      return;
    }

    try {
      await estateApi.users.update(accountId, {
        name: profile.name,
        phone: profile.phone,
        location: profile.location,
        occupation: profile.occupation,
        newsletter: profile.newsletter,
        notifications: profile.notifications,
      } as any);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch {
      setError("Profile update failed. Please try again.");
    }
  };

  const initials = (profile.name || profile.email || "User").slice(0, 2).toUpperCase();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-estate-navy font-serif">Profile Settings</h1>
        <p className="text-sm text-estate-text-sec">Manage your account information from the backend profile record.</p>
      </div>

      <div className="bg-white rounded-2xl border border-estate-border shadow-estate p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {isSaved && (
            <div className="p-4 bg-estate-success-bg border border-estate-success/30 rounded-xl text-estate-success text-sm font-medium">
              Profile updated successfully.
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-estate-border">
            <div className="w-20 h-20 bg-estate-blue-pale text-estate-navy text-2xl font-bold rounded-full flex items-center justify-center border-2 border-estate-navy">
              {initials}
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-lg font-bold text-estate-text">{profile.name || "EstateElite User"}</h3>
              <p className="text-sm text-estate-text-sec">{profile.email}</p>
              <span className="inline-block mt-2 px-3 py-1 rounded-full bg-estate-blue-pale text-estate-navy text-xs font-semibold uppercase tracking-wider">
                User
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              ["name", "Full Name", "text", false],
              ["email", "Email Address", "email", true],
              ["phone", "Phone Number", "tel", false],
              ["location", "Location", "text", false],
              ["occupation", "Occupation", "text", false],
            ].map(([name, label, type, disabled]) => (
              <label key={String(name)} className="block">
                <span className="block text-sm font-semibold text-estate-text mb-2">{label}</span>
                <input
                  type={type as string}
                  name={name as string}
                  value={String(profile[name as keyof typeof profile] || "")}
                  onChange={handleChange}
                  disabled={Boolean(disabled)}
                  className="w-full px-4 py-3 rounded-xl border border-estate-border focus:ring-2 focus:ring-estate-navy focus:border-transparent outline-none transition disabled:bg-estate-bg disabled:text-estate-muted"
                />
              </label>
            ))}
          </div>

          <div className="pt-6 border-t border-estate-border space-y-4">
            <h4 className="text-md font-bold text-estate-text">Notification Preferences</h4>
            {[
              ["notifications", "Receive email notifications about message responses and appointment updates."],
              ["newsletter", "Subscribe to Manish Properties weekly property recommendations."],
            ].map(([name, label]) => (
              <label key={name} className="flex items-center gap-3 text-sm text-estate-text-sec">
                <input
                  type="checkbox"
                  name={name}
                  checked={Boolean(profile[name as keyof typeof profile])}
                  onChange={handleChange}
                  className="h-4 w-4 text-estate-navy focus:ring-estate-navy border-estate-border rounded"
                />
                {label}
              </label>
            ))}
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-estate-navy text-white font-medium rounded-xl hover:bg-estate-navy-mid shadow-md hover:shadow-lg transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
