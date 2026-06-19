"use client";

import { useState, useEffect } from "react";
import { X, Scale, Download, Printer, Share2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PropertyComparisonTable } from "./PropertyComparisonTable";
import { usePropertyComparison } from "@/hooks/usePropertyComparison";
import { estateApi } from "@/lib/api";
import { toast } from "sonner";

interface PropertyComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PropertyComparisonModal({ isOpen, onClose }: PropertyComparisonModalProps) {
  const { selectedIds, removeProperty, clearSelection, selectedCount, maxLimit } = usePropertyComparison();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && selectedIds.length > 0) {
      const fetchProperties = async () => {
        setLoading(true);
        try {
          const response = await estateApi.properties.getByIds(selectedIds);
          setProperties(response || []);
        } catch (error) {
          console.error("Failed to fetch properties:", error);
          toast.error("Failed to load comparison data");
        } finally {
          setLoading(false);
        }
      };
      fetchProperties();
    } else if (isOpen && selectedIds.length === 0) {
      setProperties([]);
      setLoading(false);
    }
  }, [isOpen, selectedIds]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const url = `${window.location.origin}/compare?ids=${selectedIds.join(",")}`;
    navigator.clipboard.writeText(url);
    toast.success("Comparison link copied to clipboard!");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-estate-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <Scale className="w-6 h-6 text-estate-navy" />
            <h2 className="text-xl font-bold text-estate-navy">Compare Properties</h2>
            <span className="text-sm text-estate-muted">
              ({properties.length} of {selectedCount} selected)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 hover:bg-gray-100 rounded-lg transition text-estate-muted hover:text-estate-navy"
              title="Print"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={handleShare}
              className="p-2 hover:bg-gray-100 rounded-lg transition text-estate-muted hover:text-estate-navy"
              title="Share"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                clearSelection();
                onClose();
              }}
              className="px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 rounded-lg transition"
            >
              Clear All
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-estate-navy border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-estate-muted">Loading properties...</p>
              </div>
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-12">
              <Scale className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-estate-text">No properties to compare</h3>
              <p className="text-estate-muted mt-2">
                Select properties from the listing to start comparing
              </p>
              <Button onClick={onClose} className="mt-4" variant="navy">
                Browse Properties
              </Button>
            </div>
          ) : (
            <PropertyComparisonTable
              properties={properties}
              onRemove={removeProperty}
              onClose={onClose}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-4 border-t border-estate-border bg-gray-50 flex-shrink-0">
          <p className="text-sm text-estate-muted">
            Showing {properties.length} of {selectedCount} selected properties {selectedCount < maxLimit && `(add ${maxLimit - selectedCount} more)`}
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="navy" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}