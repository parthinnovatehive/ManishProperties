"use client";

import UserSidebar from "@/components/user/UserSidebar";
import UserHeader from "@/components/user/UserHeader";
import { useRedirectIfUnauthenticated } from "@/hooks/useRedirectIfUnauthenticated";
import { useState } from "react";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Guard the user routes
  useRedirectIfUnauthenticated(["user", "super-admin"]);

  // Sidebar state
  const [isOpen, setIsOpen] = useState(false); // mobile drawer state
  const [isCollapsed, setIsCollapsed] = useState(false); // desktop collapsed state

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      <UserSidebar
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <UserHeader onOpen={() => setIsOpen(true)} />

        <main className="p-6 flex-1 overflow-y-auto transition-all duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}
