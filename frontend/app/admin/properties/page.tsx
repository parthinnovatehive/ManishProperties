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
  type: string;
  status: string; // "For Sale" | "For Rent"
  verified: boolean;
  featured: boolean;
  approvalStatus: 'Approved' | 'Pending' | 'Rejected';
  agentName: string;
  agentEmail: string;
}

export default function AdminPropertiesPage() {
  const [propertiesList, setPropertiesList] = useState<PropertyListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const toListItem = (p: any): PropertyListItem => ({
      id: p.id,
      title: p.title,
      location: p.location,
      price: p.price,
      type: p.type,
      status: p.listingType || p.status,
      verified: !!p.verified,
      featured: !!p.featured,
      approvalStatus: p.status === "PENDING" ? "Pending" : p.status === "REJECTED" ? "Rejected" : "Approved",
      agentName: p.agent?.name || "Not Assigned",
      agentEmail: p.agent?.email || "none@estateelite.com"
  });

  useEffect(() => {
    estateApi.adminProperties
      .list()
      .then((items) => setPropertiesList(items.map(toListItem)))
      .finally(() => setLoading(false));
  }, []);

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

  const handleToggleFeatured = async (id: PropertyId) => {
    const current = propertiesList.find((p) => p.id === id);
    await estateApi.adminProperties.feature(id, !current?.featured);
    setPropertiesList(prev =>
      prev.map(p => (p.id === id ? { ...p, featured: !p.featured } : p))
    );
  };

  const pendingCount = propertiesList.filter(p => p.approvalStatus === 'Pending').length;
  const approvedCount = propertiesList.filter(p => p.approvalStatus === 'Approved').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-estate-navy font-serif">Manage Properties</h1>
          <p className="text-sm text-estate-text-sec">Approve new listings, toggle featured slots, and audit active properties.</p>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate">
          <span className="text-xs font-bold text-estate-muted uppercase tracking-wider block">Total Listings</span>
          <span className="text-3xl font-extrabold text-estate-navy block mt-2">{propertiesList.length}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate">
          <span className="text-xs font-bold text-estate-muted uppercase tracking-wider block">Pending Review</span>
          <span className="text-3xl font-extrabold text-estate-amber-dark block mt-2">{pendingCount}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate">
          <span className="text-xs font-bold text-estate-muted uppercase tracking-wider block">Approved Listings</span>
          <span className="text-3xl font-extrabold text-estate-success block mt-2">{approvedCount}</span>
        </div>
      </div>

      {/* Listings Table */}
      {loading && <div className="rounded-xl border border-estate-border bg-white p-6 text-center text-estate-muted">Loading properties...</div>}
      <div className="bg-white rounded-2xl border border-estate-border shadow-estate overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-estate-border text-xs uppercase tracking-wider text-estate-muted font-bold bg-estate-bg">
                <th className="py-3 px-4">Property</th>
                <th className="py-3 px-4">Price / Type</th>
                <th className="py-3 px-4">Submitted By</th>
                <th className="py-3 px-4">Featured</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-estate-border">
              {propertiesList.map((property) => (
                <tr key={property.id} className="hover:bg-estate-bg/40 transition">
                  <td className="py-4 px-4">
                    <div>
                      <div className="font-bold text-estate-text">{property.title}</div>
                      <div className="text-xs text-estate-text-sec">📍 {property.location}</div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-semibold text-estate-navy">{property.price}</div>
                    <div className="text-xs text-estate-text-sec">{property.type} • {property.status}</div>
                  </td>
                  <td className="py-4 px-4">
<div className="text-estate-text font-medium">{property.agentName}</div>
<div className="text-xs text-estate-muted">{property.agentEmail}</div>
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => handleToggleFeatured(property.id)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${
                        property.featured 
                          ? 'bg-amber-100 text-amber-800 border-amber-200' 
                          : 'bg-estate-bg text-estate-muted border-estate-border hover:bg-estate-surface'
                      }`}
                    >
                      {property.featured ? '★ Featured' : '☆ Standard'}
                    </button>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      property.approvalStatus === 'Approved' 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                        : property.approvalStatus === 'Pending'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
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
                          className="px-2.5 py-1 bg-estate-success-bg text-estate-success border border-estate-success/20 hover:bg-emerald-100 rounded-lg text-xs font-bold transition"
                        >
                          Approve
                        </button>
                      )}
                      {property.approvalStatus !== 'Rejected' && (
                        <button
                          onClick={() => handleReject(property.id)}
                          className="px-2.5 py-1 bg-estate-red-bg text-estate-red border border-estate-red/20 hover:bg-rose-100 rounded-lg text-xs font-bold transition"
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
