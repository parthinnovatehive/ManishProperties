"use client";

import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronDown, ChevronLeft, ChevronRight, Filter, Grid3X3, List, Search, X } from "lucide-react";
import type { ListingFilters, Property } from "@/types";
import { cn, uniqueValues } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PropertyCard } from "./property-card";
import { PropertyFilters } from "./property-filters";
import { PropertyQuestionnaireModal } from "./PropertyQuestionnaireModal";
import {
  shouldShowQuestionnaire,
  markQuestionnaireShown,
  answersToFilters,
  type QuestionnaireAnswers,
} from "@/lib/utils/propertyFilters";
import { fetchSubAreas, getSubAreaIdByName, groupSubAreasByCity } from "@/lib/subareas";

const blankFilters: ListingFilters = { type: "", status: "", minPrice: "", maxPrice: "", beds: "", city: "", subarea: "", isNew: "", category: "" };
const sortOptions = ["Relevance", "Price: Low to High", "Price: High to Low", "Newest First", "Most Popular"];

function listingStatus(property: Property) {
  if (property.listingType === "Sell") return "For Sale";
  if (property.listingType === "Rent") return "For Rent";
  if (property.listingType) return property.listingType;
  if (property.status === "For Sale" || property.status === "For Rent") return property.status;
  return "For Sale";
}

