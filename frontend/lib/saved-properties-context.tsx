"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { estateApi } from "@/lib/api";
import { getAdminData, clearAllAuthData, type AdminData } from "@/lib/utils/token";

interface SavedPropertiesContextType {
  savedProperties: string[];
  savedCount: number;
  toggleSaved: (propertyId: string | number) => Promise<void>;
  isSaved: (propertyId: string | number) => boolean;
  loading: boolean;
}

const SavedPropertiesContext = createContext<SavedPropertiesContextType | undefined>(undefined);

export function SavedPropertiesProvider({ children }: { children: React.ReactNode }) {
  const [savedProperties, setSavedProperties] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<AdminData | null>(null);

  const fetchSavedProperties = useCallback(async () => {
    try {
      const admin = getAdminData();
      setCurrentUser(admin);

      if (!admin) {
        setSavedProperties([]);
        setLoading(false);
        return;
      }

      // Try to get from localStorage first for quick display
      const storageKey = `saved_properties_${admin.id}`;
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        setSavedProperties(JSON.parse(cached));
      }

      // Fetch fresh data from API based on user type
      let userData;
      if (admin.role === "AGENT") {
        const agents = await estateApi.agents.list<any>();
        userData = agents.find((a: any) => a.id === admin.id);
      } else {
        const users = await estateApi.users.list<any>();
        userData = users.find((u: any) => u.id === admin.id);
      }

      const saved = userData?.savedProperties || [];
      setSavedProperties(saved);
      localStorage.setItem(storageKey, JSON.stringify(saved));
    } catch (error) {
      // console.error("Error fetching saved properties:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSavedProperties();

    // Listen for auth changes
    const handleAuthChange = () => {
      fetchSavedProperties();
    };
    window.addEventListener("estate-auth-changed", handleAuthChange);

    return () => {
      window.removeEventListener("estate-auth-changed", handleAuthChange);
    };
  }, [fetchSavedProperties]);

  const toggleSaved = async (propertyId: string | number) => {
    const admin = getAdminData();
    if (!admin) {
      // Redirect to login if not authenticated
      window.location.href = "/auth/login";
      return;
    }

    const strPropertyId = String(propertyId);
    const isCurrentlySaved = savedProperties.includes(strPropertyId);
    const updatedSaved = isCurrentlySaved
      ? savedProperties.filter((id) => id !== strPropertyId)
      : [...savedProperties, strPropertyId];

    // Optimistic update
    setSavedProperties(updatedSaved);
    const storageKey = `saved_properties_${admin.id}`;
    localStorage.setItem(storageKey, JSON.stringify(updatedSaved));

    try {
      // Update based on user role
      await estateApi.users.toggleSaved(propertyId);
      
      // Also update agents if needed (though toggleSaved might work for both)
      if (admin.role === "AGENT") {
        // For agents, we might need to update differently
        // But the users.toggleSaved should work since agents might be in users collection too
      }
    } catch (error) {
      console.error("Error toggling saved property:", error);
      // Revert on error
      setSavedProperties(savedProperties);
      localStorage.setItem(storageKey, JSON.stringify(savedProperties));
      alert("Failed to save property. Please try again.");
    }
  };

  const isSaved = useCallback(
    (propertyId: string | number) => savedProperties.includes(String(propertyId)),
    [savedProperties]
  );

  return (
    <SavedPropertiesContext.Provider
      value={{
        savedProperties,
        savedCount: savedProperties.length,
        toggleSaved,
        isSaved,
        loading,
      }}
    >
      {children}
    </SavedPropertiesContext.Provider>
  );
}

export function useSavedProperties() {
  const context = useContext(SavedPropertiesContext);
  if (context === undefined) {
    throw new Error("useSavedProperties must be used within a SavedPropertiesProvider");
  }
  return context;
}