'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Check, CheckCheck, Clock, Package, Star, Trash2, X } from 'lucide-react';
import { api } from '@/lib/api';

interface Notification {
  _id: string;
  tieuDe: string;
  noiDung: string;
  loai: string;
  daDoc: boolean;
  donHang?: {
    _id: string;
    maDonHang: string;
  };
  createdAt: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
  }, [filter]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/dang-nhap');
        return;
      }

      const params = filter === 'unread' ? { daDoc: false, limit: 50 } : { limit: 50 };
      const response = await api.getNotifications(token, params);

      if (response.success) {
        setNotifications(response.data || []);
      }
    } catch (error) {
      console.error('Lỗi khi tải thông báo:', error);
    }
    setLoading(false);
  };

  const loadUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await api.getUnreadNotificationCount(token);
      if (response.success) {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error('Lỗi khi tải số thông báo chưa đọc:', error);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await api.markNotificationAsRead(token, notificationId);

      // Update local state
      setNotifications(prev =>
        prev.map(n => (n._id === notificationId ? { ...n, daDoc: true } : n))
      );
      loadUnreadCount();
    } catch (error) {
      console.error('Lỗi khi đánh dấu đã đọc:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await api.markAllNotificationsAsRead(token);

      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, daDoc: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Lỗi khi đánh dấu tất cả đã đọc:', error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await api.deleteNotification(token, notificationId);

      // Remove from local state
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      loadUnreadCount();
    } catch (error) {
      console.error('Lỗi khi xóa thông báo:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.daDoc) {
      handleMarkAsRead(notification._id);
    }

    // Navigate to related page if applicable
    if (notification.donHang) {
      router.push(`/tai-khoan/don-hang/${notification.donHang._id}`);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'don-hang-moi':
      case 'don-hang-xac-nhan':
      case 'don-hang-dang-chuan-bi':
      case 'don-hang-dang-giao':
      case 'don-hang-giao-thanh-cong':
        return <Package className="w-5 h-5 text-primary-600" />;
      case 'don-hang-huy':
        return <X className="w-5 h-5 text-red-600" />;
      case 'danh-gia-moi':
        return <Star className="w-5 h-5 text-yellow-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;

    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Bell className="w-7 h-7 text-primary-600" />
                Thông báo
              </h1>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  Bạn có {unreadCount} thông báo chưa đọc
                </p>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2 px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 font-medium text-sm transition-colors relative ${
                filter === 'all'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 font-medium text-sm transition-colors relative ${
                filter === 'unread'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Chưa đọc
              {unreadCount > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-gray-200 rounded w-full mb-2" />
                      <div className="h-3 bg-gray-200 rounded w-1/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {filter === 'unread' ? 'Không có thông báo chưa đọc' : 'Chưa có thông báo nào'}
              </h3>
              <p className="text-gray-600">
                {filter === 'unread'
                  ? 'Tất cả thông báo của bạn đã được đọc'
                  : 'Bạn sẽ nhận được thông báo về đơn hàng và các hoạt động khác tại đây'}
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification._id}
                className={`bg-white rounded-xl p-4 transition-all hover:shadow-md cursor-pointer ${
                  !notification.daDoc ? 'border-l-4 border-primary-600' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex gap-4">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    !notification.daDoc ? 'bg-primary-50' : 'bg-gray-100'
                  }`}>
                    {getNotificationIcon(notification.loai)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold mb-1 ${
                      !notification.daDoc ? 'text-gray-900' : 'text-gray-700'
                    }`}>
                      {notification.tieuDe}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {notification.noiDung}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {formatTime(notification.createdAt)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 flex items-start gap-2">
                    {!notification.daDoc && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification._id);
                        }}
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Đánh dấu đã đọc"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(notification._id);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa thông báo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
