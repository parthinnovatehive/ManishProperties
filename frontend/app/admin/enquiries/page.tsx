"use client";

import { useEffect, useState } from "react";
import { estateApi } from "@/lib/api";
import { notificationService } from "@/lib/notifications";
import PropertyPreviewModal from "@/components/PropertyPreviewModal";
import type { Property } from "@/types";
import { toast } from "sonner";

interface Enquiry {
  id: string;
  propertyId: string;
  propertyTitle: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  message: string;
  agentId?: string;
  agentName?: string;
  agentEmail?: string;
  agentPhone?: string;
  status?: string;
  createdAt: string;
}

interface Subarea {
  id: string;
  name: string;
  city_id: string;
  agent_ids: string[];
  status: string;
}

interface Agent {
  id: string;
  name: string;
  email: string;
  phone?: string;
  rating?: number;
  totalRatings?: number;
  status?: string;
}

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [filtered, setFiltered] = useState<Enquiry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selected, setSelected] = useState<Enquiry | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewProperty, setPreviewProperty] = useState<any>(null);

  const [agents, setAgents] = useState<Agent[]>([]);
  const [subareas, setSubareas] = useState<Subarea[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignEnquiry, setAssignEnquiry] = useState<Enquiry | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [selectedSubarea, setSelectedSubarea] = useState("");
  const [subareaAgent, setSubareaAgent] = useState<Agent | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchEnquiries();
    fetchAgents();
    fetchSubareas();
    fetchProperties();
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFiltered(
      enquiries.filter((e) => {
        const matchesSearch =
          e.propertyTitle.toLowerCase().includes(term) ||
          e.userName.toLowerCase().includes(term) ||
          e.userEmail.toLowerCase().includes(term) ||
          e.userPhone.includes(term);
        if (!statusFilter) return matchesSearch;
        return matchesSearch && (e.status || "Pending") === statusFilter;
      }),
    );
  }, [searchTerm, enquiries, statusFilter]);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const data = await estateApi.enquiries.list<Enquiry>();
      setEnquiries(data);
      setFiltered(data);
    } catch (err) {
      console.error("Failed to fetch enquiries:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const data = await estateApi.agents.list<Agent>();
      setAgents(data.filter((a: Agent) => a.status !== "PENDING"));
    } catch (err) {
      console.error("Failed to fetch agents:", err);
    }
  };

  const fetchSubareas = async () => {
    try {
      const data = await estateApi.content.subareas.list<Subarea>();
      setSubareas(data);
    } catch (err) {
      console.error("Failed to fetch subareas:", err);
    }
  };

  const fetchProperties = async () => {
    try {
      const data = await estateApi.adminProperties.list();
      setProperties(data);
    } catch (err) {
      console.error("Failed to fetch properties:", err);
    }
  };

  const handleViewProperty = async (propertyId: string) => {
    try {
      const property = await estateApi.properties.detail(propertyId);
      setPreviewProperty(property);
      setPreviewOpen(true);
    } catch {
      toast.error("Property not found or has been removed.");
    }
  };

  const getPropertySubarea = (propertyId: string): Subarea | undefined => {
    const property = properties.find((p) => p.id === propertyId);
    if (!property) return undefined;
    return subareas.find((s) => s.id === property.sub_area_id);
  };

  const getAgentForSubarea = (subareaId?: string): Agent | undefined => {
    if (!subareaId) return undefined;
    const subarea = subareas.find((s) => s.id === subareaId);
    if (!subarea || !subarea.agent_ids || subarea.agent_ids.length === 0) return undefined;
    return agents.find((a) => a.id === subarea.agent_ids[0]);
  };

  const getSubareasWithAgents = (): Subarea[] => {
    return subareas.filter((s) => s.agent_ids && s.agent_ids.length > 0);
  };

  const getAgentsForSubarea = (subareaId: string): Agent[] => {
    const subarea = subareas.find((s) => s.id === subareaId);
    if (!subarea || !subarea.agent_ids || subarea.agent_ids.length === 0) return [];
    return agents.filter((a) => subarea.agent_ids?.includes(a.id));
  };

  const openAssignModal = async (enq: Enquiry) => {
    setAssignEnquiry(enq);
    setSelectedSubarea("");
    setSelectedAgent(
      enq.agentId ? agents.find((a) => a.id === enq.agentId) || null : null,
    );

    const property = properties.find((p) => p.id === String(enq.propertyId));
    if (property) {
      const preAssignedAgent = getAgentForSubarea(property.sub_area_id);
      setSubareaAgent(preAssignedAgent || null);
    } else {
      setSubareaAgent(null);
    }

    setAssignModalOpen(true);
  };

  const handleSubareaChange = (subareaId: string) => {
    setSelectedSubarea(subareaId);
    if (subareaId) {
      const agentsList = getAgentsForSubarea(subareaId);
      setSelectedAgent(agentsList[0] || null);
    } else {
      setSelectedAgent(null);
    }
  };

  const handleAssignAgent = async () => {
    if (!assignEnquiry || !selectedAgent) {
      toast.error("Please select an agent");
      return;
    }
    setIsSubmitting(true);
    try {
      await estateApi.enquiries.update(assignEnquiry.id, {
        agentId: selectedAgent.id,
        agentName: selectedAgent.name,
        agentEmail: selectedAgent.email,
        agentPhone: selectedAgent.phone || "",
        status: "Assigned",
      });

      setEnquiries((prev) =>
        prev.map((e) =>
          e.id === assignEnquiry.id
            ? {
                ...e,
                agentId: selectedAgent.id,
                agentName: selectedAgent.name,
                agentEmail: selectedAgent.email,
                agentPhone: selectedAgent.phone || "",
                status: "Assigned",
              }
            : e,
        ),
      );

      await notificationService.addNotification({
        userId: selectedAgent.id,
        userType: "AGENT",
        title: "New Enquiry Assigned",
        message: `You have been assigned an enquiry for ${assignEnquiry.propertyTitle}.`,
        type: "enquiry",
        relatedId: assignEnquiry.id,
        actionUrl: "/agent/dashboard",
        icon: "MessageCircle",
      });

      setAssignModalOpen(false);
      fetchEnquiries();
    } catch (err) {
      console.error("Error assigning agent:", err);
      toast.error("Failed to assign agent");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  };

  const statusBadge = (status?: string) => {
    const s = status || "Pending";
    const styles: Record<string, string> = {
      Pending: "bg-amber-100 text-amber-800",
      Assigned: "bg-purple-100 text-purple-800",
      Contacted: "bg-blue-100 text-blue-800",
      Closed: "bg-gray-100 text-gray-600",
    };
    return (
      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[s] || styles.Pending}`}>
        {s}
      </span>
    );
  };

  const getSubareaName = (propertyId: string): string => {
    const property = properties.find((p) => String(p.id) === String(propertyId));
    if (!property || !property.sub_area_id) return "—";
    const subarea = subareas.find((s) => s.id === property.sub_area_id);
    return subarea?.name || "—";
  };

  const getCityName = (propertyId: string): string => {
    const property = properties.find((p) => String(p.id) === String(propertyId));
    return property?.city || "—";
  };

  const availableSubareas = getSubareasWithAgents();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-estate-navy font-serif">Property Enquiries</h1>
          <p className="text-sm text-estate-text-sec">View and assign agents to enquiries received from users.</p>
        </div>
        <button onClick={fetchEnquiries} className="px-4 py-2 min-h-[44px] bg-estate-navy text-white rounded-xl hover:bg-estate-navy-mid transition">
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-estate-border shadow-estate p-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-estate-text mb-1">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by property, name, email, phone..."
              className="w-full px-3 py-2 rounded-lg border border-estate-border focus:ring-2 focus:ring-estate-navy focus:border-transparent outline-none transition text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-estate-text mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-estate-border focus:ring-2 focus:ring-estate-navy focus:border-transparent outline-none transition text-sm bg-white"
            >
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Assigned">Assigned</option>
              <option value="Contacted">Contacted</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-estate-border shadow-estate overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-estate-border text-xs uppercase tracking-wider text-estate-muted font-bold bg-estate-bg">
                <th className="py-3 px-4">Property</th>
                <th className="py-3 px-4">Subarea</th>
                <th className="py-3 px-4">City</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Agent</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-estate-border">
              {loading ? (
                <tr><td colSpan={9} className="text-center py-12 text-estate-muted">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12 text-estate-muted">No enquiries found</td></tr>
              ) : (
                filtered.map((enq) => (
                  <tr key={enq.id} className="hover:bg-estate-bg/40 transition">
                    <td className="py-4 px-4 max-w-[200px]">
                      <div className="font-medium text-estate-navy truncate">{enq.propertyTitle}</div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="text-xs text-estate-text-sec">{getSubareaName(enq.propertyId)}</span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="text-xs text-estate-text-sec">{getCityName(enq.propertyId)}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-estate-navy">{enq.userName}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-estate-text">{enq.userEmail}</div>
                      <div className="text-xs text-estate-text-sec">{enq.userPhone || "—"}</div>
                    </td>
                    <td className="py-4 px-4">
                      {enq.agentName ? (
                        <div>
                          <div className="font-medium text-estate-navy text-xs">{enq.agentName}</div>
                          <div className="text-xs text-estate-text-sec">{enq.agentEmail}</div>
                        </div>
                      ) : (
                        <span className="text-xs text-rose-500 font-medium">Not Assigned</span>
                      )}
                    </td>
                    <td className="py-4 px-4">{statusBadge(enq.status)}</td>
                    <td className="py-4 px-4 whitespace-nowrap text-estate-text-sec text-xs">{formatDate(enq.createdAt)}</td>
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {!enq.agentId && (
                          <button
                            onClick={() => openAssignModal(enq)}
                            className="px-3 py-1.5 min-h-[36px] bg-estate-navy text-white text-xs font-semibold rounded-lg hover:bg-estate-navy-mid transition"
                          >
                            Assign Agent
                          </button>
                        )}
                        <button
                          onClick={() => { setSelected(enq); setModalOpen(true); }}
                          className="px-3 py-1.5 min-h-[36px] bg-estate-navy/10 text-estate-navy text-xs font-semibold rounded-lg hover:bg-estate-navy/20 transition"
                        >
                          View Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 border-t border-estate-border bg-gray-50 text-xs text-estate-muted">
          Showing {filtered.length} of {enquiries.length} enquiries
        </div>
      </div>

      {/* Assign Agent Modal */}
      {assignModalOpen && assignEnquiry && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl p-4 sm:p-6 w-full sm:max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-estate-navy">Assign Agent</h2>
              <button
                onClick={() => setAssignModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* Subarea Agent Section */}
              <div>
                <p className="text-sm text-estate-text-sec mb-2">Agent for this Subarea</p>
                {subareaAgent ? (
                  <div
                    className={`cursor-pointer transition-all ${selectedAgent?.id === subareaAgent.id
                        ? 'bg-emerald-100 border-2 border-emerald-600'
                        : 'bg-emerald-50 border border-emerald-200 hover:bg-emerald-100'
                      } p-3 rounded-lg`}
                    onClick={() => {
                      setSelectedAgent(subareaAgent);
                      setSelectedSubarea("");
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-emerald-800">{subareaAgent.name}</p>
                        <p className="text-xs text-emerald-700">{subareaAgent.email}</p>
                      </div>
                      {selectedAgent?.id === subareaAgent.id && (
                        <span className="text-emerald-600 text-sm font-semibold">✓ Selected</span>
                      )}
                    </div>
                    {selectedAgent?.id !== subareaAgent.id && (
                      <button
                        className="mt-2 px-3 py-1 min-h-[36px] bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700 transition"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAgent(subareaAgent);
                          setSelectedSubarea("");
                        }}
                      >
                        Select This Agent
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                    <p className="text-sm text-amber-700">No agent available in this subarea</p>
                  </div>
                )}
              </div>

              {/* Subarea Dropdown */}
              <div>
                <label className="block text-sm font-semibold text-estate-text mb-2">
                  Select Subarea
                </label>
                <select
                  value={selectedSubarea}
                  onChange={(e) => handleSubareaChange(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-estate-border focus:ring-2 focus:ring-estate-navy focus:border-transparent outline-none transition text-sm bg-white"
                >
                  <option value="">Select a subarea</option>
                  {availableSubareas.map((subarea) => (
                    <option key={subarea.id} value={subarea.id}>
                      {subarea.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Agent Details */}
              {selectedAgent && (
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-semibold text-blue-800">Selected Agent</p>
                    <span className="text-blue-600 text-xs font-semibold">Ready to Assign</span>
                  </div>
                  <div className="space-y-1">
                    <p><span className="text-xs text-estate-muted">Name:</span> <span className="text-sm font-medium">{selectedAgent.name}</span></p>
                    <p><span className="text-xs text-estate-muted">Email:</span> <span className="text-sm">{selectedAgent.email}</span></p>
                    <p><span className="text-xs text-estate-muted">Phone:</span> <span className="text-sm">{selectedAgent.phone || "N/A"}</span></p>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex flex-wrap gap-3 pt-4">
                <button
                  onClick={() => setAssignModalOpen(false)}
                  className="flex-1 min-h-[44px] py-2 rounded-xl border border-estate-border text-estate-text font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignAgent}
                  disabled={isSubmitting || !selectedAgent}
                  className="flex-1 min-h-[44px] py-2 bg-estate-navy text-white font-semibold rounded-xl hover:bg-estate-navy-mid transition disabled:opacity-50"
                >
                  {isSubmitting ? "Assigning..." : "Assign Agent"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {modalOpen && selected && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[95vh] overflow-y-auto">
            <div className="sticky top-0 bg-white flex justify-between items-center p-4 sm:p-6 border-b border-estate-border">
              <h2 className="text-lg sm:text-xl font-bold text-estate-navy font-serif">Enquiry Details</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            <div className="p-4 sm:p-6 space-y-5">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <p className="text-xs text-estate-muted mb-1">Property</p>
                  <p className="font-bold text-estate-navy text-lg">{selected.propertyTitle}</p>
                  <div className="flex gap-3 mt-1 text-xs text-estate-text-sec">
                    <span>Subarea: {getSubareaName(selected.propertyId)}</span>
                    <span>City: {getCityName(selected.propertyId)}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-estate-muted">Status</p>
                  <div>{statusBadge(selected.status)}</div>
                </div>
              </div>

              <div className="border-t border-estate-border pt-4">
                <p className="text-xs font-semibold text-estate-muted uppercase tracking-wider mb-3">User Information</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-estate-muted">Name</p>
                    <p className="font-medium">{selected.userName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-estate-muted">Phone</p>
                    <p className="font-medium">{selected.userPhone || "—"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-estate-muted">Email</p>
                    <p className="font-medium">{selected.userEmail}</p>
                  </div>
                </div>
              </div>

              {selected.agentName && (
                <div className="border-t border-estate-border pt-4">
                  <p className="text-xs font-semibold text-estate-muted uppercase tracking-wider mb-3">Assigned Agent</p>
                  <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 space-y-1">
                    <p className="font-medium text-estate-navy">{selected.agentName}</p>
                    <p className="text-xs text-estate-text-sec">{selected.agentEmail}</p>
                    {selected.agentPhone && <p className="text-xs text-estate-text-sec">{selected.agentPhone}</p>}
                  </div>
                </div>
              )}

              {selected.message && (
                <div className="border-t border-estate-border pt-4">
                  <p className="text-xs text-estate-muted mb-1">Message</p>
                  <p className="text-estate-text bg-gray-50 p-4 rounded-xl leading-relaxed">{selected.message}</p>
                </div>
              )}
              <div className="text-xs text-estate-muted pt-2">Date: {formatDate(selected.createdAt)}</div>
            </div>
            <div className="sticky bottom-0 bg-white flex justify-end gap-3 p-4 sm:p-6 border-t border-estate-border bg-gray-50">
              <button
                onClick={() => handleViewProperty(selected.propertyId)}
                className="px-4 py-2 min-h-[44px] border border-estate-navy text-estate-navy rounded-xl hover:bg-estate-navy/5 transition text-sm font-medium"
              >
                View Property
              </button>
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 min-h-[44px] bg-estate-navy text-white rounded-xl hover:bg-estate-navy-mid transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <PropertyPreviewModal
        open={previewOpen}
        onClose={() => { setPreviewOpen(false); setPreviewProperty(null); }}
        property={previewProperty}
        approvalStatus={previewProperty?.moderationStatus || "Approved"}
      />
    </div>
  );
}
