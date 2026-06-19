"use client";
import { useAuth } from "@/lib/auth";
import { ArrowLeftOnRectangleIcon, HomeIcon } from "@heroicons/react/24/outline";
import { Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { NotificationBell } from "@/components/ui/NotificationBell";

interface UserHeaderProps {
  onOpen: () => void;
}

export default function UserHeader({ onOpen }: UserHeaderProps) {
  const { email, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace("/auth/login");
  };

  return (
    <header className="flex items-center justify-between bg-estate-navy p-4 text-white shadow-md">
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpen}
          className="lg:hidden p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition"
          title="Open Menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="text-xl font-semibold">User Dashboard</div>
      </div>
      <div className="flex items-center space-x-4">
        <NotificationBell />
        {email && <span className="text-sm">{email}</span>}
        <button
          onClick={() => router.push("/")}
          className="flex items-center hover:opacity-80 transition"
        >
          <HomeIcon className="h-5 w-5 mr-1" />
          Home
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center hover:opacity-80 transition"
        >
          <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-1" />
          Logout
        </button>
      </div>
    </header>
  );
}