"use client";

import { useState, useEffect } from "react";
import { Scale, ChevronUp, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { usePropertyComparison } from "@/hooks/usePropertyComparison";
import { estateApi } from "@/lib/api";

interface PropertyComparisonButtonProps {
  onOpenComparison: () => void;
}

interface PropertyItem {
  id: string;
  title: string;
  image?: string;
  price?: string;
}

export function PropertyComparisonButton({ onOpenComparison }: PropertyComparisonButtonProps) {
  const { selectedIds, selectedCount, maxLimit, removeProperty, clearSelection, getRemainingSlots } =
    usePropertyComparison();
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (selectedIds.length > 0) {
      const fetchSelectedProperties = async () => {
        try {
          const response = await estateApi.properties.getByIds(selectedIds);
          const mapped: PropertyItem[] = (response || []).map((p: any) => ({
            id: String(p.id),
            title: p.title || "Property",
            image: p.images?.[0] || p.image || p.img || undefined,
            price: p.price,
          }));
          setProperties(mapped);
        } catch {
          setProperties(
            selectedIds.map(id => ({ id, title: "Property", image: undefined }))
          );
        }
      };
      fetchSelectedProperties();
    } else {
      setProperties([]);
      setIsExpanded(false);
    }
  }, [selectedIds]);

  if (selectedIds.length === 0) return null;

  const remainingSlots = getRemainingSlots();

  return (
    <div className="fixed bottom-6 left-1/2 z-[9999] w-full max-w-2xl -translate-x-1/2 px-4">
      <div
        className={cn(
          "bg-white rounded-2xl shadow-2xl border border-estate-border transition-all duration-300",
          isExpanded ? "rounded-b-2xl" : ""
        )}
      >
        <div
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition rounded-2xl"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Scale className="w-5 h-5 text-estate-navy" />
                {selectedCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-estate-amber text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {selectedCount}
                  </span>
                )}
              </div>
              <span className="font-semibold text-estate-navy">
                Compare ({selectedCount}/{maxLimit})
              </span>
            </div>
            <div className="flex -space-x-2">
              {properties.slice(0, 3).map((property) => (
                <div
                  key={property.id}
                  className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 overflow-hidden shadow-sm"
                >
                  {property.image ? (
                    <img
                      src={property.image}
                      alt={property.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                        (e.target as HTMLImageElement).parentElement!.innerHTML =
                          `<div class="w-full h-full flex items-center justify-center bg-estate-blue-pale text-xs font-bold text-estate-navy">${property.title?.charAt(0) || "P"}</div>`;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-estate-blue-pale text-xs font-bold text-estate-navy">
                      {property.title?.charAt(0) || "P"}
                    </div>
                  )}
                </div>
              ))}
              {selectedCount > 3 && (
                <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                  +{selectedCount - 3}
                </div>
              )}
            </div>
            {remainingSlots > 0 && (
              <span className="text-xs text-estate-muted hidden sm:inline">
                {remainingSlots} slot{remainingSlots > 1 ? "s" : ""} remaining
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="navy"
              onClick={(e) => {
                e.stopPropagation();
                onOpenComparison();
              }}
              className="text-xs px-4 py-1.5 rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              Compare Now
            </Button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="p-1 hover:bg-gray-100 rounded-lg transition"
            >
              <ChevronUp
                className={cn(
                  "w-5 h-5 text-gray-500 transition-transform duration-300",
                  isExpanded ? "rotate-180" : ""
                )}
              />
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="border-t border-estate-border p-4 bg-gray-50 rounded-b-2xl">
            <div className="flex flex-wrap gap-2 mb-3">
              {properties.map((property) => (
                <div
                  key={property.id}
                  className="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5 border border-estate-border shadow-sm"
                >
                  <div className="w-6 h-6 rounded overflow-hidden flex-shrink-0 bg-gray-100">
                    {property.image ? (
                      <img
                        src={property.image}
                        alt={property.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                          (e.target as HTMLImageElement).parentElement!.innerHTML =
                            `<div class="w-full h-full flex items-center justify-center bg-estate-blue-pale text-xs font-bold text-estate-navy">${property.title?.charAt(0) || "P"}</div>`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-estate-blue-pale text-xs font-bold text-estate-navy">
                        {property.title?.charAt(0) || "P"}
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-medium text-estate-text truncate max-w-[100px]">
                    {property.title || "Property"}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeProperty(property.id);
                    }}
                    className="text-gray-400 hover:text-red-500 transition"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {remainingSlots > 0 && (
                <div className="flex items-center gap-1 text-xs text-estate-muted bg-gray-100 rounded-lg px-3 py-1.5">
                  <Plus className="w-3 h-3" />
                  Add {remainingSlots} more
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-estate-muted">
                {selectedCount} of {maxLimit} properties selected
              </span>
              <div className="flex gap-2">
                {remainingSlots === 0 && (
                  <span className="text-xs text-amber-600 font-medium">MAX limit reached</span>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearSelection();
                    setIsExpanded(false);
                  }}
                  className="text-xs text-red-500 hover:text-red-600 font-medium"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
