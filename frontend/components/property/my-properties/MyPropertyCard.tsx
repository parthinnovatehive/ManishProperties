"use client";

import { Property } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Star,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  Sparkles,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState } from "react";

interface MyPropertyCardProps {
  property: Property;
  onView?: (property: Property) => void;
  onEdit?: (property: Property) => void;
  onDelete?: (property: Property) => void;
  onFeatureRequest?: (property: Property) => void;
}

export function MyPropertyCard({
  property,
  onView,
  onEdit,
  onDelete,
  onFeatureRequest,
}: MyPropertyCardProps) {
  const [imgError, setImgError] = useState(false);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "APPROVED":
        return { variant: "success" as const, label: "Active" };
      case "PENDING":
        return { variant: "amber" as const, label: "Pending" };
      case "REJECTED":
        return { variant: "muted" as const, label: "Rejected" };
      default:
        return { variant: "blue" as const, label: status };
    }
  };

  const statusConfig = getStatusConfig(property.status);
  const imageSrc =
    !imgError && (property.img || property.image)
      ? property.img || property.image || ""
      : "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=500&q=70";

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getDaysRemaining = (expiryDate: string | null | undefined): number | null => {
    if (!expiryDate) return null;
    try {
      const now = new Date();
      const expiry = new Date(expiryDate);
      const diff = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return diff;
    } catch {
      return null;
    }
  };

  const handleCardClick = () => {
    onView?.(property);
  };

  return (
    <Card className="flex flex-col h-full group overflow-hidden cursor-pointer" onClick={handleCardClick}>
      {/* Property Image & Badges */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-estate-surface">
        <Image
          src={imageSrc}
          alt={property.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setImgError(true)}
        />
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
          {property.featured && (
            (() => {
              const daysLeft = getDaysRemaining(property.featuredExpiryDate);
              let label = "Featured";
              let colorClass = "bg-estate-amber-pale text-estate-amber-dark";

              if (daysLeft !== null) {
                if (daysLeft <= 0) {
                  label = "Expired";
                  colorClass = "bg-rose-50 text-rose-600";
                } else if (daysLeft <= 3) {
                  label = `${daysLeft} day${daysLeft > 1 ? 's' : ''} left`;
                  colorClass = "bg-rose-50 text-rose-600";
                } else if (daysLeft <= 7) {
                  label = `${daysLeft} days left`;
                  colorClass = "bg-amber-50 text-amber-700";
                } else {
                  label = `${daysLeft} days left`;
                  colorClass = "bg-emerald-50 text-emerald-700";
                }
              }

              return (
                <span
                  className={`inline-flex items-center gap-1 font-bold text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full shadow-sm ${colorClass}`}
                  title={property.featuredExpiryDate ? `Expires on ${new Date(property.featuredExpiryDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}` : "Featured indefinitely"}
                >
                  <Star className="w-2.5 h-2.5 fill-current" /> {label}
                </span>
              );
            })()
          )}

          {property.featuredRequested && property.featuredPaymentStatus === "pending" && (
            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 font-bold text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full shadow-sm">
              <Clock className="w-2.5 h-2.5" /> Requested
            </span>
          )}

          {property.featuredPaymentStatus === "rejected" && (
            <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-600 font-bold text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full shadow-sm">
              <AlertCircle className="w-2.5 h-2.5" /> Rejected
            </span>
          )}
        </div>
        <div className="absolute top-3 right-3 z-10">
          <span className="inline-flex items-center gap-1 bg-white/90 backdrop-blur-sm text-estate-navy font-bold text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full shadow-sm">
            {property.category === "commercial" ? "Commercial" : "Residential"}
          </span>
        </div>
        <div className="absolute bottom-3 right-3 bg-estate-navy text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-md backdrop-blur-sm bg-opacity-90">
          {property.type}
        </div>
      </div>

      {/* Property Details */}
      <div className="p-5 flex-1 flex flex-col justify-between" onClick={(e) => e.stopPropagation()}>
        <div>
          <div className="text-xl font-extrabold text-estate-navy tracking-tight">
            {property.price}
          </div>
          <h3 className="text-base font-bold text-estate-text mt-1.5 line-clamp-1 group-hover:text-estate-navy-mid transition-colors">
            {property.title}
          </h3>
          <div className="flex items-center gap-1 text-estate-text-sec text-xs mt-1">
            <MapPin className="w-3.5 h-3.5 text-estate-navy-light flex-shrink-0" />
            <span className="truncate">{property.location || property.city}</span>
          </div>

          {/* Specs grid */}
          <div className="grid grid-cols-3 gap-2.5 border-t border-estate-border mt-4 pt-4">
            <div className="flex items-center gap-1.5 text-estate-text-sec">
              <Bed className="w-4 h-4 text-estate-muted" />
              <span className="text-xs font-semibold">{property.beds} Bed</span>
            </div>
            <div className="flex items-center gap-1.5 text-estate-text-sec">
              <Bath className="w-4 h-4 text-estate-muted" />
              <span className="text-xs font-semibold">
                {property.baths ?? property.bathrooms ?? "N/A"} Bath
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-estate-text-sec">
              <Maximize2 className="w-4 h-4 text-estate-muted" />
              <span className="text-xs font-semibold">{property.area} ft&sup2;</span>
            </div>
          </div>

          {/* Listed Date & Views */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-estate-border/50">
            <div className="flex items-center gap-1 text-[11px] text-estate-muted">
              <Calendar className="w-3 h-3" />
              <span>Listed {formatDate(property.createdAt)}</span>
            </div>
            {property.views !== undefined && property.views !== null && (
              <div className="flex items-center gap-1 text-[11px] text-estate-muted">
                <Eye className="w-3 h-3" />
                <span>{property.views} views</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
          <Button
            variant="ghost"
            size="sm"
            className="w-full flex items-center justify-center gap-1 text-[11px] px-1 min-h-[44px]"
            onClick={() => onView?.(property)}
          >
            <Eye className="w-3.5 h-3.5" /> View
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full flex items-center justify-center gap-1 text-[11px] px-1 min-h-[44px]"
            onClick={() => onEdit?.(property)}
          >
            <Edit2 className="w-3.5 h-3.5" /> Edit
          </Button>
          {(() => {
            const daysLeft = getDaysRemaining(property.featuredExpiryDate);
            const isExpired = daysLeft !== null && daysLeft <= 0;
            const isPendingRequest = property.featuredRequested && property.featuredPaymentStatus === "pending";
            const showButton = (!property.featured && !isPendingRequest) || (property.featured && isExpired);
            if (!showButton) return <div />;
            return (
              <Button
                variant="outline"
                size="sm"
                className="w-full flex items-center justify-center gap-1 text-[11px] px-1 min-h-[44px] text-estate-amber-dark border-estate-amber/50 hover:bg-amber-50"
                onClick={() => onFeatureRequest?.(property)}
              >
                <Sparkles className="w-3.5 h-3.5" /> {property.featured && isExpired ? "Renew" : "Feature"}
              </Button>
            );
          })()}
          <Button
            variant="outline"
            size="sm"
            className="w-full flex items-center justify-center gap-1 text-[11px] px-1 min-h-[44px] text-red-600 border-red-200 hover:bg-red-50"
            onClick={() => onDelete?.(property)}
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </Button>
        </div>
      </div>
    </Card>
  );
}
