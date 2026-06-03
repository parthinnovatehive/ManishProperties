"use client";

import { useState } from "react";
import { agentLeads as initialLeads, Lead } from "@/data/agent-leads";
import { LeadCard } from "@/components/agent/LeadCard";
import { Search, Plus, X, Phone, Mail, Home, DollarSign, Calendar, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AgentLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeStatusFilter, setActiveStatusFilter] = useState<"All" | Lead["status"]>("All");

  // Selection & Modal states
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [formState, setFormState] = useState({
    clientName: "",
    email: "",
    phone: "",
    propertyTitle: "Luxury Sea-View 3BHK Apartment",
    budget: "₹2.8 - 3.0 Cr",
    status: "New" as Lead["status"],
    notes: "",
  });

  // Filter logic
  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.phone.includes(searchTerm) ||
      l.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeStatusFilter === "All") return matchesSearch;
    return matchesSearch && l.status === activeStatusFilter;
  });

  // Handler for pipeline status change
  const handleStatusChange = (id: string, newStatus: Lead["status"]) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
    );
  };

  // Save Edit Lead
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;

    setLeads((prev) =>
      prev.map((l) =>
        l.id === editingLead.id
          ? {
              ...l,
              clientName: formState.clientName,
              email: formState.email,
              phone: formState.phone,
              propertyTitle: formState.propertyTitle,
              budget: formState.budget,
              status: formState.status,
              notes: formState.notes,
            }
          : l
      )
    );
    setEditingLead(null);
  };

  // Create Lead
  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date().toISOString().split("T")[0];
    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      clientName: formState.clientName,
      email: formState.email,
      phone: formState.phone,
      propertyTitle: formState.propertyTitle,
      budget: formState.budget,
      status: formState.status,
      date: today,
      notes: formState.notes,
    };

    setLeads((prev) => [newLead, ...prev]);
    setShowAddModal(false);
    setFormState({
      clientName: "",
      email: "",
      phone: "",
      propertyTitle: "Luxury Sea-View 3BHK Apartment",
      budget: "₹2.8 - 3.0 Cr",
      status: "New",
      notes: "",
    });
  };

  const getStatusColorClass = (status: Lead["status"]) => {
    switch (status) {
      case "New":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Contacted":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "Interested":
        return "bg-estate-success-bg text-estate-success border-estate-border-med";
      case "Closed":
        return "bg-estate-blue-pale text-estate-navy border-estate-border";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-estate-navy tracking-tight font-serif">
            CRM Leads Pipeline
          </h1>
          <p className="text-sm font-semibold text-estate-text-sec mt-1">
            Track client inquiries, follow-up notes, budgets, and deal pipeline status.
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Lead
        </Button>
      </div>

      {/* Toolbar - search and filters */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-white border border-estate-border/70 p-4 rounded-2xl shadow-sm">
        {/* Pipeline tags filter */}
        <div className="flex overflow-x-auto gap-1.5 p-1 bg-estate-surface/60 rounded-xl max-w-full scrollbar-none">
          {(["All", "New", "Contacted", "Interested", "Closed"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveStatusFilter(filter)}
              className={`text-xs font-bold px-4 py-2 rounded-lg transition-all ${
                activeStatusFilter === filter
                  ? "bg-estate-navy text-white shadow-sm"
                  : "text-estate-text-sec hover:text-estate-navy hover:bg-estate-surface/40"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-estate-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search leads by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs font-semibold border border-estate-border/80 focus:border-estate-navy focus:ring-4 focus:ring-estate-blue-pale/50 rounded-xl outline-none transition bg-estate-bg"
          />
        </div>
      </div>

      {/* TABLE/CARD HYBRID RESPONSIVE LAYOUT */}
      {filteredLeads.length > 0 ? (
        <>
          {/* Card layout - ONLY visible on Mobile (< 768px) */}
          <div className="grid grid-cols-1 gap-4 md:hidden animate-fade-up">
            {filteredLeads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onStatusChange={handleStatusChange}
                onEdit={(l) => {
                  setEditingLead(l);
                  setFormState({
                    clientName: l.clientName,
                    email: l.email,
                    phone: l.phone,
                    propertyTitle: l.propertyTitle,
                    budget: l.budget,
                    status: l.status,
                    notes: l.notes || "",
                  });
                }}
              />
            ))}
          </div>

          {/* Table layout - visible on Tablet & Desktop (>= 768px) */}
          <div className="hidden md:block bg-white border border-estate-border/80 rounded-[20px] shadow-estate overflow-hidden animate-fade-up">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-estate-surface/40 border-b border-estate-border">
                    <th className="p-4 text-xs font-bold text-estate-navy uppercase tracking-wider pl-6">Client Name</th>
                    <th className="p-4 text-xs font-bold text-estate-navy uppercase tracking-wider">Contact Channels</th>
                    <th className="p-4 text-xs font-bold text-estate-navy uppercase tracking-wider">Target Property</th>
                    <th className="p-4 text-xs font-bold text-estate-navy uppercase tracking-wider">Budget limit</th>
                    <th className="p-4 text-xs font-bold text-estate-navy uppercase tracking-wider">Lead Status</th>
                    <th className="p-4 text-xs font-bold text-estate-navy uppercase tracking-wider pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-estate-border/40">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-estate-surface/20 transition">
                      {/* Name & Date */}
                      <td className="p-4 pl-6">
                        <span className="font-extrabold text-sm text-estate-navy block">{lead.clientName}</span>
                        <span className="text-[10px] text-estate-muted font-bold block mt-0.5">Assigned: {lead.date}</span>
                      </td>

                      {/* Contact Channels */}
                      <td className="p-4">
                        <div className="flex flex-col gap-0.5 text-xs text-estate-text-sec font-semibold">
                          <a href={`tel:${lead.phone}`} className="hover:text-estate-navy flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-estate-muted" /> {lead.phone}
                          </a>
                          <a href={`mailto:${lead.email}`} className="hover:text-estate-navy flex items-center gap-1.5">
                            <Mail className="w-3 h-3 text-estate-muted" /> {lead.email}
                          </a>
                        </div>
                      </td>

                      {/* Target Property */}
                      <td className="p-4 max-w-[200px]">
                        <span className="text-xs font-bold text-estate-text block truncate" title={lead.propertyTitle}>
                          {lead.propertyTitle}
                        </span>
                      </td>

                      {/* Budget */}
                      <td className="p-4">
                        <span className="text-xs font-extrabold text-estate-navy">{lead.budget}</span>
                      </td>

                      {/* Status Dropdown */}
                      <td className="p-4">
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value as Lead["status"])}
                          className={`text-[11px] font-extrabold border rounded-lg px-2.5 py-1 outline-none transition cursor-pointer ${getStatusColorClass(
                            lead.status
                          )}`}
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Interested">Interested</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </td>

                      {/* Edit actions */}
                      <td className="p-4 pr-6 text-right">
                        <button
                          onClick={() => {
                            setEditingLead(lead);
                            setFormState({
                              clientName: lead.clientName,
                              email: lead.email,
                              phone: lead.phone,
                              propertyTitle: lead.propertyTitle,
                              budget: lead.budget,
                              status: lead.status,
                              notes: lead.notes || "",
                            });
                          }}
                          className="text-xs font-bold text-estate-navy hover:underline bg-estate-blue-pale/80 px-3 py-1.5 rounded-lg border border-estate-border/50 hover:bg-estate-blue-pale transition"
                        >
                          Details / Notes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white border border-estate-border/80 rounded-[20px] p-12 text-center shadow-sm">
          <p className="text-sm font-bold text-estate-muted">No CRM leads found matching this criteria.</p>
        </div>
      )}

      {/* EDIT NOTES / DETAILS MODAL */}
      {editingLead && (
        <>
          <div
            onClick={() => setEditingLead(null)}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity"
          />
          <div className="fixed inset-x-4 top-16 max-w-xl mx-auto bg-white z-50 rounded-2xl shadow-estate-lg border border-estate-border overflow-hidden animate-fade-up">
            <div className="p-5 border-b border-estate-border flex justify-between items-center bg-estate-surface/10">
              <h3 className="font-extrabold text-base text-estate-navy font-serif">Lead Details & Follow-up Notes</h3>
              <button
                onClick={() => setEditingLead(null)}
                className="p-1 hover:bg-estate-surface rounded-lg transition"
              >
                <X className="w-5 h-5 text-estate-text-sec" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <label className="col-span-2">
                  <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block mb-1">
                    Client Name
                  </span>
                  <input
                    type="text"
                    required
                    value={formState.clientName}
                    onChange={(e) => setFormState({ ...formState, clientName: e.target.value })}
                    className="w-full p-2.5 border border-estate-border rounded-xl focus:border-estate-navy outline-none text-xs font-semibold focus:ring-4 focus:ring-estate-blue-pale/50"
                  />
                </label>

                <label>
                  <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block mb-1">
                    Client Email
                  </span>
                  <input
                    type="email"
                    required
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    className="w-full p-2.5 border border-estate-border rounded-xl focus:border-estate-navy outline-none text-xs font-semibold focus:ring-4 focus:ring-estate-blue-pale/50"
                  />
                </label>

                <label>
                  <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block mb-1">
                    Client Phone
                  </span>
                  <input
                    type="text"
                    required
                    value={formState.phone}
                    onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                    className="w-full p-2.5 border border-estate-border rounded-xl focus:border-estate-navy outline-none text-xs font-semibold focus:ring-4 focus:ring-estate-blue-pale/50"
                  />
                </label>

                <label className="col-span-2">
                  <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block mb-1">
                    Interested property
                  </span>
                  <input
                    type="text"
                    required
                    value={formState.propertyTitle}
                    onChange={(e) => setFormState({ ...formState, propertyTitle: e.target.value })}
                    className="w-full p-2.5 border border-estate-border rounded-xl focus:border-estate-navy outline-none text-xs font-semibold focus:ring-4 focus:ring-estate-blue-pale/50"
                  />
                </label>

                <label>
                  <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block mb-1">
                    Budget range
                  </span>
                  <input
                    type="text"
                    required
                    value={formState.budget}
                    onChange={(e) => setFormState({ ...formState, budget: e.target.value })}
                    className="w-full p-2.5 border border-estate-border rounded-xl focus:border-estate-navy outline-none text-xs font-semibold focus:ring-4 focus:ring-estate-blue-pale/50"
                  />
                </label>

                <label>
                  <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block mb-1">
                    Pipeline Status
                  </span>
                  <select
                    value={formState.status}
                    onChange={(e) => setFormState({ ...formState, status: e.target.value as Lead["status"] })}
                    className="w-full p-2.5 border border-estate-border rounded-xl focus:border-estate-navy outline-none text-xs font-bold text-estate-navy focus:ring-4 focus:ring-estate-blue-pale/50 cursor-pointer bg-white"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Interested">Interested</option>
                    <option value="Closed">Closed</option>
                  </select>
                </label>

                <label className="col-span-2">
                  <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block mb-1">
                    Follow-up Notes / History
                  </span>
                  <textarea
                    rows={3}
                    value={formState.notes}
                    onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
                    className="w-full p-2.5 border border-estate-border rounded-xl focus:border-estate-navy outline-none text-xs font-semibold focus:ring-4 focus:ring-estate-blue-pale/50"
                  />
                </label>
              </div>

              <div className="pt-4 border-t border-estate-border flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setEditingLead(null)}
                  className="px-4 py-2.5 border border-estate-border text-xs font-bold text-estate-text-sec hover:bg-estate-surface rounded-xl transition"
                >
                  Cancel
                </button>
                <Button variant="primary" size="sm" type="submit">
                  Save Details
                </Button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* ADD LEAD MODAL */}
      {showAddModal && (
        <>
          <div
            onClick={() => setShowAddModal(false)}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity"
          />
          <div className="fixed inset-x-4 top-16 max-w-xl mx-auto bg-white z-50 rounded-2xl shadow-estate-lg border border-estate-border overflow-hidden animate-fade-up">
            <div className="p-5 border-b border-estate-border flex justify-between items-center bg-estate-surface/10">
              <h3 className="font-extrabold text-base text-estate-navy font-serif">Add New Inbound Lead</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-estate-surface rounded-lg transition"
              >
                <X className="w-5 h-5 text-estate-text-sec" />
              </button>
            </div>
            <form onSubmit={handleCreateLead} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <label className="col-span-2">
                  <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block mb-1">
                    Client Name
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kiara Advani"
                    value={formState.clientName}
                    onChange={(e) => setFormState({ ...formState, clientName: e.target.value })}
                    className="w-full p-2.5 border border-estate-border rounded-xl focus:border-estate-navy outline-none text-xs font-semibold focus:ring-4 focus:ring-estate-blue-pale/50"
                  />
                </label>

                <label>
                  <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block mb-1">
                    Email address
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="e.g. kiara@example.com"
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    className="w-full p-2.5 border border-estate-border rounded-xl focus:border-estate-navy outline-none text-xs font-semibold focus:ring-4 focus:ring-estate-blue-pale/50"
                  />
                </label>

                <label>
                  <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block mb-1">
                    Phone Number
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +91 91111 22222"
                    value={formState.phone}
                    onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                    className="w-full p-2.5 border border-estate-border rounded-xl focus:border-estate-navy outline-none text-xs font-semibold focus:ring-4 focus:ring-estate-blue-pale/50"
                  />
                </label>

                <label className="col-span-2">
                  <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block mb-1">
                    Target Property Interest
                  </span>
                  <select
                    value={formState.propertyTitle}
                    onChange={(e) => setFormState({ ...formState, propertyTitle: e.target.value })}
                    className="w-full p-2.5 border border-estate-border rounded-xl focus:border-estate-navy outline-none text-xs font-bold text-estate-navy focus:ring-4 focus:ring-estate-blue-pale/50 cursor-pointer bg-white"
                  >
                    <option value="Luxury Sea-View 3BHK Apartment">Luxury Sea-View 3BHK Apartment</option>
                    <option value="Modern 4BHK Independent Villa">Modern 4BHK Independent Villa</option>
                    <option value="Premium 2BHK in Hinjewadi">Premium 2BHK in Hinjewadi</option>
                    <option value="Ultra-Luxury Penthouse DLF Phase 5">Ultra-Luxury Penthouse DLF Phase 5</option>
                    <option value="Elegant 3BHK Gated Residence">Elegant 3BHK Gated Residence</option>
                    <option value="Grade-A Commercial Space BKC">Grade-A Commercial Space BKC</option>
                  </select>
                </label>

                <label>
                  <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block mb-1">
                    Budget range
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ₹2.8 - 3.0 Cr or ₹40,000/mo"
                    value={formState.budget}
                    onChange={(e) => setFormState({ ...formState, budget: e.target.value })}
                    className="w-full p-2.5 border border-estate-border rounded-xl focus:border-estate-navy outline-none text-xs font-semibold focus:ring-4 focus:ring-estate-blue-pale/50"
                  />
                </label>

                <label>
                  <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block mb-1">
                    Pipeline Status
                  </span>
                  <select
                    value={formState.status}
                    onChange={(e) => setFormState({ ...formState, status: e.target.value as Lead["status"] })}
                    className="w-full p-2.5 border border-estate-border rounded-xl focus:border-estate-navy outline-none text-xs font-bold text-estate-navy focus:ring-4 focus:ring-estate-blue-pale/50 cursor-pointer bg-white"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Interested">Interested</option>
                    <option value="Closed">Closed</option>
                  </select>
                </label>

                <label className="col-span-2">
                  <span className="text-[10px] font-bold uppercase text-estate-muted tracking-wider block mb-1">
                    Initial follow-up notes
                  </span>
                  <textarea
                    rows={3}
                    placeholder="Enter initial contact summary details..."
                    value={formState.notes}
                    onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
                    className="w-full p-2.5 border border-estate-border rounded-xl focus:border-estate-navy outline-none text-xs font-semibold focus:ring-4 focus:ring-estate-blue-pale/50"
                  />
                </label>
              </div>

              <div className="pt-4 border-t border-estate-border flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 border border-estate-border text-xs font-bold text-estate-text-sec hover:bg-estate-surface rounded-xl transition"
                >
                  Cancel
                </button>
                <Button variant="primary" size="sm" type="submit">
                  Create Lead
                </Button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
