"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Calendar,
  Users,
  MessageSquare,
  User,
  Settings,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getAdminData } from "@/lib/utils/token";
import { clearAllAuthData } from "@/lib/utils/token";
import { useRouter } from "next/navigation";

interface AgentSidebarProps {
  isOpen: boolean; // For mobile drawer state
  onClose: () => void; // Mobile drawer close action
  isCollapsed: boolean; // Desktop collapsed state
  setIsCollapsed: (val: boolean) => void;
}

const MENU_ITEMS = [
  { href: "/agent/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/agent/properties", label: "Properties", icon: Building2 },
  { href: "/agent/appointments", label: "Appointments", icon: Calendar },
  // { href: "/agent/leads", label: "Leads", icon: Users },
  { href: "/agent/profile", label: "Profile", icon: User },
  { href: "/agent/settings", label: "Settings", icon: Settings },
];


export default function AgentSidebar({ isOpen, onClose, isCollapsed, setIsCollapsed }: AgentSidebarProps) {
  const pathname = usePathname() || "";
  const account = getAdminData();
  const agentName = account?.name || account?.username || "Agent";
  const agentEmail = account?.email || account?.username || "";
  const initials = agentName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "AG";
  const router = useRouter();

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity duration-300"
        />
      )}

      {/* Main Sidebar Panel */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#123826] text-white shadow-estate-lg transition-all duration-300 ease-in-out",
          // Desktop width handling
          isCollapsed ? "lg:w-20" : "lg:w-64",
          // Mobile state handling
          isOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header - Logo / Branding */}
        <div className="flex items-center justify-between h-20 px-5 border-b border-white/10 flex-shrink-0">
          <Link href="/agent/dashboard" className="flex items-center gap-3 select-none">
            <div className="w-10 h-10 bg-estate-blue flex items-center justify-center rounded-xl shadow-md border border-white/10 flex-shrink-0">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className={cn("overflow-hidden transition-all duration-300", isCollapsed ? "lg:w-0 lg:opacity-0" : "w-auto opacity-100")}>
              <span className="font-extrabold text-lg text-white block tracking-tight">Manish Properties</span>
              <span className="text-[10px] text-white/50 tracking-widest font-semibold uppercase -mt-0.5 block">Agent Hub</span>
            </div>
          </Link>

          {/* Close buttons */}
          <button
            onClick={onClose}
            className="p-1 text-white/70 hover:text-white lg:hidden rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Section */}
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
                <Icon className={cn("w-5 h-5 flex-shrink-0 transition", isActive ? "text-estate-amber" : "text-white/60 group-hover:text-white")} />
                <span className={cn("transition-all duration-300 text-sm whitespace-nowrap", isCollapsed ? "lg:w-0 lg:opacity-0" : "w-auto opacity-100")}>
                  {item.label}
                </span>

                {/* Hover tooltip when sidebar is collapsed */}
                {isCollapsed && (
                  <span className="absolute left-20 top-1/2 -translate-y-1/2 bg-estate-navy text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md border border-estate-border-med/20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-55 hidden lg:block">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Agent profile summary */}
        <div className="p-4 border-t border-white/10 flex-shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-estate-navy-light flex items-center justify-center font-extrabold text-xs text-white flex-shrink-0 border border-white/15">
              {initials}
            </div>
            <div className={cn("overflow-hidden transition-all duration-300", isCollapsed ? "lg:w-0 lg:opacity-0" : "w-auto opacity-100")}>
              <span className="text-xs font-bold block text-white leading-tight">{agentName}</span>
              <span className="text-[10px] text-white/40 block leading-tight truncate">{agentEmail}</span>
            </div>
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 text-white/50 hover:text-white rounded-lg hover:bg-white/10 transition flex-shrink-0 ml-1"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          <button
  onClick={() => {
    clearAllAuthData();
    window.dispatchEvent(new Event("estate-auth-changed"));
    router.replace("/auth/login");
  }}
>
  Logout
</button>
        </div>
      </aside>
    </>
  );
}
