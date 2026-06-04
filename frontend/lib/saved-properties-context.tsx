"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { PropertyId } from "@/types";
import { estateApi } from "@/lib/api";

type SavedPropertiesContextValue = {
  savedIds: PropertyId[];
  savedCount: number;
  isSaved: (id: PropertyId) => boolean;
  toggleSaved: (id: PropertyId) => void;
};

const SavedPropertiesContext = createContext<SavedPropertiesContextValue | null>(null);

export function SavedPropertiesProvider({ children }: { children: ReactNode }) {
  const [savedIds, setSavedIds] = useState<PropertyId[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    estateApi.users.list<any>().then((users) => {
      const user = users[0];
      setUserId(user?.id || null);
      setSavedIds(user?.savedProperties || []);
    }).catch(() => setSavedIds([]));
  }, []);

  const value = useMemo<SavedPropertiesContextValue>(
    () => ({
      savedIds,
      savedCount: savedIds.length,
      isSaved: (id: PropertyId) => savedIds.includes(id),
      toggleSaved: (id: PropertyId) => {
        setSavedIds((current) => {
          const next = current.includes(id) ? current.filter((savedId) => savedId !== id) : [...current, id];
          if (userId) {
            estateApi.users.update(userId, { savedProperties: next }).catch(() => undefined);
          }
          return next;
        });
      },
    }),
    [savedIds, userId],
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
