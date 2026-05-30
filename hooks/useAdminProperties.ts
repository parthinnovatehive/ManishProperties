/**
 * useAdminProperties Hook
 * Manages admin properties list, loading state, and mutations
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import { propertyService } from "@/lib/services/property-service";
import { ApiError } from "@/lib/api/client";
import { Property } from "@/types/property";

interface MutationState {
  loading: boolean;
  error: string | null;
}

interface UseAdminPropertiesReturn {
  properties: Property[];
  loading: boolean;
  error: string | null;
  mutationState: Record<string, MutationState>;
  fetchProperties: () => Promise<void>;
  approveProperty: (id: string | number) => Promise<void>;
  rejectProperty: (id: string | number, reason?: string) => Promise<void>;
  featureProperty: (id: string | number, featured: boolean) => Promise<void>;
  deleteProperty: (id: string | number) => Promise<void>;
  clearError: () => void;
}

export function useAdminProperties(): UseAdminPropertiesReturn {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mutationState, setMutationState] = useState<Record<string, MutationState>>({});

  const getErrorMessage = (err: unknown, fallback: string) => {
    const apiError = err as ApiError;
    return apiError.message || fallback;
  };

  const setMutationLoading = (id: string | number, isLoading: boolean) => {
    setMutationState((prev) => ({
      ...prev,
      [id]: { ...prev[id], loading: isLoading },
    }));
  };

  const setMutationError = (id: string | number, errorMsg: string | null) => {
    setMutationState((prev) => ({
      ...prev,
      [id]: { ...prev[id], error: errorMsg },
    }));
  };

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await propertyService.getAdminProperties();
      setProperties(data);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to fetch properties"));
    } finally {
      setLoading(false);
    }
  }, []);

  const approveProperty = useCallback(
    async (id: string | number) => {
      setMutationLoading(id, true);
      setMutationError(id, null);

      try {
        const updatedProperty = await propertyService.approveProperty(id);

        setProperties((prev) =>
          prev.map((p) => (p.id === id ? updatedProperty : p))
        );
        setMutationError(id, null);
      } catch (err) {
        const errorMsg = getErrorMessage(err, "Failed to approve property");
        setMutationError(id, errorMsg);
        throw err;
      } finally {
        setMutationLoading(id, false);
      }
    },
    []
  );

  const rejectProperty = useCallback(
    async (id: string | number, reason?: string) => {
      setMutationLoading(id, true);
      setMutationError(id, null);

      try {
        const updatedProperty = await propertyService.rejectProperty(id, reason);

        setProperties((prev) =>
          prev.map((p) => (p.id === id ? updatedProperty : p))
        );
        setMutationError(id, null);
      } catch (err) {
        const errorMsg = getErrorMessage(err, "Failed to reject property");
        setMutationError(id, errorMsg);
        throw err;
      } finally {
        setMutationLoading(id, false);
      }
    },
    []
  );

  const featureProperty = useCallback(
    async (id: string | number, featured: boolean) => {
      setMutationLoading(id, true);
      setMutationError(id, null);

      try {
        const updatedProperty = await propertyService.featureProperty(id, featured);

        setProperties((prev) =>
          prev.map((p) => (p.id === id ? updatedProperty : p))
        );
        setMutationError(id, null);
      } catch (err) {
        const errorMsg = getErrorMessage(err, "Failed to update property");
        setMutationError(id, errorMsg);
        throw err;
      } finally {
        setMutationLoading(id, false);
      }
    },
    []
  );

  const deleteProperty = useCallback(
    async (id: string | number) => {
      setMutationLoading(id, true);
      setMutationError(id, null);

      const originalProperty = properties.find((p) => p.id === id);
      const originalIndex = properties.findIndex((p) => p.id === id);
      setProperties((prev) => prev.filter((p) => p.id !== id));

      try {
        await propertyService.deleteProperty(id);
        setMutationError(id, null);
      } catch (err) {
        setProperties((prev) => {
          if (!originalProperty || prev.some((p) => p.id === id)) return prev;
          const next = [...prev];
          next.splice(Math.max(originalIndex, 0), 0, originalProperty);
          return next;
        });
        const errorMsg = getErrorMessage(err, "Failed to delete property");
        setMutationError(id, errorMsg);
        throw err;
      } finally {
        setMutationLoading(id, false);
      }
    },
    [properties]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Fetch properties on mount
  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  return {
    properties,
    loading,
    error,
    mutationState,
    fetchProperties,
    approveProperty,
    rejectProperty,
    featureProperty,
    deleteProperty,
    clearError,
  };
}
