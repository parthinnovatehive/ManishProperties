// hooks/useRedirectIfUnauthenticated.ts
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, Role } from "@/lib/auth";

export const useRedirectIfUnauthenticated = (allowedRoles: Role[]) => {
  const { role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!role) {
      const redirect = encodeURIComponent(window.location.pathname + window.location.search);
      router.replace(`/auth/login?redirect=${redirect}`);
      return;
    }
    if (!allowedRoles.includes(role)) {
      router.replace("/unauthorized");
    }
  }, [role, loading, allowedRoles, router]);
};
