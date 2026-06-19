// components/admin/AdminSidebar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { HomeIcon, UsersIcon, CogIcon, UserIcon, ClipboardDocumentListIcon, CalendarIcon, ChartBarIcon, StarIcon } from "@heroicons/react/24/outline";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: HomeIcon },
  { href: "/admin/profile", label: "Profile", icon: UserIcon },
  { href: "/admin/users", label: "Users", icon: UsersIcon },
  { href: "/admin/agents", label: "Agents", icon: UsersIcon },
  { href: "/admin/subareas", label: "Subareas", icon: ClipboardDocumentListIcon },
  { href: "/admin/properties", label: "Properties", icon: ClipboardDocumentListIcon },
  { href: "/admin/complaints", label: "Complaints", icon: ClipboardDocumentListIcon },
  { href: "/admin/appointments", label: "Appointments", icon: CalendarIcon },
  { href: "/admin/stats", label: "Stats", icon: ChartBarIcon },
  { href: "/admin/featured-requests", label: "Featured Requests", icon: StarIcon },
];

export default function AdminSidebar() {
  const { role } = useAuth();
  const pathname = usePathname();
  
  // Simple guard – render nothing if not admin (extra safety)
  if (role !== "admin") return null;

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-gradient-to-b from-estate-navy to-estate-blue bg-opacity-90 backdrop-blur-lg p-4 text-white">
      <div className="mb-8 text-2xl font-bold">Admin Panel</div>
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center p-2 rounded transition ${
                isActive
                  ? "bg-white/20 text-white font-semibold"
                  : "hover:bg-white/10"
              }`}
            >
              <Icon className={`h-5 w-5 mr-3 ${isActive ? "text-white" : "text-white/70"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}