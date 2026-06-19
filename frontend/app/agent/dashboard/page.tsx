"use client";

import { useEffect, useState } from "react";
import { StatsCard } from "@/components/agent/StatsCard";
import { ActivityCard, ActivityItem } from "@/components/agent/ActivityCard";
import { estateApi } from "@/lib/api";
import { Building2, Calendar, Users, Star, ArrowUpRight, TrendingUp, Clock, UserPlus } from "lucide-react";
import Link from "next/link";

export default function AgentDashboardPage() {
  const [agentProperties, setAgentProperties] = useState<any[]>([]);
  const [agentAppointments, setAgentAppointments] = useState<any[]>([]);
  const [agentLeads, setAgentLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentAgentId, setCurrentAgentId] = useState<string | null>(null);
  const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "Recently";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Recently";
    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleDateString("en-IN", { month: "short" });
    const year = date.getFullYear().toString().slice(-2);
    return `${day} ${month} ${year}`;
  } catch {
    return "Recently";
  }
};

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get current agent from localStorage
      let storedUser = localStorage.getItem("userData");
      let agentId = null;

      if (!storedUser) {
        storedUser = localStorage.getItem("adminData");
      }

      if (storedUser) {
        const userData = JSON.parse(storedUser);
        agentId = userData.id;
        setCurrentAgentId(agentId);
      }

      if (!agentId) {
        setAgentProperties([]);
        setAgentAppointments([]);
        setAgentLeads([]);
        setLoading(false);
        return;
      }

      // Fetch all properties and filter by agent
      const allProperties = await estateApi.adminProperties.list();
      const myProperties = allProperties.filter(
        (p) => p.lister_id === agentId && p.lister_type === "agent"
      );
      setAgentProperties(myProperties);

      // Fetch all appointments and filter by agent
      const allAppointments = await estateApi.appointments.list<any>();
      const myAppointments = allAppointments.filter(
        (a) => a.agentId === agentId || a.agent_id === agentId
      );
      setAgentAppointments(myAppointments);

      // Fetch all leads and filter by agent
      const allLeads = await estateApi.agents.leads<any>();
      const myLeads = allLeads.filter((l) => l.agentId === agentId || l.agent_id === agentId);
      setAgentLeads(myLeads);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load agent dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // KPI Calculations
  const totalProperties = agentProperties.length;
  const activeListings = agentProperties.filter((p) => p.status === "Active" || p.status === "APPROVED").length;
  const todayStr = new Date().toISOString().slice(0, 10);
  const appointmentsToday = agentAppointments.filter((a) => a.date === todayStr).length;
  const newLeads = agentLeads.filter((l) => l.status === "New").length;
  const leadStatusCounts = agentLeads.reduce<Record<string, number>>((acc, lead) => {
    const status = String(lead.status || "New");
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  const leadTotal = Math.max(agentLeads.length, 1);
  const closedLeads = agentLeads.filter((lead) => ["Closed", "Converted", "Won"].includes(String(lead.status))).length;
  const conversionRate = agentLeads.length ? Math.round((closedLeads / agentLeads.length) * 1000) / 10 : 0;
  
  const monthBuckets = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index));
    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label: date.toLocaleDateString("en-IN", { month: "short" }),
      count: 0,
    };
  });
  agentProperties.forEach((property) => {
    const createdAt = property.createdAt ? new Date(property.createdAt) : null;
    if (!createdAt || Number.isNaN(createdAt.getTime())) return;
    const key = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, "0")}`;
    const bucket = monthBuckets.find((item) => item.key === key);
    if (bucket) bucket.count += Number(property.views || 0);
  });

  const recentActivities: ActivityItem[] = [
  ...agentLeads.map((lead) => ({
    id: `lead-${lead.id}`,
    type: "lead" as const,
    title: "Lead updated",
    description: `${lead.clientName || lead.userName || "A lead"} is marked ${lead.status || "New"}`,
    time: formatDate(lead.updatedAt || lead.createdAt),
  })),
  ...agentAppointments.map((appointment) => ({
    id: `appointment-${appointment.id}`,
    type: "appointment" as const,
    title: "Appointment scheduled",
    description: `${appointment.clientName || appointment.userName || "Client"} for ${appointment.propertyName || "a property"}`,
    time: formatDate(appointment.date || appointment.createdAt),
  })),
  ...agentProperties.map((property) => ({
    id: `property-${property.id}`,
    type: "update" as const,
    title: "Listing status",
    description: `${property.title || "Property"} is ${property.status || "pending"}`,
    time: formatDate(property.updatedAt || property.createdAt),
  })),
].slice(0, 4);

  // Lists previews
  const upcomingAppointments = agentAppointments.filter((a) => a.status !== "Completed").slice(0, 3);
  const recentLeadsList = agentLeads.slice(0, 3);

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
          Loading agent dashboard data...
        </div>
      )}
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-estate-navy tracking-tight font-serif">
            Agent Dashboard
          </h1>
          <p className="text-sm font-semibold text-estate-text-sec mt-1">
            Here is a summary of your estate listings, appointments, and client leads.
          </p>
        </div>
        <div className="text-xs font-bold text-estate-navy bg-estate-blue-pale/80 border border-estate-border-med px-4 py-2 rounded-xl">
          Today: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          title="Total Properties"
          value={totalProperties}
          change="Total"
          icon={Building2}
          iconColor="text-estate-navy"
          iconBg="bg-estate-blue-pale"
        />
        <StatsCard
          title="Active Listings"
          value={activeListings}
          change="Live"
          icon={Star}
          iconColor="text-estate-amber-dark"
          iconBg="bg-estate-amber-pale"
        />
        <StatsCard
          title="Appointments Today"
          value={appointmentsToday}
          change="Scheduled today"
          icon={Calendar}
          iconColor="text-emerald-700"
          iconBg="bg-emerald-50"
        />
        <StatsCard
          title="New Leads"
          value={newLeads}
          change="New"
          icon={Users}
          iconColor="text-blue-700"
          iconBg="bg-blue-50"
        />
      </div>

      {/* Analytics Charts Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Property Views Chart (SVG Line) */}
        <div className="bg-white border border-estate-border/80 rounded-[20px] p-6 shadow-estate lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-extrabold text-lg text-estate-navy">Monthly Property Views</h3>
              <p className="text-xs font-semibold text-estate-text-sec mt-0.5">Jan - Jun 2026 performance</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-estate-success font-bold bg-estate-success-bg px-2.5 py-1 rounded-full">
              <TrendingUp className="w-3.5 h-3.5" /> +24% MoM
            </div>
          </div>
          {/* Custom SVG Line Chart */}
          <div className="w-full h-64 relative">
            <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
              {/* Grids */}
              <line x1="0" y1="40" x2="500" y2="40" stroke="#f3f4f6" strokeWidth="1" />
              <line x1="0" y1="90" x2="500" y2="90" stroke="#f3f4f6" strokeWidth="1" />
              <line x1="0" y1="140" x2="500" y2="140" stroke="#f3f4f6" strokeWidth="1" />
              <line x1="0" y1="190" x2="500" y2="190" stroke="#164A34" strokeWidth="1.5" strokeOpacity="0.1" />

              {/* Gradient overlay */}
              <defs>
                <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#164A34" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#164A34" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Filled Path */}
              <path
                d="M 10 170 C 80 160, 100 120, 180 100 C 250 85, 280 60, 360 50 C 420 40, 460 25, 490 20 L 490 190 L 10 190 Z"
                fill="url(#chart-grad)"
              />

              {/* Smooth Spline Curve */}
              <path
                d="M 10 170 C 80 160, 100 120, 180 100 C 250 85, 280 60, 360 50 C 420 40, 460 25, 490 20"
                fill="none"
                stroke="#164A34"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Data points */}
              <circle cx="10" cy="170" r="5" fill="#164A34" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="180" cy="100" r="5" fill="#164A34" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="360" cy="50" r="5" fill="#164A34" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="490" cy="20" r="5" fill="#164A34" stroke="#ffffff" strokeWidth="1.5" />
            </svg>
            <div className="flex justify-between items-center text-[10px] font-bold text-estate-muted mt-2 px-1">
              {monthBuckets.map((bucket) => (
                <span key={bucket.key}>{bucket.label} ({bucket.count})</span>
              ))}
            </div>
          </div>
        </div>

        {/* Lead Analytics Section (SVG Bar Chart) */}
        <div className="bg-white border border-estate-border/80 rounded-[20px] p-6 shadow-estate">
          <h3 className="font-extrabold text-lg text-estate-navy">Leads Generated</h3>
          <p className="text-xs font-semibold text-estate-text-sec mt-0.5 mb-6">Total inquiries converted</p>

          <div className="space-y-4">
            {["New", "Contacted", "Interested", "Closed"].map((status) => {
              const count = leadStatusCounts[status] || 0;
              return (
                <div key={status}>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-estate-text">{status === "Closed" ? "Closed Contracts" : `${status} Leads`}</span>
                    <span className="text-estate-navy">{count}</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-estate-success rounded-full" style={{ width: `${Math.round((count / leadTotal) * 100)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 p-3.5 bg-estate-amber-pale/40 border border-estate-border-med/40 rounded-xl flex items-center justify-between">
            <div className="text-left">
              <span className="text-[10px] text-estate-muted font-bold uppercase tracking-wider block">Conversion Rate</span>
              <span className="text-base font-extrabold text-estate-navy-mid mt-0.5 block">{conversionRate}%</span>
            </div>
            <Link href="/agent/leads" className="text-xs font-bold text-estate-navy hover:underline flex items-center gap-0.5">
              Manage CRM <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Grid of lists - Appointments, Leads, Recent activities */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Upcoming appointments preview */}
        <div className="bg-white border border-estate-border/80 rounded-[20px] p-6 shadow-estate flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-base text-estate-navy">Upcoming Appointments</h3>
              <Link href="/agent/appointments" className="text-xs font-bold text-estate-navy hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-3.5">
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((appt) => (
                  <div key={appt.id} className="p-3 bg-estate-surface/40 hover:bg-estate-surface/80 border border-estate-border/30 rounded-xl transition flex gap-3 items-start">
                    <div className="p-2 bg-white rounded-lg border border-estate-border shadow-sm flex flex-col items-center justify-center flex-shrink-0 min-w-[50px]">
                      <span className="text-[9px] font-bold text-estate-muted uppercase tracking-wider">
                        {appt.date ? appt.date.split("-")[2] : appt.date?.split(" ")[0]}
                      </span>
                      <span className="text-xs font-extrabold text-estate-navy">
                        {appt.date ? (appt.date.includes("-") ? new Date(appt.date).toLocaleDateString("en-IN", { month: "short" }) : appt.date.split(" ")[1]) : "N/A"}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-estate-text truncate">{appt.clientName || appt.userName}</h4>
                      <p className="text-[10px] text-estate-text-sec truncate mt-0.5">{appt.propertyName}</p>
                      <div className="flex items-center gap-1.5 mt-1.5 text-[9px] text-estate-muted font-bold">
                        <Clock className="w-3 h-3 text-estate-navy-light" />
                        <span>{appt.time}</span>
                        <span>•</span>
                        <span className="text-estate-navy-mid uppercase">{appt.type}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-estate-muted text-center py-6">No upcoming appointments</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent leads preview */}
        <div className="bg-white border border-estate-border/80 rounded-[20px] p-6 shadow-estate flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-base text-estate-navy">Recent Inquiries</h3>
              <Link href="/agent/leads" className="text-xs font-bold text-estate-navy hover:underline">
                View CRM
              </Link>
            </div>

            <div className="space-y-3">
              {recentLeadsList.length > 0 ? (
                recentLeadsList.map((lead) => (
                  <div key={lead.id} className="p-3 bg-estate-surface/40 hover:bg-estate-surface/80 border border-estate-border/30 rounded-xl transition flex justify-between items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-estate-text truncate">{lead.clientName || lead.userName || "New Lead"}</h4>
                      <p className="text-[10px] text-estate-text-sec truncate mt-0.5">{lead.propertyTitle || lead.propertyName || "Property inquiry"}</p>
                      <p className="text-[10px] text-estate-navy font-bold mt-1">Budget: {lead.budget || "Not specified"}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                        {lead.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-estate-muted text-center py-6">No recent inquiries</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent activities feed */}
        <div className="bg-white border border-estate-border/80 rounded-[20px] p-6 shadow-estate">
          <h3 className="font-extrabold text-base text-estate-navy mb-4">Recent Activities</h3>
          <div className="space-y-1 divide-y divide-estate-border/35 -mx-4 px-2">
            {recentActivities.map((act) => (
              <ActivityCard key={act.id} activity={act} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}