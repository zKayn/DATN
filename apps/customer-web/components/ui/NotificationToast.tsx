'use client';

import { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ToastNotification {
  _id: string;
  tieuDe: string;
  noiDung: string;
  loai: string;
  donHang?: {
    _id: string;
    maDonHang: string;
  };
}

interface NotificationToastProps {
  notification: ToastNotification | null;
  onClose: () => void;
}

export default function NotificationToast({ notification, onClose }: NotificationToastProps) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [currentNotificationId, setCurrentNotificationId] = useState<string | null>(null);

  useEffect(() => {
    console.log('🎯 NotificationToast useEffect triggered');
    console.log('   - notification ID:', notification?._id);
    console.log('   - current ID:', currentNotificationId);

    if (notification && notification._id !== currentNotificationId) {
      console.log('✅ SHOWING NEW NOTIFICATION!');
      console.log('   - Title:', notification.tieuDe);
      console.log('   - Content:', notification.noiDung);

      // New notification - show it
      setCurrentNotificationId(notification._id);
      setIsVisible(true);

      // Auto close after 5 seconds
      const timer = setTimeout(() => {
        console.log('⏰ Auto-closing toast after 5 seconds');
        handleClose();
      }, 5000);

      return () => {
        console.log('🧹 Cleaning up timer');
        clearTimeout(timer);
      };
    } else if (!notification) {
      console.log('🔄 No notification - resetting');
      // No notification - reset
      setCurrentNotificationId(null);
      setIsVisible(false);
    } else {
      console.log('⏸️ Same notification ID - skipping');
    }
  }, [notification?._id]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleClick = () => {
    if (notification?.donHang) {
      router.push(`/tai-khoan/don-hang/${notification.donHang._id}`);
    } else {
      router.push('/thong-bao');
    }
    handleClose();
  };

  if (!notification) return null;

  return (
    <div
      className={`fixed top-20 right-4 z-[9999] w-96 max-w-[calc(100vw-2rem)] transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
      }`}
    >
      <div
        className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-3xl transition-shadow"
        onClick={handleClick}
      >
        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-primary-400 animate-[shrink_5s_linear]"
            style={{
              animation: 'shrink 5s linear forwards',
            }}
          />
        </div>

        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary-400" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                {notification.tieuDe}
              </h4>
              <p className="text-sm text-gray-600 line-clamp-2">
                {notification.noiDung}
              </p>
            </div>

            {/* Close button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}
