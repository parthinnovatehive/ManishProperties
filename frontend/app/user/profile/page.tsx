"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";

export default function UserProfilePage() {
  const { email } = useAuth();
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: email || "user@estateelite.com",
    phone: "+91 98765 00001",
    location: "Worli, Mumbai",
    occupation: "Software Engineer",
    newsletter: true,
    notifications: true,
  });
  const [isSaved, setIsSaved] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setProfile(prev => ({ ...prev, [name]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-estate-navy font-serif">Profile Settings</h1>
          <p className="text-sm text-estate-text-sec">Manage your personal information and preferences.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-estate-border shadow-estate p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {isSaved && (
            <div className="p-4 bg-estate-success-bg border border-estate-success/30 rounded-xl text-estate-success text-sm font-medium animate-fade-up">
              ✓ Profile updated successfully! Changes saved locally.
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 pb-6 border-b border-estate-border">
            <div className="w-20 h-20 bg-estate-blue-pale text-estate-navy text-2xl font-bold rounded-full flex items-center justify-center border-2 border-estate-navy">
              JD
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-lg font-bold text-estate-text">{profile.name}</h3>
              <p className="text-sm text-estate-text-sec">{profile.email}</p>
              <span className="inline-block mt-2 px-3 py-1 rounded-full bg-estate-blue-pale text-estate-navy text-xs font-semibold uppercase tracking-wider">
                Standard Member
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-estate-text mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-estate-border focus:ring-2 focus:ring-estate-navy focus:border-transparent outline-none transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-estate-text mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-estate-border bg-estate-bg text-estate-muted outline-none transition"
                disabled
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-estate-text mb-2">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-estate-border focus:ring-2 focus:ring-estate-navy focus:border-transparent outline-none transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-estate-text mb-2">Location</label>
              <input
                type="text"
                name="location"
                value={profile.location}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-estate-border focus:ring-2 focus:ring-estate-navy focus:border-transparent outline-none transition"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-estate-border space-y-4">
            <h4 className="text-md font-bold text-estate-text">Notification Preferences</h4>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="notifications"
                name="notifications"
                checked={profile.notifications}
                onChange={handleChange}
                className="h-4 w-4 text-estate-navy focus:ring-estate-navy border-estate-border rounded"
              />
              <label htmlFor="notifications" className="text-sm text-estate-text-sec">
                Receive email notifications about new message responses & appointment updates.
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="newsletter"
                name="newsletter"
                checked={profile.newsletter}
                onChange={handleChange}
                className="h-4 w-4 text-estate-navy focus:ring-estate-navy border-estate-border rounded"
              />
              <label htmlFor="newsletter" className="text-sm text-estate-text-sec">
                Subscribe to EstateElite weekly property recommendation newsletters.
              </label>
            </div>
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