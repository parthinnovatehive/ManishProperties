"use client";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Menu } from "lucide-react";
import { NotificationBell } from "@/components/ui/NotificationBell";

export default function AdminNavbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { email, logout } = useAuth();
  return (
    <header className="flex items-center justify-between bg-estate-navy px-3 sm:px-4 py-3 sm:py-4 text-white shadow-md">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="text-base sm:text-xl font-semibold">Manish Properties Admin</div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <NotificationBell />
        {email && <span className="hidden sm:inline text-sm truncate max-w-[120px]">{email}</span>}
        <button onClick={logout} className="flex items-center gap-1 text-sm hover:opacity-80 transition px-2 py-1.5 rounded-lg hover:bg-white/10 min-h-[36px]">
          <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
