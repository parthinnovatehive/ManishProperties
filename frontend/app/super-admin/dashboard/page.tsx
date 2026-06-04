"use client";

import { useState } from "react";
import { users } from "@/data/users";
import { agents } from "@/data/agents";
import { properties } from "@/data/properties";
import { appointments } from "@/data/appointments";
import { complaints } from "@/data/complaints";
import { admins } from "@/data/admins";

export default function SuperAdminDashboard() {
  const totalUsers = users.length;
  const totalAgents = agents.length;
  const totalAdmins = admins.filter(a => a.role === 'admin').length;
  const totalProperties = properties.length;
  const totalAppointments = appointments.length;
  const openComplaints = complaints.filter(c => c.status !== 'Resolved').length;

  return (
    <div className="space-y-8">
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
          <span className="text-4xl font-extrabold text-estate-navy block mt-3">24</span>
          <span className="text-xs text-estate-success font-semibold mt-2 block">✓ All login sessions verified</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Platform Activities */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-estate-border shadow-estate p-6">
          <h2 className="text-xl font-bold text-estate-navy font-serif mb-4">Platform Activity Log</h2>
          <div className="space-y-4">
            {[
              { role: "Super Admin", action: "Authorized Global Settings modification", time: "10 mins ago", type: "system" },
              { role: "Admin (Nisha)", action: "Approved Listing ID #12 (Villa in Pune)", time: "1 hr ago", type: "moderation" },
              { role: "Agent (Rahul)", action: "Created appointment calendar with John Doe", time: "2 hrs ago", type: "booking" },
              { role: "System Guard", action: "Backed up database snapshots to AWS mock bucket", time: "Yesterday", type: "backup" }
            ].map((activity, idx) => (
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
                <span>Mock Auth Server Response</span>
                <span className="text-estate-success">15ms</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-estate-success rounded-full" style={{ width: "98%" }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-estate-text mb-1">
                <span>Storage Quota (Mock Uploads)</span>
                <span className="text-estate-navy">12% Used</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-estate-navy rounded-full" style={{ width: "12%" }}></div>
              </div>
            </div>

            <div className="p-4 bg-estate-amber-pale border border-estate-border-med rounded-2xl flex flex-col gap-1.5 mt-4">
              <span className="text-[10px] text-estate-muted font-bold uppercase tracking-wider">Cron Reminders</span>
              <span className="text-xs text-estate-text-sec">A mock task scheduler backup is configured to run daily at 00:00 UTC.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
