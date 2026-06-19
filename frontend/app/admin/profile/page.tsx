"use client";

import { useEffect, useState } from "react";
import { estateApi } from "@/lib/api";
import { getAdminData } from "@/lib/utils/token";
import { X, Shield, Building2, Calendar, Mail, Phone, User, BadgeCheck, AlertCircle, KeyRound, Eye, EyeOff, CheckCircle, Lock } from "lucide-react";

interface AdminProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  createdAt: string;
  permissions: string[];
}

interface City {
  id: string;
  name: string;
  admin_id: string | null;
  status: string;
}

export default function AdminProfilePage() {
  const account = getAdminData();
  const [profile, setProfile] = useState<AdminProfile>({
    id: account?.id || "",
    name: account?.name || account?.username || "",
    email: account?.email || account?.username || "",
    phone: account?.phone || "",
    role: account?.role || "ADMIN",
    status: account?.status || "active",
    createdAt: account?.createdAt || "",
    permissions: ["Manage Users", "Approve Properties"],
  });
  const [assignedCity, setAssignedCity] = useState<City | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [formState, setFormState] = useState({ ...profile });
  const [passwordForm, setPasswordForm] = useState({ newPassword: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const storedUser = localStorage.getItem("adminData");
      if (storedUser) {
        const userData = JSON.parse(storedUser);

        const allAdmins = await estateApi.admins.list<any>();
        const adminRecord = allAdmins.find((a: any) => a.id === userData.id);
        const createdAt = adminRecord?.createdAt || userData.createdAt || "";

        setProfile(prev => ({
          ...prev,
          id: userData.id || prev.id,
          name: userData.name || prev.name,
          email: userData.email || prev.email,
          phone: userData.phone || prev.phone,
          role: adminRecord?.role || userData.role || prev.role,
          status: adminRecord?.status || userData.status || prev.status,
          createdAt,
        }));
        setFormState(prev => ({
          ...prev,
          id: userData.id || prev.id,
          name: userData.name || prev.name,
          email: userData.email || prev.email,
          phone: userData.phone || prev.phone,
          role: adminRecord?.role || userData.role || prev.role,
          status: adminRecord?.status || userData.status || prev.status,
          createdAt,
        }));

        const allCities = await estateApi.cities.list<City>();
        const city = allCities.find(c => c.admin_id === userData.id);
        setAssignedCity(city || null);
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    if (passwordForm.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setIsResetting(true);
    try {
      await estateApi.admins.update(profile.id, { password: passwordForm.newPassword });
      setPasswordSuccess(true);
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Error resetting password:", error);
      setPasswordError("Failed to reset password. Please try again.");
    } finally {
      setIsResetting(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await estateApi.admins.update(profile.id, {
        name: formState.name,
        phone: formState.phone,
      });

      setProfile(formState);
      setShowEditModal(false);

      const storedUser = localStorage.getItem("adminData");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        userData.name = formState.name;
        userData.phone = formState.phone;
        localStorage.setItem("adminData", JSON.stringify(userData));
      }

      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    }
  };

  const formatDate = (iso: string) => {
    if (!iso) return "N/A";
    try {
      return new Date(iso).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "N/A";
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
          Admin Profile
        </h1>
        <p className="text-sm font-semibold text-estate-text-sec mt-1">
          Your account details, assigned city, and permissions
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <div className="bg-white border border-estate-border/80 rounded-[20px] p-6 shadow-estate">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-estate-navy text-white text-xl font-bold rounded-full flex items-center justify-center border-2 border-estate-navy/20">
                  {profile.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-estate-navy font-serif">{profile.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${profile.status === "active"
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : "bg-rose-100 text-rose-800 border border-rose-200"
                      }`}>
                      {profile.status}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                      {profile.role}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setFormState({ ...profile });
                  setShowEditModal(true);
                }}
                className="px-4 py-2 text-sm font-bold text-estate-navy border border-estate-border rounded-xl hover:bg-estate-bg transition"
              >
                Edit Profile
              </button>
            </div>
          </div>

          {/* Contact & Details */}
          <div className="bg-white border border-estate-border/80 rounded-[20px] p-6 shadow-estate space-y-4">
            <h3 className="font-extrabold text-lg text-estate-navy font-serif">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-estate-surface/40 rounded-xl border border-estate-border/30">
                <Mail className="w-5 h-5 text-estate-navy-light" />
                <div>
                  <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block">Email</span>
                  <span className="text-sm font-semibold text-estate-text">{profile.email}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-estate-surface/40 rounded-xl border border-estate-border/30">
                <Phone className="w-5 h-5 text-estate-navy-light" />
                <div>
                  <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block">Phone</span>
                  <span className="text-sm font-semibold text-estate-text">{profile.phone || "Not provided"}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-estate-surface/40 rounded-xl border border-estate-border/30">
                <Building2 className="w-5 h-5 text-estate-navy-light" />
                <div>
                  <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block">Assigned City</span>
                  <span className="text-sm font-semibold text-estate-text">{assignedCity?.name || "Not assigned"}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-estate-surface/40 rounded-xl border border-estate-border/30">
                <Calendar className="w-5 h-5 text-estate-navy-light" />
                <div>
                  <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block">Joined</span>
                  <span className="text-sm font-semibold text-estate-text">{formatDate(profile.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Col: Permissions & Badges */}
        <div className="space-y-6">
          {/* Permissions */}
          {/* <div className="bg-white border border-estate-border/80 rounded-[20px] p-6 shadow-estate space-y-4">
            <h3 className="font-extrabold text-base text-estate-navy font-serif flex items-center gap-2">
              <Shield className="w-5 h-5 text-estate-navy-light" />
              Permissions
            </h3>
            <div className="space-y-3">
              {profile.permissions.map((perm, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-estate-surface/40 rounded-xl border border-estate-border/30">
                  <BadgeCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span className="text-xs font-bold text-estate-text">{perm}</span>
                </div>
              ))}
            </div>
          </div> */}


          {/* Reset Password */}
          <div className="bg-white border border-estate-border/80 rounded-[20px] p-6 shadow-estate space-y-4">
            <h3 className="font-extrabold text-base text-estate-navy font-serif flex items-center gap-2">
              <Lock className="w-5 h-5 text-estate-navy-light" />
              Security
            </h3>
            <button
              onClick={() => {
                setPasswordForm({ newPassword: "", confirmPassword: "" });
                setPasswordError("");
                setPasswordSuccess(false);
                setShowPasswordModal(true);
              }}
              className="w-full flex items-center gap-3 p-3 bg-estate-surface/40 rounded-xl border border-estate-border/30 hover:bg-estate-surface/60 transition group"
            >
              <KeyRound className="w-4 h-4 text-estate-navy-light group-hover:text-estate-navy transition" />
              <div className="text-left">
                <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block">Reset Password</span>
                <span className="text-xs font-bold text-estate-text group-hover:text-estate-navy transition">Click to change your password</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Reset Password Modal */}
      {showPasswordModal && (
        <>
          <div
            onClick={() => { if (!isResetting) setShowPasswordModal(false); }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity"
          />
          <div className="fixed inset-x-4 top-20 max-w-lg mx-auto bg-white z-50 rounded-2xl shadow-estate-lg border border-estate-border overflow-hidden animate-fade-up">
            <div className="p-5 border-b border-estate-border flex justify-between items-center bg-estate-surface/10">
              <h3 className="font-extrabold text-base text-estate-navy font-serif flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-estate-navy" />
                Reset Password
              </h3>
              <button
                onClick={() => { if (!isResetting) setShowPasswordModal(false); }}
                className="p-1 hover:bg-estate-surface rounded-lg transition"
                disabled={isResetting}
              >
                <X className="w-5 h-5 text-estate-text-sec" />
              </button>
            </div>

            {passwordSuccess ? (
              <div className="p-12 flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-extrabold text-estate-navy">Password Updated!</p>
                  <p className="text-sm text-estate-text-sec mt-1">Your password has been changed successfully.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="p-6 space-y-5">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-amber-800">Password Requirements</p>
                    <ul className="text-[11px] text-amber-700 mt-1 space-y-0.5 list-disc list-inside">
                      <li>Minimum 6 characters</li>
                      <li>Use a mix of letters, numbers, and symbols</li>
                      <li>Avoid common or easily guessable passwords</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full p-2.5 pr-10 border border-estate-border rounded-xl focus:border-estate-navy outline-none text-sm font-semibold focus:ring-4 focus:ring-estate-blue-pale/50"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-estate-muted hover:text-estate-text transition"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full p-2.5 pr-10 border border-estate-border rounded-xl focus:border-estate-navy outline-none text-sm font-semibold focus:ring-4 focus:ring-estate-blue-pale/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-estate-muted hover:text-estate-text transition"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {passwordError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                    <span className="text-xs font-semibold text-rose-600">{passwordError}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-estate-border flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="px-4 py-2.5 border border-estate-border text-xs font-bold text-estate-text-sec hover:bg-estate-surface rounded-xl transition"
                    disabled={isResetting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isResetting || !passwordForm.newPassword || !passwordForm.confirmPassword}
                    className="px-5 py-2.5 bg-estate-navy text-white text-xs font-bold rounded-xl hover:bg-estate-navy-mid transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isResetting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Resetting...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <>
          <div
            onClick={() => setShowEditModal(false)}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity"
          />
          <div className="fixed inset-x-4 top-20 max-w-xl mx-auto bg-white z-50 rounded-2xl shadow-estate-lg border border-estate-border overflow-hidden animate-fade-up">
            <div className="p-5 border-b border-estate-border flex justify-between items-center bg-estate-surface/10">
              <h3 className="font-extrabold text-base text-estate-navy font-serif">Edit Profile</h3>
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
                    Full Name
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
                    Email
                  </span>
                  <input
                    type="email"
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
                    value={formState.phone}
                    onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
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
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-estate-navy text-white text-xs font-bold rounded-xl hover:bg-estate-navy-mid transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
