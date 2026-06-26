"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { apiClient } from "@/lib/api/client";
import { estateApi } from "@/lib/api";
import { X, MapPin, Loader2, Check, Plus } from "lucide-react";
import { toast } from "sonner";

interface City {
  id: string;
  name: string;
}

interface Subarea {
  id: string;
  name: string;
  city_id: string;
  agent_ids: string[];
  status: string;
}

interface RequestSubareaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  agentId: string;
  currentSubareaIds: string[];
}

export function RequestSubareaModal({
  isOpen,
  onClose,
  onSuccess,
  agentId,
  currentSubareaIds,
}: RequestSubareaModalProps) {
  const [cities, setCities] = useState<City[]>([]);
  const [allSubareas, setAllSubareas] = useState<Subarea[]>([]);
  const [selectedCityId, setSelectedCityId] = useState("");
  const [selectedSubareaIds, setSelectedSubareaIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchData();
      setSelectedCityId("");
      setSelectedSubareaIds([]);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const fetchData = async () => {
    try {
      const allCities = await estateApi.cities.list<City>();
      setCities(allCities || []);
      const allSubs = await estateApi.content.subareas.list<Subarea>();
      setAllSubareas(allSubs);
    } catch {
      toast.error("Failed to load data");
    }
  };

  const availableSubareas = allSubareas.filter(
    (s) =>
      s.city_id === selectedCityId &&
      s.status === "active" &&
      !currentSubareaIds.includes(s.id)
  );

  const toggleSubarea = (id: string) => {
    setSelectedSubareaIds((prev) =>
      prev.includes(id)
        ? prev.filter((sid) => sid !== id)
        : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (selectedSubareaIds.length === 0) {
      toast.error("Please select at least one subarea");
      return;
    }

    setSubmitting(true);
    try {
      const response: any = await apiClient.post(
        `/api/agents/${agentId}/request-subareas`,
        { sub_area_ids: selectedSubareaIds }
      );

      if (response.success) {
        toast.success("Subarea request submitted successfully!");
        onSuccess();
        onClose();
      } else {
        toast.error(response.message || "Failed to submit request");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <>
      <div onClick={onClose} className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm" />
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 pointer-events-none">
        <div onClick={(e) => e.stopPropagation()} className="pointer-events-auto w-full max-w-lg max-h-[85vh] overflow-y-auto bg-white rounded-2xl shadow-xl border border-estate-border animate-fade-up">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-estate-border p-5 flex justify-between items-center z-10">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-estate-blue-pale rounded-lg">
                <MapPin className="w-4 h-4 text-estate-navy" />
              </div>
              <h3 className="font-extrabold text-base text-estate-navy font-serif">
                Request New Subareas
              </h3>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-estate-surface rounded-lg transition">
              <X className="w-5 h-5 text-estate-text-sec" />
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* Current Assigned */}
            <div>
              <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block mb-2">
                Currently Assigned Subareas
              </span>
              {currentSubareaIds.length === 0 ? (
                <p className="text-xs text-estate-muted italic">None assigned</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {allSubareas
                    .filter((s) => currentSubareaIds.includes(s.id))
                    .map((s) => (
                      <span
                        key={s.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-estate-blue-pale text-estate-navy text-[11px] font-bold rounded-full border border-estate-border/40"
                      >
                        <MapPin className="w-2.5 h-2.5" />
                        {s.name}
                      </span>
                    ))}
                </div>
              )}
            </div>

            {/* Select City */}
            <div>
              <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block mb-1.5">
                Select City *
              </span>
              <select
                value={selectedCityId}
                onChange={(e) => {
                  setSelectedCityId(e.target.value);
                  setSelectedSubareaIds([]);
                }}
                className="w-full p-2.5 border border-estate-border rounded-xl focus:border-estate-navy outline-none text-sm font-semibold focus:ring-4 focus:ring-estate-blue-pale/50 bg-white"
              >
                <option value="">-- Choose a city --</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Select Subareas */}
            {selectedCityId && (
              <div>
                <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block mb-1.5">
                  Select Subareas * (Select multiple)
                </span>
                {availableSubareas.length === 0 ? (
                  <p className="text-xs text-estate-muted italic py-3 text-center border border-dashed border-estate-border rounded-xl">
                    No additional subareas available in this city
                  </p>
                ) : (
                  <div className="border border-estate-border rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                    {availableSubareas.map((subarea) => (
                      <button
                        key={subarea.id}
                        type="button"
                        onClick={() => toggleSubarea(subarea.id)}
                        className={`w-full flex items-center gap-3 p-3 text-left transition border-b border-estate-border/50 last:border-b-0 ${
                          selectedSubareaIds.includes(subarea.id)
                            ? "bg-estate-blue-pale"
                            : "hover:bg-estate-surface/60"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                            selectedSubareaIds.includes(subarea.id)
                              ? "bg-estate-navy border-estate-navy"
                              : "border-estate-border"
                          }`}
                        >
                          {selectedSubareaIds.includes(subarea.id) && (
                            <Check className="w-2.5 h-2.5 text-white" />
                          )}
                        </div>
                        <span className="text-sm font-semibold text-estate-text">
                          {subarea.name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {selectedSubareaIds.length > 0 && (
                  <p className="text-[11px] text-estate-muted mt-2 font-semibold">
                    {selectedSubareaIds.length} subarea{selectedSubareaIds.length > 1 ? "s" : ""} selected
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-estate-border p-5 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-estate-border text-sm font-bold text-estate-text-sec hover:bg-estate-surface transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={selectedSubareaIds.length === 0 || submitting}
              className="flex-1 py-2.5 rounded-xl bg-estate-navy text-white text-sm font-bold hover:bg-estate-navy-mid transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
              ) : (
                <><Plus className="w-4 h-4" /> Submit Request</>
              )}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
