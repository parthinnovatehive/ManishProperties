"use client";

import { useEffect, useState } from "react";
import {
  MessageCircle,
  ExternalLink,
  Building2,
  Mail,
  Phone,
  User,
  Calendar,
  Search,
  RefreshCw,
  MessageSquare,
  Clock,
  ChevronRight,
  CheckCheck,
} from "lucide-react";
import { estateApi } from "@/lib/api";
import { getAdminData } from "@/lib/utils/token";
import PropertyPreviewModal from "@/components/PropertyPreviewModal";
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

const statusConfig: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  Pending: { label: "Pending", bg: "bg-amber-50 border-amber-200", text: "text-amber-700", dot: "bg-amber-400" },
  Assigned: { label: "Assigned", bg: "bg-purple-50 border-purple-200", text: "text-purple-700", dot: "bg-purple-400" },
  Contacted: { label: "Contacted", bg: "bg-blue-50 border-blue-200", text: "text-blue-700", dot: "bg-blue-400" },
  Closed: { label: "Closed", bg: "bg-gray-50 border-gray-200", text: "text-gray-600", dot: "bg-gray-400" },
};

function StatusBadge({ status }: { status?: string }) {
  const cfg = statusConfig[status || "Pending"] || statusConfig.Pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function WhatsAppButton({ phone, propertyTitle, userName }: { phone: string; propertyTitle: string; userName: string }) {
  const cleanPhone = phone.replace(/\D/g, "");
  if (!cleanPhone) return null;
  const message = encodeURIComponent(
    `Hi ${userName}! 👋\n\nWe noticed you're interested in "${propertyTitle}" from Manish Properties.\n\nI'd love to share more details and help you with any questions. Please feel free to reach out!\n\nWarm regards,\nYour Property Specialist\nManish Properties`,
  );
  return (
    <a
      href={`https://wa.me/${cleanPhone}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-all shadow-sm hover:shadow-emerald-200 active:scale-[0.97]"
    >
      <MessageCircle className="w-4 h-4" />
      WhatsApp
    </a>
  );
}

export default function AgentEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [filtered, setFiltered] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState("All");
  const [selected, setSelected] = useState<Enquiry | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewProperty, setPreviewProperty] = useState<any>(null);

  useEffect(() => {
    fetchEnquiries();
  }, []);

  useEffect(() => {
    const term = search.toLowerCase();
    setFiltered(
      enquiries.filter((e) => {
        const matchesSearch =
          e.propertyTitle.toLowerCase().includes(term) ||
          e.userName.toLowerCase().includes(term) ||
          e.userEmail.toLowerCase().includes(term) ||
          e.userPhone.includes(term);
        if (filterTab === "All") return matchesSearch;
        return matchesSearch && (e.status || "Pending") === filterTab;
      }),
    );
  }, [search, enquiries, filterTab]);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const account = getAdminData();
      const currentAgentId = account?.id;
      if (!currentAgentId) {
        setEnquiries([]);
        setFiltered([]);
        setLoading(false);
        return;
      }
      const all = await estateApi.enquiries.list<Enquiry>();
      const mine = all.filter((e) => e.agentId === currentAgentId);
      setEnquiries(mine);
      setFiltered(mine);
    } catch (err) {
      console.error("Failed to fetch enquiries:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkContacted = async (enq: Enquiry) => {
    try {
      await estateApi.enquiries.update(enq.id, { status: "Contacted" });
      setEnquiries((prev) => prev.map((e) => (e.id === enq.id ? { ...e, status: "Contacted" } : e)));
    } catch (err) {
      console.error("Failed to update enquiry status:", err);
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

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  const stats = {
    total: enquiries.length,
    pending: enquiries.filter((e) => (e.status || "Pending") === "Pending").length,
    assigned: enquiries.filter((e) => e.status === "Assigned").length,
    contacted: enquiries.filter((e) => e.status === "Contacted").length,
    closed: enquiries.filter((e) => e.status === "Closed").length,
  };

  const tabs = ["All", "Pending", "Assigned", "Contacted", "Closed"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-estate-navy font-serif">My Enquiries</h1>
          <p className="text-sm text-estate-text-sec mt-0.5">Property enquiries assigned to you</p>
        </div>
        <button
          onClick={fetchEnquiries}
          className="inline-flex items-center gap-2 px-4 py-2 min-h-[44px] bg-estate-navy text-white rounded-xl hover:bg-estate-navy-mid transition text-sm font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, color: "bg-estate-navy text-white" },
          { label: "Pending", value: stats.pending, color: "bg-amber-50 text-amber-800 border border-amber-200" },
          { label: "Assigned", value: stats.assigned, color: "bg-purple-50 text-purple-800 border border-purple-200" },
          { label: "Contacted", value: stats.contacted, color: "bg-blue-50 text-blue-800 border border-blue-200" },
          { label: "Closed", value: stats.closed, color: "bg-gray-50 text-gray-700 border border-gray-200" },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl p-4 ${s.color}`}>
            <p className="text-xs font-semibold uppercase tracking-wider opacity-70">{s.label}</p>
            <p className="text-2xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl border border-estate-border shadow-estate p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-estate-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search enquiries..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-estate-border focus:ring-2 focus:ring-estate-navy focus:border-transparent outline-none transition text-sm"
            />
          </div>
          <div className="flex gap-1 bg-estate-bg rounded-xl p-1">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterTab(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filterTab === tab
                    ? "bg-white text-estate-navy shadow-sm border border-estate-border"
                    : "text-estate-text-sec hover:text-estate-navy"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Enquiries List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-6 h-6 animate-spin text-estate-muted" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-estate-border shadow-estate p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-estate-bg flex items-center justify-center">
            <MessageSquare className="w-7 h-7 text-estate-muted" />
          </div>
          <h3 className="text-lg font-semibold text-estate-navy mb-1">No Enquiries Yet</h3>
          <p className="text-sm text-estate-text-sec">
            {filterTab !== "All" ? `No enquiries with status "${filterTab}".` : "When an admin assigns an enquiry to you, it will appear here."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((enq) => (
            <div
              key={enq.id}
              className="bg-white rounded-2xl border border-estate-border shadow-estate p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-estate-navy/5 flex items-center justify-center shrink-0 mt-0.5">
                      <Building2 className="w-5 h-5 text-estate-navy" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-estate-navy truncate">{enq.propertyTitle}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <StatusBadge status={enq.status} />
                        <span className="text-xs text-estate-muted flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(enq.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pl-13 sm:pl-0">
                    <div className="flex items-center gap-2 text-sm text-estate-text">
                      <User className="w-3.5 h-3.5 text-estate-muted shrink-0" />
                      <span className="truncate">{enq.userName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-estate-text">
                      <Mail className="w-3.5 h-3.5 text-estate-muted shrink-0" />
                      <span className="truncate">{enq.userEmail}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-estate-text">
                      <Phone className="w-3.5 h-3.5 text-estate-muted shrink-0" />
                      <span>{enq.userPhone || "—"}</span>
                    </div>
                  </div>

                  {enq.message && (
                    <p className="text-sm text-estate-text-sec line-clamp-2 pl-13 sm:pl-0 italic">
                      &ldquo;{enq.message}&rdquo;
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {(enq.status || "Pending") === "Assigned" && (
                    <button
                      onClick={() => handleMarkContacted(enq)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition shadow-sm active:scale-[0.97]"
                      title="Mark as Contacted"
                    >
                      <CheckCheck className="w-4 h-4" />
                      Mark Contacted
                    </button>
                  )}
                  <WhatsAppButton phone={enq.userPhone} propertyTitle={enq.propertyTitle} userName={enq.userName} />
                  <button
                    onClick={() => { setSelected(enq); setDetailOpen(true); }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 border border-estate-border text-estate-text-sec text-sm font-medium rounded-xl hover:bg-estate-bg transition"
                  >
                    Details
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-xs text-estate-muted text-center pb-4">
        Showing {filtered.length} of {enquiries.length} enquiries
      </div>

      {/* Detail Modal */}
      {detailOpen && selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[95vh] overflow-y-auto">
            <div className="sticky top-0 bg-white flex justify-between items-center p-4 sm:p-6 border-b border-estate-border">
              <h2 className="text-lg sm:text-xl font-bold text-estate-navy font-serif">Enquiry Details</h2>
              <button onClick={() => setDetailOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-5">
              {/* Property Section */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-estate-navy/5 flex items-center justify-center shrink-0">
                  <Building2 className="w-6 h-6 text-estate-navy" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-estate-muted mb-0.5">Property</p>
                  <p className="font-bold text-estate-navy text-lg">{selected.propertyTitle}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <StatusBadge status={selected.status} />
                    <span className="text-xs text-estate-muted flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(selected.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div className="border-t border-estate-border pt-5">
                <p className="text-xs font-semibold text-estate-muted uppercase tracking-wider mb-3">Client Information</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <User className="w-4 h-4 text-estate-muted shrink-0" />
                    <div>
                      <p className="text-[10px] text-estate-muted uppercase tracking-wider">Name</p>
                      <p className="text-sm font-medium">{selected.userName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Mail className="w-4 h-4 text-estate-muted shrink-0" />
                    <div>
                      <p className="text-[10px] text-estate-muted uppercase tracking-wider">Email</p>
                      <p className="text-sm">{selected.userEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Phone className="w-4 h-4 text-estate-muted shrink-0" />
                    <div>
                      <p className="text-[10px] text-estate-muted uppercase tracking-wider">Phone</p>
                      <p className="text-sm">{selected.userPhone || "—"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message */}
              {selected.message && (
                <div className="border-t border-estate-border pt-5">
                  <p className="text-xs font-semibold text-estate-muted uppercase tracking-wider mb-2">Message from Client</p>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 leading-relaxed">
                    &ldquo;{selected.message}&rdquo;
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 bg-white border-t border-estate-border rounded-b-3xl p-4 sm:p-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleViewProperty(selected.propertyId)}
                className="flex items-center justify-center gap-2 flex-1 px-4 py-2.5 min-h-[44px] border border-estate-navy text-estate-navy rounded-xl hover:bg-estate-navy/5 transition text-sm font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                View Property
              </button>
              {(selected.status || "Pending") === "Assigned" && (
                <button
                  onClick={() => { handleMarkContacted(selected); setDetailOpen(false); }}
                  className="flex items-center justify-center gap-2 flex-1 px-4 py-2.5 min-h-[44px] bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition text-sm font-semibold"
                >
                  <CheckCheck className="w-4 h-4" />
                  Mark Contacted
                </button>
              )}
              <WhatsAppButton phone={selected.userPhone} propertyTitle={selected.propertyTitle} userName={selected.userName} />
              <button
                onClick={() => setDetailOpen(false)}
                className="flex-1 px-4 py-2.5 min-h-[44px] bg-estate-navy text-white rounded-xl hover:bg-estate-navy-mid transition text-sm font-medium"
              >
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
