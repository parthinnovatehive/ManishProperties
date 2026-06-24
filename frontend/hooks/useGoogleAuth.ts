"use client";

import { useState, useCallback } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/services/auth-service";
import { getAdminData } from "@/lib/utils/token";

interface GoogleUserInfo {
  email: string;
  name: string;
}

const redirectByRole: Record<string, string> = {
  USER: "/",
  AGENT: "/agent/dashboard",
  ADMIN: "/admin/dashboard",
  SUPER_ADMIN: "/super-admin/dashboard",
};

export function useGoogleAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleUser, setGoogleUser] = useState<GoogleUserInfo | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [requiresRegistration, setRequiresRegistration] = useState(false);
  const router = useRouter();

  const handleGoogleSuccess = useCallback(
    async (tokenResponse: { access_token: string }) => {
      setLoading(true);
      setError(null);

      const token = tokenResponse.access_token;

      try {
        const response = await authService.googleLogin(token, "USER");

        if (response.success) {
          if (response.requiresRegistration) {
            const info = response.googleUser;
            if (info) {
              setGoogleUser(info);
              setAccessToken(token);
              setRequiresRegistration(true);
            }
          } else {
            const account = getAdminData();
            const role = String(account?.role || "USER")
              .toUpperCase()
              .replace("-", "_");
            router.replace(redirectByRole[role] || "/");
          }
        } else {
          setError(response.message || "Google authentication failed");
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Google authentication failed";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  const signIn = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => setError("Google sign-in popup failed"),
    flow: "implicit",
  });

  const googleLogin = useCallback(() => {
    setRequiresRegistration(false);
    setGoogleUser(null);
    setAccessToken(null);
    setError(null);
    signIn();
  }, [signIn]);

  const googleRegister = useCallback(
    async (
      name: string,
      phone: string,
      role: string,
      city_id?: string,
      sub_area_ids?: string[]
    ): Promise<boolean> => {
      if (!accessToken || !googleUser?.email) {
        setError("Google session expired. Please try again.");
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await authService.googleRegister(
          accessToken,
          name,
          googleUser.email,
          phone,
          role,
          city_id,
          sub_area_ids
        );

        if (response.success) {
          const account = getAdminData();
          const storedRole = String(account?.role || "USER")
            .toUpperCase()
            .replace("-", "_");
          router.replace(redirectByRole[storedRole] || "/");
          return true;
        } else {
          setError(response.message || "Registration failed");
          return false;
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Registration failed";
        setError(message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [accessToken, googleUser, router]
  );

  const clearError = useCallback(() => setError(null), []);

  const reset = useCallback(() => {
    setGoogleUser(null);
    setAccessToken(null);
    setRequiresRegistration(false);
    setError(null);
  }, []);

  return {
    googleLogin,
    googleRegister,
    loading,
    error,
    googleUser,
    accessToken,
    requiresRegistration,
    clearError,
    reset,
  };
}
