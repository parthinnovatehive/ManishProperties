// components/admin/AdminNavbar.tsx
"use client";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { ArrowLeftOnRectangleIcon } from "@heroicons/react/24/outline";
import { NotificationBell } from "@/components/ui/NotificationBell";

export default function AdminNavbar() {
  const { email, logout } = useAuth();
  return (
    <header className="flex items-center justify-between bg-estate-navy p-4 text-white shadow-md">
      <div className="text-xl font-semibold">Manish Properties Admin</div>
      <div className="flex items-center space-x-4">
        <NotificationBell />
        {email && <span>{email}</span>}
        <button onClick={logout} className="flex items-center hover:opacity-80">
          <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-1" /> Logout
        </button>
      </div>
    </header>
  );
}
