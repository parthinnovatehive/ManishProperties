"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { estateApi } from "@/lib/api";
import type { Property } from "@/types";

export default function SavedPropertiesPage() {
  const [savedListings, setSavedListings] = useState<Property[]>([]);

  useEffect(() => {
    Promise.all([estateApi.users.list<any>(), estateApi.properties.list()]).then(([users, properties]) => {
      const user = users[0];
      const savedIds = (user?.savedProperties || []).map(String);
      setSavedListings(properties.filter((property) => savedIds.includes(String(property.id))));
    });
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-estate-navy font-serif">Saved Properties</h1>
        <p className="text-sm text-estate-text-sec">Manage and view your shortlisted properties.</p>
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
            <div key={property.id} className="bg-white rounded-2xl border border-estate-border shadow-estate overflow-hidden hover:shadow-estate-md transition duration-300 flex flex-col justify-between">
              <div>
                <div className="relative h-48 w-full bg-gray-100">
                  <img
                    src={property.img ?? undefined}
                    alt={property.title}
                    className="object-cover w-full h-full"
                  />
                  <span className="absolute top-3 left-3 bg-estate-navy text-white text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {property.status}
                  </span>
                  {property.verified && (
                    <span className="absolute top-3 right-3 bg-estate-success text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                      ✓ Verified
                    </span>
                  )}
                </div>

                <div className="p-5">
                  <div className="text-estate-navy font-bold text-xl mb-1">{property.price}</div>
                  <h3 className="font-bold text-lg text-estate-text line-clamp-1">{property.title}</h3>
                  <p className="text-sm text-estate-text-sec mb-4">📍 {property.location}</p>

                  <div className="grid grid-cols-3 gap-2 border-t border-estate-border pt-4 text-xs font-medium text-estate-text-sec text-center">
                    <div>
                      <div className="font-bold text-estate-text text-sm">{property.beds}</div>
                      <div>Beds</div>
                    </div>
                    <div>
                      <div className="font-bold text-estate-text text-sm">{property.baths ?? property.bathrooms}</div>
                      <div>Baths</div>
                    </div>
                    <div>
                      <div className="font-bold text-estate-text text-sm">{property.area} sqft</div>
                      <div>Area</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-estate-border/50 flex space-x-3 mt-4">
                <Link
                  href={`/properties/${property.id}`}
                  className="flex-1 text-center py-2.5 bg-estate-bg hover:bg-estate-surface text-estate-navy border border-estate-border font-semibold rounded-xl text-sm transition"
                >
                  View Details
                </Link>
                <button
                  onClick={() => setSavedListings((prev) => prev.filter((item) => item.id !== property.id))}
                  className="px-3 py-2 bg-estate-red-bg hover:bg-red-100 text-estate-red font-semibold rounded-xl text-sm transition"
                  title="Remove from saved"
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
