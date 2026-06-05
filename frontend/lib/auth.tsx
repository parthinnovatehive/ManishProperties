"use client";

import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { authService } from "@/lib/services/auth-service";
import { clearAllAuthData, getAdminData, getToken } from "@/lib/utils/token";

export type Role = "user" | "agent" | "admin" | "super-admin" | null;

interface AuthContextProps {
  role: Role;
  email: string | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshAuth: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

function normalizeRole(role?: string | null): Role {
  const value = (role || "").toUpperCase();
  if (value === "SUPER_ADMIN") return "super-admin";
  if (value === "ADMIN") return "admin";
  if (value === "AGENT") return "agent";
  if (value === "USER") return "user";
  return null;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<Role>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshAuth = () => {
    const token = getToken();
    const account = getAdminData();
    setRole(token && account ? normalizeRole(account.role) : null);
    setEmail(token && account ? account.email || account.username : null);
    setLoading(false);
  };

  useEffect(() => {
    refreshAuth();
    const onStorage = () => refreshAuth();
    window.addEventListener("storage", onStorage);
    window.addEventListener("estate-auth-changed", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("estate-auth-changed", onStorage);
    };
  }, []);

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      clearAllAuthData();
    } finally {
      setEmail(null);
      setRole(null);
      window.dispatchEvent(new Event("estate-auth-changed"));
    }
  };

  const value = useMemo(
    () => ({ role, email, loading, logout, refreshAuth }),
    [role, email, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
