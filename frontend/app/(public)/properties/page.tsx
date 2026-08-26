"use client";

import { Suspense, useEffect, useState } from "react";
import { ListingPage } from "@/components/property/listing-page";
import { estateApi } from "@/lib/api";
import type { Property } from "@/types";

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    estateApi.properties
      .list()
      .then((items) => {
        console.log(".");
        const sorted = [...items].sort((a, b) => Number(b.featured) - Number(a.featured));
        setProperties(sorted);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      {loading ? <div className="p-8 text-center text-estate-muted">Loading properties...</div> : null}
      <ListingPage properties={properties} />
    </Suspense>
  );
}
