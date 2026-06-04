"use client";

import { useEffect, useState } from "react";
import { estateApi } from "@/lib/api";

export default function SuperAdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await estateApi.superAdmin.dashboard<any>();
      setUsers(data.users || []);
      setAgents(data.agents || []);
      setProperties(data.properties || []);
      setAppointments(data.appointments || []);
      setComplaints(data.complaints || []);
      setAdmins(data.admins || []);
      setMessages(data.messages || []);
      setSettings(data.settings || {});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load super admin dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const totalUsers = users.length;
  const totalAgents = agents.length;
  const totalAdmins = admins.filter(a => String(a.role).toUpperCase() === 'ADMIN').length;
  const totalProperties = properties.length;
  const totalAppointments = appointments.length;
  const openComplaints = complaints.filter(c => c.status !== 'Resolved').length;
  const securityEvents = messages.filter(message => String(message.type || message.category || "").toLowerCase().includes("security")).length;
  const platformActivities = [
    ...properties.map((property) => ({
      role: "Property",
      action: `${property.title || "Listing"} is ${property.status || "pending"}`,
      time: property.updatedAt || property.createdAt || "Recently",
    })),
    ...appointments.map((appointment) => ({
      role: "Appointment",
      action: `${appointment.clientName || appointment.userName || "Client"} scheduled ${appointment.propertyName || "a visit"}`,
      time: appointment.date || appointment.createdAt || "Recently",
    })),
    ...complaints.map((complaint) => ({
      role: "Complaint",
      action: `${complaint.title || complaint.subject || "Complaint"} is ${complaint.status || "open"}`,
      time: complaint.updatedAt || complaint.createdAt || "Recently",
    })),
    ...messages.map((message) => ({
      role: "Message",
      action: message.subject || message.content || "Message recorded",
      time: message.createdAt || "Recently",
    })),
  ].slice(0, 4);
  const visibleActivities = platformActivities.length
    ? platformActivities
    : [{ role: "System", action: "No platform activity recorded yet", time: "Current" }];

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
          <button onClick={loadDashboard} className="ml-3 font-bold underline">Retry</button>
        </div>
      )}
      {loading && (
        <div className="rounded-2xl border border-estate-border bg-white p-4 text-sm font-semibold text-estate-text-sec">
          Loading platform data...
        </div>
      )}
      {/* Welcome & System Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-gradient-to-r from-estate-navy to-estate-navy-mid rounded-3xl text-white shadow-estate-md">
        <div>
          <h1 className="text-3xl font-bold font-serif">Super Admin Dashboard</h1>
          <p className="text-white/80 text-sm mt-1">Platform Control Tower. Manage system performance, audit logs, and administrators.</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-2.5 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10">
          <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping"></span>
          <span className="text-xs font-bold uppercase tracking-wider">System: Healthy</span>
        </div>
      </div>

      {/* Grid of Stats Cards with glassmorphism & subtle gradients */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-gradient-to-br from-white to-estate-bg border border-estate-border rounded-2xl shadow-estate hover:shadow-estate-md transition duration-300 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-5 text-estate-navy font-serif text-9xl select-none font-bold">U</div>
          <span className="text-xs font-bold text-estate-muted uppercase tracking-wider">Total Members</span>
          <span className="text-4xl font-extrabold text-estate-navy block mt-3">{totalUsers + totalAgents + totalAdmins}</span>
          <span className="text-xs text-estate-success font-semibold mt-2 block">✓ {totalUsers} Users • {totalAgents} Agents</span>
        </div>

        <div className="p-6 bg-gradient-to-br from-white to-estate-bg border border-estate-border rounded-2xl shadow-estate hover:shadow-estate-md transition duration-300 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-5 text-estate-navy font-serif text-9xl select-none font-bold">P</div>
          <span className="text-xs font-bold text-estate-muted uppercase tracking-wider">Property Listings</span>
          <span className="text-4xl font-extrabold text-estate-navy block mt-3">{totalProperties}</span>
          <span className="text-xs text-estate-success font-semibold mt-2 block">✓ {properties.filter(p => p.verified).length} Verified Listings</span>
        </div>

        <div className="p-6 bg-gradient-to-br from-white to-estate-bg border border-estate-border rounded-2xl shadow-estate hover:shadow-estate-md transition duration-300 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-5 text-estate-navy font-serif text-9xl select-none font-bold">A</div>
          <span className="text-xs font-bold text-estate-muted uppercase tracking-wider">Appointments</span>
          <span className="text-4xl font-extrabold text-estate-navy block mt-3">{totalAppointments}</span>
          <span className="text-xs text-estate-success font-semibold mt-2 block">✓ {appointments.filter(a => a.status === 'Confirmed').length} Confirmed Tours</span>
        </div>

        <div className="p-6 bg-gradient-to-br from-white to-estate-bg border border-estate-border rounded-2xl shadow-estate hover:shadow-estate-md transition duration-300 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-5 text-estate-navy font-serif text-9xl select-none font-bold">C</div>
          <span className="text-xs font-bold text-estate-muted uppercase tracking-wider">Open Complaints</span>
          <span className="text-4xl font-extrabold text-estate-red block mt-3">{openComplaints}</span>
          <span className="text-xs text-estate-red font-semibold mt-2 block">⚠️ Requires resolution attention</span>
        </div>

        <div className="p-6 bg-gradient-to-br from-white to-estate-bg border border-estate-border rounded-2xl shadow-estate hover:shadow-estate-md transition duration-300 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-5 text-estate-navy font-serif text-9xl select-none font-bold">M</div>
          <span className="text-xs font-bold text-estate-muted uppercase tracking-wider">Active Administrators</span>
          <span className="text-4xl font-extrabold text-estate-navy block mt-3">{totalAdmins}</span>
          <span className="text-xs text-estate-success font-semibold mt-2 block">✓ Delegated moderators active</span>
        </div>

        <div className="p-6 bg-gradient-to-br from-white to-estate-bg border border-estate-border rounded-2xl shadow-estate hover:shadow-estate-md transition duration-300 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-5 text-estate-navy font-serif text-9xl select-none font-bold">S</div>
          <span className="text-xs font-bold text-estate-muted uppercase tracking-wider">Security Events Logged</span>
          <span className="text-4xl font-extrabold text-estate-navy block mt-3">{securityEvents}</span>
          <span className="text-xs text-estate-success font-semibold mt-2 block">Messages tagged as security</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Platform Activities */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-estate-border shadow-estate p-6">
          <h2 className="text-xl font-bold text-estate-navy font-serif mb-4">Platform Activity Log</h2>
          <div className="space-y-4">
            {visibleActivities.map((activity, idx) => (
              <div key={idx} className="p-4 bg-estate-bg/40 border border-estate-border/50 rounded-2xl hover:bg-estate-bg/80 transition flex items-start gap-4">
                <div className="w-10 h-10 bg-estate-navy-light text-white font-bold rounded-xl flex items-center justify-center text-xs shrink-0">
                  {activity.role[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-estate-text">{activity.role}</div>
                  <div className="text-xs text-estate-text-sec mt-0.5">{activity.action}</div>
                  <span className="text-[10px] text-estate-muted font-medium mt-2 block">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Health Monitoring */}
        <div className="bg-white rounded-3xl border border-estate-border shadow-estate p-6">
          <h2 className="text-xl font-bold text-estate-navy font-serif mb-4">Platform Status</h2>
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-xs font-bold text-estate-text mb-1">
                <span>Frontend Load Latency</span>
                <span className="text-estate-success">0.2s</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-estate-success rounded-full" style={{ width: "95%" }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-estate-text mb-1">
                <span>Authenticated API Modules</span>
                <span className="text-estate-success">Active</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-estate-success rounded-full" style={{ width: "98%" }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-estate-text mb-1">
                <span>JSON Collections Loaded</span>
                <span className="text-estate-navy">7</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-estate-navy rounded-full" style={{ width: `${Math.min(100, totalUsers + totalAgents + totalAdmins + totalProperties)}%` }}></div>
              </div>
            </div>

            <div className="p-4 bg-estate-amber-pale border border-estate-border-med rounded-2xl flex flex-col gap-1.5 mt-4">
              <span className="text-[10px] text-estate-muted font-bold uppercase tracking-wider">Configured Storage</span>
              <span className="text-xs text-estate-text-sec">{settings.storage || "JSON database files"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
