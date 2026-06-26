"use client";

import { useState, useEffect } from "react";
import { AlertCircle, Clock, Sparkles, X } from "lucide-react";
import { estateApi } from "@/lib/api";
import { FeatureRequestModal } from "@/components/property/my-properties/FeatureRequestModal";
import type { Property } from "@/types";

export function FeaturedExpiryNotification() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    fetchFeaturedProperties();
  }, []);

  const fetchFeaturedProperties = async () => {
    setLoading(true);
    try {
      const currentUserId = getCurrentUserId();
      if (!currentUserId) return;

      const allProperties = await estateApi.adminProperties.list();
      const userProperties = allProperties.filter(
        (p) => p.lister_id === currentUserId
      );

      const featuredProps = userProperties.filter(
        (p) => p.featured === true || p.featuredExpired === true
      );

      setProperties(featuredProps);
    } catch {
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const getDaysRemaining = (expiryDate: string | null | undefined): number | null => {
    if (!expiryDate) return null;
    const now = new Date();
    const expiry = new Date(expiryDate);
    return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getNotificationConfig = (property: Property) => {
    const daysLeft = getDaysRemaining(property.featuredExpiryDate);

    if (property.featuredExpired || (daysLeft !== null && daysLeft <= 0)) {
      return {
        type: "expired",
        title: "Featured Property Expired!",
        message: `"${property.title}" is no longer featured. Renew now to regain visibility.`,
        color: "border-red-200 bg-red-50",
        iconColor: "text-red-600",
      };
    }

    if (daysLeft !== null && daysLeft <= 3) {
      return {
        type: "critical",
        title: `Featured Property Expires in ${daysLeft} Day${daysLeft > 1 ? "s" : ""}!`,
        message: `"${property.title}" will expire soon. Renew to maintain visibility.`,
        color: "border-orange-200 bg-orange-50",
        iconColor: "text-orange-600",
      };
    }

    if (daysLeft !== null && daysLeft <= 7) {
      return {
        type: "warning",
        title: `Featured Property Expires in ${daysLeft} Days`,
        message: `"${property.title}" will expire in ${daysLeft} days. Consider renewing.`,
        color: "border-amber-200 bg-amber-50",
        iconColor: "text-amber-600",
      };
    }

    return null;
  };

  const handleRenew = (property: Property) => {
    setSelectedProperty(property);
    setShowFeatureModal(true);
  };

  const handleFeatureSuccess = () => {
    setShowFeatureModal(false);
    setSelectedProperty(null);
    fetchFeaturedProperties();
  };

  if (loading) return null;
  if (properties.length === 0) return null;
  if (isDismissed) return null;

  const sortedProperties = [...properties].sort((a, b) => {
    const daysA = getDaysRemaining(a.featuredExpiryDate) ?? 999;
    const daysB = getDaysRemaining(b.featuredExpiryDate) ?? 999;
    return daysA - daysB;
  });

  const urgentProperty = sortedProperties[0];
  const config = getNotificationConfig(urgentProperty);

  if (!config) return null;

  return (
    <>
      <div className={`rounded-xl border p-4 mb-6 ${config.color} shadow-sm animate-fade-up`}>
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 mt-0.5 ${config.iconColor}`}>
            {config.type === "expired" ? (
              <AlertCircle className="w-5 h-5" />
            ) : (
              <Clock className="w-5 h-5" />
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-sm text-estate-navy">{config.title}</h4>
              <span className="text-xs bg-white/50 px-2 py-0.5 rounded-full border border-estate-border/50">
                {urgentProperty.title}
              </span>
            </div>
            <p className="text-sm text-estate-text-sec mt-1">{config.message}</p>

            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={() => handleRenew(urgentProperty)}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-estate-navy text-white text-xs font-bold rounded-lg hover:bg-estate-navy-mid transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Renew Featured
              </button>
              <button
                onClick={() => setIsDismissed(true)}
                className="text-xs text-estate-muted hover:text-estate-text transition"
              >
                Dismiss
              </button>
            </div>
          </div>

          <button
            onClick={() => setIsDismissed(true)}
            className="flex-shrink-0 p-1 hover:bg-white/50 rounded-lg transition"
          >
            <X className="w-4 h-4 text-estate-muted" />
          </button>
        </div>
      </div>

      {showFeatureModal && selectedProperty && (
        <FeatureRequestModal
          property={selectedProperty}
          isOpen={showFeatureModal}
          onClose={() => setShowFeatureModal(false)}
          onSuccess={handleFeatureSuccess}
        />
      )}
    </>
  );
}

function getCurrentUserId(): string | null {
  let storedUser = localStorage.getItem("userData");
  if (!storedUser) {
    storedUser = localStorage.getItem("adminData");
  }
  if (storedUser) {
    try {
      const userData = JSON.parse(storedUser);
      return userData.id || null;
    } catch {
      return null;
    }
  }
  return null;
}
