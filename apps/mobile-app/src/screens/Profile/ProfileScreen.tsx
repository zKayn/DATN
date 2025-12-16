import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, SIZES } from '../../constants/config';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

const ProfileScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { user, logout, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
    }
  }, [isAuthenticated]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await api.getOrders({ limit: 2 });
      if (response.success && response.data) {
        const orderList = Array.isArray(response.data) ? response.data : response.data.orders || [];
        setOrders(orderList);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    Alert.alert('Xác nhận', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: logout,
      },
    ]);
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.notLoggedInContainer}>
          <View style={styles.iconContainer}>
            <Ionicons name="person-outline" size={80} color={COLORS.gray[300]} />
          </View>
          <Text style={styles.notLoggedInTitle}>Bạn chưa đăng nhập</Text>
          <Text style={styles.notLoggedInText}>
            Đăng nhập để xem thông tin cá nhân và đơn hàng của bạn
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginButtonText}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SIZES.safeAreaTop }]}>
        <TouchableOpacity
          style={[styles.editButton, { top: insets.top + SIZES.safeAreaTop }]}
          onPress={() => navigation.navigate('ProfileEdit')}
        >
          <Ionicons name="create-outline" size={20} color={COLORS.white} />
        </TouchableOpacity>

        <View style={styles.avatar}>
          {user?.avatar || user?.anhDaiDien ? (
            <Image
              source={{ uri: user.avatar || user.anhDaiDien }}
              style={styles.avatarImage}
            />
          ) : (
            <Text style={styles.avatarText}>
              {user?.hoTen?.charAt(0).toUpperCase() || 'U'}
            </Text>
          )}
        </View>
        <Text style={styles.name}>{user?.hoTen || 'Người dùng'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        {user?.soDienThoai && (
          <View style={styles.phoneContainer}>
            <Ionicons name="call" size={14} color={COLORS.white} />
            <Text style={styles.phone}>{user.soDienThoai}</Text>
          </View>
        )}
      </View>

      {/* Recent Orders */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Đơn hàng gần đây</Text>
          <TouchableOpacity onPress={() => navigation.navigate('OrderHistory')}>
            <Text style={styles.seeAllText}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        ) : orders.length > 0 ? (
          orders.slice(0, 2).map((order) => (
            <TouchableOpacity
              key={order._id}
              style={styles.orderCard}
              onPress={() => navigation.navigate('OrderDetail', { id: order._id })}
            >
              <View style={styles.orderHeader}>
                <Text style={styles.orderCode}>#{order.maDonHang}</Text>
                <View style={[styles.statusBadge, getStatusStyle(order.trangThai)]}>
                  <Text style={styles.statusText}>{getStatusText(order.trangThai)}</Text>
                </View>
              </View>
              <Text style={styles.orderDate}>
                {new Date(order.createdAt).toLocaleDateString('vi-VN')}
              </Text>
              <View style={styles.orderFooter}>
                <Text style={styles.orderItemCount}>
                  {order.sanPham?.length || 0} sản phẩm
                </Text>
                <Text style={styles.orderTotal}>
                  ₫{order.tongTien?.toLocaleString('vi-VN')}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyOrders}>
            <Ionicons name="receipt-outline" size={48} color={COLORS.gray[300]} />
            <Text style={styles.emptyText}>Chưa có đơn hàng nào</Text>
          </View>
        )}
      </View>

      {/* Menu */}
      <View style={styles.menu}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('OrderHistory')}
        >
          <View style={styles.menuIconContainer}>
            <Ionicons name="receipt-outline" size={24} color={COLORS.primary} />
          </View>
          <Text style={styles.menuText}>Đơn hàng của tôi</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('MyReviews')}
        >
          <View style={styles.menuIconContainer}>
            <Ionicons name="star-outline" size={24} color={COLORS.warning} />
          </View>
          <Text style={styles.menuText}>Đánh giá của tôi</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('MainTab', { screen: 'Wishlist' })}
        >
          <View style={styles.menuIconContainer}>
            <Ionicons name="heart-outline" size={24} color={COLORS.danger} />
          </View>
          <Text style={styles.menuText}>Sản phẩm yêu thích</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('AddressList', {})}
        >
          <View style={styles.menuIconContainer}>
            <Ionicons name="location-outline" size={24} color={COLORS.success} />
          </View>
          <Text style={styles.menuText}>Địa chỉ giao hàng</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIconContainer}>
            <Ionicons name="settings-outline" size={24} color={COLORS.gray[600]} />
          </View>
          <Text style={styles.menuText}>Cài đặt</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIconContainer}>
            <Ionicons name="help-circle-outline" size={24} color={COLORS.warning} />
          </View>
          <Text style={styles.menuText}>Trợ giúp</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, styles.logoutButton]} onPress={handleLogout}>
          <View style={styles.menuIconContainer}>
            <Ionicons name="log-out-outline" size={24} color={COLORS.danger} />
          </View>
          <Text style={[styles.menuText, { color: COLORS.danger }]}>Đăng xuất</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.danger} />
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const getStatusText = (status: string) => {
  const statusMap: { [key: string]: string } = {
    'cho-xac-nhan': 'Chờ xác nhận',
    'da-xac-nhan': 'Đã xác nhận',
    'dang-chuan-bi': 'Đang chuẩn bị',
    'dang-giao': 'Đang giao',
    'da-giao': 'Đã giao',
    'da-huy': 'Đã hủy',
    'tra-hang': 'Trả hàng',
  };
  return statusMap[status] || status;
};

