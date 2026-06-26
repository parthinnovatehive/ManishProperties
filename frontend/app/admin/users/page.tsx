"use client";

import { useEffect, useState } from "react";
import { estateApi } from "@/lib/api";
import Link from "next/link";
import type { Property } from "@/types";

interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  phone?: string;
  role: string;
  avatar?: string;
  joinedDate?: string;
  savedProperties: string[];
  status?: "active" | "suspended";
}

export default function AdminUsersPage() {
  const [usersList, setUsersList] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userProperties, setUserProperties] = useState<Property[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingProperties, setIsLoadingProperties] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Filter & Sort States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "email" | "joinedDate" | "savedListings">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    fetchUsers();
    fetchProperties();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [usersList, searchTerm, statusFilter, roleFilter, sortBy, sortOrder]);

  const fetchUsers = () => {
    estateApi.users.list<User>().then((items) =>
      setUsersList(items.map((user) => ({
        ...user,
        email: user.email || user.username || "",
        avatar: user.avatar || (user.name || user.username || "U").slice(0, 2).toUpperCase(),
        joinedDate: user.joinedDate || "Not available",
        savedProperties: user.savedProperties || [],
        status: user.status || "active",
      })))
    );
  };

  const fetchProperties = () => {
    estateApi.adminProperties.list().then((properties: Property[]) => {
      console.log("All properties loaded:", properties.length);
      setAllProperties(properties);
    }).catch(error => {
      console.error("Error loading properties:", error);
      setAllProperties([]);
    });
  };

  const applyFiltersAndSort = () => {
    let filtered = [...usersList];

    // Search filter (name, email, phone)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term) ||
          (u.phone && u.phone.toLowerCase().includes(term))
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((u) => u.status === statusFilter);
    }

    // Role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter((u) => u.role.toLowerCase() === roleFilter.toLowerCase());
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === "name") {
        return sortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortBy === "email") {
        return sortOrder === "asc"
          ? a.email.localeCompare(b.email)
          : b.email.localeCompare(a.email);
      } else if (sortBy === "joinedDate") {
        const dateA = new Date(a.joinedDate === "Not available" ? "1970-01-01" : (a.joinedDate || "1970-01-01"));
        const dateB = new Date(b.joinedDate === "Not available" ? "1970-01-01" : (b.joinedDate || "1970-01-01"));
        return sortOrder === "asc"
          ? dateA.getTime() - dateB.getTime()
          : dateB.getTime() - dateA.getTime();
      } else if (sortBy === "savedListings") {
        return sortOrder === "asc"
          ? (a.savedProperties?.length || 0) - (b.savedProperties?.length || 0)
          : (b.savedProperties?.length || 0) - (a.savedProperties?.length || 0);
      }
      return 0;
    });

    setFilteredUsers(filtered);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setRoleFilter("all");
    setSortBy("name");
    setSortOrder("asc");
  };

  const toggleStatus = async (id: string) => {
    const user = usersList.find((item) => item.id === id);
    const newStatus = user?.status === "active" ? "suspended" : "active";
    await estateApi.users.update<User>(id, { status: newStatus });
    setUsersList(prev =>
      prev.map(u => {
        if (u.id === id) {
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
  };

  const viewUserProperties = async (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
    setIsLoadingProperties(true);
    
    try {
      const filteredProperties = allProperties.filter(
        (property) => 
          property.lister_id === user.id && 
          property.lister_type === 'user'
      );
      
      console.log(`Found ${filteredProperties.length} properties for user ${user.name}`);
      setUserProperties(filteredProperties);
    } catch (error) {
      console.error("Error fetching user properties:", error);
      setUserProperties([]);
    } finally {
      setIsLoadingProperties(false);
    }
  };

  const viewPropertyDetails = (property: Property) => {
    setSelectedProperty(property);
    setIsDetailModalOpen(true);
  };

  const getPropertyImage = (property: Property): string => {
    return property.image || 
           (property.images && property.images[0]) || 
           "https://placehold.co/400x300?text=No+Image";
  };

  const getPropertyStatus = (property: Property): string => {
    return property.moderationStatus || property.status || "PENDING";
  };

  const getPropertyStatusColor = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-emerald-100 text-emerald-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'rejected':
        return 'bg-rose-100 text-rose-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const formatPrice = (price: string | number): string => {
    if (typeof price === 'number') {
      return `₹${price.toLocaleString()}`;
    }
    return price || 'Price on request';
  };

  const getUserPropertyCount = (userId: string): number => {
    return allProperties.filter(
      (property) => property.lister_id === userId && property.lister_type === 'user'
    ).length;
  };

  const activeCount = usersList.filter(u => u.status === 'active').length;
  const suspendedCount = usersList.filter(u => u.status === 'suspended').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-estate-navy font-serif">Manage Users</h1>
          <p className="text-sm text-estate-text-sec">View, moderate, and manage user accounts on the platform.</p>
        </div>
        <button
          onClick={() => {
            fetchUsers();
            fetchProperties();
          }}
          className="px-4 py-2 bg-estate-navy text-white rounded-xl hover:bg-estate-navy-mid transition shadow-md"
        >
          Refresh
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate">
          <span className="text-xs font-bold text-estate-muted uppercase tracking-wider block">Total Users</span>
          <span className="text-3xl font-extrabold text-estate-navy block mt-2">{usersList.length}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate">
          <span className="text-xs font-bold text-estate-muted uppercase tracking-wider block">Active Users</span>
          <span className="text-3xl font-extrabold text-estate-success block mt-2">{activeCount}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate">
          <span className="text-xs font-bold text-estate-muted uppercase tracking-wider block">Suspended Users</span>
          <span className="text-3xl font-extrabold text-estate-red block mt-2">{suspendedCount}</span>
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
              placeholder="Name, email, phone..."
              className="w-full px-3 py-2 rounded-lg border border-estate-border focus:ring-2 focus:ring-estate-navy focus:border-transparent outline-none transition text-sm"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs font-semibold text-estate-text mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-estate-border focus:ring-2 focus:ring-estate-navy focus:border-transparent outline-none transition text-sm bg-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          {/* Role Filter */}
          <div>
            <label className="block text-xs font-semibold text-estate-text mb-1">Role</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-estate-border focus:ring-2 focus:ring-estate-navy focus:border-transparent outline-none transition text-sm bg-white"
            >
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-xs font-semibold text-estate-text mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "name" | "email" | "joinedDate" | "savedListings")}
              className="w-full px-3 py-2 rounded-lg border border-estate-border focus:ring-2 focus:ring-estate-navy focus:border-transparent outline-none transition text-sm bg-white"
            >
              <option value="name">Name</option>
              <option value="email">Email</option>
              <option value="joinedDate">Joined Date</option>
              <option value="savedListings">Saved Listings</option>
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
              <option value="asc">Ascending (A-Z / Low to High)</option>
              <option value="desc">Descending (Z-A / High to Low)</option>
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
        {(searchTerm || statusFilter !== "all" || roleFilter !== "all") && (
          <div className="mt-4 pt-3 border-t border-estate-border flex flex-wrap gap-2">
            <span className="text-xs text-estate-muted">Active filters:</span>
            {searchTerm && (
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full flex items-center gap-1">
                Search: {searchTerm}
                <button onClick={() => setSearchTerm("")} className="text-gray-500 hover:text-gray-700">×</button>
              </span>
            )}
            {statusFilter !== "all" && (
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full flex items-center gap-1">
                Status: {statusFilter}
                <button onClick={() => setStatusFilter("all")} className="text-gray-500 hover:text-gray-700">×</button>
              </span>
            )}
            {roleFilter !== "all" && (
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full flex items-center gap-1">
                Role: {roleFilter}
                <button onClick={() => setRoleFilter("all")} className="text-gray-500 hover:text-gray-700">×</button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-estate-border shadow-estate overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-estate-border text-xs uppercase tracking-wider text-estate-muted font-bold bg-estate-bg">
                <th className="py-3 px-4 cursor-pointer hover:text-estate-navy transition" onClick={() => {
                  if (sortBy === "name") {
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  } else {
                    setSortBy("name");
                    setSortOrder("asc");
                  }
                }}>
                  User {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-estate-navy transition" onClick={() => {
                  if (sortBy === "email") {
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  } else {
                    setSortBy("email");
                    setSortOrder("asc");
                  }
                }}>
                  Contact {sortBy === "email" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-estate-navy transition" onClick={() => {
                  if (sortBy === "joinedDate") {
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  } else {
                    setSortBy("joinedDate");
                    setSortOrder("desc");
                  }
                }}>
                  Joined Date {sortBy === "joinedDate" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-estate-navy transition" onClick={() => {
                  if (sortBy === "savedListings") {
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  } else {
                    setSortBy("savedListings");
                    setSortOrder("desc");
                  }
                }}>
                  Saved Listings {sortBy === "savedListings" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th className="py-3 px-4">Listings</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-estate-border">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-estate-muted">
                    No users found matching your filters
                   </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const propertyCount = getUserPropertyCount(user.id);
                  return (
                    <tr key={user.id} className="hover:bg-estate-bg/40 transition">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 bg-estate-blue-pale text-estate-navy text-xs font-bold rounded-full flex items-center justify-center border border-estate-border-med">
                            {user.avatar}
                          </div>
                          <div>
                            <div className="font-bold text-estate-text">{user.name}</div>
                            <div className="text-xs text-estate-muted capitalize">{user.role}</div>
                          </div>
                        </div>
                       </td>
                      <td className="py-4 px-4">
                        <div className="text-estate-text font-medium">{user.email}</div>
                        <div className="text-xs text-estate-text-sec">{user.phone || "No phone"}</div>
                       </td>
                      <td className="py-4 px-4 text-estate-text-sec">{user.joinedDate}</td>
                      <td className="py-4 px-4 text-center font-semibold text-estate-navy">{user.savedProperties?.length || 0}</td>
                      <td className="py-4 px-4 text-center">
                        {propertyCount > 0 ? (
                          <button
                            onClick={() => viewUserProperties(user)}
                            className="text-estate-navy hover:text-estate-navy-mid font-semibold text-xs underline"
                          >
                            View Properties ({propertyCount})
                          </button>
                        ) : (
                          <span className="text-gray-400 text-xs">No Properties</span>
                        )}
                       </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          user.status === 'active' 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}>
                          {user.status}
                        </span>
                       </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => toggleStatus(user.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                            user.status === 'active'
                              ? 'bg-estate-red-bg text-estate-red border-estate-red/20 hover:bg-rose-100'
                              : 'bg-estate-success-bg text-estate-success border-estate-success/20 hover:bg-emerald-150'
                          }`}
                        >
                          {user.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                       </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Results Count */}
        <div className="px-6 py-3 border-t border-estate-border bg-gray-50 text-xs text-estate-muted flex justify-between items-center">
          <span>Showing {filteredUsers.length} of {usersList.length} users</span>
          {filteredUsers.length !== usersList.length && (
            <button onClick={clearFilters} className="text-estate-navy hover:underline">
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* User Properties Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl w-full max-w-4xl mx-4 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex-shrink-0 flex justify-between items-center p-6 border-b border-estate-border">
              <div>
                <h2 className="text-xl font-bold text-estate-navy font-serif">
                  Properties Listed by {selectedUser.name}
                </h2>
                <p className="text-sm text-estate-text-sec mt-1">
                  Email: {selectedUser.email} | Phone: {selectedUser.phone || "Not provided"}
                </p>
                <p className="text-xs text-estate-muted mt-1">
                  Total Properties: {userProperties.length}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoadingProperties ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-estate-navy">Loading properties...</div>
                </div>
              ) : userProperties.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-estate-text-sec">No properties listed by this user.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {userProperties.map((property) => (
                    <div
                      key={property.id}
                      className="border border-estate-border rounded-xl p-4 hover:bg-estate-bg/30 transition cursor-pointer"
                      onClick={() => viewPropertyDetails(property)}
                    >
                      <div className="flex gap-4">
                        <img
                          src={getPropertyImage(property)}
                          alt={property.title}
                          className="w-28 h-28 object-cover rounded-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://placehold.co/400x300?text=No+Image";
                          }}
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-estate-navy text-lg">{property.title}</h3>
                              <p className="text-sm text-estate-text-sec">
                                {property.city}, {property.location}
                              </p>
                              <div className="flex gap-3 mt-1 text-xs text-estate-muted">
                                {property.type && <span>Type: {property.type}</span>}
                                {property.listingType && <span>| {property.listingType}</span>}
                              </div>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPropertyStatusColor(getPropertyStatus(property))}`}>
                              {getPropertyStatus(property)}
                            </span>
                          </div>
                          <div className="mt-2 flex justify-between items-center">
                            <div>
                              <span className="text-xl font-bold text-estate-navy">
                                {formatPrice(property.price)}
                              </span>
                              {property.area && (
                                <span className="text-sm text-estate-text-sec ml-2">
                                  | {property.area} sq.ft
                                </span>
                              )}
                            </div>
                            <div className="flex gap-2 text-xs text-estate-muted">
                              {property.beds && <span>🛏️ {property.beds} Beds</span>}
                              {property.bathrooms && <span>🚿 {property.bathrooms} Baths</span>}
                            </div>
                          </div>
                          {property.createdAt && (
                            <p className="text-xs text-estate-muted mt-2">
                              Listed on: {new Date(property.createdAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-6 border-t border-estate-border bg-gray-50">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-estate-navy text-white rounded-xl hover:bg-estate-navy-mid transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Property Detail Modal */}
      {isDetailModalOpen && selectedProperty && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white flex justify-between items-center p-6 border-b border-estate-border z-10">
              <h2 className="text-xl font-bold text-estate-navy font-serif">
                Property Details
              </h2>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Main Image */}
              <img
                src={getPropertyImage(selectedProperty)}
                alt={selectedProperty.title}
                className="w-full h-64 object-cover rounded-xl mb-6"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://placehold.co/800x400?text=No+Image";
                }}
              />

              {/* Title and Status */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-estate-navy">{selectedProperty.title}</h3>
                  {selectedProperty.subtitle && (
                    <p className="text-estate-text-sec mt-1">{selectedProperty.subtitle}</p>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPropertyStatusColor(getPropertyStatus(selectedProperty))}`}>
                  {getPropertyStatus(selectedProperty)}
                </span>
              </div>

              {/* Price and Basic Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-estate-bg rounded-xl mb-6">
                <div>
                  <p className="text-xs text-estate-muted">Price</p>
                  <p className="text-xl font-bold text-estate-navy">{formatPrice(selectedProperty.price)}</p>
                </div>
                {selectedProperty.area && (
                  <div>
                    <p className="text-xs text-estate-muted">Area</p>
                    <p className="text-lg font-semibold">{selectedProperty.area} sq.ft</p>
                  </div>
                )}
                {selectedProperty.type && (
                  <div>
                    <p className="text-xs text-estate-muted">Property Type</p>
                    <p className="text-lg font-semibold">{selectedProperty.type}</p>
                  </div>
                )}
                {selectedProperty.listingType && (
                  <div>
                    <p className="text-xs text-estate-muted">Listing Type</p>
                    <p className="text-lg font-semibold">{selectedProperty.listingType}</p>
                  </div>
                )}
              </div>

              {/* Location */}
              <div className="mb-6">
                <h4 className="font-bold text-estate-navy mb-2">Location</h4>
                <p className="text-estate-text">
                  {selectedProperty.city}, {selectedProperty.location}
                </p>
              </div>

              {/* Specifications */}
              <div className="mb-6">
                <h4 className="font-bold text-estate-navy mb-2">Specifications</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {selectedProperty.beds && (
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🛏️</span>
                      <div>
                        <p className="text-xs text-estate-muted">Bedrooms</p>
                        <p className="font-semibold">{selectedProperty.beds}</p>
                      </div>
                    </div>
                  )}
                  {selectedProperty.bathrooms && (
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🚿</span>
                      <div>
                        <p className="text-xs text-estate-muted">Bathrooms</p>
                        <p className="font-semibold">{selectedProperty.bathrooms}</p>
                      </div>
                    </div>
                  )}
                  {selectedProperty.baths && (
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🛁</span>
                      <div>
                        <p className="text-xs text-estate-muted">Total Baths</p>
                        <p className="font-semibold">{selectedProperty.baths}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {selectedProperty.description && (
                <div className="mb-6">
                  <h4 className="font-bold text-estate-navy mb-2">Description</h4>
                  <p className="text-estate-text leading-relaxed">{selectedProperty.description}</p>
                </div>
              )}

              {/* Amenities */}
              {selectedProperty.amenities && selectedProperty.amenities.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-bold text-estate-navy mb-2">Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProperty.amenities.map((amenity, index) => (
                      <span key={index} className="px-3 py-1 bg-estate-bg rounded-full text-sm">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Builder Info */}
              {selectedProperty.builder && (
                <div className="mb-6">
                  <h4 className="font-bold text-estate-navy mb-2">Builder</h4>
                  <p className="text-estate-text">{selectedProperty.builder}</p>
                </div>
              )}

              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl mb-6">
                {selectedProperty.createdAt && (
                  <div>
                    <p className="text-xs text-estate-muted">Listed On</p>
                    <p className="text-sm font-medium">{new Date(selectedProperty.createdAt).toLocaleDateString()}</p>
                  </div>
                )}
                {selectedProperty.updatedAt && (
                  <div>
                    <p className="text-xs text-estate-muted">Last Updated</p>
                    <p className="text-sm font-medium">{new Date(selectedProperty.updatedAt).toLocaleDateString()}</p>
                  </div>
                )}
                {selectedProperty.featured && (
                  <div>
                    <p className="text-xs text-estate-muted">Featured</p>
                    <p className="text-sm font-medium text-amber-600">Yes</p>
                  </div>
                )}
                {selectedProperty.isNew && (
                  <div>
                    <p className="text-xs text-estate-muted">New Listing</p>
                    <p className="text-sm font-medium text-emerald-600">Yes</p>
                  </div>
                )}
              </div>

              {/* View Property Page Link */}
              <div className="flex justify-center">
                <Link
                  href={`/properties/${selectedProperty.id}`}
                  target="_blank"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-estate-navy text-white rounded-xl hover:bg-estate-navy-mid transition font-semibold"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View Full Property Page
                </Link>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white flex justify-end p-6 border-t border-estate-border">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 bg-estate-navy text-white rounded-xl hover:bg-estate-navy-mid transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}