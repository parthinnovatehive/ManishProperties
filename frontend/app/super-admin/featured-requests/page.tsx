"use client";

import { useEffect, useState } from "react";
import { estateApi } from "@/lib/api";
import { X, AlertCircle, CheckCircle, AlertTriangle, Info } from "lucide-react";
import type { Property } from "@/types";

interface AdminUser {
  id: string;
  name: string;
  email: string;
}

interface Notification {
  id: number;
  type: "success" | "error" | "info" | "warning";
  message: string;
}

export default function SuperAdminFeaturedRequestsPage() {
  // ✅ Role defined inside component
  const role = "super-admin";
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [featuredRequests, setFeaturedRequests] = useState<Property[]>([]);
  const [approvedFeatured, setApprovedFeatured] = useState<Property[]>([]);
  const [expiredFeatured, setExpiredFeatured] = useState<Property[]>([]);
  const [manuallyRemovedFeatured, setManuallyRemovedFeatured] = useState<Property[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (type: Notification["type"], message: string) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  useEffect(() => {
    fetchData();
    autoCheckExpiry();
  }, []);

  const autoCheckExpiry = async () => {
    try {
      await estateApi.adminProperties.checkFeaturedExpiry();
      await fetchData();
    } catch (error) {
      // console.error("Error auto-checking expiry:", error);
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const allProperties = await estateApi.adminProperties.list();
      setProperties(allProperties);
      
      const requests = allProperties.filter(
        (p: Property) => p.featuredRequested === true && p.featuredPaymentStatus === "pending"
      );
      setFeaturedRequests(requests);
      
      const approved = allProperties.filter(
        (p: Property) => p.featured === true && p.featuredExpired !== true
      );
      approved.sort((a, b) => {
        if (!a.featuredExpiryDate) return 1;
        if (!b.featuredExpiryDate) return -1;
        return new Date(a.featuredExpiryDate).getTime() - new Date(b.featuredExpiryDate).getTime();
      });
      setApprovedFeatured(approved);
      
      const expired = allProperties.filter(
        (p: Property) => p.featuredExpired === true
      );
      expired.sort((a, b) => {
        if (!a.featuredExpiryDate) return 1;
        if (!b.featuredExpiryDate) return -1;
        return new Date(a.featuredExpiryDate).getTime() - new Date(b.featuredExpiryDate).getTime();
      });
      setExpiredFeatured(expired);
      
      const manuallyRemoved = allProperties.filter(
        (p: Property) => p.featured === false && (p.granted_for !== null || p.featuredRequested === true) && p.featuredExpired !== true
      );
      setManuallyRemovedFeatured(manuallyRemoved);
      
      const adminsList = await estateApi.admins.list<AdminUser>();
      setAdmins(adminsList);
      
    } catch (error) {
      // console.error("Error fetching data:", error);
      // addNotification("error", "Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  const openApproveModal = (property: Property) => {
    setSelectedProperty(property);
    setSelectedPlan(property.requested_for || 1);
    setIsApproveModalOpen(true);
  };

  const approveFeaturedRequest = async () => {
    if (!selectedProperty) return;
    
    const currentAdmin = JSON.parse(localStorage.getItem("adminData") || "{}");
    
    const approvedAt = new Date();
    const expiryDate = new Date(approvedAt);
    
    if (selectedPlan === 1) {
      expiryDate.setDate(expiryDate.getDate() + 30);
    } else {
      expiryDate.setDate(expiryDate.getDate() + 60);
    }
    expiryDate.setHours(23, 59, 59, 999);
    
    try {
      await estateApi.adminProperties.update(selectedProperty.id, {
        featured: true,
        featuredRequested: false,
        featuredPaymentStatus: "approved",
        featuredApprovedBy: currentAdmin.id,
        featuredApprovedAt: approvedAt.toISOString(),
        featuredRejectionReason: null,
        granted_for: selectedPlan,
        featuredExpiryDate: expiryDate.toISOString(),
        featuredExpired: false
      });
      
      addNotification("success", `Featured request approved for ${selectedPlan} month(s)!`);
      setIsApproveModalOpen(false);
      setSelectedProperty(null);
      fetchData();
    } catch (error) {
      console.error("Error approving request:", error);
      addNotification("error", "Failed to approve request");
    }
  };

  const rejectFeaturedRequest = async () => {
    if (!selectedProperty) return;
    
    if (!rejectionReason.trim()) {
      addNotification("warning", "Please provide a rejection reason");
      return;
    }
    
    try {
      await estateApi.adminProperties.update(selectedProperty.id, {
        featuredRequested: false,
        featuredPaymentStatus: "rejected",
        featuredRejectionReason: rejectionReason,
        featured: false
      });
      
      addNotification("success", "Featured request rejected!");
      setIsModalOpen(false);
      setRejectionReason("");
      setSelectedProperty(null);
      fetchData();
    } catch (error) {
      console.error("Error rejecting request:", error);
      addNotification("error", "Failed to reject request");
    }
  };

  const markAsExpired = async (property: Property) => {
    if (!confirm(`Mark "${property.title}" as expired? This will set featuredExpired to true.`)) {
      return;
    }
    
    try {
      await estateApi.adminProperties.update(property.id, {
        featuredExpired: true
      });
      
      addNotification("success", "Property marked as expired!");
      fetchData();
    } catch (error) {
      console.error("Error marking as expired:", error);
      addNotification("error", "Failed to mark as expired");
    }
  };

  const removeFeatured = async (property: Property) => {
    if (!confirm(`Are you sure you want to remove "${property.title}" from featured listings?`)) {
      return;
    }
    
    try {
      await estateApi.adminProperties.update(property.id, {
        featured: false,
        granted_for: null
      });
      
      addNotification("success", "Property removed from featured listings!");
      fetchData();
    } catch (error) {
      console.error("Error removing featured:", error);
      addNotification("error", "Failed to remove from featured");
    }
  };

  const removeExpiredFeatured = async (property: Property) => {
    if (!confirm(`Remove "${property.title}" from expired featured listings?`)) {
      return;
    }
    
    try {
      await estateApi.adminProperties.update(property.id, {
        featured: false,
        featuredExpired: false,
        granted_for: null
      });
      
      addNotification("success", "Expired property removed from featured!");
      fetchData();
    } catch (error) {
      console.error("Error removing expired featured:", error);
      addNotification("error", "Failed to remove expired property");
    }
  };

  const getPropertyImage = (property: Property): string => {
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

  const getAdminName = (adminId: string | null | undefined): string => {
    if (!adminId) return "N/A";
    const admin = admins.find(a => a.id === adminId);
    return admin?.name || adminId;
  };

  const getPlanText = (plan: number | undefined | null): string => {
    if (plan === 1) return "1 Month (30 days)";
    if (plan === 2) return "2 Months (60 days)";
    return "N/A";
  };

  const getDaysRemaining = (expiryDate: string | null | undefined): number | null => {
    if (!expiryDate) return null;
    const now = new Date();
    const expiry = new Date(expiryDate);
    const daysRemaining = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysRemaining;
  };

  const isExpired = (expiryDate: string | null | undefined): boolean => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString().slice(-2);
  return `${day}/${month}/${year}`;
};

  return (
    <div className="space-y-8">
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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-estate-navy font-serif">Featured Requests Management</h1>
          <p className="text-sm text-estate-text-sec">Manage featured property requests and approve/reject listings.</p>
        </div>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-estate-navy text-white rounded-xl hover:bg-estate-navy-mid transition min-h-[44px]"
        >
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-estate-border shadow-estate">
          <span className="text-xs font-bold text-estate-muted uppercase tracking-wider block">Pending Requests</span>
          <span className="text-3xl font-extrabold text-amber-600 block mt-2">{featuredRequests.length}</span>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-estate-border shadow-estate">
          <span className="text-xs font-bold text-estate-muted uppercase tracking-wider block">Active Featured</span>
          <span className="text-3xl font-extrabold text-emerald-600 block mt-2">{approvedFeatured.length}</span>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-estate-border shadow-estate">
          <span className="text-xs font-bold text-estate-muted uppercase tracking-wider block">Auto-Expired</span>
          <span className="text-3xl font-extrabold text-rose-600 block mt-2">{expiredFeatured.length}</span>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-estate-border shadow-estate">
          <span className="text-xs font-bold text-estate-muted uppercase tracking-wider block">Manually Removed</span>
          <span className="text-3xl font-extrabold text-gray-600 block mt-2">{manuallyRemovedFeatured.length}</span>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-estate-border shadow-estate">
          <span className="text-xs font-bold text-estate-muted uppercase tracking-wider block">Total Properties</span>
          <span className="text-3xl font-extrabold text-estate-navy block mt-2">{properties.length}</span>
        </div>
      </div>

      {/* Expired Featured Properties Section (Auto-Expired) */}
      <div className="bg-white rounded-2xl border border-rose-200 shadow-estate overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-rose-200 bg-rose-50">
          <h2 className="text-lg md:text-xl font-bold text-rose-700 font-serif">⚠️ Auto-Expired Featured Properties</h2>
          <p className="text-sm text-rose-600">These properties' featured tenure has ended automatically (system expired).</p>
        </div>
        
        {expiredFeatured.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-estate-text-sec">No auto-expired featured properties</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-estate-border text-xs uppercase tracking-wider text-estate-muted font-bold bg-estate-bg">
                  <th className="py-3 px-4">Property</th>
                  <th className="py-3 px-4">Plan</th>
                  <th className="py-3 px-4">Approved By</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-estate-border">
                {expiredFeatured.map((property) => (
                  <tr key={property.id} className="hover:bg-rose-50/40 transition bg-rose-50/20">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={getPropertyImage(property)}
                          alt={property.title}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div>
                          <div className="font-bold text-estate-navy">{property.title}</div>
                          <div className="text-xs text-estate-text-sec">{property.city}, {property.location}</div>
                          <div className="text-xs font-semibold text-estate-navy">{formatPrice(property.price)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        property.granted_for === 2 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {getPlanText(property.granted_for)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs">
                      {getAdminName(property.featuredApprovedBy)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-xs">
                        <div className="font-semibold text-rose-600">
                          {property.featuredExpiryDate ? formatDate(property.featuredExpiryDate) : "N/A"}
                        </div>
                        <div className="text-rose-500 text-[10px]">Expired</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => removeExpiredFeatured(property)}
                        className="px-3 py-1.5 bg-rose-600 text-white text-xs font-semibold rounded-lg hover:bg-rose-700 transition min-h-[44px]"
                      >
                        Remove from Featured
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pending Requests Section */}
      <div className="bg-white rounded-2xl border border-estate-border shadow-estate overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-estate-border bg-amber-50">
          <h2 className="text-lg md:text-xl font-bold text-estate-navy font-serif">Pending Featured Requests</h2>
          <p className="text-sm text-estate-text-sec">Properties waiting for approval</p>
        </div>
        
        {featuredRequests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-estate-text-sec">No pending featured requests</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-estate-border text-xs uppercase tracking-wider text-estate-muted font-bold bg-estate-bg">
                  <th className="py-3 px-4">Property</th>
                  <th className="py-3 px-4">Lister</th>
                  <th className="py-3 px-4">Request Date</th>
                  <th className="py-3 px-4">Plan Requested</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Payment Proof</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-estate-border">
                {featuredRequests.map((property) => (
                  <tr key={property.id} className="hover:bg-estate-bg/40 transition">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={getPropertyImage(property)}
                          alt={property.title}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div>
                          <div className="font-bold text-estate-navy">{property.title}</div>
                          <div className="text-xs text-estate-text-sec">{property.city}, {property.location}</div>
                          <div className="text-xs font-semibold text-estate-navy">{formatPrice(property.price)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-xs">
                        <div className="font-medium">Type: {property.lister_type}</div>
                        <div className="text-estate-text-sec">ID: {property.lister_id?.slice(0, 15)}...</div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs">
                      {property.featuredRequestDate ? formatDate(property.featuredRequestDate) : "N/A"}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        property.requested_for === 2 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {getPlanText(property.requested_for)}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-semibold text-estate-navy">
                      ₹{property.featuredPaymentAmount?.toLocaleString() || (property.requested_for === 2 ? "899" : "499")}
                    </td>
                    <td className="py-4 px-4">
                      {property.featuredPaymentProof ? (
                        <a
                          href={property.featuredPaymentProof}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-estate-navy underline text-xs hover:text-estate-navy-mid"
                        >
                          View Proof
                        </a>
                      ) : (
                        <span className="text-gray-400">No proof</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => openApproveModal(property)}
                          className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition min-h-[44px]"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProperty(property);
                            setIsModalOpen(true);
                          }}
                          className="px-3 py-1.5 bg-rose-600 text-white text-xs font-semibold rounded-lg hover:bg-rose-700 transition min-h-[44px]"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Current Featured Properties Section */}
      <div className="bg-white rounded-2xl border border-estate-border shadow-estate overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-estate-border bg-emerald-50">
          <h2 className="text-lg md:text-xl font-bold text-estate-navy font-serif">Current Featured Properties</h2>
          <p className="text-sm text-estate-text-sec">Properties currently displayed on homepage</p>
        </div>
        
        {approvedFeatured.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-estate-text-sec">No featured properties</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-estate-border text-xs uppercase tracking-wider text-estate-muted font-bold bg-estate-bg">
                  <th className="py-3 px-4">Property</th>
                  <th className="py-3 px-4">Plan</th>
                  <th className="py-3 px-4">Approved By</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4">Days Left</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-estate-border">
                {approvedFeatured.map((property) => {
                  const daysRemaining = getDaysRemaining(property.featuredExpiryDate);
                  return (
                    <tr key={property.id} className="hover:bg-estate-bg/40 transition">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={getPropertyImage(property)}
                            alt={property.title}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <div>
                            <div className="font-bold text-estate-navy">{property.title}</div>
                            <div className="text-xs text-estate-text-sec">{property.city}, {property.location}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          property.granted_for === 2 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {getPlanText(property.granted_for)}
                        </span>
                       </td>
                      <td className="py-4 px-4 text-xs">
                        {getAdminName(property.featuredApprovedBy)}
                       </td>
                      <td className="py-4 px-4 text-xs">
                        {property.featuredExpiryDate ? formatDate(property.featuredExpiryDate): "N/A"}
                       </td>
                      <td className="py-4 px-4">
                        {daysRemaining !== null && daysRemaining > 0 ? (
                          <span className="text-xs font-semibold text-emerald-600">{daysRemaining} days</span>
                        ) : (
                          <span className="text-xs text-rose-600">Expired</span>
                        )}
                       </td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold">
                          Featured
                        </span>
                       </td>
                      <td className="py-4 px-4">
  <div className="flex flex-wrap gap-2">
    <button
      onClick={() => markAsExpired(property)}
      className="px-3 py-1.5 bg-amber-600 text-white text-xs font-semibold rounded-lg hover:bg-amber-700 transition min-h-[44px]"
    >
      Mark Expired
    </button>
    <button
      onClick={() => removeFeatured(property)}
      className="px-3 py-1.5 bg-rose-600 text-white text-xs font-semibold rounded-lg hover:bg-rose-700 transition min-h-[44px]"
    >
      Remove
    </button>
  </div>
</td>
                     </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manually Removed Featured Properties Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-estate overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg md:text-xl font-bold text-gray-700 font-serif">📋 Manually Removed Featured Properties</h2>
          <p className="text-sm text-gray-600">Properties that were removed from featured as their tenure is over.</p>
        </div>
        
        {manuallyRemovedFeatured.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-estate-text-sec">No manually removed featured properties</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-estate-border text-xs uppercase tracking-wider text-estate-muted font-bold bg-estate-bg">
                  <th className="py-3 px-4">Property</th>
                  <th className="py-3 px-4">Last Plan</th>
                  <th className="py-3 px-4">Removal Status</th>
                  <th className="py-3 px-4">Actions</th>
                 </tr>
              </thead>
              <tbody className="text-sm divide-y divide-estate-border">
                {manuallyRemovedFeatured.map((property) => (
                  <tr key={property.id} className="hover:bg-gray-50/40 transition">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={getPropertyImage(property)}
                          alt={property.title}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div>
                          <div className="font-bold text-estate-navy">{property.title}</div>
                          <div className="text-xs text-estate-text-sec">{property.city}, {property.location}</div>
                          <div className="text-xs font-semibold text-estate-navy">{formatPrice(property.price)}</div>
                        </div>
                      </div>
                     </td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
                        {getPlanText(property.granted_for)}
                      </span>
                     </td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
                        Removed by Admin
                      </span>
                     </td>
                    <td className="py-4 px-4">
                      <span className="text-xs text-gray-400">No action needed</span>
                     </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Approve Modal with Plan Selection */}
      {isApproveModalOpen && selectedProperty && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg md:text-xl font-bold text-estate-navy">Approve Featured Request</h2>
              <button
                onClick={() => setIsApproveModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <p className="text-sm text-estate-text-sec mb-4">
              Property: <span className="font-bold">{selectedProperty.title}</span>
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-semibold text-estate-text mb-2">
                Select Plan *
              </label>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 border rounded-xl cursor-pointer hover:bg-gray-50 transition">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="plan"
                      value="1"
                      checked={selectedPlan === 1}
                      onChange={() => setSelectedPlan(1)}
                      className="w-4 h-4 text-estate-navy"
                    />
                    <div>
                      <span className="font-semibold">1 Month Plan</span>
                      <p className="text-xs text-estate-text-sec">Property featured for 30 days</p>
                    </div>
                  </div>
                  <span className="font-bold text-estate-navy">₹499</span>
                </label>
                
                <label className="flex items-center justify-between p-3 border rounded-xl cursor-pointer hover:bg-gray-50 transition">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="plan"
                      value="2"
                      checked={selectedPlan === 2}
                      onChange={() => setSelectedPlan(2)}
                      className="w-4 h-4 text-estate-navy"
                    />
                    <div>
                      <span className="font-semibold">2 Months Plan</span>
                      <p className="text-xs text-estate-text-sec">Property featured for 60 days</p>
                    </div>
                  </div>
                  <span className="font-bold text-estate-navy">₹899</span>
                </label>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setIsApproveModalOpen(false)}
                className="flex-1 py-2 rounded-xl border border-estate-border text-estate-text font-semibold hover:bg-gray-50 transition min-h-[44px]"
              >
                Cancel
              </button>
              <button
                onClick={approveFeaturedRequest}
                className="flex-1 py-2 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition min-h-[44px]"
              >
                Approve Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {isModalOpen && selectedProperty && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg md:text-xl font-bold text-estate-navy">Reject Featured Request</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <p className="text-sm text-estate-text-sec mb-4">
              Rejecting: <span className="font-bold">{selectedProperty.title}</span>
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-semibold text-estate-text mb-2">
                Rejection Reason *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g., Payment proof not clear, Insufficient amount, etc."
                className="w-full px-4 py-2 rounded-xl border border-estate-border focus:ring-2 focus:ring-estate-navy focus:border-transparent outline-none transition text-sm"
                rows={4}
                required
              />
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-2 rounded-xl border border-estate-border text-estate-text font-semibold hover:bg-gray-50 transition min-h-[44px]"
              >
                Cancel
              </button>
              <button
                onClick={rejectFeaturedRequest}
                className="flex-1 py-2 bg-rose-600 text-white font-semibold rounded-xl hover:bg-rose-700 transition min-h-[44px]"
              >
                Reject Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-4 sm:p-6">
            <p className="text-estate-navy">Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
}