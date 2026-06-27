"use client";

import { Search, SlidersHorizontal, ArrowUpDown } from "lucide-react";

interface Filters {
  status: string;
  category: string;
  listingType: string;
  dateRange: string;
  search: string;
}

interface MyPropertyFiltersProps {
  filters: Filters;
  sortBy: string;
  onFilterChange: (filters: Filters) => void;
  onSortChange: (sort: string) => void;
}

export function MyPropertyFilters({
  filters,
  sortBy,
  onFilterChange,
  onSortChange,
}: MyPropertyFiltersProps) {
  const updateFilter = (key: keyof Filters, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white border border-estate-border/70 p-4 sm:p-6 rounded-2xl shadow-sm mb-6 space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-estate-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by title, location, or description..."
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm font-semibold border border-estate-border/80 focus:border-estate-navy focus:ring-4 focus:ring-estate-blue-pale/50 rounded-xl outline-none transition bg-estate-bg"
        />
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex items-center gap-2 text-xs font-bold text-estate-muted">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filters
        </div>

        <div className="flex flex-wrap gap-2 flex-1">
          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => updateFilter("status", e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold border border-estate-border/80 rounded-lg bg-white focus:border-estate-navy outline-none cursor-pointer"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>

          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) => updateFilter("category", e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold border border-estate-border/80 rounded-lg bg-white focus:border-estate-navy outline-none cursor-pointer"
          >
            <option value="">All Categories</option>
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
          </select>

          {/* Listing Type Filter */}
          <select
            value={filters.listingType}
            onChange={(e) => updateFilter("listingType", e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold border border-estate-border/80 rounded-lg bg-white focus:border-estate-navy outline-none cursor-pointer"
          >
            <option value="">All Types</option>
            <option value="For Sale">For Sale</option>
            <option value="For Rent">For Rent</option>
          </select>

          {/* Date Range Filter */}
          <select
            value={filters.dateRange}
            onChange={(e) => updateFilter("dateRange", e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold border border-estate-border/80 rounded-lg bg-white focus:border-estate-navy outline-none cursor-pointer"
          >
            <option value="">All Time</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-estate-muted" />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold border border-estate-border/80 rounded-lg bg-white focus:border-estate-navy outline-none cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="views">Most Viewed</option>
          </select>
        </div>
      </div>
    </div>
  );
}
