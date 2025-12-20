import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/config';
import api from '../../services/api';
import { useFocusEffect } from '@react-navigation/native';

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

const NotificationsScreen = ({ navigation }: any) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [unreadCount, setUnreadCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
      loadUnreadCount();
    }, [filter])
  );

  const loadNotifications = async () => {
    try {
      const params = filter === 'unread' ? { daDoc: false, limit: 50 } : { limit: 50 };
      const response = await api.getNotifications(params);

      if (response.success) {
        setNotifications(response.data || []);
      }
    } catch (error) {
      console.error('Lỗi khi tải thông báo:', error);
      Alert.alert('Lỗi', 'Không thể tải thông báo');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await api.getUnreadNotificationCount();
      if (response.success) {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error('Lỗi khi tải số thông báo chưa đọc:', error);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await api.markNotificationAsRead(notificationId);

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, daDoc: true } : n))
      );
      loadUnreadCount();
    } catch (error) {
      console.error('Lỗi khi đánh dấu đã đọc:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.markAllNotificationsAsRead();

      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, daDoc: true })));
      setUnreadCount(0);
      Alert.alert('Thành công', 'Đã đánh dấu tất cả thông báo là đã đọc');
    } catch (error) {
      console.error('Lỗi khi đánh dấu tất cả đã đọc:', error);
      Alert.alert('Lỗi', 'Không thể đánh dấu tất cả đã đọc');
    }
  };

  const handleDelete = async (notificationId: string) => {
    Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa thông báo này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteNotification(notificationId);

            // Remove from local state
            setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
            loadUnreadCount();
          } catch (error) {
            console.error('Lỗi khi xóa thông báo:', error);
            Alert.alert('Lỗi', 'Không thể xóa thông báo');
          }
        },
      },
    ]);
  };

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.daDoc) {
      handleMarkAsRead(notification._id);
    }

    // Navigate to related page if applicable
    if (notification.donHang) {
      navigation.navigate('OrderDetail', { id: notification.donHang._id });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'don-hang-moi':
      case 'don-hang-xac-nhan':
      case 'don-hang-dang-chuan-bi':
      case 'don-hang-dang-giao':
      case 'don-hang-giao-thanh-cong':
        return 'cube-outline';
      case 'don-hang-huy':
        return 'close-circle-outline';
      case 'danh-gia-moi':
        return 'star-outline';
      default:
        return 'notifications-outline';
    }
  };

  const getNotificationIconColor = (type: string) => {
    switch (type) {
      case 'don-hang-moi':
      case 'don-hang-xac-nhan':
      case 'don-hang-dang-chuan-bi':
      case 'don-hang-dang-giao':
      case 'don-hang-giao-thanh-cong':
        return COLORS.primary;
      case 'don-hang-huy':
        return COLORS.error;
      case 'danh-gia-moi':
        return COLORS.warning;
      default:
        return COLORS.gray[400];
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

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications();
    loadUnreadCount();
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.notificationCard, !item.daDoc && styles.unreadCard]}
      onPress={() => handleNotificationPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.notificationContent}>
        <View
          style={[
            styles.iconContainer,
            !item.daDoc ? styles.unreadIconContainer : styles.readIconContainer,
          ]}
        >
          <Ionicons
            name={getNotificationIcon(item.loai) as any}
            size={24}
            color={getNotificationIconColor(item.loai)}
          />
        </View>

        <View style={styles.notificationText}>
          <Text style={[styles.title, !item.daDoc && styles.unreadTitle]}>{item.tieuDe}</Text>
          <Text style={styles.content} numberOfLines={2}>
            {item.noiDung}
          </Text>
          <View style={styles.timeContainer}>
            <Ionicons name="time-outline" size={12} color={COLORS.gray[400]} />
            <Text style={styles.time}>{formatTime(item.createdAt)}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          {!item.daDoc && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                handleMarkAsRead(item._id);
              }}
              style={styles.actionButton}
            >
              <Ionicons name="checkmark-outline" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              handleDelete(item._id);
            }}
            style={styles.actionButton}
          >
            <Ionicons name="trash-outline" size={20} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </View>

      {!item.daDoc && <View style={styles.unreadIndicator} />}
    </TouchableOpacity>
  );

  const EmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-outline" size={64} color={COLORS.gray[300]} />
      <Text style={styles.emptyTitle}>
        {filter === 'unread' ? 'Không có thông báo chưa đọc' : 'Chưa có thông báo nào'}
      </Text>
      <Text style={styles.emptyText}>
        {filter === 'unread'
          ? 'Tất cả thông báo của bạn đã được đọc'
          : 'Bạn sẽ nhận được thông báo về đơn hàng và các hoạt động khác tại đây'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header với filter tabs */}
      <View style={styles.header}>
        <View style={styles.filterTabs}>
          <TouchableOpacity
            style={[styles.tab, filter === 'all' && styles.activeTab]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.tabText, filter === 'all' && styles.activeTabText]}>
              Tất cả
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, filter === 'unread' && styles.activeTab]}
            onPress={() => setFilter('unread')}
          >
            <Text style={[styles.tabText, filter === 'unread' && styles.activeTabText]}>
              Chưa đọc {unreadCount > 0 && `(${unreadCount})`}
            </Text>
          </TouchableOpacity>
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.markAllButton}>
            <Ionicons name="checkmark-done-outline" size={20} color={COLORS.primary} />
            <Text style={styles.markAllText}>Đánh dấu tất cả</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Notifications List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải thông báo...</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={EmptyComponent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  header: {
    backgroundColor: COLORS.white,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  filterTabs: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: COLORS.gray[100],
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: SIZES.medium,
    fontWeight: '600',
    color: COLORS.gray[600],
  },
  activeTabText: {
    color: COLORS.white,
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 6,
  },
  markAllText: {
    marginLeft: 6,
    fontSize: SIZES.small,
    color: COLORS.primary,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: SIZES.medium,
    color: COLORS.gray[500],
  },
  notificationCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  notificationContent: {
    flexDirection: 'row',
    padding: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  unreadIconContainer: {
    backgroundColor: COLORS.primary + '15',
  },
  readIconContainer: {
    backgroundColor: COLORS.gray[100],
  },
  notificationText: {
    flex: 1,
  },
  title: {
    fontSize: SIZES.medium,
    color: COLORS.gray[700],
    marginBottom: 4,
    fontWeight: '500',
  },
  unreadTitle: {
    fontWeight: '700',
    color: COLORS.dark,
  },
  content: {
    fontSize: SIZES.small,
    color: COLORS.gray[600],
    lineHeight: 20,
    marginBottom: 6,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    fontSize: SIZES.tiny,
    color: COLORS.gray[400],
    marginLeft: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  unreadIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: SIZES.large,
    fontWeight: '600',
    color: COLORS.dark,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: SIZES.medium,
    color: COLORS.gray[500],
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 22,
  },
});

export default NotificationsScreen;