const getStatusStyle = (status: string) => {
  const styleMap: { [key: string]: any } = {
    'cho-xac-nhan': { backgroundColor: COLORS.warning + '20', borderColor: COLORS.warning },
    'da-xac-nhan': { backgroundColor: COLORS.primary + '20', borderColor: COLORS.primary },
    'dang-chuan-bi': { backgroundColor: COLORS.info + '20', borderColor: COLORS.info },
    'dang-giao': { backgroundColor: COLORS.info + '20', borderColor: COLORS.info },
    'da-giao': { backgroundColor: COLORS.success + '20', borderColor: COLORS.success },
    'da-huy': { backgroundColor: COLORS.danger + '20', borderColor: COLORS.danger },
    'tra-hang': { backgroundColor: '#FF6B35' + '20', borderColor: '#FF6B35' },
  };
  return styleMap[status] || {};
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: SIZES.padding * 2,
    alignItems: 'center',
    position: 'relative',
  },
  editButton: {
    position: 'absolute',
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.white + '30',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: COLORS.white,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  name: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  email: {
    fontSize: SIZES.body,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: 4,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  phone: {
    fontSize: SIZES.small,
    color: COLORS.white,
    opacity: 0.9,
  },
  section: {
    backgroundColor: COLORS.white,
    marginTop: 12,
    padding: SIZES.padding,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  seeAllText: {
    fontSize: SIZES.small,
    color: COLORS.primary,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  orderCard: {
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    borderRadius: SIZES.borderRadius,
    padding: 12,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderCode: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.dark,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: SIZES.tiny,
    fontWeight: '600',
  },
  orderDate: {
    fontSize: SIZES.small,
    color: COLORS.gray[500],
    marginBottom: 8,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderItemCount: {
    fontSize: SIZES.small,
    color: COLORS.gray[600],
  },
  orderTotal: {
    fontSize: SIZES.body,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  emptyOrders: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: SIZES.body,
    color: COLORS.gray[500],
    marginTop: 12,
  },
  menu: {
    backgroundColor: COLORS.white,
    marginTop: 12,
    paddingHorizontal: SIZES.padding,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gray[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: SIZES.body,
    color: COLORS.dark,
  },
  logoutButton: {
    marginTop: 8,
    borderBottomWidth: 0,
  },
  notLoggedInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding * 2,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.gray[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  notLoggedInTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 8,
  },
  notLoggedInText: {
    fontSize: SIZES.body,
    color: COLORS.gray[600],
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  loginButton: {
    paddingHorizontal: 48,
    paddingVertical: 14,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadius,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: SIZES.body,
    fontWeight: '600',
  },
});

export default ProfileScreen;