export function ListingPage({ properties }: { properties: Property[] }) {
  const searchParams = useSearchParams();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState("Relevance");
  const [currentPage, setCurrentPage] = useState(1);
  const PROPERTIES_PER_PAGE = 12;
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const autoOpenedRef = useRef(false);
  const [filters, setFilters] = useState<ListingFilters>({
    ...blankFilters,
    type: searchParams?.get("type") ?? "",
    status: searchParams?.get("status") ?? "",
    city: searchParams?.get("city") ?? "",
    subarea: searchParams?.get("subarea") ?? "",
    isNew: searchParams?.get("new") ?? "",
    category: searchParams?.get("category") ?? "",
    beds: searchParams?.get("beds") ?? "",
    minPrice: searchParams?.get("minPrice") ?? "",
    maxPrice: searchParams?.get("maxPrice") ?? "",
  });
  const query = searchParams?.get("q")?.toLowerCase() ?? "";

  // Show questionnaire modal on first visit (no pre-applied filters)
  useEffect(() => {
    if (searchParams && shouldShowQuestionnaire(searchParams)) {
      autoOpenedRef.current = true;
      setShowQuestionnaire(true);
    }
  }, [searchParams]);

  // Sync URL search params to filter state whenever URL changes
  useEffect(() => {
    setFilters({
      ...blankFilters,
      type: searchParams?.get("type") ?? "",
      status: searchParams?.get("status") ?? "",
      city: searchParams?.get("city") ?? "",
      subarea: searchParams?.get("subarea") ?? "",
      isNew: searchParams?.get("new") ?? "",
      category: searchParams?.get("category") ?? "",
      beds: searchParams?.get("beds") ?? "",
      minPrice: searchParams?.get("minPrice") ?? "",
      maxPrice: searchParams?.get("maxPrice") ?? "",
    });
  }, [searchParams]);
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, query, sort]);

  const cities = useMemo(() => uniqueValues(properties.map((property) => property.city)), [properties]);
  const types = useMemo(() => uniqueValues(properties.map((property) => property.type)), [properties]);
  const subareaGroups = useMemo(() => groupSubAreasByCity(fetchSubAreas()), []);

  const filtered = useMemo(() => {
    const next = properties.filter((property) => {
      if (filters.type && property.type !== filters.type) return false;
      if (filters.status && listingStatus(property) !== filters.status) return false;
      if (filters.city && property.city !== filters.city) return false;
      if (filters.beds && property.beds < Number.parseInt(filters.beds, 10)) return false;
      if (filters.minPrice && property.priceNum < Number.parseInt(filters.minPrice, 10)) return false;
      if (filters.maxPrice && property.priceNum > Number.parseInt(filters.maxPrice, 10)) return false;
      if (filters.category && property.category !== filters.category) return false;
      if (filters.subarea) {
        const selectedNames = filters.subarea.split(",").filter(Boolean);
        const selectedIds = selectedNames.map((n) => getSubAreaIdByName(n)).filter(Boolean) as string[];
        if (selectedIds.length > 0 && !selectedIds.includes(property.sub_area_id ?? "")) return false;
      }
      if (filters.isNew && property.isNew !== true) return false;
      if (query) {
        const haystack = `${property.title} ${property.subtitle} ${property.type} ${property.builder} ${property.location} ${property.city}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });

    return [...next].sort((a, b) => {
      if (sort === "Price: Low to High") return a.priceNum - b.priceNum;
      if (sort === "Price: High to Low") return b.priceNum - a.priceNum;
      if (sort === "Newest First") return Number(b.isNew) - Number(a.isNew);
      if (sort === "Most Popular") return b.rating * b.reviews - a.rating * a.reviews;

      const aId = Number(a.id);
      const bId = Number(b.id);
      if (Number.isFinite(aId) && Number.isFinite(bId)) return aId - bId;
      return String(a.id).localeCompare(String(b.id));
    });
  }, [filters, properties, query, sort]);
  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / PROPERTIES_PER_PAGE)
  );

  const paginatedProperties =
    filtered.slice(
      (currentPage - 1) * PROPERTIES_PER_PAGE,
      currentPage * PROPERTIES_PER_PAGE
    );
  const clearFilters = () => setFilters(blankFilters);
  const activeFilterCount = Object.values(filters).filter((v) => v !== "").length;

  const handleQuestionnaireClose = useCallback(() => {
    if (autoOpenedRef.current) {
      markQuestionnaireShown();
    }
    autoOpenedRef.current = false;
    setShowQuestionnaire(false);
  }, []);

  const handleQuestionnaireSkip = useCallback(() => {
    markQuestionnaireShown();
    autoOpenedRef.current = false;
    setShowQuestionnaire(false);
  }, []);

  const handleQuestionnaireComplete = useCallback(
    (answers: QuestionnaireAnswers) => {
      markQuestionnaireShown();
      autoOpenedRef.current = false;
      setShowQuestionnaire(false);
      const filterParams = answersToFilters(answers);
      if (Object.keys(filterParams).length > 0) {
        setFilters((prev) => ({
          ...prev,
          ...filterParams,
        }));
      }
    },
    []
  );

  const handleOpenQuestionnaire = useCallback(() => {
    autoOpenedRef.current = false;
    setShowQuestionnaire(true);
  }, []);

  return (
    <div className="min-h-screen bg-estate-bg">
      <div className="border-b border-estate-border bg-white px-6 py-8 shadow-[0_10px_28px_rgba(22,74,52,0.04)]">
        <div className="container-wide px-0">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <h1 className="mb-2 font-serif text-[clamp(1.9rem,3vw,2.6rem)] font-semibold text-estate-navy">Properties for Sale & Rent</h1>
              <div className="text-sm text-estate-muted">
                <b className="text-estate-text">{filtered.length} properties</b> found matching your criteria
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handleOpenQuestionnaire}
                className="flex items-center gap-2 rounded-xl bg-estate-navy px-4 py-2.5 text-[13px] font-semibold text-white shadow-md transition hover:bg-estate-navy/90"
              >
                <Search size={15} aria-hidden="true" />
                <span className="hidden sm:inline">Find My Property</span>
              </button>

              <button
                className="flex items-center gap-2 rounded-xl border-[1.5px] border-estate-border bg-white px-4 py-2.5 text-[13px] font-semibold text-estate-text-sec shadow-estate lg:hidden"
                onClick={() => setShowMobileFilters((value) => !value)}
              >
                <Filter size={15} aria-hidden="true" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 bg-estate-navy text-white text-xs rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <label className="relative block">
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                  className="focus-field appearance-none rounded-[14px] border-[1.5px] border-estate-border bg-white py-2.5 pl-3.5 pr-9 text-[13px] font-medium text-estate-text shadow-estate"
                >
                  {sortOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
                <ChevronDown size={14} aria-hidden="true" className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-estate-muted" />
              </label>

              <div className="flex rounded-xl border border-estate-border bg-estate-bg p-1 shadow-estate">
                {(["grid", "list"] as const).map((mode) => (
                  <button
                    key={mode}
                    aria-label={`${mode} view`}
                    className={cn(
                      "flex items-center rounded-lg px-3 py-2 transition",
                      view === mode ? "bg-white text-estate-navy shadow-estate" : "text-estate-muted",
                    )}
                    onClick={() => setView(mode)}
                  >
                    {mode === "grid" ? <Grid3X3 size={16} aria-hidden="true" /> : <List size={16} aria-hidden="true" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-wide grid gap-8 py-10 lg:grid-cols-[320px_1fr] lg:py-12">
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
            <div className="fixed inset-0 bg-black/30" onClick={() => setShowMobileFilters(false)} />
            <div className="fixed inset-y-0 left-0 w-[320px] max-w-[85vw] bg-white overflow-y-auto shadow-estate-lg animate-fade-up">
              <div className="sticky top-0 z-10 flex items-center justify-between bg-white p-4 border-b border-estate-border">
                <span className="text-sm font-bold text-estate-navy">Filters</span>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-1.5 rounded-lg hover:bg-estate-bg transition"
                  aria-label="Close filters"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="p-4">
                <PropertyFilters
                  filters={filters}
                  cities={cities}
                  types={types}
                  subareaGroups={subareaGroups}
                  onChange={setFilters}
                  onClear={clearFilters}
                />
              </div>
            </div>
          </div>
        )}
        <aside className="hidden lg:block">
          <div className="sticky top-[96px]">
            <PropertyFilters
              filters={filters}
              cities={cities}
              types={types}
              subareaGroups={subareaGroups}
              onChange={setFilters}
              onClear={clearFilters}
            />
          </div>
        </aside>

        <div>
          {filtered.length === 0 ? (
            <div className="rounded-[20px] border border-estate-border bg-white px-5 py-24 text-center shadow-estate">
              <Search size={48} aria-hidden="true" className="mx-auto mb-4 text-estate-border" />
              <h3 className="mb-2 text-xl font-bold text-estate-navy">No properties found</h3>
              <p className="mb-5 text-estate-text-sec">Try adjusting your filters to see more results</p>
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className={cn("grid gap-4 sm:gap-6", view === "grid" ? "sm:grid-cols-2 xl:grid-cols-2" : "grid-cols-1")}>
              {paginatedProperties.map((property) => (
                <PropertyCard key={property.id} property={property} compact={view === "grid"} />
              ))}
            </div>
          )}
          {filtered.length > 0 && (
            <>
              <div className="mb-5 text-center text-sm text-estate-muted">
                Showing{" "}
                {(currentPage - 1) * PROPERTIES_PER_PAGE + 1}
                -
                {Math.min(
                  currentPage * PROPERTIES_PER_PAGE,
                  filtered.length
                )}{" "}
                of {filtered.length} properties
              </div>

              <div className="mt-8 sm:mt-12 flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
                <button
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((p) =>
                      Math.max(1, p - 1)
                    )
                  }
                  className="flex items-center gap-1.5 rounded-xl border-[1.5px] border-estate-border bg-white px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium text-estate-text-sec shadow-estate disabled:opacity-50 min-h-[40px]"
                >
                  <ChevronLeft size={15} />
                  <span className="hidden sm:inline">Previous</span>
                </button>

                <div className="flex gap-1">
                  {Array.from(
                    { length: Math.min(totalPages, 5) },
                    (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={cn(
                            "h-9 w-9 sm:h-10 sm:w-10 rounded-xl border-[1.5px] text-xs sm:text-sm font-semibold shadow-estate",
                            pageNum === currentPage
                              ? "border-estate-blue bg-estate-blue text-white"
                              : "border-estate-border bg-white text-estate-text-sec"
                          )}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                  )}
                </div>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((p) =>
                      Math.min(totalPages, p + 1)
                    )
                  }
                  className="flex items-center gap-1.5 rounded-xl border-[1.5px] border-estate-border bg-white px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold text-estate-navy shadow-estate disabled:opacity-50 min-h-[40px]"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight size={15} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <PropertyQuestionnaireModal
        open={showQuestionnaire}
        cities={cities}
        onComplete={handleQuestionnaireComplete}
        onSkip={handleQuestionnaireSkip}
        onClose={handleQuestionnaireClose}
      />
    </div>
  );
}
