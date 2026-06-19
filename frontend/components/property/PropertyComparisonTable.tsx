"use client";

import { X, Check, Minus, MapPin, Building2, Bed, Bath, Ruler, DollarSign, Star, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Property } from "@/types/property";

interface PropertyComparisonTableProps {
  properties: Property[];
  onRemove: (id: string) => void;
  onClose: () => void;
}

const comparisonFields: { key: string; label: string; icon: React.ComponentType<{ className?: string }> | null }[] = [
  { key: "price", label: "Price", icon: DollarSign },
  { key: "type", label: "Property Type", icon: Building2 },
  { key: "beds", label: "Bedrooms", icon: Bed },
  { key: "bathrooms", label: "Bathrooms", icon: Bath },
  { key: "area", label: "Area (sq.ft)", icon: Ruler },
  { key: "city", label: "City", icon: MapPin },
  { key: "furnishing", label: "Furnishing", icon: null },
  { key: "status", label: "Status", icon: null },
];

function getFieldValue(property: Property, key: string): any {
  switch (key) {
    case "beds":
      return property.beds ?? property.bedrooms ?? 0;
    case "bathrooms":
      return property.bathrooms ?? property.baths ?? 0;
    case "city":
      return property.city || "—";
    case "price":
      return property.price || "—";
    case "furnishing":
      return property.furnishing || "—";
    case "status":
      return property.status || "—";
    case "type":
      return property.type || "—";
    case "area":
      return property.area ?? 0;
    default:
      return (property as any)[key] ?? "—";
  }
}

function getImage(property: Property): string | null {
  if (property.images && property.images.length > 0) return property.images[0];
  if (property.image) return property.image;
  if (property.img) return property.img;
  if (property.imgs && property.imgs.length > 0) return property.imgs[0];
  return null;
}

