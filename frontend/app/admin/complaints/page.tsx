"use client";

import { useState } from "react";
import { complaints as initialComplaints, Complaint } from "@/data/complaints";

export default function AdminComplaintsPage() {
  const [complaintsList, setComplaintsList] = useState<Complaint[]>(initialComplaints);

  const handleUpdateStatus = (id: string, newStatus: Complaint['status']) => {
    setComplaintsList(prev =>
      prev.map(c => (c.id === id ? { ...c, status: newStatus } : c))
    );
  };

  const getStatusStyle = (status: Complaint['status']) => {
    switch (status) {
      case 'Open':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'In Progress':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'Resolved':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityStyle = (priority: Complaint['priority']) => {
    switch (priority) {
      case 'High':
        return 'bg-rose-100 text-rose-800 font-bold';
      case 'Medium':
        return 'bg-amber-100 text-amber-800 font-semibold';
      case 'Low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const openCount = complaintsList.filter(c => c.status !== 'Resolved').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-estate-navy font-serif">User Complaints</h1>
          <p className="text-sm text-estate-text-sec">Investigate, track progress, and close user-reported support issues.</p>
        </div>
      </div>

      {/* Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate">
          <span className="text-xs font-bold text-estate-muted uppercase tracking-wider block">Total Complaints</span>
          <span className="text-3xl font-extrabold text-estate-navy block mt-2">{complaintsList.length}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate">
          <span className="text-xs font-bold text-estate-muted uppercase tracking-wider block">Open Complaints</span>
          <span className="text-3xl font-extrabold text-estate-red block mt-2">{openCount}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-estate-border shadow-estate">
          <span className="text-xs font-bold text-estate-muted uppercase tracking-wider block">Resolved Complaints</span>
          <span className="text-3xl font-extrabold text-estate-success block mt-2">
            {complaintsList.filter(c => c.status === 'Resolved').length}
          </span>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-2xl border border-estate-border shadow-estate overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-estate-border text-xs uppercase tracking-wider text-estate-muted font-bold bg-estate-bg">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Issue Details</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-estate-border">
              {complaintsList.map((comp) => (
                <tr key={comp.id} className="hover:bg-estate-bg/40 transition">
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="font-bold text-estate-text">{comp.userName}</div>
                    <div className="text-xs text-estate-text-sec">{comp.userEmail}</div>
                  </td>
                  <td className="py-4 px-4 max-w-md">
                    <div className="font-bold text-estate-navy">{comp.subject}</div>
                    <p className="text-xs text-estate-text-sec mt-1 leading-relaxed">{comp.description}</p>
                    {comp.resolutionNotes && (
                      <div className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200/50 p-2 rounded-xl mt-2 font-medium">
                        <span className="font-bold">Resolution Note:</span> {comp.resolutionNotes}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap text-estate-text-sec">{comp.date}</td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${getPriorityStyle(comp.priority)}`}>
                      {comp.priority}
                    </span>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusStyle(comp.status)}`}>
                      {comp.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    {comp.status !== 'Resolved' ? (
                      <div className="flex justify-end space-x-2">
                        {comp.status === 'Open' && (
                          <button
                            onClick={() => handleUpdateStatus(comp.id, 'In Progress')}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold rounded-lg transition"
                          >
                            In Progress
                          </button>
                        )}
                        <button
                          onClick={() => handleUpdateStatus(comp.id, 'Resolved')}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-lg transition"
                        >
                          Resolve
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-estate-muted font-medium">Closed</span>
                    )}
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
