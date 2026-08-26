"use client";

import { useState } from "react";
import type { PropertyId } from "@/types";

interface ApprovalModalProps {
  open: boolean;
  onClose: () => void;
  propertyId: PropertyId;
  propertyTitle: string;
  onApprove: (id: PropertyId, fetchAmenities: boolean) => Promise<void>;
}

export default function ApprovalModal({
  open,
  onClose,
  propertyId,
  propertyTitle,
  onApprove,
}: ApprovalModalProps) {
  const [loading, setLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<"with" | "without" | null>(null);

  if (!open) return null;

  const handleApprove = async (withFacilities: boolean) => {
    setLoading(true);
    setLoadingType(withFacilities ? "with" : "without");
    try {
      await onApprove(propertyId, withFacilities);
      onClose();
    } catch (err) {
      console.error("Approval failed:", err);
    } finally {
      setLoading(false);
      setLoadingType(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget && !loading) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Approve Property</h3>
              <p className="text-sm text-gray-500">Choose approval method</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-3 mb-5">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">Property</p>
            <p className="text-sm font-semibold text-gray-800 line-clamp-2">{propertyTitle}</p>
          </div>

          {/* Loading State */}
          {loading && loadingType === "with" && (
            <div className="mb-5 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <svg className="animate-spin h-8 w-8 text-emerald-600" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-800">Fetching Nearby Facilities...</p>
                  <p className="text-xs text-emerald-600 mt-0.5">
                    Finding hospitals, schools, supermarkets &amp; more. This may take 10-30 seconds.
                  </p>
                </div>
              </div>
              <div className="mt-3 w-full bg-emerald-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full animate-pulse" style={{ width: "60%" }} />
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="px-6 pb-6 space-y-3">
          {/* Approve with Facilities */}
          <button
            onClick={() => handleApprove(true)}
            disabled={loading}
            className="w-full px-4 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 rounded-xl text-sm font-semibold transition shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 min-h-[52px]"
          >
            {loadingType === "with" ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Fetching &amp; Approving...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11v2m0 0v2m0-2h2m-2 0h-2" />
                </svg>
                <span className="text-left">
                  <span className="block">Approve with Nearby Facilities</span>
                  <span className="block text-xs font-normal text-emerald-100 mt-0.5">Fetches hospitals, schools, supermarkets etc.</span>
                </span>
              </>
            )}
          </button>

          {/* Approve without Facilities */}
          <button
            onClick={() => handleApprove(false)}
            disabled={loading}
            className="w-full px-4 py-3.5 bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 rounded-xl text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 min-h-[52px]"
          >
            {loadingType === "without" ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Approving...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-left">
                  <span className="block">Approve without Facilities</span>
                  <span className="block text-xs font-normal text-gray-400 mt-0.5">Quick approve, no facility data fetched</span>
                </span>
              </>
            )}
          </button>

          {/* Cancel */}
          <button
            onClick={onClose}
            disabled={loading}
            className="w-full px-4 py-2.5 text-gray-400 hover:text-gray-600 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
