"use client";

import { useState, FormEvent, useEffect, useCallback } from "react";
import { User, Mail, Phone, MapPin, Building, X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { estateApi } from "@/lib/api";

interface GoogleUserInfo {
  email: string;
  name: string;
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

interface GoogleRegistrationFormProps {
  googleUser: GoogleUserInfo;
  loading: boolean;
  error: string | null;
  onSubmit: (name: string, phone: string, role: string, city_id?: string, sub_area_ids?: string[]) => Promise<void>;
  onCancel: () => void;
}

type PublicRole = "USER" | "AGENT";

export function GoogleRegistrationForm({
  googleUser,
  loading,
  error,
  onSubmit,
  onCancel,
}: GoogleRegistrationFormProps) {
  const [name, setName] = useState(googleUser.name || "");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<PublicRole>("USER");
  const [localError, setLocalError] = useState<string | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [subareas, setSubareas] = useState<Subarea[]>([]);
  const [filteredSubareas, setFilteredSubareas] = useState<Subarea[]>([]);
  const [cityId, setCityId] = useState("");
  const [selectedSubareas, setSelectedSubareas] = useState<string[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  const displayError = localError || error;

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
      } catch (err) {
        console.error("Failed to fetch locations:", err);
      } finally {
        setLoadingLocations(false);
      }
    };
    fetchLocations();
  }, []);

  useEffect(() => {
    if (cityId) {
      const filtered = subareas.filter((s) => s.city_id === cityId && s.status === "active");
      setFilteredSubareas(filtered);
    } else {
      setFilteredSubareas([]);
    }
    if (cityId) {
      setSelectedSubareas([]);
    }
  }, [cityId, subareas]);

  const toggleSubarea = useCallback((subareaId: string) => {
    setSelectedSubareas((prev) => {
      if (prev.includes(subareaId)) {
        return prev.filter((id) => id !== subareaId);
      }
      return [...prev, subareaId];
    });
    setLocalError(null);
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLocalError(null);

    if (!name.trim()) {
      setLocalError("Full name is required.");
      return;
    }
    if (!phone.trim()) {
      setLocalError("Phone number is required.");
      return;
    }
    if (role === "AGENT") {
      if (!cityId) {
        setLocalError("Please select a city.");
        return;
      }
      if (selectedSubareas.length === 0) {
        setLocalError("Please select at least one subarea.");
        return;
      }
    }

    await onSubmit(name.trim(), phone.trim(), role, cityId || undefined, selectedSubareas.length > 0 ? selectedSubareas : undefined);
  };

  return (
    <div className="mt-6">
      <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
        Account verified via Google. Please complete your profile.
      </div>

      {displayError && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
          {displayError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Input
          label="Full Name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setLocalError(null);
          }}
          icon={<User size={15} />}
          required
          disabled={loading}
        />

        <Input
          label="Email"
          type="email"
          value={googleUser.email}
          icon={<Mail size={15} />}
          disabled
          className="bg-gray-50 text-estate-muted cursor-not-allowed"
        />

        <Input
          label="Phone Number"
          type="tel"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            setLocalError(null);
          }}
          icon={<Phone size={15} />}
          required
          disabled={loading}
          placeholder="Enter your phone number"
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
                  if (value === "USER") {
                    setCityId("");
                    setSelectedSubareas([]);
                  }
                }}
                className={`rounded-[9px] py-2.5 text-sm font-bold transition ${
                  role === value
                    ? "bg-estate-navy text-white shadow-estate"
                    : "text-estate-muted hover:text-estate-navy"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {role === "AGENT" && (
          <div className="space-y-4 mb-4">
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-estate-text">
                City <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-estate-muted" />
                <select
                  value={cityId}
                  onChange={(e) => { setCityId(e.target.value); setLocalError(null); }}
                  className="w-full rounded-xl border border-estate-border bg-white py-2.5 pl-10 pr-3 text-sm font-medium text-estate-text outline-none transition focus:border-estate-navy focus:ring-2 focus:ring-estate-navy/20 disabled:bg-gray-100"
                  disabled={loading || loadingLocations}
                >
                  <option value="">Select a city</option>
                  {cities
                    .filter((city) => city.status === "active")
                    .map((city) => (
                      <option key={city.id} value={city.id}>{city.name}</option>
                    ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-estate-text">
                Subareas <span className="text-red-500">*</span>
                <span className="text-xs text-estate-muted font-normal ml-1">(Select multiple)</span>
              </label>

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
                        <button type="button" onClick={() => toggleSubarea(id)} className="hover:text-red-500 transition">
                          <X size={14} />
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
              )}

              <div className="relative">
                <Building size={15} className="absolute left-3 top-3 text-estate-muted z-10" />
                <div className="w-full rounded-xl border border-estate-border bg-white overflow-hidden focus-within:border-estate-navy focus-within:ring-2 focus-within:ring-estate-navy/20 transition">
                  <div className="max-h-40 overflow-y-auto p-1">
                    {loadingLocations ? (
                      <div className="py-3 text-center text-sm text-estate-muted">Loading subareas...</div>
                    ) : !cityId ? (
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
                              isSelected ? "border-white bg-white/20" : "border-estate-border"
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

        <div className="mt-6 flex gap-3">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={loading} fullWidth>
            Cancel
          </Button>
          <Button type="submit" variant="navy" fullWidth className="py-3.5 text-[15px]" disabled={loading}>
            {loading ? "Creating account..." : "Complete Registration"}
          </Button>
        </div>
      </form>
    </div>
  );
}
