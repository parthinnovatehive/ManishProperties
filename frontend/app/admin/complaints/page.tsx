"use client";

import { useEffect, useState } from "react";
import { estateApi } from "@/lib/api";
import { X, AlertCircle, CheckCircle, AlertTriangle, Info } from "lucide-react";

interface Complaint {
  id: string;
  propertyId: string;
  userId: string;
  subject: string;
  description: string;
  status: "pending" | "in_progress" | "resolved" | "rejected";
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  resolutionNotes: string | null;
  actionTaken: string | null;
}

interface Property {
  id: string;
  title: string;
  location: string;
  city: string;
  price: string;
  priceNum?: number;
  type: string;
  listingType?: string;
  beds?: number;
  bathrooms?: number;
  area?: number;
  status: string;
  moderationStatus: string;
  image?: string;
  images?: string[];
  lister_type: string;
  lister_id: string;
  lister_name?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface Notification {
  id: number;
  type: "success" | "error" | "info" | "warning";
  message: string;
}

interface City {
  id: string;
  name: string;
  admin_id: string | null;
  status: string;
}

export default function AdminComplaintsPage() {
  const [complaintsList, setComplaintsList] = useState<Complaint[]>([]);
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [relatedProperty, setRelatedProperty] = useState<Property | null>(null);
  const [complaintUser, setComplaintUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [actionTaken, setActionTaken] = useState("");
  const [suspendReason, setSuspendReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPropertyLoading, setIsPropertyLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Filter & Sort States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "status">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({ from: "", to: "" });
  const [adminCity, setAdminCity] = useState<City | null>(null);
const [allProperties, setAllProperties] = useState<Property[]>([]);
  const addNotification = (type: Notification["type"], message: string) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [complaintsList, searchTerm, statusFilter, sortBy, sortOrder, dateRange]);

  const fetchData = async () => {
  setIsLoading(true);
  try {
    // Get admin data and assigned city
    const storedAdmin = localStorage.getItem("adminData");
    if (storedAdmin) {
      const admin = JSON.parse(storedAdmin);
      
      // Fetch cities to find which city this admin manages
      const citiesList = await estateApi.cities.list<City>();
      const assignedCity = citiesList.find(city => city.admin_id === admin.id);
      setAdminCity(assignedCity || null);
      
      if (assignedCity) {
        // Fetch all properties to filter by city_id
        const properties = await estateApi.adminProperties.list();
        setAllProperties(properties);
        
        // Get property IDs that belong to admin's city
        const cityPropertyIds = properties
          .filter(p => p.city_id === assignedCity.id)
          .map(p => p.id);
        
        // Fetch complaints
        const complaints = await estateApi.complaints.list<Complaint>();
        
        // Filter complaints to only those with properties in admin's city
        const filteredComplaints = complaints.filter(c => cityPropertyIds.includes(c.propertyId));
        setComplaintsList(filteredComplaints);
      } else {
        setComplaintsList([]);
      }
    } else {
      const complaints = await estateApi.complaints.list<Complaint>();
      setComplaintsList(complaints);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    addNotification("error", "Failed to fetch complaints");
  } finally {
    setIsLoading(false);
  }
};

  const applyFiltersAndSort = () => {
    let filtered = [...complaintsList];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.subject.toLowerCase().includes(term) ||
          c.description.toLowerCase().includes(term) ||
          c.propertyId.toLowerCase().includes(term) ||
          c.id.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    // Date range filter
    if (dateRange.from) {
      const fromDate = new Date(dateRange.from);
      fromDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter((c) => new Date(c.createdAt) >= fromDate);
    }
    if (dateRange.to) {
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((c) => new Date(c.createdAt) <= toDate);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === "date") {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
      } else if (sortBy === "status") {
        const statusOrder = { pending: 0, in_progress: 1, resolved: 2, rejected: 3 };
        const orderA = statusOrder[a.status];
        const orderB = statusOrder[b.status];
        return sortOrder === "desc" ? orderB - orderA : orderA - orderB;
      }
      return 0;
    });

    setFilteredComplaints(filtered);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSortBy("date");
    setSortOrder("desc");
    setDateRange({ from: "", to: "" });
  };

  const fetchUserDetails = async (userId: string) => {
    try {
      const users = await estateApi.users.list<User>();
      const user = users.find(u => u.id === userId);
      setComplaintUser(user || null);
    } catch (error) {
      console.error("Error fetching user:", error);
      setComplaintUser(null);
    }
  };

  const fetchPropertyDetails = async (propertyId: string) => {
    setIsPropertyLoading(true);
    try {
      const property = await estateApi.properties.detail(propertyId);
      setRelatedProperty(property);
    } catch (error) {
      console.error("Error fetching property:", error);
      setRelatedProperty(null);
    } finally {
      setIsPropertyLoading(false);
    }
  };

  const suspendProperty = async () => {
    if (!selectedComplaint || !relatedProperty) return;
    
    if (!suspendReason.trim()) {
      addNotification("warning", "Please provide a reason for suspension");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await estateApi.adminProperties.update(relatedProperty.id, {
        status: "SUSPENDED",
        moderationStatus: "SUSPENDED"
      });
      
      await handleUpdateStatus(
        selectedComplaint.id, 
        "resolved", 
        `Property suspended due to complaint: ${suspendReason}`,
        `Property ${relatedProperty.title} has been suspended`
      );
      
      addNotification("success", "Property suspended successfully!");
      setIsSuspendModalOpen(false);
      setSuspendReason("");
      fetchPropertyDetails(selectedComplaint.propertyId);
      fetchData();
    } catch (error) {
      console.error("Error suspending property:", error);
      addNotification("error", "Failed to suspend property");
    } finally {
      setIsSubmitting(false);
    }
  };

  const activateProperty = async () => {
    if (!selectedComplaint || !relatedProperty) return;
    
    setIsSubmitting(true);
    try {
      await estateApi.adminProperties.update(relatedProperty.id, {
        status: "APPROVED",
        moderationStatus: "APPROVED"
      });
      
      addNotification("success", "Property activated successfully!");
      fetchPropertyDetails(selectedComplaint.propertyId);
    } catch (error) {
      console.error("Error activating property:", error);
      addNotification("error", "Failed to activate property");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (
    id: string, 
    status: Complaint["status"], 
    resolutionNotes?: string,
    actionTaken?: string
  ) => {
    const updateData: any = { 
      status, 
      updatedAt: new Date().toISOString()
    };
    
    if (status === "resolved" || status === "rejected") {
      updateData.resolvedAt = new Date().toISOString();
      if (resolutionNotes) updateData.resolutionNotes = resolutionNotes;
      if (actionTaken) updateData.actionTaken = actionTaken;
    }
    
    await estateApi.complaints.update<Complaint>(id, updateData);
  };

  const handleResolve = async () => {
    if (!selectedComplaint) return;
    
    if (!resolutionNotes.trim()) {
      addNotification("warning", "Please add resolution notes");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await handleUpdateStatus(
        selectedComplaint.id, 
        "resolved", 
        resolutionNotes,
        actionTaken || "Complaint resolved"
      );
      addNotification("success", "Complaint resolved successfully!");
      setIsActionModalOpen(false);
      setResolutionNotes("");
      setActionTaken("");
      await fetchData();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error resolving complaint:", error);
      addNotification("error", "Failed to resolve complaint");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedComplaint) return;
    
    if (!resolutionNotes.trim()) {
      addNotification("warning", "Please provide rejection reason");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await handleUpdateStatus(
        selectedComplaint.id, 
        "rejected", 
        resolutionNotes,
        actionTaken || "Complaint rejected"
      );
      addNotification("success", "Complaint rejected successfully!");
      setIsActionModalOpen(false);
      setResolutionNotes("");
      setActionTaken("");
      await fetchData();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error rejecting complaint:", error);
      addNotification("error", "Failed to reject complaint");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartProgress = async () => {
    if (!selectedComplaint) return;
    
    setIsSubmitting(true);
    try {
      await handleUpdateStatus(
        selectedComplaint.id, 
        "in_progress", 
        "Investigation started",
        "Assigned to support team"
      );
      addNotification("success", "Complaint marked as in progress!");
      setIsActionModalOpen(false);
      await fetchData();
    } catch (error) {
      console.error("Error updating status:", error);
      addNotification("error", "Failed to update status");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openComplaintModal = async (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setResolutionNotes(complaint.resolutionNotes || "");
    setActionTaken(complaint.actionTaken || "");
    setIsModalOpen(true);
    await Promise.all([
      fetchPropertyDetails(complaint.propertyId),
      fetchUserDetails(complaint.userId)
    ]);
  };

  const getStatusStyle = (status: Complaint["status"]) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800 border border-amber-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "resolved":
        return "bg-emerald-100 text-emerald-800 border border-emerald-200";
      case "rejected":
        return "bg-rose-100 text-rose-800 border border-rose-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: Complaint["status"]) => {
    switch (status) {
      case "pending": return "Pending";
      case "in_progress": return "In Progress";
      case "resolved": return "Resolved";
      case "rejected": return "Rejected";
      default: return status;
    }
  };

  const getPropertyStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "APPROVED":
        return "bg-emerald-100 text-emerald-800";
      case "SUSPENDED":
        return "bg-rose-100 text-rose-800";
      case "PENDING":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString().slice(-2);
    return `${day}/${month}/${year}`;
  };

  const formatDateTime = (dateString: string | null | undefined): string => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString().slice(-2);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const getPropertyImage = (property: Property | null): string => {
    if (!property) return "https://placehold.co/400x300?text=No+Image";
    return property.image || 
           (property.images && property.images[0]) || 
           "https://placehold.co/400x300?text=No+Image";
  };

  const formatPrice = (price: string | number): string => {
    if (typeof price === 'number') {
      return `₹${price.toLocaleString()}`;
    }
    return price || 'Price on request';
  };

  const pendingCount = complaintsList.filter(c => c.status === "pending").length;
  const inProgressCount = complaintsList.filter(c => c.status === "in_progress").length;
  const resolvedCount = complaintsList.filter(c => c.status === "resolved").length;
  const rejectedCount = complaintsList.filter(c => c.status === "rejected").length;

  return (
    <div className="space-y-6">
      {/* Notifications */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        {notifications.map((notification, idx) => (
          <div
            key={notification.id}
            className={`flex items-start gap-3 rounded-xl px-4 py-3 text-sm font-medium shadow-2xl animate-slide-in-right border-l-4 ${
              notification.type === "error"
                ? "bg-red-50 text-red-900 border-l-red-500"
                : notification.type === "success"
                ? "bg-green-50 text-green-900 border-l-green-500"
                : notification.type === "warning"
                ? "bg-yellow-50 text-yellow-900 border-l-yellow-500"
                : "bg-blue-50 text-blue-900 border-l-blue-500"
            }`}
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            {notification.type === "error" && <AlertCircle className="flex-shrink-0 w-5 h-5 text-red-500" />}
            {notification.type === "success" && <CheckCircle className="flex-shrink-0 w-5 h-5 text-green-500" />}
            {notification.type === "warning" && <AlertTriangle className="flex-shrink-0 w-5 h-5 text-yellow-500" />}
            {notification.type === "info" && <Info className="flex-shrink-0 w-5 h-5 text-blue-500" />}
            <span className="flex-1">{notification.message}</span>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
<h1 className="text-3xl font-bold text-estate-navy font-serif">User Complaints</h1>
<p className="text-sm text-estate-text-sec">
  {adminCity ? `Managing complaints for ${adminCity.name} city` : "Investigate, track progress, and resolve user-reported issues."}
</p>
        </div>
        <button
  onClick={() => fetchData()}
  className="px-4 py-2 bg-estate-navy text-white rounded-xl hover:bg-estate-navy-mid transition"
>
  Refresh
</button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate">
          <span className="text-xs font-bold text-estate-muted uppercase tracking-wider block">Total</span>
          <span className="text-3xl font-extrabold text-estate-navy block mt-2">{complaintsList.length}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate">
          <span className="text-xs font-bold text-estate-muted uppercase tracking-wider block">Pending</span>
          <span className="text-3xl font-extrabold text-amber-600 block mt-2">{pendingCount}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate">
          <span className="text-xs font-bold text-estate-muted uppercase tracking-wider block">In Progress</span>
          <span className="text-3xl font-extrabold text-blue-600 block mt-2">{inProgressCount}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate">
          <span className="text-xs font-bold text-estate-muted uppercase tracking-wider block">Resolved</span>
          <span className="text-3xl font-extrabold text-emerald-600 block mt-2">{resolvedCount}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate">
          <span className="text-xs font-bold text-estate-muted uppercase tracking-wider block">Rejected</span>
          <span className="text-3xl font-extrabold text-rose-600 block mt-2">{rejectedCount}</span>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-2xl border border-estate-border shadow-estate p-6">
        <div className="flex flex-wrap gap-4 items-end">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-estate-text mb-1">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by subject, description, ID..."
              className="w-full px-3 py-2 rounded-lg border border-estate-border focus:ring-2 focus:ring-estate-navy focus:border-transparent outline-none transition text-sm"
            />
          </div>

          {/* Status Filter */}
          <div className="w-[180px]">
            <label className="block text-xs font-semibold text-estate-text mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-estate-border focus:ring-2 focus:ring-estate-navy focus:border-transparent outline-none transition text-sm bg-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="w-[180px]">
            <label className="block text-xs font-semibold text-estate-text mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "date" | "status")}
              className="w-full px-3 py-2 rounded-lg border border-estate-border focus:ring-2 focus:ring-estate-navy focus:border-transparent outline-none transition text-sm bg-white"
            >
              <option value="date">Date</option>
              <option value="status">Status</option>
            </select>
          </div>

          {/* Sort Order */}
          <div className="w-[180px]">
            <label className="block text-xs font-semibold text-estate-text mb-1">Order</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
              className="w-full px-3 py-2 rounded-lg border border-estate-border focus:ring-2 focus:ring-estate-navy focus:border-transparent outline-none transition text-sm bg-white"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>

          {/* Date Range - From */}
          <div className="w-[160px]">
            <label className="block text-xs font-semibold text-estate-text mb-1">From Date</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-estate-border focus:ring-2 focus:ring-estate-navy focus:border-transparent outline-none transition text-sm"
            />
          </div>

          {/* Date Range - To */}
          <div className="w-[160px]">
            <label className="block text-xs font-semibold text-estate-text mb-1">To Date</label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-estate-border focus:ring-2 focus:ring-estate-navy focus:border-transparent outline-none transition text-sm"
            />
          </div>

          {/* Clear Filters Button */}
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition text-sm"
          >
            Clear Filters
          </button>
        </div>

        {/* Active Filters Display */}
        {(searchTerm || statusFilter !== "all" || dateRange.from || dateRange.to) && (
          <div className="mt-4 pt-3 border-t border-estate-border flex flex-wrap gap-2">
            <span className="text-xs text-estate-muted">Active filters:</span>
            {searchTerm && (
              <span className="text-xs bg-estate-bg px-2 py-1 rounded-full">
                Search: {searchTerm}
                <button onClick={() => setSearchTerm("")} className="ml-1 text-rose-500">×</button>
              </span>
            )}
            {statusFilter !== "all" && (
              <span className="text-xs bg-estate-bg px-2 py-1 rounded-full">
                Status: {statusFilter}
                <button onClick={() => setStatusFilter("all")} className="ml-1 text-rose-500">×</button>
              </span>
            )}
            {dateRange.from && (
              <span className="text-xs bg-estate-bg px-2 py-1 rounded-full">
                From: {formatDate(dateRange.from)}
                <button onClick={() => setDateRange(prev => ({ ...prev, from: "" }))} className="ml-1 text-rose-500">×</button>
              </span>
            )}
            {dateRange.to && (
              <span className="text-xs bg-estate-bg px-2 py-1 rounded-full">
                To: {formatDate(dateRange.to)}
                <button onClick={() => setDateRange(prev => ({ ...prev, to: "" }))} className="ml-1 text-rose-500">×</button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-2xl border border-estate-border shadow-estate overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-estate-border text-xs uppercase tracking-wider text-estate-muted font-bold bg-estate-bg">
                <th className="py-3 px-4">Property</th>
                <th className="py-3 px-4">Issue</th>
                <th className="py-3 px-4 cursor-pointer hover:text-estate-navy" onClick={() => {
                  if (sortBy === "date") {
                    setSortOrder(sortOrder === "desc" ? "asc" : "desc");
                  } else {
                    setSortBy("date");
                    setSortOrder("desc");
                  }
                }}>
                  Date {sortBy === "date" && (sortOrder === "desc" ? "↓" : "↑")}
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-estate-navy" onClick={() => {
                  if (sortBy === "status") {
                    setSortOrder(sortOrder === "desc" ? "asc" : "desc");
                  } else {
                    setSortBy("status");
                    setSortOrder("desc");
                  }
                }}>
                  Status {sortBy === "status" && (sortOrder === "desc" ? "↓" : "↑")}
                </th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-estate-border">
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-estate-muted">
                    No complaints found matching your filters
                  </td>
                 </tr>
              ) : (
                filteredComplaints.map((comp) => (
                  <tr key={comp.id} className="hover:bg-estate-bg/40 transition">
                    <td className="py-4 px-4">
                      <div className="font-medium text-estate-navy">Property {comp.propertyId.slice(-8)}</div>
                      <div className="text-xs text-estate-text-sec">ID: {comp.id.slice(-8)}</div>
                    </td>
                    <td className="py-4 px-4 max-w-md">
                      <div className="font-bold text-estate-navy">{comp.subject}</div>
                      <p className="text-xs text-estate-text-sec mt-1 line-clamp-2">{comp.description}</p>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-estate-text-sec">{formatDate(comp.createdAt)}</td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusStyle(comp.status)}`}>
                        {getStatusText(comp.status)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => openComplaintModal(comp)}
                        className="px-3 py-1.5 bg-estate-navy/10 text-estate-navy text-xs font-semibold rounded-lg hover:bg-estate-navy/20 transition"
                      >
                        View Details
                      </button>
                    </td>
                   </tr>
                ))
              )}
            </tbody>
           </table>
        </div>
        
        {/* Results Count */}
        <div className="px-6 py-3 border-t border-estate-border bg-gray-50 text-xs text-estate-muted">
          Showing {filteredComplaints.length} of {complaintsList.length} complaints
        </div>
      </div>

      {/* Rest of the modals remain the same... */}
      {/* Complaint Detail Modal */}
      {isModalOpen && selectedComplaint && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white flex justify-between items-center p-6 border-b border-estate-border">
              <div>
                <h2 className="text-xl font-bold text-estate-navy font-serif">Complaint Details</h2>
                <p className="text-xs text-estate-muted mt-1">Last updated: {formatDateTime(selectedComplaint.updatedAt)}</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-estate-border">
              {/* Left Column */}
              <div className="p-6 space-y-6">
                <h3 className="font-bold text-estate-navy text-lg border-b border-estate-border pb-2">Complaint Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-estate-muted">Complaint ID</p>
                    <p className="font-mono text-sm">{selectedComplaint.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-estate-muted">Reported On</p>
                    <p className="font-medium">{formatDateTime(selectedComplaint.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-estate-muted">Status</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusStyle(selectedComplaint.status)}`}>
                      {getStatusText(selectedComplaint.status)}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-estate-muted">Reporter</p>
                    <p className="font-medium">{complaintUser?.name || "Loading..."}</p>
                    <p className="text-xs text-estate-text-sec">{complaintUser?.email}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-estate-muted mb-1">Subject</p>
                  <p className="font-bold text-estate-navy">{selectedComplaint.subject}</p>
                </div>
                
                <div>
                  <p className="text-xs text-estate-muted mb-1">Description</p>
                  <p className="text-estate-text bg-gray-50 p-4 rounded-xl leading-relaxed">{selectedComplaint.description}</p>
                </div>

                {selectedComplaint.resolutionNotes && (
                  <div>
                    <p className="text-xs text-estate-muted mb-1">Resolution Notes</p>
                    <p className={`p-3 rounded-xl border ${selectedComplaint.status === "resolved" ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-rose-50 text-rose-800 border-rose-200"}`}>
                      {selectedComplaint.resolutionNotes}
                    </p>
                  </div>
                )}

                {selectedComplaint.actionTaken && (
                  <div>
                    <p className="text-xs text-estate-muted mb-1">Action Taken</p>
                    <p className="text-estate-text bg-blue-50 p-3 rounded-xl border border-blue-200">
                      {selectedComplaint.actionTaken}
                    </p>
                  </div>
                )}

                {(selectedComplaint.status === "pending" || selectedComplaint.status === "in_progress") && (
                  <div className="flex gap-3 pt-4">
                    {selectedComplaint.status === "pending" && (
                      <button
                        onClick={handleStartProgress}
                        disabled={isSubmitting}
                        className="flex-1 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
                      >
                        Start Progress
                      </button>
                    )}
                    <button
                      onClick={() => setIsActionModalOpen(true)}
                      className="flex-1 py-2 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition"
                    >
                      Resolve / Reject
                    </button>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="p-6 space-y-6">
                <h3 className="font-bold text-estate-navy text-lg border-b border-estate-border pb-2">Property Details</h3>
                
                {isPropertyLoading ? (
                  <div className="text-center py-8">
                    <p className="text-estate-muted">Loading property details...</p>
                  </div>
                ) : relatedProperty ? (
                  <>
                    <div className="flex gap-4">
                      <img
                        src={getPropertyImage(relatedProperty)}
                        alt={relatedProperty.title}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-bold text-estate-navy">{relatedProperty.title}</h4>
                        <p className="text-sm text-estate-text-sec">{relatedProperty.city}, {relatedProperty.location}</p>
                        <p className="text-lg font-bold text-estate-navy mt-1">{formatPrice(relatedProperty.price)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-estate-muted">Property Type</p>
                        <p className="font-medium">{relatedProperty.type || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-estate-muted">Listing Type</p>
                        <p className="font-medium">{relatedProperty.listingType || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-estate-muted">Beds/Baths</p>
                        <p className="font-medium">{relatedProperty.beds || "N/A"} Beds / {relatedProperty.bathrooms || "N/A"} Baths</p>
                      </div>
                      <div>
                        <p className="text-xs text-estate-muted">Area</p>
                        <p className="font-medium">{relatedProperty.area || "N/A"} sq.ft</p>
                      </div>
                      <div>
                        <p className="text-xs text-estate-muted">Listed By</p>
                        <p className="font-medium capitalize">{relatedProperty.lister_type}</p>
                      </div>
                      <div>
                        <p className="text-xs text-estate-muted">Status</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getPropertyStatusColor(relatedProperty.status)}`}>
                          {relatedProperty.status || "N/A"}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-estate-border pt-4">
                      <h3 className="font-bold text-estate-navy mb-3">Property Actions</h3>
                      <div className="flex gap-3">
                        {relatedProperty.status === "SUSPENDED" ? (
                          <button
                            onClick={activateProperty}
                            disabled={isSubmitting}
                            className="flex-1 py-2 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition disabled:opacity-50"
                          >
                            Activate Property
                          </button>
                        ) : (
                          <button
                            onClick={() => setIsSuspendModalOpen(true)}
                            className="flex-1 py-2 bg-rose-600 text-white font-semibold rounded-xl hover:bg-rose-700 transition"
                          >
                            Suspend Property
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-estate-muted">Property not found</p>
                  </div>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 bg-white flex justify-end p-6 border-t border-estate-border bg-gray-50">
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

      {/* Action Modal (Resolve/Reject) */}
      {isActionModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-estate-navy">Resolve or Reject Complaint</h2>
              <button
                onClick={() => setIsActionModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-estate-text mb-2">
                  Resolution/Rejection Notes *
                </label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Provide details about resolution or rejection reason..."
                  className="w-full px-4 py-2 rounded-xl border border-estate-border focus:ring-2 focus:ring-estate-navy focus:border-transparent outline-none transition text-sm"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-estate-text mb-2">
                  Action Taken
                </label>
                <textarea
                  value={actionTaken}
                  onChange={(e) => setActionTaken(e.target.value)}
                  placeholder="What action was taken?"
                  className="w-full px-4 py-2 rounded-xl border border-estate-border focus:ring-2 focus:ring-estate-navy focus:border-transparent outline-none transition text-sm"
                  rows={2}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleResolve}
                  disabled={isSubmitting}
                  className="flex-1 py-2 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition disabled:opacity-50"
                >
                  Mark Resolved
                </button>
                <button
                  onClick={handleReject}
                  disabled={isSubmitting}
                  className="flex-1 py-2 bg-rose-600 text-white font-semibold rounded-xl hover:bg-rose-700 transition disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Property Modal */}
      {isSuspendModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-estate-navy">Suspend Property</h2>
              <button
                onClick={() => setIsSuspendModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <p className="text-sm text-estate-text-sec mb-4">
              You are about to suspend: <span className="font-bold">{relatedProperty?.title}</span>
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-semibold text-estate-text mb-2">
                Reason for Suspension *
              </label>
              <textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="Enter the reason for suspending this property..."
                className="w-full px-4 py-2 rounded-xl border border-estate-border focus:ring-2 focus:ring-estate-navy focus:border-transparent outline-none transition text-sm"
                rows={3}
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setIsSuspendModalOpen(false)}
                className="flex-1 py-2 rounded-xl border border-estate-border text-estate-text font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={suspendProperty}
                disabled={isSubmitting}
                className="flex-1 py-2 bg-rose-600 text-white font-semibold rounded-xl hover:bg-rose-700 transition disabled:opacity-50"
              >
                {isSubmitting ? "Suspending..." : "Confirm Suspension"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6">
            <p className="text-estate-navy">Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
}