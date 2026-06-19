"use client";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { ArrowLeftOnRectangleIcon } from "@heroicons/react/24/outline";
import { NotificationBell } from "@/components/ui/NotificationBell";

export default function SuperAdminNavbar() {
  const { email, logout } = useAuth();
  return (
    <header className="flex items-center justify-between bg-estate-navy p-4 text-white shadow-md">
      <div className="text-xl font-semibold">Manish Properties Super Admin</div>
      <div className="flex items-center space-x-4">
        <NotificationBell />
        {email && <span className="text-sm">{email}</span>}
        <button onClick={logout} className="flex items-center hover:opacity-80 transition">
          <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-1" /> Logout
        </button>
      </div>
    </header>
  );
}