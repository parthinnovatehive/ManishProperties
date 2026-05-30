/**
 * API Configuration
 * Centralized configuration for all API calls
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: "/api/admin/login",
    LOGOUT: "/api/admin/logout",
    REGISTER: "/api/admin/register",
    GOOGLE: "/api/admin/google-login",
    OTP_SEND: "/api/admin/otp/send",
    OTP_VERIFY: "/api/admin/otp/verify",
  },

  // Admin endpoints
  ADMIN: {
    DASHBOARD: "/api/admin/dashboard",
    PROPERTIES: "/api/admin/properties",
    PROPERTIES_CREATE: "/api/admin/properties/create",
  },

  // Public endpoints
  PUBLIC: {
    PROPERTIES: "/api/public/properties",
    PROPERTIES_DETAIL: (id: string) => `/api/public/properties/${id}`,
    PROPERTIES_SUBMIT: "/api/public/properties/submit",
  },
} as const;

/**
 * Request timeout in milliseconds
 */
export const REQUEST_TIMEOUT = 30000;

/**
 * Token storage key
 */
export const TOKEN_STORAGE_KEY = "adminToken";

/**
 * Admin data storage key
 */
export const ADMIN_DATA_STORAGE_KEY = "adminData";
