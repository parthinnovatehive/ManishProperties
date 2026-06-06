// components/user/UserHeader.tsx
"use client";
import { useAuth } from "@/lib/auth";
import { ArrowLeftOnRectangleIcon } from "@heroicons/react/24/outline";
import { Menu } from "lucide-react";
import { useRouter } from "next/navigation";

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
        <div className="text-xl font-semibold">EstateElite User Dashboard</div>
      </div>
      <div className="flex items-center space-x-4">
        {email && <span className="text-sm">{email}</span>}
        <button
          onClick={handleLogout}
          className="flex items-center hover:opacity-80"
        >
          <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-1" />
          Logout
        </button>
      </div>
    </header>
  );
}
