"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Calendar,
  Building2,
  Users,
  User,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { getAdminData } from "@/lib/utils/token";

interface UserSidebarProps {
  isOpen: boolean; // mobile drawer state
  onClose: () => void; // close action
  isCollapsed: boolean; // desktop collapsed state
  setIsCollapsed: (val: boolean) => void;
}

const MENU_ITEMS = [
  { href: "/user/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/user/appointments", label: "Appointments", icon: Calendar },
  { href: "/user/saved-properties", label: "Saved Properties", icon: Building2 },
  { href: "/user/complaints", label: "Complaints", icon: Users },
  { href: "/user/profile", label: "Profile", icon: User },
];

export default function UserSidebar({ isOpen, onClose, isCollapsed, setIsCollapsed }: UserSidebarProps) {
  const pathname = usePathname() ?? "";
  const { email } = useAuth();

  // Use state to avoid SSR/client hydration mismatch (localStorage is browser-only)
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("Signed in user");
  const [initials, setInitials] = useState("UE");

  useEffect(() => {
    const account = getAdminData();
    if (account) {
      const name = account.name || account.username || "User";
      const emailVal = account.email || email || "Signed in user";
      const init = name
        .split(" ")
        .map((part: string) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "UE";
      setUserName(name);
      setUserEmail(emailVal);
      setInitials(init);
    } else if (email) {
      setUserEmail(email);
      const init = email.slice(0, 2).toUpperCase();
      setInitials(init);
    }
  }, [email]);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity duration-300"
        />
      )}

      <aside
        className={cn(
          "flex flex-col bg-[#123826] text-white shadow-estate-lg transition-all duration-300 ease-in-out",
          isCollapsed ? "w-20" : "w-64",
          // Mobile drawer behavior: overlay when open, hidden on mobile otherwise
          isOpen ? "fixed inset-0 z-50 w-64 lg:static lg:translate-x-0" : "hidden lg:block lg:static",
          // Ensure desktop sidebar stays static
          "lg:relative"
        )}
      >
        {/* Header - logo & title */}
        <div className="flex items-center justify-between h-20 px-5 border-b border-white/10 flex-shrink-0">
          <Link href="/" className="flex items-center gap-3 select-none">
            <div className="w-10 h-10 bg-estate-blue flex items-center justify-center rounded-xl shadow-md border border-white/10 flex-shrink-0">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <div
              className={cn(
                "overflow-hidden transition-all duration-300",
                isCollapsed ? "lg:w-0 lg:opacity-0" : "w-auto opacity-100"
              )}
            >
              <span className="font-extrabold text-lg text-white block tracking-tight">Manish Properties</span>
              <span className="text-[10px] text-white/50 tracking-widest font-semibold uppercase -mt-0.5 block">
                User Portal
              </span>
            </div>
          </Link>

          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="p-1 text-white/70 hover:text-white lg:hidden rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 overflow-y-auto space-y-1 scrollbar-thin">
          {MENU_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 group relative",
                  isActive
                    ? "bg-white/10 text-white font-extrabold shadow-sm border-l-4 border-estate-amber -ml-1"
                    : "text-white/70 hover:text-white hover:bg-white/5 font-semibold"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 flex-shrink-0 transition",
                    isActive ? "text-estate-amber" : "text-white/60 group-hover:text-white"
                  )}
                />
                <span
                  className={cn(
                    "transition-all duration-300 text-sm whitespace-nowrap",
                    isCollapsed ? "lg:w-0 lg:opacity-0" : "w-auto opacity-100"
                  )}
                >
                  {item.label}
                </span>
                {/* Tooltip when collapsed */}
                {isCollapsed && (
                  <span className="absolute left-20 top-1/2 -translate-y-1/2 bg-estate-navy text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md border border-estate-border-med/20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-55 hidden lg:block">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer with profile and collapse toggle */}
        <div className="p-4 border-t border-white/10 bg-black/20 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-estate-navy-light flex items-center justify-center font-extrabold text-xs text-white border border-white/15">
              {initials}
            </div>
            <div
              className={cn(
                "overflow-hidden transition-all duration-300",
                isCollapsed ? "lg:w-0 lg:opacity-0" : "w-auto opacity-100"
              )}
            >
              <span className="text-xs font-bold block text-white leading-tight">{userName}</span>
              <span className="text-[10px] text-white/40 block leading-tight truncate">{userEmail}</span>
            </div>
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 text-white/50 hover:text-white rounded-lg hover:bg-white/10 transition flex-shrink-0"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>
    </>
  );
}
