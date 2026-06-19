"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { estateApi } from "@/lib/api";
import { getAdminData } from "@/lib/utils/token";
import { AlertCircle, CheckCircle, Clock, ExternalLink, MessageSquare, Plus, X } from "lucide-react";

interface Complaint {
  id: string;
  userId: string;
  propertyId?: string;
  propertyTitle?: string;
  subject: string;
  description: string;
  status: "pending" | "in_progress" | "resolved" | "rejected";
  priority?: "low" | "medium" | "high";
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | null;
  resolutionNotes?: string | null;
  actionTaken?: string | null;
}

export default function UserComplaintsPage() {
  const router = useRouter();
  const [complaintsList, setComplaintsList] = useState<Complaint[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [propertyId, setPropertyId] = useState("");
  const [propertyTitle, setPropertyTitle] = useState("");
  const [properties, setProperties] = useState<any[]>([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchComplaints();
    fetchProperties();
  }, []);

  const fetchComplaints = async () => {
    try {
      const account = getAdminData();
      if (!account?.id) return;

      const allComplaints = await estateApi.complaints.list<Complaint>();
      const userComplaints = allComplaints.filter(
        (complaint) => complaint.userId === account.id
      );
      setComplaintsList(userComplaints);
    } catch (error) {
      console.error("Error fetching complaints:", error);
    }
  };

  const fetchProperties = async () => {
    try {
      const allProperties = await estateApi.properties.list();
      setProperties(allProperties);
    } catch (error) {
      console.error("Error fetching properties:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const account = getAdminData();

    const newComplaint: any = {
      id: `comp_${Date.now()}`,
      userId: account?.id || "",
      propertyId: propertyId || null,
      propertyTitle: propertyTitle || null,
      subject,
      description,
      status: "pending",
      priority,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      resolvedAt: null,
      resolutionNotes: null,
      actionTaken: null,
    };

    try {
      const created = await estateApi.complaints.create(newComplaint);
      setComplaintsList(prev => [created, ...prev]);
      setSubject("");
      setDescription("");
      setPriority("medium");
      setPropertyId("");
      setPropertyTitle("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError("Failed to submit complaint. Please try again.");
      setTimeout(() => setError(""), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openComplaintModal = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setIsModalOpen(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case "in_progress":
        return <Clock className="w-4 h-4 text-blue-600" />;
      case "rejected":
        return <AlertCircle className="w-4 h-4 text-rose-600" />;
      default:
        return <MessageSquare className="w-4 h-4 text-amber-600" />;
    }
  };

  const getStatusStyle = (status: string) => {
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

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return "Pending Review";
      case "in_progress": return "In Progress";
      case "resolved": return "Resolved";
      case "rejected": return "Rejected";
      default: return status;
    }
  };

  const getPriorityStyle = (priority?: string) => {
    switch (priority) {
      case "high":
        return "bg-rose-100 text-rose-800";
      case "medium":
        return "bg-amber-100 text-amber-800";
      case "low":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getPriorityText = (priority?: string) => {
    switch (priority) {
      case "high": return "High";
      case "medium": return "Medium";
      case "low": return "Low";
      default: return "Not specified";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString().slice(-2);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const formatSimpleDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString().slice(-2);
    return `${day}/${month}/${year}`;
  };

  const pendingCount = complaintsList.filter(c => c.status === "pending").length;
  const inProgressCount = complaintsList.filter(c => c.status === "in_progress").length;
  const resolvedCount = complaintsList.filter(c => c.status === "resolved").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-estate-navy font-serif">Support Tickets</h1>
          <p className="text-sm text-estate-text-sec mt-1">Track and manage your support requests.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-estate-muted uppercase tracking-wider">Pending</p>
              <p className="text-3xl font-extrabold text-amber-600 mt-1">{pendingCount}</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-full">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-estate-muted uppercase tracking-wider">In Progress</p>
              <p className="text-3xl font-extrabold text-blue-600 mt-1">{inProgressCount}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-estate-muted uppercase tracking-wider">Resolved</p>
              <p className="text-3xl font-extrabold text-emerald-600 mt-1">{resolvedCount}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-full">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Ticket History */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-estate-border shadow-estate overflow-hidden">
            <div className="px-6 py-4 border-b border-estate-border bg-gray-50">
              <h2 className="text-xl font-bold text-estate-navy font-serif">Ticket History</h2>
              <p className="text-sm text-estate-text-sec">View all your support tickets and their status</p>
            </div>

            {complaintsList.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
                  <MessageSquare className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-estate-text-sec">You haven't submitted any tickets yet.</p>
                <p className="text-sm text-estate-muted mt-1">Use the form to submit your first support request.</p>
              </div>
            ) : (
              <div className="divide-y divide-estate-border">
                {complaintsList.map((complaint) => (
                  <div
                    key={complaint.id}
                    className="p-6 hover:bg-gray-50 transition cursor-pointer"
                    onClick={() => openComplaintModal(complaint)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusIcon(complaint.status)}
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusStyle(complaint.status)}`}>
                            {getStatusText(complaint.status)}
                          </span>
                          {complaint.priority && (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getPriorityStyle(complaint.priority)}`}>
                              {getPriorityText(complaint.priority)} Priority
                            </span>
                          )}
                          {/* <span className="text-xs text-estate-muted">#{complaint.id.slice(-8)}</span> */}
                        </div>

                        <h3 className="font-bold text-estate-navy text-lg mb-1">{complaint.subject}</h3>
                        <p className="text-sm text-estate-text-sec line-clamp-2 mb-2">{complaint.description}</p>

                        {complaint.propertyTitle && (
                          <div className="text-xs text-estate-muted mb-2">
                            📍 Related Property: {complaint.propertyTitle}
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-xs text-estate-muted">
                          <span>Submitted: {formatSimpleDate(complaint.createdAt)}</span>
                          {complaint.resolvedAt && (
                            <span>Resolved: {formatSimpleDate(complaint.resolvedAt)}</span>
                          )}
                        </div>

                        {complaint.resolutionNotes && complaint.status === "resolved" && (
                          <div className="mt-3 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                            <p className="text-xs font-semibold text-emerald-800 mb-1">Resolution</p>
                            <p className="text-xs text-emerald-700">{complaint.resolutionNotes}</p>
                          </div>
                        )}

                        {complaint.resolutionNotes && complaint.status === "rejected" && (
                          <div className="mt-3 p-3 bg-rose-50 rounded-lg border border-rose-100">
                            <p className="text-xs font-semibold text-rose-800 mb-1">Rejection Reason</p>
                            <p className="text-xs text-rose-700">{complaint.resolutionNotes}</p>
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        <button className="text-estate-navy text-xs font-semibold hover:underline">
                          View Details →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Complaint Details Modal */}
      {isModalOpen && selectedComplaint && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white flex justify-between items-center p-6 border-b border-estate-border">
              <div>
                <h2 className="text-xl font-bold text-estate-navy font-serif">Ticket Details</h2>
                <p className="text-xs text-estate-muted">ID: {selectedComplaint.id}</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Bar */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  {getStatusIcon(selectedComplaint.status)}
                  <div>
                    <p className="text-xs text-estate-muted">Current Status</p>
                    <p className={`font-semibold ${selectedComplaint.status === "resolved" ? "text-emerald-600" : selectedComplaint.status === "rejected" ? "text-rose-600" : "text-amber-600"}`}>
                      {getStatusText(selectedComplaint.status)}
                    </p>
                  </div>
                </div>
                {selectedComplaint.priority && (
                  <div className="text-right">
                    <p className="text-xs text-estate-muted">Priority</p>
                    <p className={`font-semibold ${getPriorityStyle(selectedComplaint.priority)}`}>
                      {getPriorityText(selectedComplaint.priority)}
                    </p>
                  </div>
                )}
              </div>

              {/* Complaint Info */}
              <div>
                <h3 className="font-bold text-estate-navy mb-2">Subject</h3>
                <p className="text-estate-text">{selectedComplaint.subject}</p>
              </div>

              <div>
                <h3 className="font-bold text-estate-navy mb-2">Description</h3>
                <p className="text-estate-text bg-gray-50 p-4 rounded-xl">{selectedComplaint.description}</p>
              </div>

              {selectedComplaint.propertyId && (
                <div>
                  <h3 className="font-bold text-estate-navy mb-2">Related Property</h3>
                  {selectedComplaint.propertyTitle && (
                    <p className="text-estate-text">{selectedComplaint.propertyTitle}</p>
                  )}
                  <p className="text-xs text-estate-muted mb-3">Property ID: {selectedComplaint.propertyId}</p>
                  <button
                    onClick={() => router.push(`/properties/${selectedComplaint.propertyId}`)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-estate-navy text-white rounded-xl hover:bg-estate-navy-mid transition text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Visit Property Page
                  </button>
                </div>
              )}

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-xs text-estate-muted">Created On</p>
                  <p className="text-sm font-medium">{formatDate(selectedComplaint.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-estate-muted">Last Updated</p>
                  <p className="text-sm font-medium">{formatDate(selectedComplaint.updatedAt)}</p>
                </div>
                {selectedComplaint.resolvedAt && (
                  <div>
                    <p className="text-xs text-estate-muted">Resolved On</p>
                    <p className="text-sm font-medium">{formatDate(selectedComplaint.resolvedAt)}</p>
                  </div>
                )}
              </div>

              {/* Resolution Notes */}
              {selectedComplaint.resolutionNotes && (
                <div className={`p-4 rounded-xl ${selectedComplaint.status === "resolved"
                    ? "bg-emerald-50 border border-emerald-200"
                    : "bg-rose-50 border border-rose-200"
                  }`}>
                  <p className="text-xs font-semibold mb-1">
                    {selectedComplaint.status === "resolved" ? "Resolution Notes" : "Rejection Reason"}
                  </p>
                  <p className="text-sm">{selectedComplaint.resolutionNotes}</p>
                  {selectedComplaint.actionTaken && (
                    <>
                      <p className="text-xs font-semibold mt-3 mb-1">Action Taken</p>
                      <p className="text-sm">{selectedComplaint.actionTaken}</p>
                    </>
                  )}
                </div>
              )}
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
    </div>
  );
}