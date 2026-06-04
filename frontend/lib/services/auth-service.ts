/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/config";
import { LoginResponse, LogoutResponse } from "@/types/api";
import { clearAllAuthData, getToken, setAdminData, setAuthPersistence, setRefreshToken, setToken } from "@/lib/utils/token";

function notifyAuthChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("estate-auth-changed"));
  }
}

export class AuthService {
  private persistAuth(response: LoginResponse, remember = true) {
    const accessToken = response.access_token || response.token;
    const refreshToken = response.refresh_token || response.refreshToken;
    const account = response.user || response.admin;

    if (accessToken) setToken(accessToken);
    if (refreshToken) setRefreshToken(refreshToken);
    if (account) setAdminData(account);
    notifyAuthChanged();
  }

  /**
   * Login user with email and password.
   */
  async login(email: string, password: string, remember = true): Promise<LoginResponse> {
    setAuthPersistence(remember);
    const response = await apiClient.post<LoginResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      { email, password }
    );

    if (response.success) {
      this.persistAuth(response, remember);
    }

    return response;
  }

  /**
   * Register a new user
   */
  async register(
    email: string,
    password: string,
    role: string,
    name?: string,
    phone?: string
  ): Promise<LoginResponse> {
    setAuthPersistence(true);
    const response = await apiClient.post<LoginResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      { email, password, role, name, phone }
    );

    if (response.success) {
      this.persistAuth(response);
    }

    return response;
  }

  /**
   * Authenticate user with Google
   */
  async googleLogin(token: string, role: string): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      API_ENDPOINTS.AUTH.GOOGLE,
      { token, role }
    );

    if (response.success) {
      this.persistAuth(response);
    }

    return response;
  }

  /**
   * Send Phone OTP
   */
  async sendOtp(phone: string): Promise<{ success: boolean; message: string; simulated?: boolean }> {
    return await apiClient.post<{ success: boolean; message: string; simulated?: boolean }>(
      API_ENDPOINTS.AUTH.OTP_SEND,
      { phone }
    );
  }

  /**
   * Verify Phone OTP
   */
  async verifyOtp(phone: string, otp: string): Promise<{ success: boolean; message: string }> {
    return await apiClient.post<{ success: boolean; message: string }>(
      API_ENDPOINTS.AUTH.OTP_VERIFY,
      { phone, otp }
    );
  }

  /**
   * Logout user
   */
  async logout(): Promise<LogoutResponse> {
    const response = await apiClient.post<LogoutResponse>(
      API_ENDPOINTS.AUTH.LOGOUT,
      {}
    );

    if (response.success) {
      clearAllAuthData();
      notifyAuthChanged();
    }

    return response;
  }

  /**
   * Get current auth token
   */
  getToken(): string | null {
    return getToken();
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return getToken() !== null;
  }
}

/**
 * Singleton instance
 */
export const authService = new AuthService();
