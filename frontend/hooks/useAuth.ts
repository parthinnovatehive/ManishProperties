/**
 * useAuth Hook
 * Manages authentication state and operations
 */

"use client";

import { useState, useCallback } from "react";
import { authService } from "@/lib/services/auth-service";
import { ApiError } from "@/lib/api/client";
import { getAdminData } from "@/lib/utils/token";
import { AdminData } from "@/lib/utils/token";

interface UseAuthReturn {
  admin: AdminData | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string, remember?: boolean) => Promise<boolean>;
  register: (
    email: string,
    password: string,
    role: string,
    name?: string,
    phone?: string,
    status?: string,
    city_id?: string,
    sub_area_ids?: string[] // Changed to array
  ) => Promise<boolean>;
  googleLogin: (token: string, role: string) => Promise<boolean>;
  sendOtp: (phone: string) => Promise<{ success: boolean; message: string; simulated?: boolean }>;
  verifyOtp: (phone: string, otp: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export function useAuth(): UseAuthReturn {
  const [admin, setAdmin] = useState<AdminData | null>(() => getAdminData());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(
    async (email: string, password: string, remember = true) => {
      setLoading(true);
      setError(null);

      try {
        const response = await authService.login(email, password, remember);

        if (response.success) {
          setAdmin(response.user || response.admin);
          return true;
        } else {
          setError(response.message || "Login failed");
          return false;
        }
      } catch (err) {
        const apiError = err as ApiError;
        let errorMessage = "Login failed. Please try again.";

        if (apiError.status === 401) {
          errorMessage = apiError.message || "Invalid email or password.";
        } else if (apiError.status === 403) {
          setAdmin(null);
          errorMessage = apiError.message || "Your account has been suspended. Please contact support.";
        } else if (apiError.status === 0) {
          errorMessage = "Network error. Please check your connection.";
        } else if (apiError.message) {
          errorMessage = apiError.message;
        }

        setError(errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const register = useCallback(
    async (
      email: string,
      password: string,
      role: string,
      name?: string,
      phone?: string,
      status: string = "pending",
      city_id?: string,
      sub_area_ids: string[] = [] // Changed to array with default
    ) => {
      setLoading(true);
      setError(null);

      try {
        const response = await authService.register(
          email,
          password,
          role,
          name,
          phone,
          status,
          city_id,
          sub_area_ids // Pass array
        );

        if (response.success) {
          setAdmin(response.user || response.admin);
          return true;
        } else {
          setError(response.message || "Registration failed");
          return false;
        }
      } catch (err) {
        const apiError = err as ApiError;
        let errorMessage = "Registration failed. Please try again.";

        if (apiError.status === 400) {
          errorMessage = apiError.message || "Username already exists.";
        } else if (apiError.status === 0) {
          errorMessage = "Network error. Please check your connection.";
        } else if (apiError.message) {
          errorMessage = apiError.message;
        }

        setError(errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ... rest of the code remains the same (googleLogin, sendOtp, verifyOtp, logout, clearError)

  const googleLogin = useCallback(
    async (token: string, role: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await authService.googleLogin(token, role);

        if (response.success) {
          setAdmin(response.user || response.admin);
          return true;
        } else {
          setError(response.message || "Google login failed");
          return false;
        }
      } catch (err) {
        const apiError = err as ApiError;
        let errorMessage = "Google login failed. Please try again.";

        if (apiError.status === 401) {
          errorMessage = apiError.message || "Account exists with a different role.";
        } else if (apiError.status === 403) {
          setAdmin(null);
          errorMessage = apiError.message || "Your account has been suspended. Please contact support.";
        } else if (apiError.status === 0) {
          errorMessage = "Network error. Please check your connection.";
        } else if (apiError.message) {
          errorMessage = apiError.message;
        }

        setError(errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const sendOtp = useCallback(async (phone: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.sendOtp(phone);
      return res;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Failed to send OTP");
      return { success: false, message: apiError.message || "Failed to send OTP" };
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyOtp = useCallback(async (phone: string, otp: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.verifyOtp(phone, otp);
      return res;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Failed to verify OTP");
      return { success: false, message: apiError.message || "Failed to verify OTP" };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await authService.logout();
      setAdmin(null);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Logout failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    admin,
    loading,
    error,
    login,
    register,
    googleLogin,
    sendOtp,
    verifyOtp,
    logout,
    clearError,
  };
}