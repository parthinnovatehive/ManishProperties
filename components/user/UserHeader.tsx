// components/user/UserHeader.tsx
"use client";
import { useAuth } from "@/lib/auth";
import { ArrowLeftOnRectangleIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

export default function UserHeader() {
  const { email, role, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace("/auth");
  };

  return (
    <header className="flex items-center justify-between bg-estate-navy p-4 text-white shadow-md">
      <div className="text-xl font-semibold">EstateElite User Dashboard</div>
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