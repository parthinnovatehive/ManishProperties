// app/admin/layout.tsx
"use client";
import { ReactNode } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminNavbar from "@/components/admin/AdminNavbar";
import { useRedirectIfUnauthenticated } from "@/hooks/useRedirectIfUnauthenticated";

export default function AdminLayout({ children }: { children: ReactNode }) {
  // Protect route – only admin role can access
  useRedirectIfUnauthenticated(["admin", "super-admin"]);

  return (
    <div className="min-h-screen flex bg-estate-bg text-estate-text font-sans">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminNavbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
