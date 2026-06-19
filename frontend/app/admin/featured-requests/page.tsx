"use client";

import SuperAdminFeaturedRequestsPage from "../../super-admin/featured-requests/page";

export default function AdminFeaturedRequestsPage() {
  return (
    <div>
      <div className="mb-4 bg-estate-navy text-white px-5 py-3 rounded-2xl text-xs font-semibold">
        🛡️ Admin Authorization Mode: Manage featured property requests for your city.
      </div>
      <SuperAdminFeaturedRequestsPage />
    </div>
  );
}