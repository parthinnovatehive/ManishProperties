"use client";

import Link from "next/link";
import { Bath, Bed, Heart, MapPin, Maximize2, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import type { Property } from "@/types";
import { useSavedProperties } from "@/lib/saved-properties-context";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type PropertyCardProps = {
  property: Property;
  compact?: boolean;
};

function listingStatus(property: Property) {
  if (property.listingType === "Sell") return "For Sale";
  if (property.listingType === "Rent") return "For Rent";
  if (property.listingType) return property.listingType;
  if (property.status === "For Sale" || property.status === "For Rent") return property.status;
  return "For Sale";
}

export function PropertyCard({ property, compact }: PropertyCardProps) {
  const { isSaved, toggleSaved } = useSavedProperties();
  const saved = isSaved(property.id);
      const image =
      property.img ||
      property.image ||
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=700&auto=format&q=75";

    const agent = property.agent || {
      name: "EstateElite Agent",
      avatar: "",
      deals: 0,
    };

    const beds = property.beds || 0;

    const baths =
      property.baths ||
      property.bathrooms ||
      0;

    const verified =
      property.verified || false;

    const propertyType =
      property.type || "Property";

    const propertyStatus = listingStatus(property);

    const propertyLocation =
      property.location || property.city || "India";

    const propertyPrice =
      property.price || "Price on Request";

  return (
    <Card className="group cursor-pointer rounded-[20px] border-estate-border/90 shadow-estate hover:-translate-y-1.5 hover:shadow-estate-lg">
      <div className="relative overflow-hidden bg-estate-navy">
        <Link href={`/properties/${property.id}`} aria-label={`View ${property.title}`} className="block">
          <img
            src={image}
            alt={property.title}
            loading="lazy"
            className={cn(
              "w-full object-cover transition duration-500 group-hover:scale-[1.045] group-hover:saturate-[1.08]",
              compact ? "h-[188px]" : "h-[232px]",
            )}
            onError={(event) => {
              event.currentTarget.src = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=700&auto=format&q=75";
            }}
          />
          <span className="absolute inset-0 bg-gradient-to-t from-estate-navy/72 via-estate-navy/10 to-transparent opacity-80 transition group-hover:opacity-95" />
          <span className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
        </Link>

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {verified && (
            <Badge variant="success" className="shadow-[0_8px_22px_rgba(0,0,0,0.12)]">
              <ShieldCheck size={10} aria-hidden="true" /> Verified
            </Badge>
          )}
          {property.isNew && (
            <Badge variant="navy" className="shadow-[0_8px_22px_rgba(0,0,0,0.12)]">
              New
            </Badge>
          )}
          <Badge variant={propertyStatus === "For Sale" ? "blue" : "amber"} className="shadow-[0_8px_22px_rgba(0,0,0,0.12)]">
            {propertyStatus}
          </Badge>
        </div>

        <button
          aria-label={saved ? "Remove saved property" : "Save property"}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-white/95 shadow-[0_10px_26px_rgba(0,0,0,0.18)] backdrop-blur transition hover:scale-105 hover:bg-white active:scale-95"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            toggleSaved(property.id);
          }}
        >
          <Heart
            size={16}
            aria-hidden="true"
            className={saved ? "fill-estate-red text-estate-red" : "text-estate-text-sec"}
          />
        </button>

        <div className="absolute bottom-3 left-3 rounded-xl border border-white/10 bg-estate-navy/95 px-3.5 py-2 text-[15px] font-extrabold leading-none text-white shadow-estate backdrop-blur">
          {propertyPrice}
        </div>
      </div>

      <Link href={`/properties/${property.id}`} className={cn("block", compact ? "p-5" : "p-6")}>
        <div className="mb-2 flex items-start justify-between gap-2.5">
          <h3 className={cn("flex-1 font-bold leading-snug text-estate-text transition group-hover:text-estate-navy", compact ? "text-[15px]" : "text-base")}>
            {property.title}
          </h3>
          <Badge variant="muted" size="sm" className="mt-0.5">
            {propertyType}
          </Badge>
        </div>

        <div className={cn("flex items-center gap-1.5 text-[13px] font-medium text-estate-text-sec", compact ? "mb-3" : "mb-4")}>
          <MapPin size={13} aria-hidden="true" className="shrink-0 text-estate-blue" />
          {propertyLocation}
        </div>

        <div className={cn("mb-4 flex flex-wrap gap-2.5 border-b border-estate-border pb-4 text-[13px] font-semibold text-estate-text-sec", !compact && "sm:gap-3")}>
          {beds > 0 && (
            <span className="flex items-center gap-1.5 rounded-full bg-estate-bg px-2.5 py-1.5">
              <Bed size={14} aria-hidden="true" className="text-estate-blue" />
              {beds} Beds
            </span>
          )}
          {baths > 0 && (
            <span className="flex items-center gap-1.5 rounded-full bg-estate-bg px-2.5 py-1.5">
              <Bath size={14} aria-hidden="true" className="text-estate-blue" />
              {baths} Baths
            </span>
          )}
          <span className="flex items-center gap-1.5 rounded-full bg-estate-bg px-2.5 py-1.5">
            <Maximize2 size={14} aria-hidden="true" className="text-estate-blue" />
            {property.area.toLocaleString("en-IN")} ft²
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">

          {property.listingType && (
            <span className="rounded-full bg-estate-blue-pale px-3 py-1 text-xs font-semibold text-estate-blue">
              {property.listingType}
            </span>
          )}

          {property.furnishing && (
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
              {property.furnishing}
            </span>
          )}

        </div>

        {property.amenities?.length > 0 && (

          <div className="mt-3 flex flex-wrap gap-2">

            {property.amenities.slice(0, 3).map((item: string) => (

              <span key={item} className="rounded-full border border-estate-border bg-estate-bg px-2.5 py-1 text-xs text-estate-text-sec">
                {item}
              </span>

            ))}

          </div>

        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar initials={agent.avatar || "EA"} size="sm" />
            <div>
              <div className="text-xs font-semibold text-estate-text">{agent.name}</div>
              <div className="text-[11px] text-estate-muted">{agent.deals} deals</div>
            </div>
          </div>
          <div className="flex gap-1.5">
            {[Phone, MessageCircle].map((Icon, index) => (
              <button
                key={index}
                aria-label={index === 0 ? "Call agent" : "Message agent"}
                className="flex h-9 w-9 items-center justify-center rounded-xl border-[1.5px] border-estate-border bg-white text-estate-blue shadow-sm transition hover:-translate-y-px hover:border-estate-blue hover:bg-estate-blue-pale active:translate-y-0"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
              >
                <Icon size={14} aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      </Link>
    </Card>
  );
}
