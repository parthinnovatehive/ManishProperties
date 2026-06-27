"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  Award,
  Bath,
  Bed,
  Calendar,
  Car,
  CheckCircle,
  ChevronLeft,
  Dumbbell,
  Heart,
  MapPin,
  Maximize2,
  MessageCircle,
  ParkingCircle,
  Phone,
  Share2,
  Shield,
  ShieldCheck,
  TrendingUp,
  TreePine,
  Users,
  Waves,
  Wifi,
} from "lucide-react";
import type { Property } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useSavedProperties } from "@/lib/saved-properties-context";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Stars } from "@/components/ui/stars";
import { EmiCalculator } from "./emi-calculator";
import { PropertyCard } from "./property-card";
import { PropertyGallery } from "./property-gallery";

const amenityIcons: Record<string, ReactNode> = {
  "Swimming Pool": <Waves size={16} aria-hidden="true" />,
  Gymnasium: <Dumbbell size={16} aria-hidden="true" />,
  "24/7 Security": <Shield size={16} aria-hidden="true" />,
  "Covered Parking": <ParkingCircle size={16} aria-hidden="true" />,
  "High-Speed WiFi": <Wifi size={16} aria-hidden="true" />,
  "Fiber WiFi": <Wifi size={16} aria-hidden="true" />,
  Garden: <TreePine size={16} aria-hidden="true" />,
  "Private Garden": <TreePine size={16} aria-hidden="true" />,
};

type DetailTab = "overview" | "amenities" | "details";

