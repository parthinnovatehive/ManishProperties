/**
 * API Client
 * Production-grade HTTP client with automatic token injection and error handling
 */

import { API_BASE_URL, API_ENDPOINTS, REQUEST_TIMEOUT } from "./config";
import {
  getRefreshToken,
  getToken,
  setToken,
  clearAllAuthData,
} from "@/lib/utils/token";

export interface ApiError {
  status: number;
  message: string;
  data?: unknown;
}

export interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean>;
  timeout?: number;
}

/**
 * ApiClient class - Handles all HTTP communication
 * Features:
 * - Automatic Bearer token injection
 * - Request timeout handling
 * - Centralized error handling
 * - Type-safe responses
 * - URL parameter handling
 */
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Build full URL with query parameters
   */
  private buildUrl(
    endpoint: string,
    params?: Record<string, string | number | boolean>,
  ): string {
    if (!this.baseUrl) {
      throw new Error("NEXT_PUBLIC_API_URL is not configured");
    }
    const url = new URL(`${this.baseUrl}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    return url.toString();
  }

  /**
   * Build request headers with Authorization token
   */
  private buildHeaders(config?: RequestConfig): HeadersInit {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(typeof config?.headers === "object" && config?.headers !== null
        ? Object.entries(config.headers).reduce(
            (acc, [key, value]) => ({
              ...acc,
              [key]: String(value),
            }),
            {},
          )
        : {}),
    };

    const token = getToken();
    if (token !== null) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Handle API errors with proper error objects
   */
  private async handleError(response: Response): Promise<ApiError> {
    let data: unknown;

    try {
      data = await response.json();
    } catch {
      data = null;
    }

    const message =
      typeof data === "object" && data !== null && "message" in data
        ? String((data as { message: unknown }).message)
        : response.statusText || "Unknown error";

    const error: ApiError = {
      status: response.status,
      message,
      data,
    };

    return error;
  }

  /**
   * Make HTTP request with timeout
   */
  private async requestWithTimeout(
    url: string,
    init: RequestInit,
    timeout: number,
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      return await fetch(url, {
        ...init,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Generic request method
   */
  private async refreshAccessToken(): Promise<boolean> {
    const refreshToken = getRefreshToken();
    if (!refreshToken || !this.baseUrl) return false;

    try {
      const response = await fetch(
        `${this.baseUrl}${API_ENDPOINTS.AUTH.REFRESH}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${refreshToken}`,
          },
        },
      );
      if (!response.ok) return false;
      const data = (await response.json()) as { token?: string };
      if (!data.token) return false;
      setToken(data.token);
      return true;
    } catch {
      return false;
    }
  }

  async request<T = unknown>(
    endpoint: string,
    config?: RequestConfig,
    retry = true,
  ): Promise<T> {
    const url = this.buildUrl(endpoint, config?.params);
    const timeout = config?.timeout ?? REQUEST_TIMEOUT;

    try {
      const response = await this.requestWithTimeout(
        url,
        {
          ...config,
          headers: this.buildHeaders(config),
        },
        timeout,
      );

      if (!response.ok) {
        if (
          response.status === 401 &&
          retry &&
          (await this.refreshAccessToken())
        ) {
          return this.request<T>(endpoint, config, false);
        }
        if (response.status === 401) {
          clearAllAuthData();
        }
        const error = await this.handleError(response);
        if (
          response.status === 403 &&
          error.message ===
            "Your account has been suspended. Please contact support."
        ) {
          clearAllAuthData();
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("estate-auth-changed"));
          }
        }
        throw error;
      }

      try {
        const data = (await response.json()) as T;
        return data;
      } catch (parseError) {
        throw {
          status: response.status,
          message: "Failed to parse response JSON",
          data: parseError instanceof Error ? parseError.message : null,
        } as ApiError;
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw {
          status: 0,
          message: `Request timeout after ${timeout}ms`,
          data: null,
        } as ApiError;
      }

      if (error && typeof error === "object" && "status" in error) {
        throw error as ApiError;
      }

      throw {
        status: 0,
        message: error instanceof Error ? error.message : "Unknown error",
        data: null,
      } as ApiError;
    }
  }

  /**
   * GET request
   */
  async get<T = unknown>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "GET",
    });
  }

  /**
   * POST request
   */
  async post<T = unknown>(
    endpoint: string,
    body?: unknown,
    config?: RequestConfig,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T = unknown>(
    endpoint: string,
    body?: unknown,
    config?: RequestConfig,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T = unknown>(
    endpoint: string,
    config?: RequestConfig,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "DELETE",
    });
  }
}

/**
 * Singleton instance
 */
export const apiClient = new ApiClient(API_BASE_URL);
