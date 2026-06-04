"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { PropertyId } from "@/types";

type SavedPropertiesContextValue = {
  savedIds: PropertyId[];
  savedCount: number;
  isSaved: (id: PropertyId) => boolean;
  toggleSaved: (id: PropertyId) => void;
};

const SavedPropertiesContext = createContext<SavedPropertiesContextValue | null>(null);

export function SavedPropertiesProvider({ children }: { children: ReactNode }) {
  const [savedIds, setSavedIds] = useState<PropertyId[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("estateelite:saved-properties");
    if (stored) {
      setSavedIds(JSON.parse(stored) as PropertyId[]);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      window.localStorage.setItem("estateelite:saved-properties", JSON.stringify(savedIds));
    }
  }, [hydrated, savedIds]);

  const value = useMemo<SavedPropertiesContextValue>(
    () => ({
      savedIds,
      savedCount: savedIds.length,
      isSaved: (id: PropertyId) => savedIds.includes(id),
      toggleSaved: (id: PropertyId) => {
        setSavedIds((current) =>
          current.includes(id) ? current.filter((savedId) => savedId !== id) : [...current, id],
        );
      },
    }),
    [savedIds],
  );

  return <SavedPropertiesContext.Provider value={value}>{children}</SavedPropertiesContext.Provider>;
}

export function useSavedProperties() {
  const context = useContext(SavedPropertiesContext);
  if (!context) {
    throw new Error("useSavedProperties must be used within SavedPropertiesProvider");
  }
  return context;
}
