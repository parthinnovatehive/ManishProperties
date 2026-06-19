"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Building2, ChevronRight, Heart, LogOut, Menu, Plus, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useSavedProperties } from "@/lib/saved-properties-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getAdminData, clearAllAuthData, type AdminData } from "@/lib/utils/token";

const links = [
  { label: "Buy", href: "/properties?status=For%20Sale" },
  { label: "Rent", href: "/properties?status=For%20Rent" },
  // { label: "New Projects", href: "/properties?new=true" },
  { label: "Commercial", href: "/properties?type=Commercial" },
  { label: "Browse all", href: "/properties" },
];

function getRoleBadgeColor(role: string): string {
  switch (role.toUpperCase()) {
    case "SUPER_ADMIN":
    case "ADMIN":
      return "bg-estate-red/10 text-estate-red border-estate-red/20";
    case "AGENT":
      return "bg-amber-50 text-amber-700 border-amber-200";
    default:
      return "bg-estate-blue-pale text-estate-blue border-estate-blue/20";
  }
}

function getDisplayName(admin: AdminData): string {
  if (admin.name) return admin.name.split(" ")[0];
  return admin.username.split("@")[0];
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { savedCount } = useSavedProperties();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [admin, setAdmin] = useState<AdminData | null>(null);

  useEffect(() => {
    // Read auth state from localStorage on mount & on route change
    setAdmin(getAdminData());
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [mobileOpen]);

  const handleSignOut = () => {
    clearAllAuthData();

    window.dispatchEvent(
      new Event("estate-auth-changed")
    );

    setAdmin(null);

    router.replace("/auth/login");
  };

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 border-b border-white/60 bg-white/90 backdrop-blur-2xl transition-all duration-300",
        scrolled
          ? "border-estate-border/80 shadow-[0_12px_34px_rgba(22,74,52,0.10)]"
          : "shadow-[0_1px_0_rgba(229,231,235,0.9)]",
      )}
    >
      <div className={cn("container-wide flex items-center justify-between transition-[height] duration-300", scrolled ? "h-16" : "h-[68px]")}>
        {/* Logo Section */}
        <Link href="/" className="flex min-w-0 items-center rounded-xl py-1.5">
          <Image
            src="/logo.png"
            alt="Manish Properties Logo"
            width={220}
            height={55}
            className="object-contain"
            priority
          />
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="rounded-xl px-3.5 py-2 text-sm font-medium text-estate-text-sec transition hover:bg-estate-bg hover:text-estate-navy"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/user/saved-properties"
            aria-label="Saved properties"
            className="relative hidden h-10 w-10 items-center justify-center rounded-[10px] border-[1.5px] border-estate-border bg-white text-estate-text-sec shadow-sm transition hover:-translate-y-px hover:border-estate-red/30 hover:text-estate-red hover:shadow-estate sm:flex"
          >
            <Heart size={17} aria-hidden="true" />
            {savedCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-[17px] w-[17px] items-center justify-center rounded-full bg-estate-red text-[10px] font-bold text-white">
                {savedCount}
              </span>
            )}
          </Link>

          {/* Auth State: Signed In vs Sign In */}
          {admin ? (
            <div className="hidden items-center gap-2 sm:flex">
              <div className="flex items-center gap-2 rounded-xl border-[1.5px] border-estate-border bg-white px-3 py-1.5 shadow-sm">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-estate-navy text-[10px] font-bold text-white">
                  {getDisplayName(admin).slice(0, 2).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-estate-navy leading-tight">
                    {getDisplayName(admin)}
                  </span>
                  <span className={cn(
                    "mt-0.5 inline-flex w-fit rounded-md border px-1.5 py-0 text-[9px] font-bold uppercase leading-[16px]",
                    getRoleBadgeColor(admin.role)
                  )}>
                    {admin.role}
                  </span>
                </div>
              </div>
              <Button
                href={
                  admin.role === "SUPER_ADMIN"
                    ? "/super-admin/dashboard"
                    : admin.role === "ADMIN"
                      ? "/admin/dashboard"
                      : admin.role === "AGENT"
                        ? "/agent/dashboard"
                        : "/user/dashboard"
                }
                variant="outline"
                size="sm"
                className="text-xs"
              >
                Dashboard
              </Button>
              <button
                onClick={handleSignOut}
                className="flex h-9 w-9 items-center justify-center rounded-[10px] border-[1.5px] border-estate-border bg-white text-estate-text-sec shadow-sm transition hover:-translate-y-px hover:border-estate-red/30 hover:text-estate-red hover:shadow-estate"
                aria-label="Sign Out"
              >
                <LogOut size={15} aria-hidden="true" />
              </button>
            </div>
          ) : (
            <Button href="/auth/login" variant="ghost" size="sm" className="hidden sm:inline-flex">
              <User size={14} aria-hidden="true" /> Sign In
            </Button>
          )}

          <Button href="/submit-property" variant="navy" size="sm" className="hidden lg:inline-flex">
            <Plus size={14} aria-hidden="true" /> Post Property
          </Button>
          <button
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
            className="flex h-11 w-11 items-center justify-center rounded-xl border-[1.5px] border-estate-border bg-white text-estate-navy shadow-sm transition hover:border-estate-navy/25 hover:shadow-estate active:scale-95 md:hidden"
            onClick={() => setMobileOpen((value) => !value)}
          >
            {mobileOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="absolute inset-x-0 top-full z-50 max-h-[calc(100vh-68px)] overflow-y-auto border-t border-estate-border/80 bg-white/95 px-6 pb-6 pt-4 shadow-[0_28px_60px_rgba(22,74,52,0.18)] backdrop-blur-2xl md:hidden">
          <div className="mb-4 grid gap-2">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="flex min-h-12 items-center justify-between rounded-xl border border-transparent px-4 text-[15px] font-semibold text-estate-text-sec transition hover:border-estate-border hover:bg-estate-bg hover:text-estate-navy active:scale-[0.99]"
                onClick={() => setMobileOpen(false)}
              >
                <span>{link.label}</span>
                <ChevronRight size={16} aria-hidden="true" className="text-estate-muted" />
              </Link>
            ))}
            <Link
              href="/properties"
              className="flex min-h-12 items-center justify-between rounded-xl border border-estate-border bg-estate-bg/80 px-4 text-[15px] font-semibold text-estate-navy"
              onClick={() => setMobileOpen(false)}
            >
              <span className="flex items-center gap-2">
                <Heart size={16} aria-hidden="true" className={savedCount > 0 ? "fill-estate-red text-estate-red" : "text-estate-text-sec"} />
                Saved Properties
              </span>
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-estate-text-sec shadow-sm">{savedCount}</span>
            </Link>
          </div>
          <div className="grid gap-2.5">
            {admin ? (
              <>
                <div className="flex items-center gap-3 rounded-xl border border-estate-border bg-estate-bg/50 px-4 py-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-estate-navy text-xs font-bold text-white">
                    {getDisplayName(admin).slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-estate-navy">{getDisplayName(admin)}</span>
                    <span className={cn(
                      "mt-0.5 inline-flex w-fit rounded-md border px-1.5 py-0 text-[9px] font-bold uppercase leading-[16px]",
                      getRoleBadgeColor(admin.role)
                    )}>
                      {admin.role}
                    </span>
                  </div>
                </div>
                <Button
                  href={
                    admin.role === "SUPER_ADMIN"
                      ? "/super-admin/dashboard"
                      : admin.role === "ADMIN"
                        ? "/admin/dashboard"
                        : admin.role === "AGENT"
                          ? "/agent/dashboard"
                          : "/"
                  }
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => setMobileOpen(false)}
                >
                  Dashboard
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  fullWidth
                  onClick={() => {
                    setMobileOpen(false);
                    handleSignOut();
                  }}
                >
                  <LogOut size={14} aria-hidden="true" /> Sign Out
                </Button>
              </>
            ) : (
              <Button href="/auth/login" variant="ghost" size="sm" fullWidth onClick={() => setMobileOpen(false)}>
                <User size={14} aria-hidden="true" /> Sign In
              </Button>
            )}
            <Button href="/submit-property" variant="navy" size="sm" fullWidth className="min-h-11 shadow-[0_14px_28px_rgba(22,74,52,0.18)]" onClick={() => setMobileOpen(false)}>
              <Plus size={14} aria-hidden="true" /> Post Property
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}