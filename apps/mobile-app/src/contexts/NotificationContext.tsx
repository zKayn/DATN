import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';
import NotificationToast from '../components/NotificationToast';

interface Notification {
  _id: string;
  tieuDe: string;
  noiDung: string;
  loai: string;
  donHang?: {
    _id: string;
    maDonHang: string;
  };
  daDoc: boolean;
  createdAt: string;
}

interface NotificationContextType {
  showToast: (notification: Notification) => void;
  toastNotification: Notification | null;
  closeToast: () => void;
  unreadCount: number;
  notifications: Notification[];
  loading: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [toastNotification, setToastNotification] = useState<Notification | null>(null);
  const [lastCheckedId, setLastCheckedId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch unread count
  const fetchUnreadCount = async () => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }

    try {
      const response = await api.getUnreadNotificationCount();
      if (response.success) {
        setUnreadCount(response.data?.count || 0);
      }
    } catch (error) {
      console.log('Could not fetch unread count');
    }
  };

  // Fetch all notifications
  const refreshNotifications = async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      return;
    }

    setLoading(true);
    try {
      const response = await api.getNotifications({ limit: 50 });
      if (response.success && response.data) {
        const notifs = Array.isArray(response.data) ? response.data : response.data.notifications || [];
        setNotifications(notifs);

        // Update unread count
        const unread = notifs.filter((n: Notification) => !n.daDoc).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await api.markNotificationAsRead(notificationId);
      if (response.success) {
        // Update local state
        setNotifications((prev) =>
          prev.map((n) => (n._id === notificationId ? { ...n, daDoc: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const response = await api.markAllNotificationsAsRead();
      if (response.success) {
        // Update local state
        setNotifications((prev) => prev.map((n) => ({ ...n, daDoc: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await api.deleteNotification(notificationId);
      if (response.success) {
        // Update local state
        const notification = notifications.find((n) => n._id === notificationId);
        setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
        if (notification && !notification.daDoc) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setLastCheckedId(null);
      setUnreadCount(0);
      setNotifications([]);
      return;
    }

    // Initial check for toast notifications
    checkForNewNotifications();

    // Fetch unread count initially
    fetchUnreadCount();

    // Poll every 10 seconds for unread count (faster for real-time updates when admin updates order status)
    const countInterval = setInterval(() => {
      fetchUnreadCount();
    }, 10000);

    // Poll every 5 seconds for toast notifications
    const toastInterval = setInterval(() => {
      checkForNewNotifications();
    }, 5000);

    return () => {
      clearInterval(countInterval);
      clearInterval(toastInterval);
    };
  }, [isAuthenticated]);

  const checkForNewNotifications = async () => {
    try {
      console.log('🔍 Checking for new notifications...');
      const response = await api.getNotifications({ limit: 1, daDoc: false });
      console.log('📦 API Response:', response);

      if (response.success && response.data && response.data.length > 0) {
        const latestNotification = response.data[0];
        console.log('📬 Latest notification:', latestNotification._id, latestNotification.tieuDe);
        console.log('🏷️ Last checked ID:', lastCheckedId);

        // If this is a new notification (different from last checked)
        if (lastCheckedId !== latestNotification._id) {
          console.log('🔔 NEW NOTIFICATION DETECTED!');
          console.log('  - Title:', latestNotification.tieuDe);
          console.log('  - ID:', latestNotification._id);
          console.log('  - Previous ID:', lastCheckedId);

          // Always show toast for new notifications
          showToast(latestNotification);
          setLastCheckedId(latestNotification._id);
        } else {
          console.log('✓ No new notifications (same ID)');
        }
      } else {
        console.log('📭 No unread notifications found');
      }
    } catch (error) {
      console.error('❌ Error checking notifications:', error);
    }
  };

  const showToast = (notification: Notification) => {
    console.log('📱 showToast called with:', notification.tieuDe, 'ID:', notification._id);
    setToastNotification(notification);
  };

  const closeToast = () => {
    console.log('🚪 closeToast called');
    setToastNotification(null);
  };

  return (
    <NotificationContext.Provider
      value={{
        showToast,
        toastNotification,
        closeToast,
        unreadCount,
        notifications,
        loading,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
