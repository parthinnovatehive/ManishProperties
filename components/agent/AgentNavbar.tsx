"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Menu, ChevronRight, User, Settings, LogOut, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { agentAppointments } from "@/data/agent-appointments";

interface AgentNavbarProps {
  onMenuClick: () => void; // Trigger mobile drawer open
}

export default function AgentNavbar({ onMenuClick }: AgentNavbarProps) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Derive page name from route path
  const getPageTitle = () => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length <= 1) return "Dashboard";
    const sub = segments[1];
    return sub.charAt(0).toUpperCase() + sub.slice(1);
  };

  // Mock notifications derived from pending appointments
  const pendingMeetings = agentAppointments.filter((a) => a.status === "Pending");

  return (
    <header className="h-20 bg-white/80 border-b border-estate-border/80 flex items-center justify-between px-6 sticky top-0 z-30 backdrop-blur-md">
      {/* Mobile Drawer Trigger & Breadcrumbs */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-estate-text-sec hover:text-estate-navy rounded-lg hover:bg-estate-surface/60 transition"
          title="Open Menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Path Breadcrumbs */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-estate-muted select-none">
          <span>Agent</span>
          <ChevronRight className="w-3.5 h-3.5 text-estate-muted/60" />
          <span className="text-estate-navy font-bold">{getPageTitle()}</span>
        </div>
      </div>

      {/* Right Controls - Notification & Profile */}
      <div className="flex items-center gap-4">
        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="p-2.5 text-estate-text-sec hover:text-estate-navy rounded-xl border border-estate-border/60 hover:bg-estate-surface bg-white shadow-sm transition relative"
            title="Notifications"
          >
            <Bell className="w-4.5 h-4.5" />
            {pendingMeetings.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-estate-red text-white text-[10px] font-extrabold flex items-center justify-center rounded-full shadow-sm">
                {pendingMeetings.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <>
              <div onClick={() => setShowNotifications(false)} className="fixed inset-0 z-40" />
              <div className="absolute right-0 mt-3 w-80 bg-white border border-estate-border rounded-2xl shadow-estate-lg z-50 overflow-hidden animate-fade-up">
                <div className="p-4 border-b border-estate-border flex justify-between items-center bg-estate-surface/20">
                  <span className="font-extrabold text-sm text-estate-navy">Notifications</span>
                  <span className="text-[10px] font-bold text-estate-navy-light uppercase cursor-pointer hover:underline">
                    Mark Read
                  </span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-estate-border/40">
                  {pendingMeetings.length > 0 ? (
                    pendingMeetings.map((appt) => (
                      <div
                        key={appt.id}
                        onClick={() => {
                          router.push("/agent/appointments");
                          setShowNotifications(false);
                        }}
                        className="p-3.5 hover:bg-estate-surface/40 cursor-pointer transition flex items-start gap-2.5"
                      >
                        <div className="w-2 h-2 rounded-full bg-estate-amber mt-1.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-estate-text">
                            New meeting pending: <span className="text-estate-navy">{appt.clientName}</span>
                          </p>
                          <p className="text-[10px] text-estate-text-sec mt-0.5">{appt.propertyName}</p>
                          <p className="text-[9px] text-estate-muted font-semibold mt-1">{appt.date} at {appt.time}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-xs text-estate-muted font-medium">
                      No new notifications
                    </div>
                  )}
                </div>
                <div
                  onClick={() => {
                    router.push("/agent/appointments");
                    setShowNotifications(false);
                  }}
                  className="p-3 border-t border-estate-border text-center text-xs text-estate-navy-light font-bold hover:bg-estate-surface/30 cursor-pointer block"
                >
                  View all appointments
                </div>
              </div>
            </>
          )}
        </div>

        {/* Profile Dropdown Tag */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5 p-1.5 pl-3 border border-estate-border/60 hover:bg-estate-surface bg-white shadow-sm hover:border-estate-border-med rounded-xl transition cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-estate-navy text-white flex items-center justify-center font-extrabold text-xs shadow-sm">
              RS
            </div>
            <div className="text-left hidden md:block">
              <span className="text-xs font-bold block text-estate-navy leading-none">Rahul Sharma</span>
              <span className="text-[9px] text-estate-success font-semibold flex items-center gap-0.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-estate-success animate-pulse inline-block" /> Online
              </span>
            </div>
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <>
              <div onClick={() => setShowProfileMenu(false)} className="fixed inset-0 z-40" />
              <div className="absolute right-0 mt-3 w-56 bg-white border border-estate-border rounded-2xl shadow-estate-lg z-50 overflow-hidden animate-fade-up">
                <div className="p-4 border-b border-estate-border bg-estate-surface/10">
                  <p className="text-xs font-bold text-estate-navy">Rahul Sharma</p>
                  <p className="text-[10px] text-estate-muted font-semibold truncate mt-0.5">rahul@estateelite.in</p>
                </div>
                <div className="p-2 space-y-0.5">
                  <button
                    onClick={() => {
                      router.push("/agent/profile");
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-estate-text-sec hover:text-estate-navy font-semibold hover:bg-estate-surface/40 rounded-xl transition text-left"
                  >
                    <User className="w-4 h-4 text-estate-muted" /> My Profile
                  </button>
                  <button
                    onClick={() => {
                      router.push("/agent/settings");
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-estate-text-sec hover:text-estate-navy font-semibold hover:bg-estate-surface/40 rounded-xl transition text-left"
                  >
                    <Settings className="w-4 h-4 text-estate-muted" /> Settings
                  </button>
                </div>
                <div className="p-2 border-t border-estate-border/50 bg-estate-surface/10">
                  <button
                    onClick={() => {
                      router.push("/");
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-estate-red hover:bg-estate-red-bg font-bold rounded-xl transition text-left"
                  >
                    <LogOut className="w-4 h-4 text-estate-red/70" /> Logout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
