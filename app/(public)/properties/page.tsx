"use client";

import { Suspense } from "react";
import { ListingPage } from "@/components/property/listing-page";
import { properties } from "@/data/properties";

export default function PropertiesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ListingPage properties={properties} />
    </Suspense>
  );
}
