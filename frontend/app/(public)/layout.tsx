import type { Metadata } from "next";
import type { ReactNode } from "react";
import "leaflet/dist/leaflet.css";
import { SiteShell } from "@/components/layout/site-shell";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Manish Properties | Premium Real Estate",
  description: "Premium frontend-only real estate marketplace prototype built with Next.js.",
};

export default function PublicLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <SiteShell>{children}</SiteShell>
      <Toaster
        position="top-right"
        richColors
        closeButton
      />
    </>
  );
}
