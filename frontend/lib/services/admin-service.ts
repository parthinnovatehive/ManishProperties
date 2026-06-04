/**
 * Admin Service
 * Handles admin-specific operations
 */

import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/config";
import { DashboardResponse, AdminsListResponse } from "@/types/api";
import { AdminData } from "@/lib/utils/token";

export class AdminService {
  /**
   * Get admin dashboard stats
   */
  async getDashboardStats() {
    const response = await apiClient.get<DashboardResponse>(
      API_ENDPOINTS.ADMIN.DASHBOARD
    );

    return response.stats || response.data || {};
  }

  /**
   * Get list of all admins
   */
  async getAdminsList(): Promise<AdminData[]> {
    const response = await apiClient.get<AdminsListResponse>(
      `${API_ENDPOINTS.ADMIN.DASHBOARD}/admins`
    );

    return (response.admins || response.data || []) as AdminData[];
  }
}

/**
 * Singleton instance
 */
export const adminService = new AdminService();
