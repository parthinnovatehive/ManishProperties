"use client";

import { useState } from "react";

export default function SuperAdminSettingsPage() {
  const [settings, setSettings] = useState({
    platformFee: "1.5",
    apiLimit: "5000",
    maintenanceMode: false,
    cronBackup: "Daily",
    allowedDomains: "manishproperties.com, manishproperties.in",
  });
  const [saved, setSaved] = useState(false);

  const handleToggle = () => {
    setSettings(prev => ({ ...prev, maintenanceMode: !prev.maintenanceMode }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-estate-navy font-serif">Global Settings</h1>
          <p className="text-sm text-estate-text-sec">Modify core platform parameters, security policies, and performance variables.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-estate-border shadow-estate p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {saved && (
            <div className="p-4 bg-estate-success-bg border border-estate-success/30 rounded-xl text-estate-success text-sm font-medium animate-fade-up">
              ✓ Global system settings synchronized successfully.
            </div>
          )}

          {/* Maintenance Mode Option */}
          <div className="p-5 bg-estate-bg rounded-2xl border border-estate-border flex justify-between items-center">
            <div>
              <span className="font-bold text-estate-navy block">System Maintenance Mode</span>
              <span className="text-xs text-estate-text-sec mt-0.5 block">Restrict access to Manish Properties for database optimizations.</span>
            </div>
            <button
              type="button"
              onClick={handleToggle}
              className={`w-14 h-8 rounded-full p-1 transition duration-300 outline-none ${
                settings.maintenanceMode ? "bg-estate-red" : "bg-estate-navy"
              }`}
            >
              <div
                className={`w-6 h-6 bg-white rounded-full shadow-md transform transition duration-300 ${
                  settings.maintenanceMode ? "translate-x-6" : ""
                }`}
              ></div>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-estate-text mb-2">Broker Platform Commission (%)</label>
              <input
                type="number"
                step="0.1"
                name="platformFee"
                value={settings.platformFee}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-estate-border focus:ring-2 focus:ring-estate-navy focus:border-transparent outline-none transition text-sm bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-estate-text mb-2">Public API Request Limit / Min</label>
              <input
                type="number"
                name="apiLimit"
                value={settings.apiLimit}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-estate-border focus:ring-2 focus:ring-estate-navy focus:border-transparent outline-none transition text-sm bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-estate-text mb-2">Database Backup Schedule</label>
              <select
                name="cronBackup"
                value={settings.cronBackup}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-estate-border focus:ring-2 focus:ring-estate-navy focus:border-transparent outline-none transition text-sm bg-white"
              >
                <option>Hourly</option>
                <option>Daily</option>
                <option>Weekly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-estate-text mb-2">Security Allowed Domains</label>
              <input
                type="text"
                name="allowedDomains"
                value={settings.allowedDomains}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-estate-border focus:ring-2 focus:ring-estate-navy focus:border-transparent outline-none transition text-sm bg-white"
                required
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-estate-navy text-white font-semibold rounded-xl hover:bg-estate-navy-mid shadow-md hover:shadow-lg transition"
            >
              Sync Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
