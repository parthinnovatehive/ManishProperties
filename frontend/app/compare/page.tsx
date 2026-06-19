"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { estateApi } from "@/lib/api";
import { PropertyComparisonTable } from "@/components/property/PropertyComparisonTable";
import { usePropertyComparison } from "@/hooks/usePropertyComparison";
import { ArrowLeft, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Property } from "@/types/property";

export default function ComparePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { selectedIds, removeProperty, deselectAll } = usePropertyComparison();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const idsParam = searchParams.get("ids");

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        let ids: string[] = [];
        if (idsParam) {
          ids = idsParam.split(",").filter(Boolean);
        }
        if (ids.length === 0 && selectedIds.length > 0) {
          ids = selectedIds;
        }
        if (ids.length === 0) {
          setProperties([]);
          setLoading(false);
          return;
        }
        const response = await estateApi.properties.getByIds(ids);
        setProperties(response || []);
      } catch (error) {
        console.error("Failed to fetch properties:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, [idsParam]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-200 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Scale className="w-6 h-6 text-estate-navy" />
            <h1 className="text-2xl font-bold text-estate-navy font-serif">Property Comparison</h1>
            <span className="text-sm text-estate-muted">({properties.length} properties)</span>
          </div>
          <div className="flex items-center gap-2">
            {properties.length >= 2 && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.print()}
              >
                Print
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                deselectAll();
                router.push("/properties");
              }}
              className="text-red-500"
            >
              Clear All
            </Button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-estate-navy border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-estate-muted">Loading properties...</p>
            </div>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-24">
            <Scale className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-estate-text mb-2">No properties to compare</h2>
            <p className="text-estate-muted mb-6">
              Select properties from the listing to start comparing
            </p>
            <Button variant="navy" onClick={() => router.push("/properties")}>
              Browse Properties
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-estate-border shadow-estate overflow-hidden">
            <PropertyComparisonTable
              properties={properties}
              onRemove={(id) => {
                removeProperty(id);
                setProperties((prev) => prev.filter((p) => String(p.id) !== id));
              }}
              onClose={() => router.push("/properties")}
            />
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push("/properties")}
            className="text-sm text-estate-navy font-semibold hover:underline"
          >
            ← Back to Properties
          </button>
        </div>
      </div>
    </div>
  );
}
