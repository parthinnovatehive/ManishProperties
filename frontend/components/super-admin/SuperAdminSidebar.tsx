"use client";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  HomeIcon,
  UsersIcon,
  ChartBarIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  DocumentChartBarIcon,
  StarIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

interface SuperAdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const navItems = [
  { href: "/super-admin/dashboard", label: "Dashboard", icon: HomeIcon },
  { href: "/super-admin/admins", label: "Manage Admins", icon: UserGroupIcon },
  { href: "/super-admin/users", label: "Manage Users", icon: UsersIcon },
  { href: "/super-admin/agents", label: "Manage Agents", icon: UsersIcon },
  { href: "/super-admin/properties", label: "Manage Properties", icon: BuildingOfficeIcon },
  { href: "/super-admin/featured-requests", label: "Featured Requests", icon: StarIcon },
  { href: "/super-admin/analytics", label: "Platform Analytics", icon: ChartBarIcon },
  { href: "/super-admin/complaints", label: "Complaints", icon: DocumentChartBarIcon },
];

export default function SuperAdminSidebar({ isOpen = false, onClose = () => {} }: SuperAdminSidebarProps) {
  const { role } = useAuth();
  const pathname = usePathname();

  // Lock body scroll on mobile when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (role !== "super-admin") return null;

  return (
    <>
      {/* Mobile backdrop overlay */}
      <div
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      />
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-estate-navy p-4 text-white border-r border-white/10 transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between mb-6 px-2">
          <div>
            <h1 className="text-2xl font-bold font-serif text-white">Manish Properties</h1>
            <p className="text-[10px] text-white/50 tracking-widest font-semibold uppercase mt-0.5">Super Admin</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-white/70 hover:text-white lg:hidden rounded-lg hover:bg-white/10 transition"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto overscroll-contain">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center px-4 py-3 rounded-xl transition",
                  isActive
                    ? "bg-white/10 text-white font-bold border-l-4 border-estate-blue-light"
                    : "text-white/70 hover:text-white hover:bg-white/5 font-medium"
                )}
              >
                <Icon className={cn("h-5 w-5 mr-3", isActive ? "text-estate-blue-light" : "text-white/60")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-2 border-t border-white/10 text-xs text-white/40 flex-shrink-0">
          Logged in as Super Admin
        </div>
      </aside>
    </>
  );
}