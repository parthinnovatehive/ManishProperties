"use client";

import { useEffect, useState } from "react";
import { estateApi } from "@/lib/api";
import type { PropertyId } from "@/types";

// Define local state interface matching property entries
interface PropertyListItem {
  id: PropertyId;
  title: string;
  location: string;
  price: string;
  priceNum?: number;
  type: string;
  status: string; // "For Sale" | "For Rent"
  verified: boolean;
  featured: boolean;
  approvalStatus: 'Approved' | 'Pending' | 'Rejected' | 'Suspended';
  listerType: string;
  listerName: string;
  listerPhone: string;
  city?: string;
  createdAt?: string;
}

export default function AdminPropertiesPage() {
  const [propertiesList, setPropertiesList] = useState<PropertyListItem[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<PropertyListItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Sort States
  const [searchTerm, setSearchTerm] = useState("");
  const [approvalFilter, setApprovalFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [featuredFilter, setFeaturedFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"price" | "title" | "date">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    Promise.all([
      estateApi.adminProperties.list(),
      estateApi.agents.list<any>(),
      estateApi.users.list<any>(),
    ])
      .then(([items, agents, users]) => {
        const map = new Map<string, { name: string; phone: string; type: string }>();
        agents.forEach((a: any) => map.set(a.id, { name: a.name || a.email, phone: a.phone || "N/A", type: "Agent" }));
        users.forEach((u: any) => map.set(u.id, { name: u.name || u.email, phone: u.phone || "N/A", type: "Owner" }));
        const mapped = items.map((p: any) => toListItem(p, map));
        setPropertiesList(mapped);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [propertiesList, searchTerm, approvalFilter, typeFilter, statusFilter, featuredFilter, sortBy, sortOrder]);

  const toListItem = (p: any, listerMap: Map<string, { name: string; phone: string; type: string }>): PropertyListItem => {
    const lister = p.lister_id ? listerMap.get(p.lister_id) : undefined;
    const rawType = p.lister_type || "";
    return {
      id: p.id,
      title: p.title,
      location: p.location,
      price: p.price,
      priceNum: p.priceNum || parseFloat(p.price?.replace(/[^0-9.-]+/g, "")) || 0,
      type: p.type || "Apartment",
      status: p.listingType || p.status || "For Sale",
      verified: !!p.verified,
      featured: !!p.featured,
      approvalStatus: p.moderationStatus === "PENDING" ? "Pending" : p.moderationStatus === "REJECTED" ? "Rejected" : p.moderationStatus === "SUSPENDED" ? "Suspended" : "Approved",
      listerType: lister?.type || (rawType ? rawType.charAt(0).toUpperCase() + rawType.slice(1) : "N/A"),
      listerName: lister?.name || p.lister_name || "Not Assigned",
      listerPhone: lister?.phone || "N/A",
      city: p.city || "Unknown",
      createdAt: p.createdAt || new Date().toISOString()
    };
  };

  const applyFiltersAndSort = () => {
    let filtered = [...propertiesList];

    // Search filter (title, location, agent, city)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          p.location.toLowerCase().includes(term) ||
          p.listerName.toLowerCase().includes(term) ||
          (p.city && p.city.toLowerCase().includes(term))
      );
    }

    // Approval Status filter
    if (approvalFilter !== "all") {
      filtered = filtered.filter((p) => p.approvalStatus === approvalFilter);
    }

    // Property Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((p) => p.type.toLowerCase() === typeFilter.toLowerCase());
    }

    // Listing Status filter (For Sale / For Rent)
    if (statusFilter !== "all") {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    // Featured filter
    if (featuredFilter !== "all") {
      filtered = filtered.filter((p) => p.featured === (featuredFilter === "featured"));
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === "price") {
        const priceA = a.priceNum || 0;
        const priceB = b.priceNum || 0;
        return sortOrder === "desc" ? priceB - priceA : priceA - priceB;
      } else if (sortBy === "title") {
        return sortOrder === "desc" 
          ? b.title.localeCompare(a.title)
          : a.title.localeCompare(b.title);
      } else if (sortBy === "date") {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
      }
      return 0;
    });

    setFilteredProperties(filtered);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setApprovalFilter("all");
    setTypeFilter("all");
    setStatusFilter("all");
    setFeaturedFilter("all");
    setSortBy("date");
    setSortOrder("desc");
  };

  const handleApprove = async (id: PropertyId) => {
    await estateApi.adminProperties.approve(id);
    setPropertiesList(prev =>
      prev.map(p => (p.id === id ? { ...p, approvalStatus: 'Approved' } : p))
    );
  };

  const handleReject = async (id: PropertyId) => {
    await estateApi.adminProperties.reject(id);
    setPropertiesList(prev =>
      prev.map(p => (p.id === id ? { ...p, approvalStatus: 'Rejected' } : p))
    );
  };

  const uniqueTypes = [...new Set(propertiesList.map(p => p.type))];
  const pendingCount = propertiesList.filter(p => p.approvalStatus === 'Pending').length;
  const approvedCount = propertiesList.filter(p => p.approvalStatus === 'Approved').length;
  const featuredCount = propertiesList.filter(p => p.featured).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-estate-navy font-serif">Manage Properties</h1>
          <p className="text-sm text-estate-text-sec">Approve new listings and audit active properties.</p>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            Promise.all([
              estateApi.adminProperties.list(),
              estateApi.agents.list<any>(),
              estateApi.users.list<any>(),
            ]).then(([items, agents, users]) => {
              const map = new Map<string, { name: string; phone: string; type: string }>();
              agents.forEach((a: any) => map.set(a.id, { name: a.name || a.email, phone: a.phone || "N/A", type: "Agent" }));
              users.forEach((u: any) => map.set(u.id, { name: u.name || u.email, phone: u.phone || "N/A", type: "Owner" }));
              setPropertiesList(items.map((p: any) => toListItem(p, map)));
            }).finally(() => setLoading(false));
          }}
          className="px-4 py-2 bg-estate-navy text-white rounded-xl hover:bg-estate-navy-mid transition shadow-md"
        >
          Refresh
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate">
          <span className="text-xs font-bold text-estate-muted uppercase tracking-wider block">Total Listings</span>
          <span className="text-3xl font-extrabold text-estate-navy block mt-2">{propertiesList.length}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate">
          <span className="text-xs font-bold text-estate-muted uppercase tracking-wider block">Pending Review</span>
          <span className="text-3xl font-extrabold text-amber-600 block mt-2">{pendingCount}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate">
          <span className="text-xs font-bold text-estate-muted uppercase tracking-wider block">Approved</span>
          <span className="text-3xl font-extrabold text-emerald-600 block mt-2">{approvedCount}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate">
          <span className="text-xs font-bold text-estate-muted uppercase tracking-wider block">Featured</span>
          <span className="text-3xl font-extrabold text-amber-600 block mt-2">{featuredCount}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate">
          <span className="text-xs font-bold text-estate-muted uppercase tracking-wider block">Total Agents</span>
          <span className="text-3xl font-extrabold text-estate-navy block mt-2">
            {new Set(propertiesList.map(p => p.listerName)).size}
          </span>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-2xl border border-estate-border shadow-estate p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-xs font-semibold text-estate-text mb-1">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Title, location, agent..."
              className="w-full px-3 py-2 rounded-lg border border-estate-border focus:ring-2 focus:ring-estate-navy focus:border-transparent outline-none transition text-sm"
            />
          </div>

          {/* Approval Status Filter */}
          <div>
            <label className="block text-xs font-semibold text-estate-text mb-1">Approval Status</label>
            <select
              value={approvalFilter}
              onChange={(e) => setApprovalFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-estate-border focus:ring-2 focus:ring-estate-navy focus:border-transparent outline-none transition text-sm bg-white"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          {/* Property Type Filter */}
          <div>
            <label className="block text-xs font-semibold text-estate-text mb-1">Property Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-estate-border focus:ring-2 focus:ring-estate-navy focus:border-transparent outline-none transition text-sm bg-white"
            >
              <option value="all">All Types</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Listing Status Filter */}
          <div>
            <label className="block text-xs font-semibold text-estate-text mb-1">Listing Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-estate-border focus:ring-2 focus:ring-estate-navy focus:border-transparent outline-none transition text-sm bg-white"
            >
              <option value="all">All Listings</option>
              <option value="For Sale">For Sale</option>
              <option value="For Rent">For Rent</option>
            </select>
          </div>

          {/* Featured Filter */}
          <div>
            <label className="block text-xs font-semibold text-estate-text mb-1">Featured Status</label>
            <select
              value={featuredFilter}
              onChange={(e) => setFeaturedFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-estate-border focus:ring-2 focus:ring-estate-navy focus:border-transparent outline-none transition text-sm bg-white"
            >
              <option value="all">All Properties</option>
              <option value="featured">Featured Only</option>
              <option value="standard">Standard Only</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-xs font-semibold text-estate-text mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "price" | "title" | "date")}
              className="w-full px-3 py-2 rounded-lg border border-estate-border focus:ring-2 focus:ring-estate-navy focus:border-transparent outline-none transition text-sm bg-white"
            >
              <option value="date">Date Listed</option>
              <option value="price">Price</option>
              <option value="title">Title</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-xs font-semibold text-estate-text mb-1">Sort Order</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
              className="w-full px-3 py-2 rounded-lg border border-estate-border focus:ring-2 focus:ring-estate-navy focus:border-transparent outline-none transition text-sm bg-white"
            >
              <option value="desc">Newest / Highest</option>
              <option value="asc">Oldest / Lowest</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition text-sm"
            >
              Clear All Filters
            </button>
          </div>
        </div>

        {/* Active Filters Display */}
        {(searchTerm || approvalFilter !== "all" || typeFilter !== "all" || statusFilter !== "all" || featuredFilter !== "all") && (
          <div className="mt-4 pt-3 border-t border-estate-border flex flex-wrap gap-2">
            <span className="text-xs text-estate-muted">Active filters:</span>
            {searchTerm && (
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full flex items-center gap-1">
                Search: {searchTerm}
                <button onClick={() => setSearchTerm("")} className="text-gray-500 hover:text-gray-700">×</button>
              </span>
            )}
            {approvalFilter !== "all" && (
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full flex items-center gap-1">
                Status: {approvalFilter}
                <button onClick={() => setApprovalFilter("all")} className="text-gray-500 hover:text-gray-700">×</button>
              </span>
            )}
            {typeFilter !== "all" && (
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full flex items-center gap-1">
                Type: {typeFilter}
                <button onClick={() => setTypeFilter("all")} className="text-gray-500 hover:text-gray-700">×</button>
              </span>
            )}
            {statusFilter !== "all" && (
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full flex items-center gap-1">
                Listing: {statusFilter}
                <button onClick={() => setStatusFilter("all")} className="text-gray-500 hover:text-gray-700">×</button>
              </span>
            )}
            {featuredFilter !== "all" && (
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full flex items-center gap-1">
                {featuredFilter === "featured" ? "Featured Only" : "Standard Only"}
                <button onClick={() => setFeaturedFilter("all")} className="text-gray-500 hover:text-gray-700">×</button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Properties Table */}
      {loading && <div className="rounded-xl border border-estate-border bg-white p-6 text-center text-estate-muted">Loading properties...</div>}
      <div className="bg-white rounded-2xl border border-estate-border shadow-estate overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-estate-border text-xs uppercase tracking-wider text-estate-muted font-bold bg-estate-bg">
                <th className="py-3 px-4 cursor-pointer hover:text-estate-navy transition" onClick={() => {
                  if (sortBy === "title") {
                    setSortOrder(sortOrder === "desc" ? "asc" : "desc");
                  } else {
                    setSortBy("title");
                    setSortOrder("asc");
                  }
                }}>
                  Property {sortBy === "title" && (sortOrder === "desc" ? "↓" : "↑")}
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-estate-navy transition" onClick={() => {
                  if (sortBy === "price") {
                    setSortOrder(sortOrder === "desc" ? "asc" : "desc");
                  } else {
                    setSortBy("price");
                    setSortOrder("desc");
                  }
                }}>
                  Price / Type {sortBy === "price" && (sortOrder === "desc" ? "↓" : "↑")}
                </th>
                <th className="py-3 px-4">Submitted By</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-estate-border">
              {filteredProperties.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-estate-muted">
                    No properties found matching your filters
                    </td>
                 </tr>
              ) : (
                filteredProperties.map((property) => (
                  <tr key={property.id} className="hover:bg-estate-bg/40 transition">
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-bold text-estate-text">{property.title}</div>
                        <div className="text-xs text-estate-text-sec">{property.location}</div>
                        {property.city && <div className="text-xs text-estate-muted mt-0.5">{property.city}</div>}
                      </div>
                     </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-estate-navy">{property.price}</div>
                      <div className="text-xs text-estate-text-sec">{property.type} • {property.status}</div>
                      <div className="text-xs text-estate-muted mt-1">
                        {property.featured ? 'Featured' : 'Standard'}
                      </div>
                     </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold tracking-wide uppercase text-estate-muted">{property.listerType}</span>
                      </div>
                      <div className="text-estate-text font-medium">{property.listerName}</div>
                      <div className="text-xs text-estate-muted">{property.listerPhone}</div>
                      </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        property.approvalStatus === 'Approved' 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                          : property.approvalStatus === 'Pending'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : property.approvalStatus === 'Suspended'
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}>
                        {property.approvalStatus}
                      </span>
                      </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end space-x-2">
                        {property.approvalStatus !== 'Approved' && (
                          <button
                            onClick={() => handleApprove(property.id)}
                            className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition"
                          >
                            Approve
                          </button>
                        )}
                        {property.approvalStatus !== 'Rejected' && (
                          <button
                            onClick={() => handleReject(property.id)}
                            className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 rounded-lg text-xs font-semibold transition"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                      </td>
                    </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Results Count */}
        <div className="px-6 py-3 border-t border-estate-border bg-gray-50 text-xs text-estate-muted flex justify-between items-center">
          <span>Showing {filteredProperties.length} of {propertiesList.length} properties</span>
          {filteredProperties.length !== propertiesList.length && (
            <button onClick={clearFilters} className="text-estate-navy hover:underline">
              Clear all filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}