"use client";

import { Award, CheckCircle, ChevronDown, Search, ShieldCheck, SlidersHorizontal, X } from "lucide-react";
import { useState, useRef, useEffect, type Dispatch, type SetStateAction } from "react";
import type { ListingFilters } from "@/types";
import { cn } from "@/lib/utils";
import type { SubAreaGroup } from "@/lib/subareas";

type PropertyFiltersProps = {
  filters: ListingFilters;
  cities: string[];
  types: string[];
  subareaGroups: SubAreaGroup[];
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

function SubareaFilter({
  subareaGroups,
  selected,
  selectedCity,
  onChange,
}: {
  subareaGroups: SubAreaGroup[];
  selected: string;
  selectedCity: string;
  onChange: (val: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectedSubareas = selected ? selected.split(",").filter(Boolean) : [];

  const relevant = selectedCity
    ? subareaGroups.filter((g) => g.cityName === selectedCity)
    : subareaGroups;
  const allOptions = relevant.flatMap((g) => g.subareas);

  const filtered = query.trim()
    ? allOptions.filter((s) =>
        s.name.toLowerCase().includes(query.trim().toLowerCase())
      )
    : [];

  const toggleSubarea = (name: string) => {
    const next = selectedSubareas.includes(name)
      ? selectedSubareas.filter((s) => s !== name)
      : [...selectedSubareas, name];
    onChange(next.join(","));
    setQuery("");
    setOpen(false);
  };

  const removeSubarea = (name: string) => {
    onChange(selectedSubareas.filter((s) => s !== name).join(","));
  };

  return (
    <div className="mb-5" ref={ref}>
      <label className="text-sm font-semibold text-estate-text mb-2.5 block">
        Subarea
        <span className="text-xs font-normal text-estate-muted ml-1">(Optional)</span>
      </label>

      {/* Selected chips */}
      {selectedSubareas.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selectedSubareas.map((name) => (
            <span
              key={name}
              className="inline-flex items-center gap-1 rounded-full bg-estate-blue-pale border border-estate-blue/30 px-2.5 py-1 text-xs font-semibold text-estate-navy"
            >
              {name}
              <button
                onClick={() => removeSubarea(name)}
                className="text-estate-muted hover:text-red-500 transition"
                aria-label={`Remove ${name}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-estate-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => query.trim() && setOpen(true)}
          placeholder="Search subareas..."
          className="w-full rounded-[14px] border-[1.5px] border-estate-border bg-white py-2.5 pl-9 pr-3 text-sm text-estate-text outline-none transition focus:border-estate-navy focus:ring-2 focus:ring-estate-navy/10"
        />

        {/* Suggestions dropdown */}
        {open && query.trim() && (
          <div className="absolute left-0 right-0 top-full mt-1 z-20 max-h-48 overflow-y-auto rounded-xl border border-estate-border bg-white shadow-estate-lg">
            {filtered.length === 0 ? (
              <div className="px-3 py-2.5 text-xs text-estate-muted">No matching subareas</div>
            ) : (
              filtered.map((s) => {
                const active = selectedSubareas.includes(s.name);
                return (
                  <button
                    key={s.id}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-estate-bg",
                      active && "bg-estate-blue-pale/50 font-semibold text-estate-navy"
                    )}
                    onClick={() => toggleSubarea(s.name)}
                  >
                    {active && <span className="text-estate-blue shrink-0">✓</span>}
                    <span className={cn(!active && "pl-4")}>{s.name}</span>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {allOptions.length === 0 && (
        <p className="text-xs text-estate-muted mt-1">No subareas available</p>
      )}
    </div>
  );
}

export function PropertyFilters({ filters, cities, types, subareaGroups, onChange, onClear }: PropertyFiltersProps) {
  const selectedClass = "border-estate-navy bg-estate-blue-pale text-estate-navy shadow-estate";
  const defaultClass = "border-estate-border bg-white text-estate-text-sec hover:border-estate-border-med hover:bg-estate-bg";

  const selectableClass = (key: keyof ListingFilters, value: string) =>
    cn("border-[1.5px] transition duration-300", filters[key] === value ? selectedClass : defaultClass);

  const activeCategoryGroups = filters.type
    ? categoryFilterGroups.filter((group) => group.matches.includes(filters.type))
    : categoryFilterGroups;

  const activeFilterEntries = Object.entries(filters).filter(([, value]) => value !== "");
  const hasActiveFilters = activeFilterEntries.length > 0;

  const filterValueDisplay: Record<string, (val: string) => string> = {
    status: (val) => (val === "For Sale" ? "Buy" : val === "For Rent" ? "Rent" : val),
    beds: (val) => `${val}+ Beds`,
    isNew: () => "New Only",
    minPrice: (val) => `Min: ₹${val}L`,
    maxPrice: (val) => `Max: ₹${val}L`,
    category: (val) => (val === "residential" ? "Residential" : "Commercial"),
    subarea: (val) => {
      const items = val.split(",").filter(Boolean);
      return items.length <= 2 ? items.join(", ") : `${items[0]}…`;
    },
  };

  const removeFilter = (key: string) => {
    onChange((prev) => ({ ...prev, [key]: "" }));
  };

  return (
    <div className="rounded-[20px] border border-estate-border/80 bg-white p-6 shadow-estate">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-base font-bold text-estate-navy">
          <SlidersHorizontal size={16} aria-hidden="true" /> Filters
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="rounded-full px-3 py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-50"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="mb-5 p-3 bg-estate-blue-pale/50 rounded-xl border border-estate-blue/20">
          <p className="text-xs font-semibold text-estate-muted mb-2">
            Active Filters ({activeFilterEntries.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {activeFilterEntries.map(([key, value]) => (
              <span
                key={key}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-white rounded-lg text-xs font-medium border border-estate-border text-estate-text"
              >
                {filterValueDisplay[key] ? filterValueDisplay[key](value as string) : (value as string)}
                <button
                  onClick={() => removeFilter(key)}
                  className="text-estate-muted hover:text-red-500 transition"
                  aria-label={`Remove ${key} filter`}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Category */}
      <div className="mb-5">
        <label className="text-sm font-semibold text-estate-text mb-2.5 block">
          Category
          <span className="text-xs font-normal text-estate-muted ml-1">(Residential / Commercial)</span>
        </label>
        <div className="flex gap-2">
          {["residential", "commercial"].map((cat) => (
            <button
              key={cat}
              className={cn(
                "flex-1 rounded-xl px-2 py-2.5 text-[13px] font-semibold",
                filters.category === cat ? selectedClass : defaultClass,
              )}
              onClick={() => onChange((current) => ({ ...current, category: current.category === cat ? "" : cat }))}
              aria-pressed={filters.category === cat}
            >
              {cat === "residential" ? "🏠 Residential" : "🏢 Commercial"}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-estate-muted mt-1">Choose between residential and commercial properties</p>
      </div>

      {/* Section Divider */}
      <div className="h-px bg-estate-border mb-5" />

      {/* Listing Status */}
      <div className="mb-5">
        <label className="text-sm font-semibold text-estate-text mb-2.5 block">
          Listing Status
          <span className="text-xs font-normal text-estate-muted ml-1">(Buy / Rent)</span>
        </label>
        <div className="flex gap-2">
          {["For Sale", "For Rent"].map((status) => (
            <button
              key={status}
              className={cn("flex-1 rounded-xl px-2 py-2.5 text-[13px] font-semibold", selectableClass("status", status))}
              onClick={() => onChange((current) => ({ ...current, status: current.status === status ? "" : status }))}
              aria-pressed={filters.status === status}
            >
              {status === "For Sale" ? "Buy" : "Rent"}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-estate-muted mt-1">Choose Buy or Rent to filter listings</p>
      </div>

      {/* Property Type */}
      <div className="mb-5">
        <label className="text-sm font-semibold text-estate-text mb-2.5 block">
          Property Type
          <span className="text-xs font-normal text-estate-muted ml-1">(Optional)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {types.map((type) => (
            <button
              key={type}
              className={cn("rounded-full px-3.5 py-2 text-xs font-semibold", selectableClass("type", type))}
              onClick={() => onChange((current) => ({ ...current, type: current.type === type ? "" : type }))}
              aria-pressed={filters.type === type}
            >
              {type}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-estate-muted mt-1">Select a property type to narrow results</p>
      </div>

      {/* Section Divider */}
      <div className="h-px bg-estate-border mb-5" />

      {/* Location */}
      <div className="mb-5">
        <label className="text-sm font-semibold text-estate-text mb-2.5 block">
          Location
          <span className="text-xs font-normal text-estate-muted ml-1">(City)</span>
        </label>
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
        <p className="text-[10px] text-estate-muted mt-1">Filter properties by city</p>
      </div>

      {/* Subarea */}
      <SubareaFilter
        subareaGroups={subareaGroups}
        selected={filters.subarea}
        selectedCity={filters.city}
        onChange={(val) => onChange((current) => ({ ...current, subarea: val }))}
      />

      {/* Section Divider */}
      <div className="h-px bg-estate-border mb-5" />

      {/* Price Range */}
      <div className="mb-5">
        <label className="text-sm font-semibold text-estate-text mb-2.5 block">
          Price Range
          <span className="text-xs font-normal text-estate-muted ml-1">(₹ Lakhs)</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-xs text-estate-muted block mb-1">Min</span>
            <input
              type="number"
              value={filters.minPrice}
              onChange={(e) => onChange((current) => ({ ...current, minPrice: e.target.value }))}
              placeholder="e.g. 50"
              className="w-full px-3 py-2.5 rounded-lg border border-estate-border text-sm focus:ring-2 focus:ring-estate-navy focus:border-transparent outline-none transition"
              aria-label="Minimum price in lakhs"
            />
          </div>
          <div>
            <span className="text-xs text-estate-muted block mb-1">Max</span>
            <input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => onChange((current) => ({ ...current, maxPrice: e.target.value }))}
              placeholder="e.g. 200"
              className="w-full px-3 py-2.5 rounded-lg border border-estate-border text-sm focus:ring-2 focus:ring-estate-navy focus:border-transparent outline-none transition"
              aria-label="Maximum price in lakhs"
            />
          </div>
        </div>
        <p className="text-[10px] text-estate-muted mt-1">Set minimum and maximum price</p>
      </div>

      {/* Section Divider */}
      <div className="h-px bg-estate-border mb-5" />

      {/* Bedrooms */}
      <div className="mb-5">
        <label className="text-sm font-semibold text-estate-text mb-2.5 block">
          Bedrooms
          <span className="text-xs font-normal text-estate-muted ml-1">(Minimum)</span>
        </label>
        <div className="flex gap-2">
          {["1", "2", "3", "4", "5"].map((bed) => (
            <button
              key={bed}
              className={cn("h-10 w-10 shrink-0 rounded-xl text-[13px] font-semibold", selectableClass("beds", bed))}
              onClick={() => onChange((current) => ({ ...current, beds: current.beds === bed ? "" : bed }))}
              aria-pressed={filters.beds === bed}
            >
              {bed}+
            </button>
          ))}
        </div>
        <p className="text-[10px] text-estate-muted mt-1">Minimum number of bedrooms</p>
      </div>

      {/* Section Divider */}
      <div className="h-px bg-estate-border mb-5" />

      {/* New Listings Only */}
      <div className="mb-5">
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.isNew === "true"}
            onChange={(e) => onChange((current) => ({ ...current, isNew: e.target.checked ? "true" : "" }))}
            className="w-4 h-4 rounded border-estate-border text-estate-navy focus:ring-estate-navy"
          />
          <span className="text-sm font-semibold text-estate-text">New Listings Only</span>
        </label>
        <p className="text-[10px] text-estate-muted mt-1 ml-6">Show only newly added properties</p>
      </div>

      {/* Property Specific */}
      {activeCategoryGroups.length > 0 && (
        <>
          <div className="h-px bg-estate-border mb-5" />
          <div className="mb-5 rounded-[18px] border border-estate-border/80 bg-estate-bg p-4">
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
        </>
      )}

      {/* Trust Badges */}
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

      {/* Clear All Button */}
      {hasActiveFilters && (
        <div className="mt-6 pt-4 border-t border-estate-border">
          <button
            onClick={onClear}
            className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition text-sm"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}
