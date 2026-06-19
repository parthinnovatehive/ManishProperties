// components/super-admin/SuperAdminSidebar.tsx
"use client";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  UsersIcon,
  CogIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  DocumentChartBarIcon,
  StarIcon
} from "@heroicons/react/24/outline";

const navItems = [
  { href: "/super-admin/dashboard", label: "Dashboard", icon: HomeIcon },
  { href: "/super-admin/admins", label: "Manage Admins", icon: UserGroupIcon },
  { href: "/super-admin/users", label: "Manage Users", icon: UsersIcon },
  { href: "/super-admin/agents", label: "Manage Agents", icon: UsersIcon },
  { href: "/super-admin/properties", label: "Manage Properties", icon: BuildingOfficeIcon },
  { href: "/super-admin/featured-requests", label: "Featured Requests", icon: StarIcon },
  { href: "/super-admin/analytics", label: "Platform Analytics", icon: ChartBarIcon },
  // { href: "/super-admin/security", label: "Security Logs", icon: ShieldCheckIcon },
  { href: "/super-admin/complaints", label: "Complaints", icon: DocumentChartBarIcon },
  // { href: "/super-admin/settings", label: "Global Settings", icon: CogIcon },
];

export default function SuperAdminSidebar() {
  const { role } = useAuth();
  const pathname = usePathname();

  if (role !== "super-admin") return null;

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-estate-navy p-4 text-white border-r border-white/10">
      <div className="mb-8 px-2">
        <h1 className="text-2xl font-bold font-serif text-white">Manish Properties</h1>
        <p className="text-[10px] text-white/50 tracking-widest font-semibold uppercase mt-0.5">Super Admin</p>
      </div>
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-3 rounded-xl transition ${
                isActive
                  ? "bg-white/10 text-white font-bold border-l-4 border-estate-blue-light"
                  : "text-white/70 hover:text-white hover:bg-white/5 font-medium"
              }`}
            >
              <Icon className={`h-5 w-5 mr-3 ${isActive ? "text-estate-blue-light" : "text-white/60"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-2 border-t border-white/10 text-xs text-white/40">
        Logged in as Super Admin
      </div>
    </aside>
  );
}