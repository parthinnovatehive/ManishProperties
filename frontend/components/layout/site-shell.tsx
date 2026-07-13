"use client";

import type { ReactNode } from "react";
import Link from "next/link";
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

        {pathname === "/" && (
          <Link
            href="/submit-property"
            aria-label="Post Property"
            className="fixed bottom-6 right-6 z-50 flex h-12 items-center gap-2 rounded-full bg-estate-navy px-5 text-sm font-semibold text-white shadow-lg transition duration-300 hover:-translate-y-0.5 hover:bg-estate-navy-mid hover:shadow-estate-md md:hidden"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
            Post Property
          </Link>
        )}

        <ToastContainer />
      </div>
    </SavedPropertiesProvider>
  );
}