export function PropertyDetailPage({ properties, propertyId }: { properties: Property[]; propertyId: number }) {
  const property = properties.find((item) => item.id === propertyId) ?? properties[0];
  const [tab, setTab] = useState<DetailTab>("overview");
  const [contactMessage, setContactMessage] = useState("");
  const { isSaved, toggleSaved } = useSavedProperties();

  const saved = isSaved(property.id);
  const highlights = property.highlights ?? [];
  const galleryImages =
    property.imgs && property.imgs.length > 0
      ? property.imgs
      : property.images && property.images.length > 0
      ? property.images
      : property.img
      ? [property.img]
      : property.image
      ? [property.image]
      : [];
  const agent = property.agent ?? {
    name: "Manish Properties Agent",
    avatar: "EA",
    deals: 0,
    rating: property.rating,
  };
  const similar = useMemo(
    () => properties.filter((item) => item.id !== property.id && item.city === property.city).slice(0, 3),
    [properties, property.city, property.id],
  );

  return (
    <div className="min-h-screen bg-estate-bg">
      <div className="border-b border-estate-border bg-white px-6 py-3.5">
        <div className="container-wide flex items-center justify-between px-0">
          <Link href="/properties" className="flex items-center gap-2 text-sm font-medium text-estate-text-sec">
            <ChevronLeft size={18} aria-hidden="true" /> Back to Listings
          </Link>
          <div className="flex gap-2.5">
            <button
              className={`flex items-center gap-1.5 rounded-lg border-[1.5px] border-estate-border bg-white px-4 py-2 text-[13px] font-semibold ${
                saved ? "text-estate-red" : "text-estate-text-sec"
              }`}
              onClick={() => toggleSaved(property.id)}
            >
              <Heart size={15} aria-hidden="true" className={saved ? "fill-estate-red text-estate-red" : "text-estate-text-sec"} />
              {saved ? "Saved" : "Save"}
            </button>
            <button className="flex items-center gap-1.5 rounded-lg border-[1.5px] border-estate-border bg-white px-4 py-2 text-[13px] font-semibold text-estate-text-sec">
              <Share2 size={15} aria-hidden="true" /> Share
            </button>
          </div>
        </div>
      </div>

      <div className="container-wide py-6">
        <PropertyGallery
          images={galleryImages}
          title={property.title}
          listingType={property.listingType ?? property.status}
          price={property.price}
          area={property.area}
        />

        <div className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">
          <div className="min-w-0">
            <div className="mb-5 rounded-2xl border border-estate-border bg-white p-4 sm:p-7">
              <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-start">
                <div className="flex-1">
                  <div className="mb-2.5 flex flex-wrap gap-2">
                    {property.category && (
                      <Badge
                        variant={property.category === "commercial" ? "muted" : "navy"}
                        className={property.category === "commercial" ? "bg-purple-100 text-purple-700" : ""}
                      >
                        {property.category === "residential" ? "🏠 Residential" : "🏢 Commercial"}
                      </Badge>
                    )}
                    <Badge variant={property.status === "For Sale" ? "blue" : "amber"}>{property.status}</Badge>
                    <Badge variant="muted">{property.type}</Badge>
                    {highlights.slice(0, 2).map((highlight) => (
                      <Badge key={highlight} variant="success">
                        {highlight}
                      </Badge>
                    ))}
                  </div>
                  <h1 className="mb-2 font-serif text-[clamp(1.4rem,2.5vw,1.9rem)] font-bold leading-tight text-estate-navy">
                    {property.title}
                  </h1>
                  <div className="mb-3 flex items-center gap-1.5 text-sm text-estate-text-sec">
                    <MapPin size={15} aria-hidden="true" className="text-estate-blue" />
                    {property.location}
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Stars rating={property.rating} />
                    <span className="text-[13px] text-estate-text-sec">
                      {property.rating} · {property.reviews} reviews
                    </span>
                  </div>
                </div>

                <div className="shrink-0 xl:text-right">
                  <div className="text-[28px] font-extrabold leading-none text-estate-navy">{property.price}</div>
                  {property.status === "For Sale" && property.priceNum > 0 && (
                    <div className="mt-1 text-[13px] text-estate-text-sec">
                      {formatCurrency(Math.round(property.priceNum / property.area))}/sq.ft
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 grid overflow-hidden rounded-xl bg-estate-border [gap:1px] grid-cols-2 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { icon: Bed, label: "Bedrooms", value: property.beds > 0 ? `${property.beds} BHK` : "N/A" },
                  { icon: Bath, label: "Bathrooms", value: `${property.baths} Baths` },
                  { icon: Maximize2, label: "Carpet Area", value: `${property.area.toLocaleString("en-IN")} ft²` },
                  { icon: Car, label: "Parking", value: `${property.parking} Spots` },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-white px-2 sm:px-3.5 py-3 sm:py-4 text-center">
                    <div className="mb-1 flex sm:mb-1.5 justify-center text-estate-blue">
                      <Icon size={18} aria-hidden="true" className="sm:w-5 sm:h-5" />
                    </div>
                    <div className="text-sm sm:text-base font-bold text-estate-text">{value}</div>
                    <div className="mt-0.5 text-[11px] sm:text-xs text-estate-muted">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-5 overflow-hidden rounded-2xl border border-estate-border bg-white">
              <div className="flex overflow-x-auto border-b border-estate-border scrollbar-hide">
                {(["overview", "amenities", "details"] as const).map((item) => (
                  <button
                    key={item}
                    className={`shrink-0 mb-[-1px] border-b-[2.5px] px-3 sm:px-5 py-3.5 text-xs sm:text-sm font-semibold capitalize transition ${
                      tab === item ? "border-estate-blue text-estate-blue" : "border-transparent text-estate-text-sec"
                    }`}
                    onClick={() => setTab(item)}
                  >
                    {item === "details" ? "Property Details" : item}
                  </button>
                ))}
              </div>

              <div className="p-4 sm:p-6">
                {tab === "overview" && (
                  <div>
                    <p className="mb-5 text-[15px] leading-8 text-estate-text-sec">{property.description}</p>
                    <div className="flex flex-wrap gap-2.5">
                      {highlights.map((highlight) => (
                        <span key={highlight} className="flex items-center gap-1.5 rounded-full bg-estate-success-bg px-3.5 py-2 text-[13px] font-semibold text-estate-success">
                          <CheckCircle size={14} aria-hidden="true" /> {highlight}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {tab === "amenities" && (
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {property.amenities.map((amenity) => (
                      <div key={amenity} className="flex items-center gap-2.5 rounded-[10px] bg-estate-bg px-3.5 py-3">
                        <span className="shrink-0 text-estate-blue">{amenityIcons[amenity] ?? <CheckCircle size={16} aria-hidden="true" />}</span>
                        <span className="text-[13px] font-medium text-estate-text">{amenity}</span>
                      </div>
                    ))}
                  </div>
                )}

                {tab === "details" && (
                  <div className="grid md:grid-cols-2">
                    {(property.category === "commercial"
                      ? [
                          ["Property Type", property.type],
                          ["Office Type", property.officeType || "N/A"],
                          ["Pantry", property.pantry ? "Available" : "Not Available"],
                          ["Washrooms", property.washrooms ? `${property.washrooms}` : "N/A"],
                          ["Power Backup", property.powerBackup ? "Available" : "Not Available"],
                          ["Cabins", property.cabinCount ? `${property.cabinCount}` : "N/A"],
                          ["Conference Room", property.conferenceRoom ? "Available" : "Not Available"],
                          ["Area", `${property.area.toLocaleString("en-IN")} ft²`],
                          ["Builder/Developer", property.builder],
                        ]
                      : [
                          ["Property Type", property.type],
                          ["Builder/Developer", property.builder],
                          ["Year Built", property.yearBuilt],
                          ["Furnishing", property.furnishing],
                          ["Floor", property.floor],
                          ["Facing", property.facing],
                          ["Possession", property.possession],
                          ["RERA No.", property.rera],
                        ]
                    ).map(([label, value], index) => (
                      <div
                        key={label}
                        className={`flex justify-between gap-4 border-b border-estate-border px-4 py-3 text-[13px] ${
                          index % 2 === 0 ? "bg-white" : "bg-estate-bg"
                        }`}
                      >
                        <span className="font-medium text-estate-muted">{label}</span>
                        <span className="font-semibold text-estate-text">{value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <EmiCalculator property={property} />
          </div>

          <div className="lg:sticky lg:top-[88px]">
            <div className="mb-4 rounded-2xl border border-estate-border bg-white p-4 sm:p-6">
              <div className="mb-5 flex items-center gap-3 border-b border-estate-border pb-5">
                <Avatar initials={agent.avatar ?? "EA"} size="lg" />
                <div className="flex-1">
                  <div className="text-base font-bold text-estate-text">{agent.name}</div>
                  <div className="mb-1 text-[13px] text-estate-muted">{agent.deals} verified transactions</div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Stars rating={agent.rating ?? property.rating} size={12} />
                    <span className="text-xs text-estate-text-sec">{agent.rating ?? property.rating}</span>
                    <Badge variant="success" size="sm">
                      <ShieldCheck size={10} aria-hidden="true" /> Verified Agent
                    </Badge>
                  </div>
                </div>
              </div>

              <textarea
                value={contactMessage}
                onChange={(event) => setContactMessage(event.target.value)}
                placeholder={`Hi, I'm interested in ${property.title}. Please share more details.`}
                rows={3}
                className="focus-field mb-4 w-full resize-none rounded-[10px] border-[1.5px] border-estate-border px-3.5 py-2.5 text-[13px] leading-6 text-estate-text"
              />

              <Button variant="navy" fullWidth className="mb-2.5 rounded-[10px]">
                <MessageCircle size={16} aria-hidden="true" /> Send Message
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <button className="flex items-center justify-center gap-1.5 rounded-[10px] border-[1.5px] border-estate-border bg-white px-3 py-2.5 text-[13px] font-semibold text-estate-text">
                  <Phone size={15} aria-hidden="true" className="text-estate-success" /> Call
                </button>
                <button className="flex items-center justify-center gap-1.5 rounded-[10px] border-[1.5px] border-[#25D366] bg-green-50 px-3 py-2.5 text-[13px] font-semibold text-green-600">
                  <MessageCircle size={15} aria-hidden="true" /> WhatsApp
                </button>
              </div>
            </div>

            <div className="mb-4 rounded-2xl border border-estate-border bg-white p-6">
              <div className="mb-4 flex items-center gap-2.5">
                <Calendar size={18} aria-hidden="true" className="text-estate-blue" />
                <h4 className="text-[15px] font-bold text-estate-navy">Schedule a Site Visit</h4>
              </div>
              <div className="mb-3.5 grid grid-cols-2 gap-2">
                {["Today", "Tomorrow", "This Sat", "This Sun"].map((day) => (
                  <button key={day} className="rounded-lg border-[1.5px] border-estate-border bg-white px-2 py-2 text-[13px] font-semibold text-estate-text-sec transition hover:border-estate-blue hover:bg-estate-blue-pale hover:text-estate-blue">
                    {day}
                  </button>
                ))}
              </div>
              <Button fullWidth className="rounded-[10px]">
                <Calendar size={15} aria-hidden="true" /> Book Site Visit
              </Button>
            </div>

            <div className="rounded-2xl border border-estate-blue/15 bg-estate-blue-pale p-4 sm:p-5">
              <div className="mb-3.5 text-sm font-bold text-estate-navy">Why This Property?</div>
              {[
                { icon: ShieldCheck, text: "RERA & legally verified" },
                { icon: Award, text: "Built by reputed developer" },
                { icon: TrendingUp, text: "Strong appreciation history" },
                { icon: Users, text: "14 people viewed this week" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="mb-3 flex items-center gap-2.5 last:mb-0">
                  <Icon size={15} aria-hidden="true" className="text-estate-blue" />
                  <span className="text-[13px] font-medium text-estate-navy-mid">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {similar.length > 0 && (
          <div className="mt-10">
            <h3 className="mb-5 font-serif text-[22px] text-estate-navy">Similar Properties</h3>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((item) => (
                <PropertyCard key={item.id} property={item} compact />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
