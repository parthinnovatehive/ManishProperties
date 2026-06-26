"use client";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Bars3Icon, ArrowLeftOnRectangleIcon } from "@heroicons/react/24/outline";
import { NotificationBell } from "@/components/ui/NotificationBell";

interface SuperAdminNavbarProps {
  onMenuClick?: () => void;
}

export default function SuperAdminNavbar({ onMenuClick = () => {} }: SuperAdminNavbarProps) {
  const { email, logout } = useAuth();
  return (
    <header className="flex items-center justify-between bg-estate-navy px-4 sm:px-6 py-3 text-white shadow-md">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition"
          title="Open Menu"
        >
          <Bars3Icon className="w-6 h-6" />
        </button>
        <div className="text-lg sm:text-xl font-semibold">Manish Properties Super Admin</div>
      </div>
      <div className="flex items-center space-x-3 sm:space-x-4">
        <NotificationBell />
        {email && <span className="text-xs sm:text-sm hidden sm:inline">{email}</span>}
        <button onClick={logout} className="flex items-center text-xs sm:text-sm hover:opacity-80 transition">
          <ArrowLeftOnRectangleIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1" /> <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}