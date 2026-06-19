"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, MapPin, Search, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const searchTabs = ["Buy", "Rent", "Commercial", "New Projects"];
const popularSearches = ["3 BHK Mumbai", "Villa Bangalore", "Office BKC", "1 BHK Pune"];

export function HeroSearch() {
  const router = useRouter();
  const [searchType, setSearchType] = useState("Buy");
  const [searchCity, setSearchCity] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (queryOverride?: string) => {
    const params = new URLSearchParams();
    const query = queryOverride ?? searchQuery;

    if (searchType === "Buy") params.set("status", "For Sale");
    if (searchType === "Rent") params.set("status", "For Rent");
    if (searchType === "Commercial") params.set("type", "Commercial");
    if (searchType === "New Projects") params.set("new", "true");
    if (searchCity) params.set("city", searchCity);
    if (query) params.set("q", query);

    router.push(`/properties${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <section className="relative flex min-h-[680px] items-center overflow-hidden sm:min-h-[720px]">
      <img
        src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&auto=format&q=80"
        alt="Luxury residential property"
        className="absolute inset-0 h-full w-full scale-[1.02] object-cover"
      />
      <div className="hero-overlay absolute inset-0" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(16,42,30,0.84)_0%,rgba(22,74,52,0.62)_46%,rgba(22,74,52,0.18)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-estate-bg/80 to-transparent" />

      <div className="container-wide relative py-24 sm:py-28">
        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/12 px-4 py-2 text-[13px] font-medium text-white shadow-estate backdrop-blur-md transition hover:border-white/50 hover:bg-white/18">
          <ShieldCheck size={15} aria-hidden="true" className="text-estate-blue-light" />
          Trusted by 2M+ homebuyers across India
        </div>

        <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-estate-blue-light">
          <Sparkles size={14} aria-hidden="true" />
          Curated premium residences
        </div>

        <h1 className="max-w-4xl font-serif text-[clamp(2.8rem,6vw,5.3rem)] font-semibold leading-[0.98] text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.22)]">
          Find a Home
          <br />
          <span className="text-[#BFE6BF]">That Matches Your Life</span>
        </h1>
        <p className="mt-7 max-w-2xl text-base leading-8 text-white/[0.84] sm:text-lg">
          Explore 85,000+ verified listings with transparent pricing, RERA-compliant properties, and expert guidance.
        </p>

        <div className="mt-12 max-w-[920px] rounded-[28px] border border-white/30 bg-white/20 p-2 shadow-search-card backdrop-blur-xl">
          <div className="rounded-[22px] bg-white p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
            <div className="mb-3 flex overflow-x-auto border-b border-estate-border px-1">
              {searchTabs.map((tab) => (
                <button
                  key={tab}
                  className={`mb-[-1px] whitespace-nowrap border-b-[2.5px] px-4 py-3 text-sm font-semibold transition duration-300 hover:bg-estate-bg/80 sm:px-5 ${
                    searchType === tab
                      ? "border-estate-navy text-estate-navy"
                      : "border-transparent text-estate-text-sec hover:text-estate-navy"
                  }`}
                  onClick={() => setSearchType(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="grid gap-3 p-1 sm:grid-cols-[1fr_1fr_auto]">
              <label className="group relative block">
                <MapPin size={16} aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-estate-blue transition group-focus-within:text-estate-navy" />
                <input
                  value={searchCity}
                  onChange={(event) => setSearchCity(event.target.value)}
                  placeholder="City, locality, or landmark"
                  className="focus-field w-full rounded-[14px] border-[1.5px] border-estate-border bg-estate-bg/65 py-3.5 pl-10 pr-3.5 text-sm text-estate-text shadow-sm transition hover:border-estate-border-med hover:bg-white focus:bg-white"
                />
              </label>
              <label className="group relative block">
                <Search size={16} aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-estate-blue transition group-focus-within:text-estate-navy" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Property type, builder, project..."
                  className="focus-field w-full rounded-[14px] border-[1.5px] border-estate-border bg-estate-bg/65 py-3.5 pl-10 pr-3.5 text-sm text-estate-text shadow-sm transition hover:border-estate-border-med hover:bg-white focus:bg-white"
                />
              </label>
              <Button variant="navy" className="rounded-xl px-8 py-3.5 text-[15px]" onClick={() => handleSearch()}>
                Search <ArrowRight size={16} aria-hidden="true" />
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2 px-2 pb-1.5 pt-3">
              <span className="mr-1 text-xs font-semibold uppercase tracking-[0.12em] text-estate-muted">Popular:</span>
              {popularSearches.map((search) => (
                <button
                  key={search}
                  className="rounded-full bg-estate-blue-pale px-3.5 py-1.5 text-xs font-semibold text-estate-blue transition duration-300 hover:-translate-y-0.5 hover:bg-estate-navy hover:text-white"
                  onClick={() => handleSearch(search)}
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
