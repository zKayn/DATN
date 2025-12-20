'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { api } from '@/lib/api';
import NotificationToast from '@/components/ui/NotificationToast';

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
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [toastNotification, setToastNotification] = useState<Notification | null>(null);
  const [lastCheckedId, setLastCheckedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setLastCheckedId(null);
      return;
    }

    // Initial check
    checkForNewNotifications();

    // Poll every 5 seconds for real-time notifications
    const interval = setInterval(() => {
      checkForNewNotifications();
    }, 5000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const checkForNewNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      console.log('🔍 Checking for new notifications...');
      const response = await api.getNotifications(token, { limit: 1, daDoc: false });
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
    setToastNotification(notification);
  };

  const closeToast = () => {
    setToastNotification(null);
  };

  return (
    <NotificationContext.Provider value={{ showToast }}>
      {children}
      <NotificationToast notification={toastNotification} onClose={closeToast} />
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
