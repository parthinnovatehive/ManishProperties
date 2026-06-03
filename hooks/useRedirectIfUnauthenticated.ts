// hooks/useRedirectIfUnauthenticated.ts
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, Role } from "@/lib/auth";

export const useRedirectIfUnauthenticated = (allowedRoles: Role[]) => {
  const { role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!role || !allowedRoles.includes(role)) {
      // Determine appropriate login route
      const dest = allowedRoles.includes("super-admin")
        ? "/super-admin/login"
        : "/auth";
      router.replace(dest);
    }
  }, [role, allowedRoles, router]);
};
