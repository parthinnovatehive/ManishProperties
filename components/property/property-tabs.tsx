"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { PropertyAmenities } from "./property-amenities";

export type PropertyTabId = "overview" | "amenities" | "details";

export type PropertyDetailRow = {
  label: string;
  value?: string | number | null;
  highlight?: boolean;
};

type PropertyTabsProps = {
  description?: string | null;
  furnishing?: string | null;
  listingType?: string | null;
  features?: string[] | null;
  amenities?: string[] | null;
  details: PropertyDetailRow[];
};

const tabs: PropertyTabId[] = ["overview", "amenities", "details"];

function tabLabel(tab: PropertyTabId) {
  if (tab === "overview") return "Overview";
  if (tab === "amenities") return "Amenities";
  return "Property Details";
}

export function PropertyTabs({
  description,
  furnishing,
  listingType,
  features,
  amenities,
  details,
}: PropertyTabsProps) {
  const [activeTab, setActiveTab] = useState<PropertyTabId>("overview");
  const detailColumns = [
    details.slice(0, Math.ceil(details.length / 2)),
    details.slice(Math.ceil(details.length / 2)),
  ];

  return (
    <div className="overflow-hidden rounded-[20px] border border-estate-border/80 bg-white shadow-estate">
      <div className="flex border-b border-estate-border">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-4 text-sm font-medium tracking-wide transition-all duration-300 ${
              activeTab === tab
                ? "border-b-2 border-estate-navy bg-estate-blue-pale text-estate-navy"
                : "text-estate-text-sec hover:bg-estate-bg hover:text-estate-navy"
            }`}
          >
            {tabLabel(tab)}
          </button>
        ))}
      </div>

      <div className="p-8">
        {activeTab === "overview" && (
          <div>
            <h2 className="mb-4 font-serif text-2xl font-semibold tracking-tight text-estate-navy">The Residence</h2>
            {description ? (
              <p className="whitespace-pre-line text-[15px] leading-[1.9] text-estate-text-sec">{description}</p>
            ) : (
              <p className="text-sm italic text-estate-muted">No description provided for this listing.</p>
            )}

            <div className="mt-8 grid grid-cols-2 gap-3.5">
              <div className="rounded-[16px] border border-estate-border bg-estate-bg p-5">
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-estate-muted">Furnishing Status</p>
                <p className="text-base font-medium text-estate-text">{furnishing || "\u2014"}</p>
              </div>
              <div className="rounded-[16px] border border-estate-border bg-estate-bg p-5">
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-estate-muted">Listing Type</p>
                <p className="text-base font-medium text-estate-text">{listingType || "Private Sale"}</p>
              </div>
            </div>

            {features && features.length > 0 && (
              <div className="flex flex-wrap gap-2.5 mt-6">
                {features.map((feature) => (
                  <span
                    key={feature}
                    className="flex items-center gap-1.5 rounded-full border border-estate-border bg-estate-blue-pale px-3.5 py-1.5 text-xs font-semibold text-estate-success"
                  >
                    <CheckCircle className="w-3 h-3 flex-shrink-0" />
                    {feature}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "amenities" && (
          <div>
            <h2 className="mb-5 font-serif text-2xl font-semibold tracking-tight text-estate-navy">Signature Amenities</h2>
            <PropertyAmenities amenities={amenities} />
          </div>
        )}

        {activeTab === "details" && (
          <div>
            <h2 className="mb-5 font-serif text-2xl font-semibold tracking-tight text-estate-navy">Property Specifications</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-0">
              {detailColumns.map((column, index) => (
                <div key={index} className={index === 1 ? "sm:border-l sm:border-estate-border sm:pl-8" : ""}>
                  {column.map((item) =>
                    item.value ? (
                      <div key={item.label} className="flex items-center justify-between gap-5 border-b border-estate-border/70 py-3.5 last:border-0">
                        <span className="text-sm text-estate-muted">{item.label}</span>
                        <span className={`text-right text-sm font-semibold ${item.highlight ? "text-estate-navy" : "text-estate-text"}`}>
                          {item.value}
                        </span>
                      </div>
                    ) : null,
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
