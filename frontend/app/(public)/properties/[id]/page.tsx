"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Heart, Home, Share2 } from "lucide-react";
import { useParams } from "next/navigation";
import { PropertyEMI } from "@/components/property/property-emi";
import { PropertyGallery } from "@/components/property/property-gallery";
import { PropertyHeader } from "@/components/property/property-header";
import { PropertyOverview } from "@/components/property/property-overview";
import { PropertySidebar } from "@/components/property/property-sidebar";
import { PropertySimilar } from "@/components/property/property-similar";
import { PropertyTabs, type PropertyDetailRow } from "@/components/property/property-tabs";
import { PropertyTrust } from "@/components/property/property-trust";
import { estateApi } from "@/lib/api";
import type { Property } from "@/types";

type PropertyResponse = {
  property?: Property | null;
};

const fallbackImage = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&q=75";

function propertyImages(property: Property) {
  if (property.images && property.images.length > 0) return property.images;
  if (property.image) return [property.image];
  if (property.imgs && property.imgs.length > 0) return property.imgs;
  if (property.img) return [property.img];
  return [fallbackImage];
}

function bedrooms(property: Property) {
  return property.beds || property.bedrooms || null;
}

function bathrooms(property: Property) {
  return property.bathrooms || property.baths || null;
}

function listingType(property: Property) {
  if (property.listingType === "Sell") return "For Sale";
  if (property.listingType === "Rent") return "For Rent";
  if (property.listingType) return property.listingType;
  if (property.status === "For Sale" || property.status === "For Rent") return property.status;
  return "For Sale";
}

function propertyFeatures(property: Property) {
  if (property.features && property.features.length > 0) return property.features;
  if (property.highlights && property.highlights.length > 0) return property.highlights;
  return [];
}

function propertyDetails(property: Property): PropertyDetailRow[] {
  return [
    { label: "Property Type", value: property.type },
    { label: "Year Built", value: property.yearBuilt },
    { label: "Floor", value: property.floor },
    { label: "Possession", value: property.possession },
    { label: "Builder / Developer", value: property.builder },
    { label: "Furnishing", value: property.furnishing },
    { label: "Facing", value: property.facing },
    { label: "RERA No.", value: property.rera, highlight: true },
  ];
}

export default function PropertyDetailsPage() {
  const params = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchProperty = async () => {
      if (params?.id) {
        try {
          const found = await estateApi.properties.detail(params.id);
          setProperty(found || null);
        } catch {
          setProperty(null);
        }
      }
      setLoading(false);
    };

    fetchProperty();
  }, [params?.id]);

  const derived = useMemo(() => {
    if (!property) return null;

    return {
      images: propertyImages(property),
      bedrooms: bedrooms(property),
      bathrooms: bathrooms(property),
      listingType: listingType(property),
      features: propertyFeatures(property),
      details: propertyDetails(property),
    };
  }, [property]);

  if (loading) return <PropertyLoadingState />;
  if (!property || !derived) return <PropertyUnavailableState />;
  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-estate-bg pb-28 font-sans selection:bg-estate-blue-pale selection:text-estate-navy">
      <PropertyTopBar saved={saved} onSavedChange={setSaved} />

      <PropertyGallery
        images={derived.images}
        title={property.title}
        listingType={derived.listingType}
        price={property.price}
        area={property.area}
        saved={saved}
        onSavedChange={setSaved}
      />

      <div className="mx-auto mt-12 max-w-[1400px] px-6 sm:px-10 lg:px-12">
        <div className="grid grid-cols-1 items-start gap-x-10 gap-y-8 lg:grid-cols-12">
          <main className="space-y-7 lg:col-span-8">
            <section className="rounded-[20px] border border-estate-border/80 bg-white p-8 shadow-estate">
              <PropertyHeader
                title={property.title}
                subtitle={property.subtitle}
                price={property.price}
                location={property.location}
                area={property.area}
                listingType={derived.listingType}
                propertyType={property.type}
                possession={property.possession}
                facing={property.facing}
              />
              <PropertyOverview
                bedrooms={derived.bedrooms}
                bathrooms={derived.bathrooms}
                area={property.area}
                propertyType={property.type}
                furnishing={property.furnishing}
                listingType={derived.listingType}
              />
            </section>

            <PropertyTabs
              description={property.description}
              furnishing={property.furnishing}
              listingType={derived.listingType}
              features={derived.features}
              amenities={property.amenities}
              details={derived.details}
            />

            <PropertyTrust rera={property.rera} />
            <PropertyEMI price={property.price} />
            <PropertySimilar city={property.city} propertyType={property.type} />
          </main>

          <PropertySidebar title={property.title} price={property.price} area={property.area} />
        </div>
      </div>
    </div>
  );
}

function PropertyTopBar({
  saved,
  onSavedChange,
}: {
  saved: boolean;
  onSavedChange: (saved: boolean) => void;
}) {
  return (
    <div className="sticky top-0 z-40 border-b border-estate-border/80 bg-white/95 shadow-estate backdrop-blur-md">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-12 h-14 flex items-center justify-between">
        <button
          onClick={() => window.history.back()}
          className="group flex items-center gap-2 text-sm font-medium text-estate-text-sec transition-colors duration-200 hover:text-estate-navy"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
          Back to Listings
        </button>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onSavedChange(!saved)}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all duration-200 ${
              saved
                ? "bg-red-50 border-red-200 text-red-600"
                : "bg-white border-estate-border text-estate-text-sec hover:border-estate-border-med hover:bg-estate-bg"
            }`}
          >
            <Heart className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
            {saved ? "Saved" : "Save"}
          </button>
          <button className="flex items-center gap-2 rounded-xl border border-estate-border bg-white px-4 py-2 text-sm font-medium text-estate-text-sec transition-all duration-200 hover:border-estate-border-med hover:bg-estate-bg">
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>
      </div>
    </div>
  );
}

function PropertyLoadingState() {
  return (
    <div className="min-h-screen bg-estate-bg pb-20 pt-8">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-12">
        <div className="mb-10 h-[62vh] w-full animate-pulse rounded-[20px] bg-estate-surface" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-5">
            <div className="h-12 w-2/3 animate-pulse rounded-xl bg-estate-surface" />
            <div className="h-8 w-1/3 animate-pulse rounded-xl bg-estate-surface" />
            <div className="grid grid-cols-4 gap-4 mt-4">
              {[0, 1, 2, 3].map((item) => (
                <div key={item} className="h-28 animate-pulse rounded-xl bg-estate-surface" />
              ))}
            </div>
            <div className="h-52 animate-pulse rounded-xl bg-estate-surface" />
            <div className="h-72 animate-pulse rounded-xl bg-estate-surface" />
          </div>
          <div className="lg:col-span-4">
            <div className="h-[520px] animate-pulse rounded-[20px] bg-estate-surface" />
          </div>
        </div>
      </div>
    </div>
  );
}

function PropertyUnavailableState() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-estate-bg">
      <div className="text-center max-w-lg w-full px-6">
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-estate-blue-pale">
          <Home className="h-9 w-9 text-estate-navy" />
        </div>
        <h2 className="text-3xl font-light text-gray-900 mb-4 tracking-tight">Listing Unavailable</h2>
        <p className="text-gray-500 mb-10 font-light text-lg leading-relaxed">
          This exclusive property may have been sold or removed from the public market.
        </p>
        <button
          onClick={() => window.history.back()}
          className="rounded-xl bg-estate-navy px-10 py-4 font-medium tracking-wide text-white transition-all duration-200 hover:bg-estate-navy-mid"
        >
          Return to Portfolio
        </button>
      </div>
    </div>
  );
}
