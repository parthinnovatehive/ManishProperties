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
    <header className="flex items-center justify-between bg-estate-navy px-3 sm:px-4 py-3 sm:py-4 text-white shadow-md">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onOpen}
          className="lg:hidden p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition"
          title="Open Menu"
        >
          <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <div className="text-base sm:text-xl font-semibold truncate">User Dashboard</div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <NotificationBell />
        {email && <span className="hidden sm:inline text-sm truncate max-w-[120px]">{email}</span>}
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-1 text-sm hover:opacity-80 transition px-2 py-1.5 rounded-lg hover:bg-white/10 min-h-[36px]"
        >
          <HomeIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="hidden sm:inline">Home</span>
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 text-sm hover:opacity-80 transition px-2 py-1.5 rounded-lg hover:bg-white/10 min-h-[36px]"
        >
          <ArrowLeftOnRectangleIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}