"use client";

import { useState } from "react";
import { complaints as initialComplaints, Complaint } from "@/data/complaints";

export default function UserComplaintsPage() {
  const [complaintsList, setComplaintsList] = useState<Complaint[]>(
    initialComplaints.filter(c => c.userId === "u1")
  );
  
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newComplaint: Complaint = {
      id: `comp-${Date.now()}`,
      userId: "u1",
      userName: "John Doe",
      userEmail: "user@estateelite.com",
      subject,
      description,
      status: "Open",
      priority,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    };

    setComplaintsList(prev => [newComplaint, ...prev]);
    setSubject("");
    setDescription("");
    setPriority("Medium");
    setSuccess(true);

    setTimeout(() => setSuccess(false), 4000);
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
        return 'text-estate-red font-semibold';
      case 'Medium':
        return 'text-amber-700 font-medium';
      case 'Low':
        return 'text-gray-500';
      default:
        return '';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* File a Complaint */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl border border-estate-border shadow-estate p-6">
          <h2 className="text-xl font-bold text-estate-navy font-serif mb-4">File a Complaint</h2>
          <p className="text-sm text-estate-text-sec mb-6">Encountered an issue? Submit a ticket and our team will get back to you shortly.</p>

          {success && (
            <div className="p-4 mb-4 bg-estate-success-bg border border-estate-success/30 rounded-xl text-estate-success text-sm font-medium animate-fade-up">
              ✓ Ticket submitted successfully!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-estate-text mb-2">Subject / Title</label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="e.g. Listing page pricing error"
                className="w-full px-4 py-2.5 rounded-xl border border-estate-border focus:ring-2 focus:ring-estate-navy focus:border-transparent outline-none transition text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-estate-text mb-2">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl border border-estate-border focus:ring-2 focus:ring-estate-navy focus:border-transparent outline-none transition text-sm bg-white"
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-estate-text mb-2">Detailed Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe the issue in detail..."
                rows={4}
                className="w-full px-4 py-2.5 rounded-xl border border-estate-border focus:ring-2 focus:ring-estate-navy focus:border-transparent outline-none transition text-sm"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-estate-navy hover:bg-estate-navy-mid text-white font-semibold rounded-xl transition shadow-md"
            >
              Submit Ticket
            </button>
          </form>
        </div>
      </div>

      {/* History */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-2xl border border-estate-border shadow-estate p-6">
          <h2 className="text-xl font-bold text-estate-navy font-serif mb-4">Ticket History</h2>
          
          {complaintsList.length === 0 ? (
            <p className="text-sm text-estate-muted py-6">You have no reported complaints.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-estate-border text-xs uppercase tracking-wider text-estate-muted font-bold bg-estate-bg">
                    <th className="py-3 px-4">Ticket ID</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-estate-border">
                  {complaintsList.map((comp) => (
                    <tr key={comp.id} className="hover:bg-estate-bg/40 transition">
                      <td className="py-4 px-4 font-mono font-semibold text-estate-navy">{comp.id.substring(0, 8)}</td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-estate-text">{comp.subject}</div>
                        <div className="text-xs text-estate-text-sec line-clamp-1 mt-0.5">{comp.description}</div>
                        {comp.resolutionNotes && (
                          <div className="text-xs text-estate-success bg-estate-success-bg p-2 rounded-lg border border-estate-success/10 mt-2">
                            <span className="font-semibold">Resolution:</span> {comp.resolutionNotes}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-estate-text-sec">{comp.date}</td>
                      <td className={`py-4 px-4 whitespace-nowrap ${getPriorityStyle(comp.priority)}`}>{comp.priority}</td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusStyle(comp.status)}`}>
                          {comp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}