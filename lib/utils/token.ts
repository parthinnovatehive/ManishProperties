/**
 * Token Utilities
 * Handles token storage, retrieval, and lifecycle management
 */

import { TOKEN_STORAGE_KEY, ADMIN_DATA_STORAGE_KEY } from "@/lib/api/config";

export interface AdminData {
  id: string;
  username: string;
  role: string;
  name?: string;
  phone?: string;
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
    return localStorage.getItem(TOKEN_STORAGE_KEY);
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
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch (error) {
    console.error("Failed to write token to localStorage:", error);
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
    localStorage.removeItem(TOKEN_STORAGE_KEY);
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
    const data = localStorage.getItem(ADMIN_DATA_STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data) as AdminData;
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
    localStorage.setItem(ADMIN_DATA_STORAGE_KEY, JSON.stringify(data));
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
    localStorage.removeItem(ADMIN_DATA_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear admin data from localStorage:", error);
  }
}

/**
 * Clear all auth data (logout)
 */
export function clearAllAuthData(): void {
  clearToken();
  clearAdminData();
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return hasToken();
}
