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
      router.replace("/auth/login");
      return;
    }
    if (!allowedRoles.includes(role)) {
      router.replace("/unauthorized");
    }
  }, [role, loading, allowedRoles, router]);
};
