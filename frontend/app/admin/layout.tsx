"use client";
import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminNavbar from "@/components/admin/AdminNavbar";
import { useRedirectIfUnauthenticated } from "@/hooks/useRedirectIfUnauthenticated";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/profile", label: "Profile" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/agents", label: "Agents" },
  { href: "/admin/subareas", label: "Subareas" },
  { href: "/admin/properties", label: "Properties" },
  { href: "/admin/complaints", label: "Complaints" },
  { href: "/admin/appointments", label: "Appointments" },
  { href: "/admin/stats", label: "Stats" },
  { href: "/admin/featured-requests", label: "Featured Requests" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  useRedirectIfUnauthenticated(["admin", "super-admin"]);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex bg-estate-bg text-estate-text font-sans">
      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/30" onClick={() => setMobileSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-72 bg-gradient-to-b from-estate-navy to-estate-blue p-4 text-white overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xl font-bold">Admin Panel</span>
              <button onClick={() => setMobileSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={`flex items-center p-2.5 rounded-lg transition text-sm ${
                      isActive ? "bg-white/20 text-white font-semibold" : "text-white/80 hover:bg-white/10"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminNavbar onMenuClick={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
