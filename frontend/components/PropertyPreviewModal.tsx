"use client";

import { useState } from "react";
import type { PropertyId } from "@/types";

interface PropertyPreviewModalProps {
  open: boolean;
  onClose: () => void;
  property: any;
  approvalStatus: string;
  onApprove?: (id: PropertyId) => Promise<void>;
  onReject?: (id: PropertyId) => Promise<void>;
  listerName?: string;
  listerType?: string;
  listerPhone?: string;
}

const NEARBY_ICONS: Record<string, string> = {
  airport: "✈️",
  atm: "🏧",
  bank: "🏦",
  busStation: "🚌",
  bus: "🚌",
  college: "🎓",
  hospital: "🏥",
  park: "🌳",
  petrol: "⛽",
  pharmacy: "💊",
  restaurant: "🍽️",
  school: "🏫",
  station: "🚉",
  supermarket: "🛒",
  mall: "🏬",
  gym: "💪",
  beach: "🏖️",
  metro: "🚇",
};

export default function PropertyPreviewModal({
  open,
  onClose,
  property,
  approvalStatus,
  onApprove,
  onReject,
  listerName,
  listerType,
  listerPhone,
}: PropertyPreviewModalProps) {
  const [actionLoading, setActionLoading] = useState(false);

  if (!open || !property) return null;

  const isPending = approvalStatus === "Pending";
  const firstImage = property.images?.[0] || property.image || null;

  const handleApprove = async () => {
    if (!onApprove) return;
    setActionLoading(true);
    try {
      await onApprove(property.id);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!onReject) return;
    setActionLoading(true);
    try {
      await onReject(property.id);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex items-start justify-between p-6 pb-4 border-b border-estate-border rounded-t-3xl">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-block w-2.5 h-2.5 rounded-full ${
                approvalStatus === "Approved" ? "bg-emerald-500" :
                approvalStatus === "Pending" ? "bg-amber-500 animate-pulse" :
                approvalStatus === "Suspended" ? "bg-purple-500" :
                "bg-rose-500"
              }`} />
              <span className={`text-xs font-semibold uppercase tracking-wider ${
                approvalStatus === "Approved" ? "text-emerald-600" :
                approvalStatus === "Pending" ? "text-amber-600" :
                approvalStatus === "Suspended" ? "text-purple-600" :
                "text-rose-600"
              }`}>{approvalStatus}</span>
            </div>
            <h2 className="text-xl font-bold text-estate-navy font-serif truncate">{property.title}</h2>
            <p className="text-sm text-estate-text-sec flex items-center gap-1.5 mt-0.5">
              <PinIcon />
              {property.location || "Location not specified"}
              {property.city && <><span className="text-estate-border">|</span><span>{property.city}</span></>}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2.5 rounded-full hover:bg-gray-100 transition text-gray-400 hover:text-gray-600 hover:scale-105 active:scale-95"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Image */}
          {firstImage && (
            <div className="rounded-2xl overflow-hidden bg-gray-100 max-h-80 shadow-inner">
              <img
                src={firstImage}
                alt={property.title}
                className="w-full h-80 object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          )}

          {/* Price Highlight */}
          {property.price && (
            <div className="flex items-center gap-3 bg-gradient-to-r from-estate-navy to-estate-navy-mid rounded-2xl p-5 text-white shadow-lg">
              <div className="p-3 bg-white/15 rounded-xl backdrop-blur-sm">
                <TagIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-white/70">Price</p>
                <p className="text-2xl font-bold">{property.price}</p>
                {property.priceNum && <p className="text-xs text-white/60 mt-0.5">{property.type} &middot; {property.listingType || property.status}</p>}
              </div>
            </div>
          )}

          {/* Key Details Grid */}
          <div>
            <SectionHeader icon={<GridIcon />} title="Property Details" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
              <DetailCard icon={<BedIcon />} label="Bedrooms" value={property.beds != null ? String(property.beds) : "N/A"} />
              <DetailCard icon={<BathIcon />} label="Bathrooms" value={property.baths != null ? String(property.baths) : "N/A"} />
              <DetailCard icon={<AreaIcon />} label="Area" value={property.area ? `${property.area} sq.ft` : "N/A"} />
              <DetailCard icon={<HomeIcon />} label="Type" value={property.type || "N/A"} />
              <DetailCard icon={<MapPinIcon />} label="City" value={property.city || "N/A"} />
              <DetailCard icon={<ListIcon />} label="Listing" value={property.listingType || property.status || "N/A"} />
              <DetailCard icon={<StarIcon />} label="Featured" value={property.featured ? "Yes" : "No"} filled={property.featured} />
              <DetailCard icon={<ShieldIcon />} label="Verified" value={property.verified ? "Yes" : "No"} filled={property.verified} />
              <DetailCard icon={<EyeIcon />} label="Views" value={property.views != null ? String(property.views) : "0"} />
              <DetailCard icon={<CarIcon />} label="Parking" value={property.parking ? "Yes" : "No"} filled={property.parking} />
              <DetailCard icon={<TagIcon />} label="RERA" value={property.rera || "N/A"} />
              <DetailCard icon={<BadgeCheckIcon />} label="Status" value={approvalStatus} badge status={approvalStatus} />
            </div>
          </div>

          {/* Description */}
          {property.description && (
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-5 border border-estate-border">
              <SectionHeader icon={<DescriptionIcon />} title="Description" />
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap mt-3">{property.description}</p>
            </div>
          )}

          {/* Amenities */}
          {property.amenities && Array.isArray(property.amenities) && property.amenities.length > 0 && (
            <div>
              <SectionHeader icon={<AmenitiesIcon />} title="Amenities" />
              <div className="flex flex-wrap gap-2 mt-4">
                {property.amenities.map((a: string, i: number) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-50 text-teal-700 text-xs font-medium rounded-full border border-teal-200 shadow-sm">
                    <span className="text-teal-500">✓</span>
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Nearby Amenities */}
          {property.nearbyAmenities && typeof property.nearbyAmenities === 'object' && Object.keys(property.nearbyAmenities).length > 0 && (
            (() => {
              const validEntries = Object.entries(property.nearbyAmenities).filter(([key, val]) => {
                const distance = val && typeof val === "object" && val !== null ? (val as any).distance : null;
                const name = val && typeof val === "object" && val !== null ? (val as any).name : null;
                return (
                  distance !== null &&
                  distance !== undefined &&
                  distance !== "N/A" &&
                  distance !== "NA" &&
                  name !== "Not Found" &&
                  name !== "Nearby Location"
                );
              });
              if (validEntries.length === 0) return null;
              return (
                <div>
                  <SectionHeader icon={<NearbyIcon />} title="Nearby Amenities" />
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
                    {validEntries.map(([key, val]) => {
                      const emoji = NEARBY_ICONS[key] || "📍";
                      const label = key.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase());
                      const distance = (val as any).distance;
                      const unit = (val as any).unit;
                      const distanceStr = unit ? `${distance} ${unit}` : /[a-z]/i.test(String(distance)) ? distance : `${distance} km`;
                      return (
                        <div
                          key={key}
                          className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-white hover:shadow-sm hover:border-emerald-200 transition-all duration-200"
                        >
                          <span className="text-lg">{emoji}</span>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-gray-700 truncate">{label}</p>
                            <p className="text-xs text-gray-400">
                              {distanceStr}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()
          )}

          {/* Owner/Lister Info */}
          {(listerName || property.lister_name || property.agent) && (
            <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-5 border border-indigo-100 shadow-sm">
              <SectionHeader icon={<UserIcon />} title="Owner / Lister Information" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <InfoRow icon={<PersonIcon />} label="Name" value={listerName || property.lister_name || property.agent?.name || "Not Assigned"} />
                <InfoRow icon={<UserTypeIcon />} label="Type" value={listerType || (property.lister_type ? property.lister_type.charAt(0).toUpperCase() + property.lister_type.slice(1) : "N/A")} />
                <InfoRow icon={<PhoneIcon />} label="Phone" value={listerPhone || property.lister_phone || "N/A"} />
                <InfoRow icon={<MailIcon />} label="Email" value={property.agent?.email || property.lister_email || "N/A"} />
              </div>
            </div>
          )}

          {/* Extra Details */}
          {property.coordinates && (
            <div>
              <SectionHeader icon={<CoordinatesIcon />} title="Coordinates" />
              <div className="mt-3 flex gap-4 text-sm">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg text-gray-700 font-mono">
                  <span className="text-gray-400 text-xs">Lat</span> {property.coordinates.lat}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg text-gray-700 font-mono">
                  <span className="text-gray-400 text-xs">Lng</span> {property.coordinates.lng}
                </span>
              </div>
            </div>
          )}

          {/* Created At */}
          {property.createdAt && (
            <div className="flex items-center gap-2 text-xs text-gray-400 pt-2 border-t border-gray-100">
              <CalendarIcon />
              Listed on {new Date(property.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {(isPending || approvalStatus === "Rejected") && (
          <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-estate-border rounded-b-3xl p-4 flex justify-end gap-3">
            {isPending && onReject && (
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="px-5 py-2.5 min-h-[44px] bg-white text-rose-600 border-2 border-rose-200 hover:bg-rose-50 hover:border-rose-300 rounded-xl text-sm font-semibold transition disabled:opacity-50 flex items-center gap-2"
              >
                <XCircleIcon />
                {actionLoading ? "Processing..." : "Reject"}
              </button>
            )}
            {isPending && onApprove && (
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="px-6 py-2.5 min-h-[44px] bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 rounded-xl text-sm font-semibold transition shadow-lg shadow-emerald-200 disabled:opacity-50 flex items-center gap-2"
              >
                {actionLoading ? (
                  <span className="flex items-center gap-2">
                    <SpinnerIcon />
                    Approving...
                  </span>
                ) : (
                  <>
                    <CheckCircleIcon />
                    Approve Property
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Sub Components ─── */

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="p-1.5 rounded-lg bg-estate-navy/5 text-estate-navy">
        {icon}
      </div>
      <h3 className="text-sm font-bold text-estate-navy uppercase tracking-wider">{title}</h3>
    </div>
  );
}

function DetailCard({
  icon,
  label,
  value,
  badge,
  status,
  filled,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  badge?: boolean;
  status?: string;
  filled?: boolean;
}) {
  if (badge) {
    const colorMap: Record<string, string> = {
      Approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
      Pending: "bg-amber-100 text-amber-800 border-amber-200",
      Rejected: "bg-rose-100 text-rose-800 border-rose-200",
      Suspended: "bg-purple-100 text-purple-800 border-purple-200",
    };
    return (
      <div className="bg-white rounded-xl border border-estate-border p-3 flex flex-col items-start gap-1.5">
        <div className="text-estate-muted">{icon}</div>
        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">{label}</span>
        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorMap[status || ""] || "bg-gray-100 text-gray-800 border-gray-200"}`}>
          {value}
        </span>
      </div>
    );
  }
  return (
    <div className={`bg-white rounded-xl border p-3 flex flex-col items-start gap-1.5 transition-all duration-200 ${
      filled ? "border-amber-200 bg-amber-50/30" : "border-estate-border"
    }`}>
      <div className={filled ? "text-amber-500" : "text-estate-muted"}>{icon}</div>
      <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">{label}</span>
      <span className="text-sm font-semibold text-estate-text">{value}</span>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-indigo-100 shadow-sm">
      <div className="p-2 rounded-lg bg-indigo-50 text-indigo-500">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">{label}</p>
        <p className="text-sm font-semibold text-gray-800 truncate">{value}</p>
      </div>
    </div>
  );
}

/* ─── Icons ─── */

function CloseIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function TagIcon({ className }: { className?: string }) {
  return (
    <svg className={className || "w-4 h-4"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}

function BedIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v11a1 1 0 001 1h16a1 1 0 001-1V7M3 7h18M3 7l3 6h12l3-6M3 7l-1 4m19-4l1 4" />
    </svg>
  );
}

function BathIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10M12 3v4m0 0a4 4 0 01-4 4H6a2 2 0 01-2-2V7a2 2 0 012-2h2a4 4 0 014 4zm0 0a4 4 0 004 4h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2a4 4 0 00-4 4z" />
    </svg>
  );
}

function AreaIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function CarIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 17h14M5 17a2 2 0 01-2-2V9a2 2 0 012-2h1l2-3h8l2 3h1a2 2 0 012 2v6a2 2 0 01-2 2M5 17a2 2 0 002 2h10a2 2 0 002-2M9 13h6" />
    </svg>
  );
}

function BadgeCheckIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  );
}

function DescriptionIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
    </svg>
  );
}

function AmenitiesIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}

function NearbyIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11v2m0 0v2m0-2h2m-2 0h-2" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function UserTypeIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function CoordinatesIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function XCircleIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
