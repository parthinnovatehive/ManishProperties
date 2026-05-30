/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/config";
import { LoginResponse, LogoutResponse } from "@/types/api";
import { getToken, setToken, setAdminData, clearAllAuthData } from "@/lib/utils/token";

export class AuthService {
  /**
   * Login user with username, password and optional role selection
   */
  async login(username: string, password: string, role?: string): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      { username, password, role }
    );

    if (response.success) {
      setToken(response.token);
      setAdminData(response.admin);
    }

    return response;
  }

  /**
   * Register a new user
   */
  async register(
    username: string,
    password: string,
    role: string,
    name?: string,
    phone?: string,
    otp?: string
  ): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      { username, password, role, name, phone, otp }
    );

    if (response.success) {
      setToken(response.token);
      setAdminData(response.admin);
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
      setToken(response.token);
      setAdminData(response.admin);
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
