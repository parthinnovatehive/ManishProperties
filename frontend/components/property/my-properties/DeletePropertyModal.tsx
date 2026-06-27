"use client";

import { Property } from "@/types";
import { AlertTriangle, X } from "lucide-react";

interface DeletePropertyModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (property: Property) => void;
}

export function DeletePropertyModal({
  property,
  isOpen,
  onClose,
  onConfirm,
}: DeletePropertyModalProps) {
  if (!isOpen || !property) return null;

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity"
      />
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-estate-lg border border-estate-border overflow-hidden animate-fade-up">
          <div className="p-4 sm:p-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
              <AlertTriangle className="h-7 w-7 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-estate-navy font-serif mb-2">
              Delete Property
            </h3>
            <p className="text-sm text-estate-text-sec mb-1">
              Are you sure you want to delete this property?
            </p>
            <p className="text-sm font-bold text-estate-navy mb-6">
              &ldquo;{property.title}&rdquo;
            </p>
            <p className="text-xs text-red-500 mb-6">
              This action cannot be undone. The property will be permanently removed.
            </p>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 min-h-[44px] rounded-xl border border-estate-border text-sm font-bold text-estate-text-sec hover:bg-estate-surface transition"
              >
                Cancel
              </button>
              <button
                onClick={() => onConfirm(property)}
                className="flex-1 py-2.5 min-h-[44px] rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition"
              >
                Delete Property
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
