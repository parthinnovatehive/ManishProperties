"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Bell, Calendar, Star, UserPlus, CheckCircle, AlertCircle, MessageSquare, X, Eye } from "lucide-react";
import { notificationService, Notification } from "@/lib/notifications";
import { getAdminData } from "@/lib/utils/token";

const iconMap: Record<string, any> = {
  Calendar: Calendar,
  Star: Star,
  UserPlus: UserPlus,
  CheckCircle: CheckCircle,
  AlertCircle: AlertCircle,
  MessageSquare: MessageSquare,
};

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    const user = getAdminData();
    setCurrentUser(user);
    if (user?.id) {
      const notifs = await notificationService.getNotifications(user.id, user.role);
      setNotifications(notifs);
      const count = await notificationService.getUnreadCount(user.id, user.role);
      setUnreadCount(count);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    await notificationService.markAsRead(id);
    loadNotifications();
  };

  const handleMarkAllAsRead = async () => {
    if (currentUser?.id) {
      await notificationService.markAllAsRead(currentUser.id, currentUser.role);
      loadNotifications();
    }
  };

  const handleViewDetails = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsDetailModalOpen(true);
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
  };

  const getIcon = (iconName?: string) => {
    const Icon = iconName && iconMap[iconName] ? iconMap[iconName] : Bell;
    return <Icon className="w-5 h-5" />;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString().slice(-2);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const getNotificationUrl = (notification: Notification): string => {
    if (notification.actionUrl) return notification.actionUrl;
    
    switch (notification.type) {
      case "appointment":
        return currentUser?.role === "USER" ? "/user/appointments" : 
               currentUser?.role === "AGENT" ? "/agent/appointments" : 
               "/admin/appointments";
      case "featured_request":
        return "/super-admin/featured-requests";
      case "subarea_assigned":
        return "/agent/dashboard";
      default:
        return "/notifications";
    }
  };

  // Modal content
  const notificationsModalContent = isModalOpen ? (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4" onClick={() => setIsModalOpen(false)}>
      <div className="bg-white rounded-2xl w-full max-w-2xl mx-auto flex flex-col max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="flex-shrink-0 flex justify-between items-center p-6 border-b border-estate-border bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-estate-navy font-serif">Notifications</h2>
            <p className="text-xs text-estate-muted mt-1">Stay updated with your latest activities</p>
          </div>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Mark all as read
              </button>
            )}
            <button
              onClick={() => setIsModalOpen(false)}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-estate-muted">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 rounded-xl border transition cursor-pointer hover:shadow-md ${
                    !notif.isRead 
                      ? "bg-blue-50/30 border-blue-200" 
                      : "bg-white border-estate-border hover:bg-gray-50"
                  }`}
                  onClick={() => handleViewDetails(notif)}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        !notif.isRead ? "bg-blue-100" : "bg-gray-100"
                      }`}>
                        {getIcon(notif.icon)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-estate-text">{notif.title}</p>
                          <p className="text-sm text-estate-text-sec mt-1 line-clamp-2">{notif.message}</p>
                          <p className="text-xs text-estate-muted mt-2">{formatTime(notif.createdAt)}</p>
                        </div>
                        {!notif.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex-shrink-0 p-4 border-t border-estate-border bg-gray-50">
          <p className="text-center text-xs text-estate-muted">
            Click on any notification to view details
          </p>
        </div>
      </div>
    </div>
  ) : null;

  // Detail Modal content
  const detailModalContent = isDetailModalOpen && selectedNotification ? (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4" onClick={() => setIsDetailModalOpen(false)}>
      <div className="bg-white rounded-2xl w-full max-w-md mx-auto flex flex-col max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex-shrink-0 flex justify-between items-center p-6 border-b border-estate-border">
          <h2 className="text-xl font-bold text-estate-navy font-serif">Notification Details</h2>
          <button
            onClick={() => setIsDetailModalOpen(false)}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              {getIcon(selectedNotification.icon)}
            </div>
            <div>
              <p className="font-bold text-estate-navy text-lg">{selectedNotification.title}</p>
              <p className="text-xs text-estate-muted">{formatDateTime(selectedNotification.createdAt)}</p>
            </div>
          </div>

          <div className="border-t border-estate-border pt-4">
            <p className="text-estate-text leading-relaxed">{selectedNotification.message}</p>
          </div>

          {selectedNotification.type && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-estate-muted">Type</p>
              <p className="text-sm font-medium capitalize">{selectedNotification.type.replace("_", " ")}</p>
            </div>
          )}

          {selectedNotification.relatedId && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-estate-muted">Reference ID</p>
              <p className="text-sm font-mono">{selectedNotification.relatedId}</p>
            </div>
          )}
        </div>

        <div className="flex-shrink-0 flex gap-3 p-6 border-t border-estate-border bg-gray-50">
          <button
            onClick={() => {
              const url = getNotificationUrl(selectedNotification);
              window.location.href = url;
              setIsDetailModalOpen(false);
              setIsModalOpen(false);
            }}
            className="flex-1 py-2 bg-estate-navy text-white font-semibold rounded-xl hover:bg-estate-navy-mid transition flex items-center justify-center gap-2"
          >
            <Eye size={16} />
            View Related Page
          </button>
          <button
            onClick={() => setIsDetailModalOpen(false)}
            className="flex-1 py-2 rounded-xl border border-estate-border text-estate-text font-semibold hover:bg-gray-50 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition"
      >
        <Bell className="w-5 h-5 text-estate-text-sec" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* ✅ Render modals using createPortal at document.body level */}
      {mounted && createPortal(notificationsModalContent, document.body)}
      {mounted && createPortal(detailModalContent, document.body)}
    </>
  );
}