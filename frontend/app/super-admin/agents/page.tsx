"use client";

import AdminAgentsPage from "../../admin/agents/page";

export default function SuperAdminAgentsPage() {
  return (
    <div>
      <div className="mb-4 bg-estate-navy text-white px-5 py-3 rounded-2xl text-xs font-semibold">
        🛡️ Super Admin Authorization Mode: Broker Performance and Contract Auditing Enabled.
      </div>
      <AdminAgentsPage />
    </div>
  );
}
