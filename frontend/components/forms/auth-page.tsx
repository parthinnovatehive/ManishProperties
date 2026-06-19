"use client";

import { FormEvent, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Lock, Mail, Phone, User, MapPin, Building, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { getAdminData } from "@/lib/utils/token";
import { estateApi } from "@/lib/api";

type AuthMode = "login" | "register";
type PublicRole = "USER" | "AGENT";

const redirectByRole: Record<string, string> = {
  USER: "/",
  AGENT: "/agent/dashboard",
  ADMIN: "/admin/dashboard",
  SUPER_ADMIN: "/super-admin/dashboard",
};

function routeForStoredRole() {
  const account = getAdminData();
  const role = String(account?.role || "USER").toUpperCase().replace("-", "_");
  return redirectByRole[role] || "/user/dashboard";
}

interface City {
  id: string;
  name: string;
  status: string;
}

interface Subarea {
  id: string;
  name: string;
  city_id: string;
  status: string;
}

export function AuthPage({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const { login, register, error: authError, loading, clearError } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    city_id: "",
  });
  const [selectedSubareas, setSelectedSubareas] = useState<string[]>([]);
  const [role, setRole] = useState<PublicRole>("USER");
  const [remember, setRemember] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [subareas, setSubareas] = useState<Subarea[]>([]);
  const [filteredSubareas, setFilteredSubareas] = useState<Subarea[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  const isLogin = mode === "login";
  const title = isLogin ? "Sign in to Manish Properties" : "Create your Manish Properties account";
  const subtitle = isLogin
    ? "Use your registered email and password to continue."
    : "Register as a buyer/owner, agent, or admin.";

  // Fetch cities and subareas on component mount
  useEffect(() => {
    const fetchLocations = async () => {
      setLoadingLocations(true);
      try {
        const [citiesData, subareasData] = await Promise.all([
          estateApi.cities.list<any>(),
          estateApi.content.subareas.list<any>(),
        ]);
        setCities(citiesData || []);
        setSubareas(subareasData || []);
      } catch (error) {
        console.error("Failed to fetch locations:", error);
      } finally {
        setLoadingLocations(false);
      }
    };
    fetchLocations();
  }, []);

  // Filter subareas when city is selected
  useEffect(() => {
    if (form.city_id) {
      const filtered = subareas.filter((s) => s.city_id === form.city_id && s.status === "active");
      setFilteredSubareas(filtered);
    } else {
      setFilteredSubareas([]);
    }
    // Reset selected subareas when city changes
    if (form.city_id) {
      setSelectedSubareas([]);
    }
  }, [form.city_id, subareas]);

  const update = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setLocalError(null);
    clearError();
  };

  const toggleSubarea = (subareaId: string) => {
    setSelectedSubareas((prev) => {
      if (prev.includes(subareaId)) {
        return prev.filter((id) => id !== subareaId);
      } else {
        return [...prev, subareaId];
      }
    });
    setLocalError(null);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);

    if (!form.email.trim() || !form.password) {
      setLocalError("Email and password are required.");
      return;
    }

    if (!isLogin) {
      if (!form.name.trim() || !form.phone.trim()) {
        setLocalError("Full name and phone number are required.");
        return;
      }
      if (form.password.length < 6) {
        setLocalError("Password must be at least 6 characters.");
        return;
      }
      if (form.password !== form.confirmPassword) {
        setLocalError("Passwords do not match.");
        return;
      }

      // Validate city and subareas for AGENT role
      if (role === "AGENT") {
        if (!form.city_id) {
          setLocalError("Please select a city.");
          return;
        }
        if (selectedSubareas.length === 0) {
          setLocalError("Please select at least one subarea.");
          return;
        }
      }
    }

    const ok = isLogin
      ? await login(form.email.trim(), form.password, remember)
      : await register(
          form.email.trim(),
          form.password,
          role,
          form.name.trim(),
          form.phone.trim(),
          "pending",
          form.city_id,
          selectedSubareas // Pass array of subarea IDs
        );

    if (ok) {
      router.replace(routeForStoredRole());
    }
  };

  const displayError = localError || authError;

  return (
    <div className="grid min-h-[calc(100vh-68px)] bg-white lg:grid-cols-[0.95fr_1.05fr]">
      <div className="relative hidden min-h-[580px] overflow-hidden lg:block">
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&q=80"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="auth-overlay absolute inset-0" />
        <div className="relative z-10 flex h-full flex-col justify-end p-12 text-white">
          <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wider backdrop-blur">
            <Building2 size={14} />
            Manish Properties
          </div>
          <h1 className="max-w-xl font-serif text-5xl font-bold leading-tight">
            One account for every real estate workflow.
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-7 text-white/75">
            Access saved homes, agent pipelines, admin approvals, and platform controls through the Flask-backed Manis Properties API.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-[430px]">
          <Link href="/" className="mb-8 flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-estate-navy text-white">
              <Building2 size={20} aria-hidden="true" />
            </span>
            <span className="font-serif text-xl font-bold text-estate-navy">Manish Properties</span>
          </Link>

          <div className="mb-7">
            <h1 className="text-2xl font-extrabold text-estate-navy">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-estate-text-sec">{subtitle}</p>
          </div>

          {displayError && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
              {displayError}
            </div>
          )}

          <form onSubmit={submit}>
            {!isLogin && (
              <>
                <Input
                  label="Full Name"
                  value={form.name}
                  onChange={(event) => update("name", event.target.value)}
                  icon={<User size={15} />}
                  required
                  disabled={loading}
                />

                <Input
                  label="Phone Number"
                  type="tel"
                  value={form.phone}
                  onChange={(event) => update("phone", event.target.value)}
                  icon={<Phone size={15} />}
                  required
                  disabled={loading}
                />

                <div className="mb-4">
                  <span className="mb-2 block text-[13px] font-semibold text-estate-text">Role</span>
                  <div className="grid grid-cols-3 gap-2 rounded-xl bg-estate-bg p-1">
                    {[
                      ["USER", "User"],
                      ["AGENT", "Agent"],
                    ].map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => {
                          setRole(value as PublicRole);
                          // Reset location fields when switching to USER
                          if (value === "USER") {
                            setForm((prev) => ({ ...prev, city_id: "" }));
                            setSelectedSubareas([]);
                          }
                        }}
                        className={`rounded-[9px] py-2.5 text-sm font-bold transition ${
                          role === value ? "bg-estate-navy text-white shadow-estate" : "text-estate-muted hover:text-estate-navy"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* City and Subarea dropdowns - only for AGENT role */}
                {role === "AGENT" && (
                  <div className="space-y-4 mb-4">
                    <div>
                      <label className="mb-1.5 block text-[13px] font-semibold text-estate-text">
                        City <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-estate-muted" />
                        <select
                          value={form.city_id}
                          onChange={(e) => update("city_id", e.target.value)}
                          className="w-full rounded-xl border border-estate-border bg-white py-2.5 pl-10 pr-3 text-sm font-medium text-estate-text outline-none transition focus:border-estate-navy focus:ring-2 focus:ring-estate-navy/20 disabled:bg-gray-100"
                          disabled={loading || loadingLocations}
                        >
                          <option value="">Select a city</option>
                          {cities
                            .filter((city) => city.status === "active")
                            .map((city) => (
                              <option key={city.id} value={city.id}>
                                {city.name}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[13px] font-semibold text-estate-text">
                        Subareas <span className="text-red-500">*</span>
                        <span className="text-xs text-estate-muted font-normal ml-1">(Select multiple)</span>
                      </label>
                      
                      {/* Selected Subareas Tags */}
                      {selectedSubareas.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {selectedSubareas.map((id) => {
                            const subarea = subareas.find((s) => s.id === id);
                            return subarea ? (
                              <span
                                key={id}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-estate-navy/10 text-estate-navy rounded-full text-xs font-medium"
                              >
                                {subarea.name}
                                <button
                                  type="button"
                                  onClick={() => toggleSubarea(id)}
                                  className="hover:text-red-500 transition"
                                >
                                  <X size={14} />
                                </button>
                              </span>
                            ) : null;
                          })}
                        </div>
                      )}

                      {/* Subarea Selection Grid */}
                      <div className="relative">
                        <Building size={15} className="absolute left-3 top-3 text-estate-muted z-10" />
                        <div className="w-full rounded-xl border border-estate-border bg-white overflow-hidden focus-within:border-estate-navy focus-within:ring-2 focus-within:ring-estate-navy/20 transition">
                          <div className="max-h-40 overflow-y-auto p-1">
                            {loadingLocations ? (
                              <div className="py-3 text-center text-sm text-estate-muted">Loading subareas...</div>
                            ) : !form.city_id ? (
                              <div className="py-3 text-center text-sm text-estate-muted">Select a city first</div>
                            ) : filteredSubareas.length === 0 ? (
                              <div className="py-3 text-center text-sm text-amber-600">No subareas available for this city.</div>
                            ) : (
                              filteredSubareas.map((subarea) => {
                                const isSelected = selectedSubareas.includes(subarea.id);
                                return (
                                  <button
                                    key={subarea.id}
                                    type="button"
                                    onClick={() => toggleSubarea(subarea.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                                      isSelected
                                        ? "bg-estate-navy text-white"
                                        : "hover:bg-estate-bg text-estate-text"
                                    }`}
                                  >
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                                      isSelected
                                        ? "border-white bg-white/20"
                                        : "border-estate-border"
                                    }`}>
                                      {isSelected && <span className="text-white text-xs">✓</span>}
                                    </div>
                                    <span className="flex-1 text-left">{subarea.name}</span>
                                    {isSelected && <Plus size={14} className="rotate-45" />}
                                  </button>
                                );
                              })
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-estate-muted mt-1">
                        Click to select/deselect subareas. Selected: {selectedSubareas.length}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}

            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(event) => update("email", event.target.value)}
              icon={<Mail size={15} />}
              required
              disabled={loading}
            />

            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={(event) => update("password", event.target.value)}
              icon={<Lock size={15} />}
              required
              disabled={loading}
            />

            {!isLogin && (
              <Input
                label="Confirm Password"
                type="password"
                value={form.confirmPassword}
                onChange={(event) => update("confirmPassword", event.target.value)}
                icon={<Lock size={15} />}
                required
                disabled={loading}
              />
            )}

            {isLogin && (
              <div className="-mt-1 mb-5 flex items-center justify-between gap-4">
                <label className="flex items-center gap-2 text-sm font-semibold text-estate-text-sec">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(event) => setRemember(event.target.checked)}
                    className="h-4 w-4 rounded border-estate-border text-estate-navy"
                    disabled={loading}
                  />
                  Remember me
                </label>
                <Link href="/auth/forgot-password" className="text-sm font-semibold text-estate-blue hover:underline">
                  Forgot Password?
                </Link>
              </div>
            )}

            <Button type="submit" variant="navy" fullWidth className="py-3.5 text-[15px]" disabled={loading}>
              {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-estate-text-sec">
            {isLogin ? "New to Manish Properties?" : "Already have an account?"}{" "}
            <Link href={isLogin ? "/auth/register" : "/auth/login"} className="font-bold text-estate-navy hover:underline">
              {isLogin ? "Register" : "Sign in"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}