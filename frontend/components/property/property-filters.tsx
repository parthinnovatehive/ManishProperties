"use client";

import { Award, CheckCircle, ChevronDown, ShieldCheck, SlidersHorizontal } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import type { ListingFilters } from "@/types";
import { cn } from "@/lib/utils";

type PropertyFiltersProps = {
  filters: ListingFilters;
  cities: string[];
  types: string[];
  onChange: Dispatch<SetStateAction<ListingFilters>>;
  onClear: () => void;
};

const categoryFilterGroups = [
  {
    key: "Apartment",
    matches: ["Apartment", "Penthouse", "Studio"],
    title: "Apartment Details",
    fields: [
      { label: "Bedrooms", options: ["Any", "1 BHK", "2 BHK", "3 BHK", "4+ BHK"] },
      { label: "Bathrooms", options: ["Any", "1+", "2+", "3+", "4+"] },
      { label: "Furnishing", options: ["Any", "Unfurnished", "Semi-Furnished", "Fully Furnished"] },
      { label: "Balcony", options: ["Any", "No balcony", "1 balcony", "2+ balconies"] },
    ],
  },
  {
    key: "Villa",
    matches: ["Villa", "Farmhouse", "Row House"],
    title: "Villa Details",
    fields: [
      { label: "Garden", options: ["Any", "Private garden", "Shared garden"] },
      { label: "Pool", options: ["Any", "Private pool", "Community pool"] },
      { label: "Floors", options: ["Any", "G+1", "G+2", "G+3"] },
      { label: "Parking", options: ["Any", "1 car", "2 cars", "3+ cars"] },
    ],
  },
  {
    key: "Land",
    matches: ["Plot", "Land"],
    title: "Land Details",
    fields: [
      { label: "Plot Area", options: ["Any", "Under 1,000 sqft", "1,000-2,500 sqft", "2,500+ sqft"] },
      { label: "Facing", options: ["Any", "East", "West", "North", "South"] },
      { label: "Road Width", options: ["Any", "20 ft", "30 ft", "40+ ft"] },
    ],
  },
  {
    key: "Commercial",
    matches: ["Commercial"],
    title: "Commercial Details",
    fields: [
      { label: "Office Type", options: ["Any", "Bare shell", "Warm shell", "Plug & play"] },
      { label: "Pantry", options: ["Any", "Private pantry", "Shared pantry"] },
      { label: "Washrooms", options: ["Any", "1+", "2+", "4+"] },
    ],
  },
];

export function PropertyFilters({ filters, cities, types, onChange, onClear }: PropertyFiltersProps) {
  const selectedClass = "border-estate-navy bg-estate-blue-pale text-estate-navy shadow-estate";
  const defaultClass = "border-estate-border bg-white text-estate-text-sec hover:border-estate-border-med hover:bg-estate-bg";

  const selectableClass = (key: keyof ListingFilters, value: string) =>
    cn("border-[1.5px] transition duration-300", filters[key] === value ? selectedClass : defaultClass);

  const activeCategoryGroups = filters.type
    ? categoryFilterGroups.filter((group) => group.matches.includes(filters.type))
    : categoryFilterGroups;

  return (
    <div className="sticky top-[96px] rounded-[20px] border border-estate-border/80 bg-white p-6 shadow-estate">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-base font-bold text-estate-navy">
          <SlidersHorizontal size={16} aria-hidden="true" /> Filters
        </div>
        <button className="rounded-full px-3 py-1.5 text-xs font-semibold text-estate-blue transition hover:bg-estate-blue-pale" onClick={onClear}>
          Clear All
        </button>
      </div>

      <div className="mb-6">
        <div className="mb-2.5 text-xs font-bold uppercase tracking-[0.06em] text-estate-muted">City</div>
        <label className="relative block">
          <select
            value={filters.city}
            onChange={(event) => onChange((current) => ({ ...current, city: event.target.value }))}
            className="focus-field w-full appearance-none rounded-[14px] border-[1.5px] border-estate-border bg-white py-3 pl-4 pr-9 text-sm text-estate-text"
          >
            <option value="">All Cities</option>
            {cities.map((city) => (
              <option key={city}>{city}</option>
            ))}
          </select>
          <ChevronDown size={14} aria-hidden="true" className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-estate-muted" />
        </label>
      </div>

      <div className="mb-6">
        <div className="mb-2.5 text-xs font-bold uppercase tracking-[0.06em] text-estate-muted">Listing Type</div>
        <div className="flex gap-2">
          {["For Sale", "For Rent"].map((status) => (
            <button
              key={status}
              className={cn("flex-1 rounded-xl px-2 py-2.5 text-[13px] font-semibold", selectableClass("status", status))}
              onClick={() => onChange((current) => ({ ...current, status: current.status === status ? "" : status }))}
            >
              {status === "For Sale" ? "Buy" : "Rent"}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <div className="mb-2.5 text-xs font-bold uppercase tracking-[0.06em] text-estate-muted">Property Type</div>
        <div className="flex flex-wrap gap-2">
          {types.map((type) => (
            <button
              key={type}
              className={cn("rounded-full px-3.5 py-2 text-xs font-semibold", selectableClass("type", type))}
              onClick={() => onChange((current) => ({ ...current, type: current.type === type ? "" : type }))}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <div className="mb-2.5 text-xs font-bold uppercase tracking-[0.06em] text-estate-muted">Min. Bedrooms</div>
        <div className="flex gap-2">
          {["1", "2", "3", "4", "5"].map((bed) => (
            <button
              key={bed}
              className={cn("h-10 w-10 shrink-0 rounded-xl text-[13px] font-semibold", selectableClass("beds", bed))}
              onClick={() => onChange((current) => ({ ...current, beds: current.beds === bed ? "" : bed }))}
            >
              {bed}+
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 rounded-[18px] border border-estate-border/80 bg-estate-bg p-4">
        <div className="mb-3 text-xs font-bold uppercase tracking-[0.06em] text-estate-muted">Property Specific</div>
        <div className="grid gap-4">
          {activeCategoryGroups.map((group) => (
            <div key={group.key}>
              <div className="mb-3 text-sm font-bold text-estate-navy">{group.title}</div>
              <div className="grid gap-3">
                {group.fields.map((field) => (
                  <label key={`${group.key}-${field.label}`} className="relative block">
                    <span className="mb-1.5 block text-xs font-semibold text-estate-text-sec">{field.label}</span>
                    <select className="focus-field w-full appearance-none rounded-[14px] border-[1.5px] border-estate-border bg-white py-2.5 pl-3.5 pr-8 text-[13px] text-estate-text">
                      {field.options.map((option) => (
                        <option key={option}>{option}</option>
                      ))}
                    </select>
                    <ChevronDown size={13} aria-hidden="true" className="pointer-events-none absolute bottom-3 right-3 text-estate-muted" />
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[18px] bg-estate-bg p-4">
        {[
          { icon: ShieldCheck, text: "All listings verified" },
          { icon: CheckCircle, text: "RERA registered" },
          { icon: Award, text: "Fraud-protected platform" },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="mb-2.5 flex items-center gap-2.5 last:mb-0">
            <Icon size={15} aria-hidden="true" className="text-estate-success" />
            <span className="text-[13px] font-medium text-estate-text-sec">{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
