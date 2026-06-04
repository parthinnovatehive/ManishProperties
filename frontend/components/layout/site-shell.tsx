"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { SavedPropertiesProvider } from "@/lib/saved-properties-context";
import { Footer } from "./footer";
import { Navbar } from "./navbar";
import { ToastContainer } from "../ui/toast";

export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hideFooter = pathname?.startsWith("/auth");

  return (
    <SavedPropertiesProvider>
      <div className="min-h-screen bg-estate-bg">
        <Navbar />
        <main className="animate-fade-up">{children}</main>
        {!hideFooter && <Footer />}
        <ToastContainer />
      </div>
    </SavedPropertiesProvider>
  );
}
