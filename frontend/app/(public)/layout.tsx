import type { Metadata } from "next";
import type { ReactNode } from "react";
import "leaflet/dist/leaflet.css";
import { SiteShell } from "@/components/layout/site-shell";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Manish Properties | Premium Real Estate",
  description: "Premium frontend-only real estate marketplace prototype built with Next.js.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <SiteShell>{children}</SiteShell>
        <Toaster
  position="top-right"
  richColors
  closeButton
/>
      </body>
    </html>
  );
}
