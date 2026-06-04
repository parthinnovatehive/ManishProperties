"use client";

import AdminUsersPage from "../../admin/users/page";

export default function SuperAdminUsersPage() {
  return (
    <div>
      <div className="mb-4 bg-estate-navy text-white px-5 py-3 rounded-2xl text-xs font-semibold">
        🛡️ Super Admin Authorization Mode: Advanced Account Suspension Permissions Enabled.
      </div>
      <AdminUsersPage />
    </div>
  );
}
