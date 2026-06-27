import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS, API_BASE_URL } from "@/lib/api/config";

export type NotificationType = 
  | "appointment"
  | "agent_rating"
  | "featured_request"
  | "subarea_assigned"
  | "complaint_update"
  | "property_approved"
  | "property_rejected"
  | "lead_assigned"
  | "account_update";


export interface Notification {
  id: string;
  userId: string;
  userType: "USER" | "AGENT" | "ADMIN" | "SUPER_ADMIN";
  title: string;
  message: string;
  type: NotificationType;
  relatedId?: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  icon?: string;
}

type ApiItemResponse<T> = {
  success: boolean;
  data?: T;
  [key: string]: unknown;
};

class NotificationService {
  private isConfigured(): boolean {
    return Boolean(API_BASE_URL);
  }

  async getNotifications(userId: string, userType: string): Promise<Notification[]> {
    if (!this.isConfigured()) return [];
    try {
      const response = await apiClient.get<{ success: boolean; notifications: Notification[] }>(
        `${API_ENDPOINTS.NOTIFICATIONS}/my?userId=${userId}&userType=${userType}`
      );
      return response.notifications || [];
    } catch {
      return [];
    }
  }

  async addNotification(notification: Omit<Notification, "id" | "createdAt" | "isRead">): Promise<Notification | null> {
    if (!this.isConfigured()) return null;
    try {
      const response = await apiClient.post<{ success: boolean; notification: Notification }>(
        API_ENDPOINTS.NOTIFICATIONS,
        notification
      );
      return response.notification || null;
    } catch {
      return null;
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    if (!this.isConfigured()) return;
    try {
      await apiClient.patch(`${API_ENDPOINTS.NOTIFICATIONS}/${notificationId}/read`);
    } catch {
      // Silently ignore - notifications are non-critical
    }
  }

  async markAllAsRead(userId: string, userType: string): Promise<void> {
    if (!this.isConfigured()) return;
    try {
      await apiClient.post(`${API_ENDPOINTS.NOTIFICATIONS}/read-all?userId=${userId}&userType=${userType}`);
    } catch {
      // Silently ignore - notifications are non-critical
    }
  }

  async getUnreadCount(userId: string, userType: string): Promise<number> {
    if (!this.isConfigured()) return 0;
    try {
      const response = await apiClient.get<{ success: boolean; count: number }>(
        `${API_ENDPOINTS.NOTIFICATIONS}/unread-count?userId=${userId}&userType=${userType}`
      );
      return response.count || 0;
    } catch {
      return 0;
    }
  }
}

export const notificationService = new NotificationService();
