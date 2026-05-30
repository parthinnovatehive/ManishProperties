"use client";

import { Suspense, useEffect, useState } from "react";
import { ListingPage } from "@/components/property/listing-page";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/config";
import type { PropertiesListResponse } from "@/types/api";
import type { Property } from "@/types";

export default function PropertiesPage() {

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchProperties = async () => {

      try {

        const data = await apiClient.get<PropertiesListResponse>(
          API_ENDPOINTS.PUBLIC.PROPERTIES
        );

        setProperties(data.properties || data.data || []);

      } catch (error) {

        console.log(error);
        setProperties([]);

      } finally {

        setLoading(false);

      }

    };

    fetchProperties();

  }, []);

  if (loading) {
    return (
      <div className="container-wide py-16 text-estate-text-sec">
        Loading properties...
      </div>
    );
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ListingPage properties={properties} />
    </Suspense>
  );
}
