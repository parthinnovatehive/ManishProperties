// app/super-admin/layout.tsx
"use client";
import { ReactNode } from "react";
import SuperAdminSidebar from "@/components/super-admin/SuperAdminSidebar";
import SuperAdminNavbar from "@/components/super-admin/SuperAdminNavbar";
import { useRedirectIfUnauthenticated } from "@/hooks/useRedirectIfUnauthenticated";

export default function SuperAdminLayout({ children }: { children: ReactNode }) {
  // Protect route – only super-admin role can access
  useRedirectIfUnauthenticated(["super-admin"]);

  return (
    <div className="min-h-screen flex bg-estate-bg text-estate-text font-sans">
      <SuperAdminSidebar />
      <div className="flex-1 flex flex-col">
        <SuperAdminNavbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
