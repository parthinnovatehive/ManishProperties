"use client";

import { useState } from "react";
import AgentSidebar from "@/components/agent/AgentSidebar";
import AgentNavbar from "@/components/agent/AgentNavbar";
import { cn } from "@/lib/utils";
import { useRedirectIfUnauthenticated } from "@/hooks/useRedirectIfUnauthenticated";

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  // Guard the agent routes
  useRedirectIfUnauthenticated(["agent"]);

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-estate-bg text-estate-text font-sans antialiased overflow-x-hidden relative flex">
      {/* Shared Sidebar Component */}
      <AgentSidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Main Panel Content Area */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out",
          isSidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
        )}
      >
        {/* Navigation Header */}
        <AgentNavbar onMenuClick={() => setMobileSidebarOpen(true)} />

        {/* Dynamic page contents with fade-up animation */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto animate-fade-up">
          {children}
        </main>
      </div>
    </div>
  );
}
