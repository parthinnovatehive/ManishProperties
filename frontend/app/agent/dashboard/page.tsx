"use client";

import { StatsCard } from "@/components/agent/StatsCard";
import { ActivityCard, ActivityItem } from "@/components/agent/ActivityCard";
import { agentProperties } from "@/data/agent-properties";
import { agentAppointments } from "@/data/agent-appointments";
import { agentLeads } from "@/data/agent-leads";
import { Building2, Calendar, Users, Star, ArrowUpRight, TrendingUp, Clock, UserPlus } from "lucide-react";
import Link from "next/link";

export default function AgentDashboardPage() {
  // KPI Calculations
  const totalProperties = agentProperties.length;
  const activeListings = agentProperties.filter((p) => p.status === "Active").length;
  const todayStr = "2026-06-03";
  const appointmentsToday = agentAppointments.filter((a) => a.date === todayStr).length;
  const newLeads = agentLeads.filter((l) => l.status === "New").length;

  // Mock Recent Activities
  const recentActivities: ActivityItem[] = [
    {
      id: "act-1",
      type: "lead",
      title: "New Lead Assigned",
      description: "Ayesha Sen inquired about 'Elegant 3BHK Gated Residence'",
      time: "2 hours ago",
    },
    {
      id: "act-2",
      type: "inquiry",
      title: "Property Inquiry Received",
      description: "Aditya Roy requested brochure for 'Luxury Sea-View 3BHK Apartment'",
      time: "4 hours ago",
    },
    {
      id: "act-3",
      type: "appointment",
      title: "Appointment Scheduled",
      description: "Site visit with Prerna Sharma for Hinjewadi 2BHK confirmed",
      time: "5 hours ago",
    },
    {
      id: "act-4",
      type: "update",
      title: "Listing Updated",
      description: "Cozy Studio near Cyber City status updated to 'Sold'",
      time: "1 day ago",
    },
  ];

  // Lists previews
  const upcomingAppointments = agentAppointments.filter((a) => a.status !== "Completed").slice(0, 3);
  const recentLeadsList = agentLeads.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-estate-navy tracking-tight font-serif">
            Welcome back, Rahul
          </h1>
          <p className="text-sm font-semibold text-estate-text-sec mt-1">
            Here is a summary of your estate listings, appointments, and client leads.
          </p>
        </div>
        <div className="text-xs font-bold text-estate-navy bg-estate-blue-pale/80 border border-estate-border-med px-4 py-2 rounded-xl">
          Today: June 3, 2026
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          title="Total Properties"
          value={totalProperties}
          change="+8 Total"
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
          change="1 Visit Scheduled"
          icon={Calendar}
          iconColor="text-emerald-700"
          iconBg="bg-emerald-50"
        />
        <StatsCard
          title="New Leads"
          value={newLeads}
          change="+2 New"
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
              <span>Jan (1.2k)</span>
              <span>Feb (1.8k)</span>
              <span>Mar (2.4k)</span>
              <span>Apr (3.2k)</span>
              <span>May (4.5k)</span>
              <span>Jun (5.8k)</span>
            </div>
          </div>
        </div>

        {/* Lead Analytics Section (SVG Bar Chart) */}
        <div className="bg-white border border-estate-border/80 rounded-[20px] p-6 shadow-estate">
          <h3 className="font-extrabold text-lg text-estate-navy">Leads Generated</h3>
          <p className="text-xs font-semibold text-estate-text-sec mt-0.5 mb-6">Total inquiries converted</p>

          <div className="space-y-4">
            {/* Bar 1 - New */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-estate-text">New Leads</span>
                <span className="text-estate-navy">45</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: "45%" }} />
              </div>
            </div>
            {/* Bar 2 - Contacted */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-estate-text">Contacted</span>
                <span className="text-estate-navy">80</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500 rounded-full" style={{ width: "80%" }} />
              </div>
            </div>
            {/* Bar 3 - Interested */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-estate-text">Interested</span>
                <span className="text-estate-navy">62</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-estate-success rounded-full" style={{ width: "62%" }} />
              </div>
            </div>
            {/* Bar 4 - Closed */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-estate-text">Closed Contracts</span>
                <span className="text-estate-navy">35</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#123826] rounded-full" style={{ width: "35%" }} />
              </div>
            </div>
          </div>

          <div className="mt-8 p-3.5 bg-estate-amber-pale/40 border border-estate-border-med/40 rounded-xl flex items-center justify-between">
            <div className="text-left">
              <span className="text-[10px] text-estate-muted font-bold uppercase tracking-wider block">Conversion Rate</span>
              <span className="text-base font-extrabold text-estate-navy-mid mt-0.5 block">18.2%</span>
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
              {upcomingAppointments.map((appt) => (
                <div key={appt.id} className="p-3 bg-estate-surface/40 hover:bg-estate-surface/80 border border-estate-border/30 rounded-xl transition flex gap-3 items-start">
                  <div className="p-2 bg-white rounded-lg border border-estate-border shadow-sm flex flex-col items-center justify-center flex-shrink-0 min-w-[50px]">
                    <span className="text-[9px] font-bold text-estate-muted uppercase tracking-wider">
                      {appt.date.split("-")[2]}
                    </span>
                    <span className="text-xs font-extrabold text-estate-navy">
                      {new Date(appt.date).toLocaleDateString("en-IN", { month: "short" })}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-estate-text truncate">{appt.clientName}</h4>
                    <p className="text-[10px] text-estate-text-sec truncate mt-0.5">{appt.propertyName}</p>
                    <div className="flex items-center gap-1.5 mt-1.5 text-[9px] text-estate-muted font-bold">
                      <Clock className="w-3 h-3 text-estate-navy-light" />
                      <span>{appt.time}</span>
                      <span>•</span>
                      <span className="text-estate-navy-mid uppercase">{appt.type}</span>
                    </div>
                  </div>
                </div>
              ))}
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
              {recentLeadsList.map((lead) => (
                <div key={lead.id} className="p-3 bg-estate-surface/40 hover:bg-estate-surface/80 border border-estate-border/30 rounded-xl transition flex justify-between items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-estate-text truncate">{lead.clientName}</h4>
                    <p className="text-[10px] text-estate-text-sec truncate mt-0.5">{lead.propertyTitle}</p>
                    <p className="text-[10px] text-estate-navy font-bold mt-1">Budget: {lead.budget}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                      {lead.status}
                    </span>
                  </div>
                </div>
              ))}
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
