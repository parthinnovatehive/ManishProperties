"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";

const MAX_COMPARISON_LIMIT = 4;
const STORAGE_KEY = "property_comparison_selection";

interface ComparisonContextType {
  selectedIds: string[];
  toggleProperty: (id: string) => void;
  selectAll: (ids: string[]) => void;
  deselectAll: () => void;
  isSelected: (id: string) => boolean;
  clearSelection: () => void;
  canSelectMore: boolean;
  selectedCount: number;
  maxLimit: number;
  removeProperty: (id: string) => void;
  isMaxLimitReached: boolean;
  getRemainingSlots: () => number;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export function ComparisonProvider({ children }: { children: React.ReactNode }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const initRef = useRef(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length <= MAX_COMPARISON_LIMIT) {
          setSelectedIds(parsed);
        }
      }
    } catch { /* ignore */ }
    initRef.current = true;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        try {
          const parsed = JSON.parse(e.newValue || "[]");
          if (Array.isArray(parsed) && parsed.length <= MAX_COMPARISON_LIMIT) {
            setSelectedIds(parsed);
          }
        } catch { /* ignore */ }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    if (initRef.current) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedIds));
      } catch { /* ignore */ }
    }
  }, [selectedIds]);

  const toggleProperty = useCallback((id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id);
      if (prev.length >= MAX_COMPARISON_LIMIT) return prev;
      return [...prev, id];
    });
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    setSelectedIds((prev) => {
      const combined = [...prev];
      const availableSlots = MAX_COMPARISON_LIMIT - combined.length;
      const idsToAdd = ids.filter((id) => !combined.includes(id)).slice(0, availableSlots);
      return [...combined, ...idsToAdd];
    });
  }, []);

  const deselectAll = useCallback(() => setSelectedIds([]), []);
  const clearSelection = useCallback(() => setSelectedIds([]), []);

  const isSelected = useCallback((id: string) => selectedIds.includes(id), [selectedIds]);

  const removeProperty = useCallback((id: string) => {
    setSelectedIds((prev) => prev.filter((item) => item !== id));
  }, []);

  const getRemainingSlots = useCallback(() => MAX_COMPARISON_LIMIT - selectedIds.length, [selectedIds.length]);

  const canSelectMore = selectedIds.length < MAX_COMPARISON_LIMIT;
  const isMaxLimitReached = selectedIds.length >= MAX_COMPARISON_LIMIT;

  return (
    <ComparisonContext.Provider
      value={{
        selectedIds,
        toggleProperty,
        selectAll,
        deselectAll,
        isSelected,
        clearSelection,
        canSelectMore,
        selectedCount: selectedIds.length,
        maxLimit: MAX_COMPARISON_LIMIT,
        removeProperty,
        isMaxLimitReached,
        getRemainingSlots,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
}

export function usePropertyComparison(): ComparisonContextType {
  const context = useContext(ComparisonContext);
  if (context) return context;

  // Fallback for components not wrapped in provider (uses isolated state)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const initRef = useRef(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length <= MAX_COMPARISON_LIMIT) {
          setSelectedIds(parsed);
        }
      }
    } catch { /* ignore */ }
    initRef.current = true;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        try {
          const parsed = JSON.parse(e.newValue || "[]");
          if (Array.isArray(parsed) && parsed.length <= MAX_COMPARISON_LIMIT) {
            setSelectedIds(parsed);
          }
        } catch { /* ignore */ }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    if (initRef.current) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedIds)); } catch { /* ignore */ }
    }
  }, [selectedIds]);

  const toggleProperty = useCallback((id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id);
      if (prev.length >= MAX_COMPARISON_LIMIT) return prev;
      return [...prev, id];
    });
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    setSelectedIds((prev) => {
      const combined = [...prev];
      const availableSlots = MAX_COMPARISON_LIMIT - combined.length;
      const idsToAdd = ids.filter((id) => !combined.includes(id)).slice(0, availableSlots);
      return [...combined, ...idsToAdd];
    });
  }, []);

  const deselectAll = useCallback(() => setSelectedIds([]), []);
  const clearSelection = useCallback(() => setSelectedIds([]), []);
  const isSelected = useCallback((id: string) => selectedIds.includes(id), [selectedIds]);
  const removeProperty = useCallback((id: string) => {
    setSelectedIds((prev) => prev.filter((item) => item !== id));
  }, []);
  const getRemainingSlots = useCallback(() => MAX_COMPARISON_LIMIT - selectedIds.length, [selectedIds.length]);

  return {
    selectedIds,
    toggleProperty,
    selectAll,
    deselectAll,
    isSelected,
    clearSelection,
    canSelectMore: selectedIds.length < MAX_COMPARISON_LIMIT,
    selectedCount: selectedIds.length,
    maxLimit: MAX_COMPARISON_LIMIT,
    removeProperty,
    isMaxLimitReached: selectedIds.length >= MAX_COMPARISON_LIMIT,
    getRemainingSlots,
  };
}
