/**
 * API Configuration
 * Centralized configuration for all API calls
 */

const rawApiBaseUrl = `${process.env.NEXT_PUBLIC_API_URL ?? ""}`;

export const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, "");

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    REFRESH: "/api/auth/refresh",
    REGISTER: "/api/auth/register",
    GOOGLE: "/api/auth/google-login",
    OTP_SEND: "/api/auth/otp/send",
    OTP_VERIFY: "/api/auth/otp/verify",
  },

  // Admin endpoints
  ADMIN: {
    DASHBOARD: "/api/admins/dashboard",
    PROPERTIES: "/api/admin/properties",
    PROPERTIES_CREATE: "/api/admin/properties/create",
  },

  // Public endpoints
  PUBLIC: {
    PROPERTIES: "/api/public/properties",
    PROPERTIES_DETAIL: (id: string) => `/api/public/properties/${id}`,
    PROPERTIES_SUBMIT: "/api/public/properties/submit",
    FEATURED_PROPERTIES: "/api/content/properties/featured",
    CITIES: "/api/content/cities",
    CATEGORIES: "/api/content/categories",
    TESTIMONIALS: "/api/content/testimonials",
  },
  USERS: "/api/users",
  AGENTS: "/api/agents",
  ADMINS: "/api/admins",
  SUPER_ADMIN: "/api/super-admin",
  APPOINTMENTS: "/api/appointments",
  COMPLAINTS: "/api/complaints",
  MESSAGES: "/api/messages",
} as const;

/**
 * Request timeout in milliseconds
 */
export const REQUEST_TIMEOUT = 30000;

/**
 * Token storage key
 */
export const TOKEN_STORAGE_KEY = "adminToken";
export const REFRESH_TOKEN_STORAGE_KEY = "refreshToken";

/**
 * Admin data storage key
 */
export const ADMIN_DATA_STORAGE_KEY = "adminData";
