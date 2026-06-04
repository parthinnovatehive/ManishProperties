"use client";

import { useEffect, useState } from "react";
import { estateApi } from "@/lib/api";

export default function SuperAdminReportsPage() {
  const [reportType, setReportType] = useState<"Properties" | "Users" | "Complaints">("Properties");
  const [properties, setProperties] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);

  const handleExport = (format: "CSV" | "PDF" | "Excel") => {
    if (format !== "CSV") return;
    const rows = reportType === "Properties" ? properties : reportType === "Users" ? users : complaints;
    const csv = rows.length
      ? [Object.keys(rows[0]).join(","), ...rows.map((row) => Object.values(row).map((value) => JSON.stringify(value ?? "")).join(","))].join("\n")
      : "";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${reportType.toLowerCase()}-report.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    Promise.all([
      estateApi.adminProperties.list(),
      estateApi.users.list(),
      estateApi.complaints.list(),
    ]).then(([properties, users, complaints]) => {
      setProperties(properties);
      setUsers(users);
      setComplaints(complaints);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-estate-navy font-serif">Platform Reports</h1>
          <p className="text-sm text-estate-text-sec">Extract and export audits and transactions sheets.</p>
        </div>
        <div className="flex space-x-2">
          {["Properties", "Users", "Complaints"].map((type) => (
            <button
              key={type}
              onClick={() => setReportType(type as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                reportType === type
                  ? "bg-estate-navy text-white shadow-md"
                  : "bg-white text-estate-text border border-estate-border hover:bg-estate-surface"
              }`}
            >
              {type} Report
            </button>
          ))}
        </div>
      </div>

      {/* Report View Panel */}
      <div className="bg-white rounded-3xl border border-estate-border shadow-estate overflow-hidden">
        <div className="p-6 border-b border-estate-border bg-estate-bg flex justify-between items-center">
          <h3 className="font-bold text-estate-navy text-sm uppercase tracking-wider">{reportType} Audit Sheets</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => handleExport("CSV")}
              className="px-3.5 py-1.5 bg-white hover:bg-estate-surface text-estate-navy border border-estate-border text-xs font-bold rounded-xl transition"
            >
              Export CSV
            </button>
            <button
              onClick={() => handleExport("PDF")}
              className="px-3.5 py-1.5 bg-white hover:bg-estate-surface text-estate-navy border border-estate-border text-xs font-bold rounded-xl transition"
            >
              Export PDF
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {reportType === "Properties" && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-estate-border text-xs uppercase tracking-wider text-estate-muted font-bold bg-estate-bg">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">City</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Agent</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-estate-border">
                {properties.map((p) => (
                  <tr key={p.id} className="hover:bg-estate-bg/40 transition">
                    <td className="py-4 px-4 font-semibold text-estate-navy">#{p.id}</td>
                    <td className="py-4 px-4 font-medium text-estate-text">{p.title}</td>
                    <td className="py-4 px-4 text-estate-text-sec">{p.city}</td>
                    <td className="py-4 px-4 font-bold text-estate-navy">{p.price}</td>
                    <td className="py-4 px-4 text-estate-text-sec">{p.agent?.name ?? "—"}</td>
                    <td className="py-4 px-4">
                      <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full text-xs font-semibold">
                        Verified
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === "Users" && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-estate-border text-xs uppercase tracking-wider text-estate-muted font-bold bg-estate-bg">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-estate-border">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-estate-bg/40 transition">
                    <td className="py-4 px-4 font-semibold text-estate-navy">{u.id}</td>
                    <td className="py-4 px-4 font-medium text-estate-text">{u.name}</td>
                    <td className="py-4 px-4 text-estate-text-sec">{u.email}</td>
                    <td className="py-4 px-4 text-estate-text-sec">{u.phone}</td>
                    <td className="py-4 px-4 capitalize font-semibold text-estate-navy">{u.role}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        u.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === "Complaints" && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-estate-border text-xs uppercase tracking-wider text-estate-muted font-bold bg-estate-bg">
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-estate-border">
                {complaints.map((c) => (
                  <tr key={c.id} className="hover:bg-estate-bg/40 transition">
                    <td className="py-4 px-4 font-mono font-semibold text-estate-navy">{c.id.substring(0, 8)}</td>
                    <td className="py-4 px-4 font-medium text-estate-text">{c.userName}</td>
                    <td className="py-4 px-4 text-estate-text-sec line-clamp-1">{c.subject}</td>
                    <td className="py-4 px-4 capitalize text-estate-text-sec font-semibold">{c.priority}</td>
                    <td className="py-4 px-4 text-estate-text-sec">{c.date}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        c.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