export function PropertyComparisonTable({
  properties,
  onRemove,
  onClose,
}: PropertyComparisonTableProps) {
  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-estate-muted">No properties selected for comparison</p>
      </div>
    );
  }

  const bestPrice = Math.min(...properties.map((p) => p.priceNum ?? Infinity));
  const bestRating = Math.max(...properties.map((p) => p.rating ?? 0));
  const largestArea = Math.max(...properties.map((p) => p.area ?? 0));

  const getBestValue = (key: string, value: any, property: Property) => {
    if (key === "price" && (property.priceNum ?? Infinity) === bestPrice) return "best";
    if (key === "rating" && (property.rating ?? 0) === bestRating && bestRating > 0) return "best";
    if (key === "area" && (property.area ?? 0) === largestArea) return "best";
    return null;
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[768px]">
        {/* Header - Property Images */}
        <div className="grid grid-cols-[180px_1fr] gap-0 border-b border-estate-border">
          <div className="p-4 bg-gray-50 font-semibold text-estate-muted text-sm flex items-center gap-2">
            <Home className="w-4 h-4" />
            Compare Properties
          </div>
          <div className="grid gap-0" style={{ gridTemplateColumns: `repeat(${properties.length}, 1fr)` }}>
            {properties.map((property) => {
              const img = getImage(property);
              return (
                <div key={String(property.id)} className="relative p-4 border-l border-estate-border">
                  <button
                    onClick={() => onRemove(String(property.id))}
                    className="absolute top-2 right-2 p-1 bg-red-100 text-red-500 rounded-full hover:bg-red-200 transition z-10"
                    title="Remove from comparison"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
                    {img ? (
                      <Image
                        src={img}
                        alt={property.title}
                        width={200}
                        height={150}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-estate-blue-pale">
                        <Building2 className="w-12 h-12 text-estate-muted" />
                      </div>
                    )}
                  </div>
                  <h3 className="mt-2 text-sm font-semibold text-estate-navy line-clamp-1">
                    {property.title}
                  </h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {property.featured && (
                      <span className="inline-block text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                        Featured
                      </span>
                    )}
                    {property.isNew && (
                      <span className="inline-block text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        New
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Comparison Rows */}
        {comparisonFields.map((field) => (
          <div
            key={field.key}
            className="grid grid-cols-[180px_1fr] gap-0 border-b border-estate-border hover:bg-gray-50 transition"
          >
            <div className="p-3 bg-gray-50 flex items-center gap-2 text-sm font-medium text-estate-text">
              {field.icon && <field.icon className="w-4 h-4 text-estate-muted" />}
              {field.label}
            </div>
            <div className="grid gap-0" style={{ gridTemplateColumns: `repeat(${properties.length}, 1fr)` }}>
              {properties.map((property) => {
                const value = getFieldValue(property, field.key);
                const best = getBestValue(field.key, value, property);

                return (
                  <div
                    key={String(property.id)}
                    className={cn(
                      "p-3 border-l border-estate-border flex items-center",
                      best === "best" ? "bg-green-50" : ""
                    )}
                  >
                    <span
                      className={cn(
                        "text-sm",
                        best === "best" ? "font-bold text-green-700" : "text-estate-text"
                      )}
                    >
                      {value !== undefined && value !== null && value !== "—" ? (
                        field.key === "price" ? (
                          value
                        ) : typeof value === "boolean" ? (
                          value ? <Check className="w-5 h-5 text-green-600" /> : <Minus className="w-5 h-5 text-gray-300" />
                        ) : (
                          String(value)
                        )
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </span>
                    {best === "best" && (
                      <span className="ml-2 text-xs bg-green-200 text-green-700 px-1.5 py-0.5 rounded-full flex-shrink-0">
                        Best
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Amenities Row */}
        <div className="grid grid-cols-[180px_1fr] gap-0 border-b border-estate-border">
          <div className="p-3 bg-gray-50 flex items-center gap-2 text-sm font-medium text-estate-text">
            Amenities
          </div>
          <div className="grid gap-0" style={{ gridTemplateColumns: `repeat(${properties.length}, 1fr)` }}>
            {properties.map((property) => {
              const amenities = property.amenities ?? [];
              return (
                <div key={String(property.id)} className="p-3 border-l border-estate-border">
                  <div className="flex flex-wrap gap-1">
                    {amenities.slice(0, 4).map((amenity, index) => (
                      <span
                        key={index}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full"
                      >
                        {amenity}
                      </span>
                    ))}
                    {amenities.length > 4 && (
                      <span className="text-xs text-estate-muted">+{amenities.length - 4} more</span>
                    )}
                    {amenities.length === 0 && (
                      <span className="text-xs text-gray-400">No amenities listed</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Description Row */}
        <div className="grid grid-cols-[180px_1fr] gap-0 border-b border-estate-border">
          <div className="p-3 bg-gray-50 flex items-center gap-2 text-sm font-medium text-estate-text">
            Description
          </div>
          <div className="grid gap-0" style={{ gridTemplateColumns: `repeat(${properties.length}, 1fr)` }}>
            {properties.map((property) => (
              <div key={String(property.id)} className="p-3 border-l border-estate-border">
                <p className="text-sm text-estate-text-sec line-clamp-3">
                  {property.description || "No description available"}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Rating & Reviews Row */}
        <div className="grid grid-cols-[180px_1fr] gap-0">
          <div className="p-3 bg-gray-50 flex items-center gap-2 text-sm font-medium text-estate-text">
            <Star className="w-4 h-4 text-amber-500" />
            Rating
          </div>
          <div className="grid gap-0" style={{ gridTemplateColumns: `repeat(${properties.length}, 1fr)` }}>
            {properties.map((property) => {
              const rating = property.rating ?? 0;
              const best = getBestValue("rating", rating, property);
              return (
                <div
                  key={String(property.id)}
                  className={cn(
                    "p-3 border-l border-estate-border flex items-center gap-2",
                    best === "best" ? "bg-green-50" : ""
                  )}
                >
                  <span
                    className={cn(
                      "text-sm font-medium",
                      best === "best" ? "text-green-700" : "text-estate-text"
                    )}
                  >
                    {rating > 0 ? `${rating.toFixed(1)} ⭐` : "No ratings"}
                  </span>
                  {(property.reviews ?? 0) > 0 && (
                    <span className="text-xs text-estate-muted">({property.reviews} reviews)</span>
                  )}
                  {best === "best" && rating > 0 && (
                    <span className="ml-2 text-xs bg-green-200 text-green-700 px-1.5 py-0.5 rounded-full">
                      Best
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
