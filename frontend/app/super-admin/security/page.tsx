"use client";

import { useEffect, useState } from "react";
import { estateApi } from "@/lib/api";

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
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await estateApi.superAdmin.dashboard<any>();
      const rows = (data.messages || []).map((message: any) => ({
        id: String(message.id),
        user: message.senderName || message.userName || message.sender || "System",
        email: message.senderEmail || message.email || "",
        role: message.role || message.senderRole || "System",
        action: message.subject || message.content || "Message recorded",
        ip: message.ip || "N/A",
        timestamp: message.createdAt || message.updatedAt || "N/A",
        status: String(message.status || "Success") === "Failed" ? "Failed" : String(message.status || "").toLowerCase() === "warning" ? "Warning" : "Success",
      }));
      setLogs(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load security logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleResolveAlert = (id: string) => {
    setLogs((current) => current.map((log) => (log.id === id ? { ...log, status: "Success" } : log)));
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
            onClick={loadLogs}
            className="px-4 py-2 bg-white hover:bg-estate-surface text-estate-navy border border-estate-border text-xs font-bold rounded-xl transition"
          >
            Refresh Logs
          </button>
        </div>

        {error && (
          <div className="m-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
            <button onClick={loadLogs} className="ml-3 font-bold underline">Retry</button>
          </div>
        )}

        {loading && (
          <div className="m-4 rounded-2xl border border-estate-border bg-white p-4 text-sm font-semibold text-estate-text-sec">
            Loading security logs...
          </div>
        )}

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
              {logs.length === 0 && !loading ? (
                <tr>
                  <td colSpan={7} className="py-8 px-4 text-center text-sm font-semibold text-estate-muted">
                    No security logs are available from the API yet.
                  </td>
                </tr>
              ) : logs.map((log) => (
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
