"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, MapPin, Search, ShieldCheck, Sparkles, X, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchSearchData, SearchSuggestion } from "@/lib/searchData";
import { parseSearchQuery, buildSearchUrl } from "@/lib/searchParser";
import {
  SmartSuggestion,
  PROPERTY_TYPES,
  BUILDERS,
  getRecentSearches,
  saveRecentSearch,
  generateSmartSuggestions,
} from "@/lib/smartSearch";
import Fuse from "fuse.js";

const searchTabs = ["Buy", "Rent", "Commercial", "New Projects"];
const popularSearches = ["3 BHK Mumbai", "Villa Bangalore", "Office BKC", "1 BHK Pune"];
const MAX_SUGGESTIONS = 10;

export function HeroSearch() {
  const router = useRouter();
  const [searchType, setSearchType] = useState("");
  const [query, setQuery] = useState("");
  const [searchData, setSearchData] = useState<{
    cities: SearchSuggestion[];
    subareas: SearchSuggestion[];
    propertyTypes: SearchSuggestion[];
  }>({ cities: [], subareas: [], propertyTypes: [] });
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchSearchData();
        setSearchData(data);
      } catch (error) {
        console.error("Failed to load search data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fuse.js instances — rebuilt only when searchData changes
  const fuseLocations = useMemo(() => {
    const items = [
      ...searchData.cities.map((c) => ({ ...c, _type: "city" as const, _icon: "📍" })),
      ...searchData.subareas.map((s) => ({ ...s, _type: "subarea" as const, _icon: "📍" })),
    ];
    return new Fuse(items, {
      keys: ["label"],
      threshold: 0.3,
      distance: 80,
      minMatchCharLength: 1,
    });
  }, [searchData]);

  const fuseTypes = useMemo(
    () =>
      new Fuse(PROPERTY_TYPES, {
        threshold: 0.3,
        distance: 80,
        minMatchCharLength: 1,
      }),
    []
  );

  const fuseBuilders = useMemo(
    () =>
      new Fuse(BUILDERS, {
        threshold: 0.3,
        distance: 80,
        minMatchCharLength: 1,
      }),
    []
  );

  const suggestions = useMemo((): SmartSuggestion[] => {
    if (!query || query.length < 1) return [];
    const lowerQuery = query.toLowerCase();
    const results: SmartSuggestion[] = [];
    const seen = new Set<string>();

    // 1. Location matches
    const locMatches = fuseLocations.search(lowerQuery);
    for (const match of locMatches.slice(0, 3)) {
      const item = match.item;
      const key = `loc_${item._type}_${item.label}`;
      if (!seen.has(key)) {
        seen.add(key);
        results.push({
          id: key,
          label: item.label,
          type: item._type,
          category: item._type === "city" ? "City" : "Subarea",
          icon: "📍",
        });
      }
    }

    // 2. Property type matches
    const typeMatches = fuseTypes.search(lowerQuery);
    for (const match of typeMatches.slice(0, 2)) {
      const key = `type_${match.item}`;
      if (!seen.has(key)) {
        seen.add(key);
        results.push({
          id: key,
          label: match.item,
          type: "propertyType",
          category: "Property Type",
          icon: "🏠",
        });
      }
    }

    // 3. Builder matches
    const builderMatches = fuseBuilders.search(lowerQuery);
    for (const match of builderMatches.slice(0, 2)) {
      const key = `builder_${match.item}`;
      if (!seen.has(key)) {
        seen.add(key);
        results.push({
          id: key,
          label: match.item,
          type: "builder",
          category: "Builder",
          icon: "🏗️",
        });
      }
    }

    // 4. Smart query suggestions
    const parsed = parseSearchQuery(query, searchData);
    const smartSuggestions = generateSmartSuggestions(parsed, searchData.cities, searchData.subareas);
    for (const s of smartSuggestions) {
      if (!seen.has(s.id)) {
        seen.add(s.id);
        results.push(s);
      }
    }

    // 5. Recent searches
    const recent = getRecentSearches();
    for (const r of recent) {
      if (r.toLowerCase().includes(lowerQuery) && !seen.has(`recent_${r}`)) {
        seen.add(`recent_${r}`);
        results.push({
          id: `recent_${r}`,
          label: r,
          type: "smart",
          category: "Recent Search",
          icon: "🕐",
        });
      }
    }

    return results.slice(0, MAX_SUGGESTIONS);
  }, [query, searchData, fuseLocations, fuseTypes, fuseBuilders]);

  const handleSearch = useCallback(
    (searchQuery?: string) => {
      const q = (searchQuery ?? query).trim();
      if (!q) {
        // Navigate to properties page with just the tab filter
        const params = new URLSearchParams();
        if (searchType === "Buy") params.set("status", "for-sale");
        if (searchType === "Rent") params.set("status", "for-rent");
        if (searchType === "Commercial") params.set("type", "Commercial");
        if (searchType === "New Projects") params.set("new", "true");
        router.push(`/properties${params.toString() ? `?${params.toString()}` : ""}`);
        return;
      }

      const parsed = parseSearchQuery(q, searchData);
      saveRecentSearch(q);

      const params = new URLSearchParams();

      if (searchType === "Buy") params.set("status", "for-sale");
      else if (searchType === "Rent") params.set("status", "for-rent");
      else if (searchType === "Commercial") params.set("type", "Commercial");
      else if (searchType === "New Projects") params.set("new", "true");

      if (parsed.beds) params.set("beds", parsed.beds.toString());
      if (parsed.propertyType) params.set("type", parsed.propertyType);
      if (parsed.city) params.set("city", parsed.city);
      if (parsed.subarea) params.set("subarea", parsed.subarea);
      if (parsed.listingType) params.set("status", parsed.listingType);
      if (parsed.maxPrice) params.set("maxPrice", parsed.maxPrice.toString());
      if (parsed.minPrice) params.set("minPrice", parsed.minPrice.toString());
      if (parsed.area) params.set("area", parsed.area.toString());
      if (parsed.builder) params.set("builder", parsed.builder);
      params.set("q", q);

      router.push(`/properties?${params.toString()}`);
      setShowSuggestions(false);
    },
    [query, searchType, searchData, router]
  );

  const handleSuggestionClick = useCallback(
    (suggestion: SmartSuggestion) => {
      setQuery(suggestion.label);
      setShowSuggestions(false);
      setHighlightedIndex(-1);
      if (suggestion.type === "smart" || suggestion.type === "propertyType") {
        handleSearch(suggestion.label);
      } else {
        inputRef.current?.focus();
      }
    },
    [handleSearch]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!showSuggestions || suggestions.length === 0) {
        if (e.key === "Enter") {
          e.preventDefault();
          handleSearch();
        }
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev > 0 ? prev - 1 : suggestions.length - 1
          );
          break;
        case "Enter": {
          e.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
            handleSuggestionClick(suggestions[highlightedIndex]);
          } else {
            handleSearch();
          }
          break;
        }
        case "Escape":
          setShowSuggestions(false);
          setHighlightedIndex(-1);
          break;
      }
    },
    [showSuggestions, suggestions, highlightedIndex, handleSearch, handleSuggestionClick]
  );

  const categoryIcon = (type: string) => {
    switch (type) {
      case "city":
      case "subarea":
        return "📍";
      case "propertyType":
        return "🏠";
      case "builder":
        return "🏗️";
      default:
        return "🔍";
    }
  };

  // Group suggestions by category for display
  const groupedSuggestions = useMemo(() => {
    const groups: { label: string; icon: string; items: SmartSuggestion[] }[] = [];
    const map = new Map<string, { label: string; icon: string; items: SmartSuggestion[] }>();

    for (const s of suggestions) {
      let groupKey: string;
      let icon: string;

      switch (s.type) {
        case "city":
        case "subarea":
          groupKey = "locations";
          icon = "📍";
          break;
        case "propertyType":
          groupKey = "types";
          icon = "🏠";
          break;
        case "builder":
          groupKey = "builders";
          icon = "🏗️";
          break;
        default:
          groupKey = "suggestions";
          icon = "🔍";
      }

      if (!map.has(groupKey)) {
        map.set(groupKey, { label: groupKey, icon, items: [] });
      }
      map.get(groupKey)!.items.push(s);
    }

    const order = ["locations", "types", "builders", "suggestions"];
    for (const key of order) {
      if (map.has(key)) {
        groups.push(map.get(key)!);
      }
    }
    return groups;
  }, [suggestions]);

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

            <div className="flex gap-3 p-1" ref={wrapperRef}>
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setShowSuggestions(true);
                    setHighlightedIndex(-1);
                  }}
                  onFocus={() => {
                    if (query.length > 0 || suggestions.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Search properties, locations, builders..."
                  disabled={loading}
                  className="w-full rounded-[14px] border-[1.5px] border-estate-border bg-estate-bg/65 py-3.5 pl-10 pr-10 text-sm text-estate-text shadow-sm transition hover:border-estate-border-med hover:bg-white focus:border-estate-navy focus:bg-white focus:ring-2 focus:ring-estate-navy/20 focus:outline-none"
                  autoComplete="off"
                  role="combobox"
                  aria-expanded={showSuggestions}
                  aria-haspopup="listbox"
                  aria-autocomplete="list"
                />
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-estate-blue transition">
                  <Search size={16} aria-hidden="true" />
                </span>
                {query && !loading && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setShowSuggestions(false);
                      inputRef.current?.focus();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 transition hover:bg-gray-200"
                    aria-label="Clear input"
                  >
                    <X size={14} className="text-estate-muted" />
                  </button>
                )}
                {loading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-estate-navy border-t-transparent" />
                  </div>
                )}

                {/* Autocomplete dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div
                    className="absolute z-50 mt-1 w-full rounded-xl border border-estate-border bg-white shadow-estate-lg max-h-80 overflow-y-auto animate-fade-up"
                    role="listbox"
                  >
                    <div className="p-1.5">
                      {groupedSuggestions.map((group) => (
                        <div key={group.label}>
                          {group.items.map((suggestion, idx) => {
                            const globalIndex = suggestions.indexOf(suggestion);
                            return (
                              <button
                                key={suggestion.id}
                                onClick={() => handleSuggestionClick(suggestion)}
                                onMouseEnter={() => setHighlightedIndex(globalIndex)}
                                role="option"
                                aria-selected={highlightedIndex === globalIndex}
                                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                                  highlightedIndex === globalIndex
                                    ? "bg-estate-blue-pale text-estate-navy"
                                    : "text-estate-text hover:bg-estate-bg"
                                }`}
                              >
                                <span className="flex-shrink-0 text-base">
                                  {categoryIcon(suggestion.type)}
                                </span>
                                <span className="flex-1 truncate">
                                  {suggestion.label}
                                </span>
                                <span className="whitespace-nowrap rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-estate-muted">
                                  {suggestion.category}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Button
                variant="navy"
                className="rounded-xl px-8 py-3.5 text-[15px]"
                onClick={() => handleSearch()}
              >
                Search <ArrowRight size={16} aria-hidden="true" />
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2 px-2 pb-1.5 pt-3">
              <span className="mr-1 text-xs font-semibold uppercase tracking-[0.12em] text-estate-muted">
                Popular:
              </span>
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
