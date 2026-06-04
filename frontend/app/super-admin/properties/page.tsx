"use client";

import AdminPropertiesPage from "../../admin/properties/page";

export default function SuperAdminPropertiesPage() {
  return (
    <div>
      <div className="mb-4 bg-estate-navy text-white px-5 py-3 rounded-2xl text-xs font-semibold">
        🛡️ Super Admin Authorization Mode: Advanced Moderation and Bulk Listing Controls.
      </div>
      <AdminPropertiesPage />
    </div>
  );
}
