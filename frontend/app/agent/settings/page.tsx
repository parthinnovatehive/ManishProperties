"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Lock, Shield, User, Globe, Eye, EyeOff, Save, Check } from "lucide-react";

export default function AgentSettingsPage() {
  // Toggle states
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: false,
    newLeads: true,
    apptReminders: true,
  });

  const [privacy, setPrivacy] = useState({
    profilePublic: true,
    showPhone: true,
    showEmail: true,
  });

  // Password fields
  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Handle Save settings
  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const toggleNotif = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const togglePrivacy = (key: keyof typeof privacy) => {
    setPrivacy((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fade-up">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-estate-navy tracking-tight font-serif">
            Portal Settings
          </h1>
          <p className="text-sm font-semibold text-estate-text-sec mt-1">
            Configure your notifications, privacy preferences, and password credentials.
          </p>
        </div>
        {saveSuccess && (
          <div className="flex items-center gap-1.5 bg-estate-success-bg text-estate-success border border-estate-border-med px-3 py-1.5 rounded-xl text-xs font-bold animate-fade-up">
            <Check className="w-4 h-4" /> Preferences Saved!
          </div>
        )}
      </div>

      {/* Grid Layout of configuration cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CARD 1: Account Info Settings */}
        <Card className="p-6 space-y-4 hover:shadow-estate transition">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-estate-blue-pale text-estate-navy rounded-lg">
              <User className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-estate-navy font-serif">Account Profile</h3>
          </div>
          <form onSubmit={handleSaveGeneral} className="space-y-4 pt-2">
            <label className="block">
              <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block mb-1">
                Real Estate Agency Name
              </span>
              <input
                type="text"
                defaultValue="Manish Properties Mumbai Core"
                className="w-full p-2.5 border border-estate-border rounded-xl focus:border-estate-navy outline-none text-xs font-semibold focus:ring-4 focus:ring-estate-blue-pale/50"
              />
            </label>
            <label className="block">
              <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block mb-1">
                Operating Language
              </span>
              <select className="w-full p-2.5 border border-estate-border rounded-xl focus:border-estate-navy outline-none text-xs font-bold text-estate-navy focus:ring-4 focus:ring-estate-blue-pale/50 cursor-pointer bg-white">
                <option value="en">English (India)</option>
                <option value="hi">Hindi (हिंदी)</option>
                <option value="mr">Marathi (मराठी)</option>
              </select>
            </label>
            <Button variant="primary" size="sm" type="submit" className="w-full mt-2">
              Update Account
            </Button>
          </form>
        </Card>

        {/* CARD 2: Password & Authentication Credentials */}
        <Card className="p-6 space-y-4 hover:shadow-estate transition">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-estate-blue-pale text-estate-navy rounded-lg">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-estate-navy font-serif">Security Password</h3>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setPasswords({ current: "", next: "", confirm: "" });
              setSaveSuccess(true);
              setTimeout(() => setSaveSuccess(false), 2500);
            }}
            className="space-y-3.5 pt-2"
          >
            <label className="block relative">
              <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block mb-1">
                Current Password
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                className="w-full p-2.5 border border-estate-border rounded-xl focus:border-estate-navy outline-none text-xs font-semibold pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 bottom-3 text-estate-muted hover:text-estate-navy"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </label>

            <label className="block">
              <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block mb-1">
                New Password
              </span>
              <input
                type="password"
                required
                value={passwords.next}
                onChange={(e) => setPasswords({ ...passwords, next: e.target.value })}
                className="w-full p-2.5 border border-estate-border rounded-xl focus:border-estate-navy outline-none text-xs font-semibold"
              />
            </label>

            <Button variant="outline" size="sm" type="submit" className="w-full mt-2">
              Update Password
            </Button>
          </form>
        </Card>

        {/* CARD 3: Notification Alerts (Toggles switches) */}
        <Card className="p-6 space-y-4 hover:shadow-estate transition">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-estate-blue-pale text-estate-navy rounded-lg">
              <Bell className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-estate-navy font-serif">Notification Settings</h3>
          </div>
          <div className="space-y-4 pt-2">
            {[
              ["emailAlerts", "Email Alerts", "Receive digest of views and client requests."],
              ["smsAlerts", "SMS Alerts", "Instant text notification on mobile for emergency site visits."],
              ["newLeads", "New Leads Assigned", "Get notified immediately when a new inbound CRM lead is assigned."],
              ["apptReminders", "Appointment Reminders", "Alerts 2 hours prior to scheduled client site visits."],
            ].map(([k, label, desc]) => (
              <div key={k} className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-extrabold text-estate-navy block">{label}</span>
                  <span className="text-[10px] text-estate-muted font-medium mt-0.5 block">{desc}</span>
                </div>
                {/* Custom toggle slider */}
                <button
                  onClick={() => toggleNotif(k as keyof typeof notifications)}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors relative flex-shrink-0 cursor-pointer ${
                    notifications[k as keyof typeof notifications] ? "bg-estate-navy" : "bg-estate-border-med"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full bg-white shadow-sm block transition-transform ${
                      notifications[k as keyof typeof notifications] ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* CARD 4: Privacy Settings (Toggles switches) */}
        <Card className="p-6 space-y-4 hover:shadow-estate transition">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-estate-blue-pale text-estate-navy rounded-lg">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-estate-navy font-serif">Privacy Settings</h3>
          </div>
          <div className="space-y-4 pt-2">
            {[
              ["profilePublic", "Public Listing Profile", "Display your biography and ratings on public property detail pages."],
              ["showPhone", "Display Phone Number", "Allow verified buyers to view your direct mobile number."],
              ["showEmail", "Display Email address", "Make email coordinates viewable on contact cards."],
            ].map(([k, label, desc]) => (
              <div key={k} className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-extrabold text-estate-navy block">{label}</span>
                  <span className="text-[10px] text-estate-muted font-medium mt-0.5 block">{desc}</span>
                </div>
                {/* Custom toggle slider */}
                <button
                  onClick={() => togglePrivacy(k as keyof typeof privacy)}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors relative flex-shrink-0 cursor-pointer ${
                    privacy[k as keyof typeof privacy] ? "bg-estate-navy" : "bg-estate-border-med"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full bg-white shadow-sm block transition-transform ${
                      privacy[k as keyof typeof privacy] ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
