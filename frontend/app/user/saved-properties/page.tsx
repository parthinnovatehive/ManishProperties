"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { estateApi } from "@/lib/api";
import type { Property } from "@/types";
import { PropertyCard } from "@/components/property/property-card";
import { SavedPropertiesProvider } from "@/lib/saved-properties-context";

export default function SavedPropertiesPage() {
  const [savedListings, setSavedListings] = useState<Property[]>([]);

  useEffect(() => {
    Promise.all([estateApi.users.me<any>(), estateApi.properties.list()]).then(([user, properties]) => {
      const savedIds = (user?.savedProperties || []).map(String);
      setSavedListings(properties.filter((property) => savedIds.includes(String(property.id))));
    }).catch((err) => {
      console.error("Failed to fetch saved properties:", err);
    });
  }, []);

  const handleRemove = async (propertyId: string | number) => {
    try {
      await estateApi.users.toggleSaved(propertyId);
      setSavedListings((prev) => prev.filter((item) => String(item.id) !== String(propertyId)));
    } catch (err) {
      console.error("Failed to remove saved property:", err);
    }
  };

  return (
    <SavedPropertiesProvider>
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-estate-navy font-serif">Saved Properties</h1>
            <p className="text-sm text-estate-text-sec">Manage and view your shortlisted properties.</p>
          </div>
          <Link
            href="/properties"
            className="px-5 py-2.5 bg-estate-navy text-white font-semibold rounded-xl hover:bg-estate-navy-mid transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Explore More Properties
          </Link>
        </div>

        {savedListings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-estate-border p-12 text-center shadow-estate">
            <p className="text-lg font-medium text-estate-muted mb-4">You haven't saved any properties yet.</p>
            <Link
              href="/properties"
              className="inline-block px-5 py-2.5 bg-estate-navy text-white font-medium rounded-xl hover:bg-estate-navy-mid transition"
            >
              Browse Properties
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedListings.map((property) => (
              <PropertyCard key={property.id} property={property} compact />
            ))}
          </div>
        )}
      </div>
    </SavedPropertiesProvider>
  );
}
