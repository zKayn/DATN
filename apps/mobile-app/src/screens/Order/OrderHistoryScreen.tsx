import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { COLORS, SIZES } from '../../constants/config';

const OrderHistoryScreen = ({ navigation }: any) => {
  const { isAuthenticated } = useAuth();
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [showFilterModal, setShowFilterModal] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [filter, allOrders]);

  const loadOrders = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.getOrders({});
      if (response.success && response.data) {
        const orderList = Array.isArray(response.data)
          ? response.data
          : response.data.orders || [];
        setAllOrders(orderList);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    }
    setLoading(false);
  };

  const applyFilter = () => {
    console.log('Applying filter:', filter);
    console.log('All orders:', allOrders.length);

    if (filter === 'all') {
      setFilteredOrders(allOrders);
      console.log('Showing all orders:', allOrders.length);
    } else {
      const filtered = allOrders.filter(order => order.trangThai === filter);
      setFilteredOrders(filtered);
      console.log(`Filtered orders for "${filter}":`, filtered.length);
      console.log('Orders status:', allOrders.map(o => o.trangThai));
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  }, [filter]);

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'cho-xac-nhan': 'Chờ xác nhận',
      'dang-xu-ly': 'Đang xử lý',
      'dang-giao': 'Đang giao',
      'da-giao': 'Đã giao',
      'da-huy': 'Đã hủy',
    };
    return statusMap[status] || status;
  };

  const getStatusStyle = (status: string) => {
    const styleMap: { [key: string]: any } = {
      'cho-xac-nhan': {
        backgroundColor: COLORS.warning + '20',
        borderColor: COLORS.warning,
        color: COLORS.warning,
      },
      'dang-xu-ly': {
        backgroundColor: COLORS.primary + '20',
        borderColor: COLORS.primary,
        color: COLORS.primary,
      },
      'dang-giao': {
        backgroundColor: COLORS.info + '20',
        borderColor: COLORS.info,
        color: COLORS.info,
      },
      'da-giao': {
        backgroundColor: COLORS.success + '20',
        borderColor: COLORS.success,
        color: COLORS.success,
      },
      'da-huy': {
        backgroundColor: COLORS.danger + '20',
        borderColor: COLORS.danger,
        color: COLORS.danger,
      },
    };
    return styleMap[status] || {};
  };

  const filterOptions = [
    { label: 'Tất cả', value: 'all' },
    { label: 'Chờ xác nhận', value: 'cho-xac-nhan' },
    { label: 'Đang xử lý', value: 'dang-xu-ly' },
    { label: 'Đang giao', value: 'dang-giao' },
    { label: 'Đã giao', value: 'da-giao' },
  ];

  const getFilterLabel = () => {
    return filterOptions.find(opt => opt.value === filter)?.label || 'Tất cả';
  };

  const handleFilterSelect = (value: string) => {
    setFilter(value);
    setShowFilterModal(false);
  };

  const renderOrderItem = ({ item }: any) => {
    const statusStyle = getStatusStyle(item.trangThai);
    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => navigation.navigate('OrderDetail', { id: item._id })}
      >
        <View style={styles.orderHeader}>
          <Text style={styles.orderCode}>#{item.maDonHang}</Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: statusStyle.backgroundColor,
                borderColor: statusStyle.borderColor,
              },
            ]}
          >
            <Text style={[styles.statusText, { color: statusStyle.color }]}>
              {getStatusText(item.trangThai)}
            </Text>
          </View>
        </View>

        <View style={styles.orderDate}>
          <Ionicons name="calendar-outline" size={14} color={COLORS.gray[500]} />
          <Text style={styles.orderDateText}>
            {new Date(item.createdAt).toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>

        {item.sanPham && item.sanPham.length > 0 && (
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={1}>
              {item.sanPham[0]?.sanPham?.tenSanPham || 'Sản phẩm'}
            </Text>
            {item.sanPham.length > 1 && (
              <Text style={styles.moreProducts}>
                và {item.sanPham.length - 1} sản phẩm khác
              </Text>
            )}
          </View>
        )}

        <View style={styles.orderFooter}>
          <View style={styles.itemCount}>
            <Ionicons name="cube-outline" size={16} color={COLORS.gray[600]} />
            <Text style={styles.itemCountText}>
              {item.sanPham?.length || 0} sản phẩm
            </Text>
          </View>
          <Text style={styles.orderTotal}>
            ₫{item.tongTien?.toLocaleString('vi-VN')}
          </Text>
        </View>

        <View style={styles.orderActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('OrderDetail', { id: item._id })}
          >
            <Text style={styles.actionButtonText}>Xem chi tiết</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="lock-closed-outline" size={80} color={COLORS.gray[300]} />
        <Text style={styles.emptyTitle}>Vui lòng đăng nhập</Text>
        <Text style={styles.emptyText}>
          Đăng nhập để xem lịch sử đơn hàng của bạn
        </Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginButtonText}>Đăng nhập</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filter Dropdown */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          style={styles.filterDropdown}
          onPress={() => setShowFilterModal(true)}
        >
          <Ionicons name="filter-outline" size={20} color={COLORS.primary} />
          <Text style={styles.filterDropdownText}>{getFilterLabel()}</Text>
          <Ionicons name="chevron-down" size={20} color={COLORS.gray[600]} />
        </TouchableOpacity>
      </View>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFilterModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Lọc đơn hàng</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.dark} />
              </TouchableOpacity>
            </View>
            {filterOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.filterOption,
                  filter === option.value && styles.filterOptionActive,
                ]}
                onPress={() => handleFilterSelect(option.value)}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    filter === option.value && styles.filterOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
                {filter === option.value && (
                  <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Order List */}
      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={filteredOrders.length === 0 ? styles.emptyListContent : styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={80} color={COLORS.gray[300]} />
            <Text style={styles.emptyTitle}>Chưa có đơn hàng</Text>
            <Text style={styles.emptyText}>
              {filter === 'all'
                ? 'Bạn chưa có đơn hàng nào'
                : `Không có đơn hàng nào ở trạng thái "${getStatusText(filter)}"`}
            </Text>
            {filter === 'all' && (
              <TouchableOpacity
                style={styles.shopButton}
                onPress={() => navigation.navigate('MainTab', { screen: 'Home' })}
              >
                <Text style={styles.shopButtonText}>Mua sắm ngay</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[100],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gray[100],
  },
  loadingText: {
    marginTop: 12,
    fontSize: SIZES.body,
    color: COLORS.gray[600],
  },
  filterBar: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.padding,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  filterDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    gap: 8,
  },
  filterDropdownText: {
    flex: 1,
    fontSize: SIZES.body,
    color: COLORS.dark,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadiusLg,
    width: '85%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  modalTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  filterOptionActive: {
    backgroundColor: COLORS.primary + '10',
  },
  filterOptionText: {
    fontSize: SIZES.body,
    color: COLORS.dark,
    fontWeight: '500',
  },
  filterOptionTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  listContent: {
    padding: SIZES.padding,
  },
  emptyListContent: {
    flex: 1,
  },
  orderCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  orderCode: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 0,
  },
  statusText: {
    fontSize: SIZES.small,
    fontWeight: '700',
  },
  orderDate: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  orderDateText: {
    fontSize: SIZES.small,
    color: COLORS.gray[500],
  },
  productInfo: {
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: COLORS.gray[50],
    borderRadius: 8,
  },
  productName: {
    fontSize: SIZES.body,
    color: COLORS.dark,
    fontWeight: '600',
    marginBottom: 4,
  },
  moreProducts: {
    fontSize: SIZES.small,
    color: COLORS.gray[500],
    fontStyle: 'italic',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
  },
  itemCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemCountText: {
    fontSize: SIZES.body,
    color: COLORS.gray[600],
    fontWeight: '500',
  },
  orderTotal: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionButtonText: {
    fontSize: SIZES.body,
    color: COLORS.primary,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding * 2,
    marginTop: 80,
  },
  emptyTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: SIZES.body,
    color: COLORS.gray[600],
    textAlign: 'center',
    marginBottom: 24,
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
  shopButton: {
    paddingHorizontal: 48,
    paddingVertical: 14,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadius,
  },
  shopButtonText: {
    color: COLORS.white,
    fontSize: SIZES.body,
    fontWeight: '600',
  },
});

export default OrderHistoryScreen;
