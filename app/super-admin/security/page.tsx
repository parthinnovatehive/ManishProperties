"use client";

import { useState } from "react";

interface AuditLog {
  id: string;
  user: string;
  email: string;
  role: string;
  action: string;
  ip: string;
  timestamp: string;
  status: 'Success' | 'Failed' | 'Warning';
}

export default function SuperAdminSecurityPage() {
  const [logs, setLogs] = useState<AuditLog[]>([
    { id: "log1", user: "Super Admin", email: "superadmin@estateelite.com", role: "Super Admin", action: "Global configuration modified", ip: "192.168.1.1", timestamp: "03 Jun 2026 12:00 PM", status: "Success" },
    { id: "log2", user: "John Doe", email: "user@estateelite.com", role: "User", action: "User sign-in session initiated", ip: "152.12.85.96", timestamp: "03 Jun 2026 11:45 AM", status: "Success" },
    { id: "log3", user: "Unknown", email: "attacker@gmail.com", role: "Guest", action: "Invalid authentication attempt", ip: "203.45.18.23", timestamp: "03 Jun 2026 11:30 AM", status: "Failed" },
    { id: "log4", user: "Rahul Sharma", email: "agent@estateelite.com", role: "Agent", action: "Property listing added (ID: #1)", ip: "103.56.24.12", timestamp: "03 Jun 2026 10:15 AM", status: "Success" },
    { id: "log5", user: "Admin (Nisha)", email: "nisha@estateelite.com", role: "Admin", action: "User account suspended (ID: u4)", ip: "192.168.1.12", timestamp: "03 Jun 2026 09:22 AM", status: "Warning" },
  ]);

  const handleResolveAlert = (id: string) => {
    alert(`Mock Action: Incident ${id} has been flagged as resolved.`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-estate-navy font-serif">Security Audits</h1>
        <p className="text-sm text-estate-text-sec">Live connection logs, authorization checks, and system warning logs.</p>
      </div>

      <div className="bg-white rounded-3xl border border-estate-border shadow-estate overflow-hidden">
        <div className="p-6 border-b border-estate-border bg-estate-bg flex justify-between items-center">
          <span className="text-sm font-bold text-estate-navy">Security Logs Feed</span>
          <button
            onClick={() => alert("Mock Action: Exporting Security Audits CSV...")}
            className="px-4 py-2 bg-white hover:bg-estate-surface text-estate-navy border border-estate-border text-xs font-bold rounded-xl transition"
          >
            Export Logs
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-estate-border text-xs uppercase tracking-wider text-estate-muted font-bold bg-estate-bg">
                <th className="py-3 px-4">Log ID</th>
                <th className="py-3 px-4">Authorized Identity</th>
                <th className="py-3 px-4">Logged Operation</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">Time Stamp</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Audit Action</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-estate-border">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-estate-bg/40 transition">
                  <td className="py-4 px-4 font-mono font-semibold text-estate-navy">{log.id}</td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="font-bold text-estate-text">{log.user}</div>
                    <div className="text-xs text-estate-text-sec">{log.email} • {log.role}</div>
                  </td>
                  <td className="py-4 px-4">{log.action}</td>
                  <td className="py-4 px-4 font-mono text-estate-text-sec">{log.ip}</td>
                  <td className="py-4 px-4 whitespace-nowrap text-estate-text-sec">{log.timestamp}</td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      log.status === 'Success'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : log.status === 'Warning'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    {log.status === 'Failed' || log.status === 'Warning' ? (
                      <button
                        onClick={() => handleResolveAlert(log.id)}
                        className="px-3 py-1 bg-estate-navy text-white text-xs font-bold rounded-lg hover:bg-estate-navy-mid transition shadow-sm"
                      >
                        Acknowledge
                      </button>
                    ) : (
                      <span className="text-xs text-estate-muted">Audited</span>
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
