/**
 * Token Utilities
 * Handles token storage, retrieval, and lifecycle management
 */

import { TOKEN_STORAGE_KEY, REFRESH_TOKEN_STORAGE_KEY, ADMIN_DATA_STORAGE_KEY } from "@/lib/api/config";

export interface AdminData {
  id: string;
  username: string;
  email?: string;
  role: string;
  name?: string;
  phone?: string;
  status?: string;
  city_id?: string;
  sub_area_id?: string;
}

const AUTH_PERSISTENCE_KEY = "estate_auth_persistence";
const ADMIN_DATA_COOKIE_KEY = "estate_admin_data";

function normalizeStoredRole(role?: string): string {
  const normalized = String(role || "USER").toUpperCase().replace("-", "_");
  return normalized === "CLIENT" ? "USER" : normalized;
}

function getBrowserStorage(kind?: "local" | "session"): Storage | null {
  if (typeof window === "undefined") return null;
  return kind === "session" ? window.sessionStorage : window.localStorage;
}

function getPreferredStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  const preference = window.localStorage.getItem(AUTH_PERSISTENCE_KEY);
  return preference === "session" ? window.sessionStorage : window.localStorage;
}

function getStoredItem(key: string): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(key) || window.sessionStorage.getItem(key);
}

function setStoredItem(key: string, value: string): void {
  const storage = getPreferredStorage();
  if (!storage) return;
  storage.setItem(key, value);
  const otherStorage = storage === window.localStorage ? window.sessionStorage : window.localStorage;
  otherStorage.removeItem(key);
}

function removeStoredItem(key: string): void {
  getBrowserStorage("local")?.removeItem(key);
  getBrowserStorage("session")?.removeItem(key);
}

/**
 * Set cookie for middleware access
 */
function setAdminDataCookie(data: AdminData): void {
  if (typeof window === "undefined") return;
  try {
    const jsonData = JSON.stringify(data);
    // Set cookie with 7 days expiry
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);
    document.cookie = `${ADMIN_DATA_COOKIE_KEY}=${encodeURIComponent(jsonData)}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
  } catch (error) {
    console.error("Failed to set admin data cookie:", error);
  }
}

/**
 * Clear admin data cookie
 */
function clearAdminDataCookie(): void {
  if (typeof window === "undefined") return;
  try {
    document.cookie = `${ADMIN_DATA_COOKIE_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  } catch (error) {
    console.error("Failed to clear admin data cookie:", error);
  }
}

export function setAuthPersistence(remember: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_PERSISTENCE_KEY, remember ? "local" : "session");
}

/**
 * Get token from storage
 * Safe for server-side rendering - checks if window exists
 */
export function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return getStoredItem(TOKEN_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to read token from localStorage:", error);
    return null;
  }
}

/**
 * Set token in storage
 */
export function setToken(token: string): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    setStoredItem(TOKEN_STORAGE_KEY, token);
  } catch (error) {
    console.error("Failed to write token to localStorage:", error);
  }
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return getStoredItem(REFRESH_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setRefreshToken(token: string): void {
  if (typeof window === "undefined") return;
  try {
    setStoredItem(REFRESH_TOKEN_STORAGE_KEY, token);
  } catch (error) {
    console.error("Failed to write refresh token to localStorage:", error);
  }
}

export function clearRefreshToken(): void {
  if (typeof window === "undefined") return;
  try {
    removeStoredItem(REFRESH_TOKEN_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear refresh token from localStorage:", error);
  }
}

/**
 * Remove token from storage
 */
export function clearToken(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    removeStoredItem(TOKEN_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear token from localStorage:", error);
  }
}

/**
 * Check if token exists
 */
export function hasToken(): boolean {
  return getToken() !== null;
}

/**
 * Get admin data from storage
 */
export function getAdminData(): AdminData | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const data = getStoredItem(ADMIN_DATA_STORAGE_KEY);
    if (!data) return null;
    const account = JSON.parse(data) as AdminData;
    return { ...account, role: normalizeStoredRole(account.role) };
  } catch (error) {
    console.error("Failed to read admin data from localStorage:", error);
    return null;
  }
}

/**
 * Set admin data in storage
 */
export function setAdminData(data: AdminData): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const normalizedData = { ...data, role: normalizeStoredRole(data.role) };
    const jsonData = JSON.stringify(normalizedData);
    
    // Store in localStorage/sessionStorage
    setStoredItem(ADMIN_DATA_STORAGE_KEY, jsonData);
    
    // Also set as cookie for middleware access
    setAdminDataCookie(normalizedData);
  } catch (error) {
    console.error("Failed to write admin data to localStorage:", error);
  }
}

/**
 * Remove admin data from storage
 */
export function clearAdminData(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    removeStoredItem(ADMIN_DATA_STORAGE_KEY);
    clearAdminDataCookie();
  } catch (error) {
    console.error("Failed to clear admin data from localStorage:", error);
  }
}

/**
 * Clear all auth data (logout)
 */
export function clearAllAuthData(): void {
  clearToken();
  clearRefreshToken();
  clearAdminData();
  if (typeof window !== "undefined") {
    localStorage.removeItem("estate_role");
    localStorage.removeItem("estate_email");
    localStorage.removeItem(AUTH_PERSISTENCE_KEY);
    sessionStorage.removeItem("estate_role");
    sessionStorage.removeItem("estate_email");
    clearAdminDataCookie();
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return hasToken();
}