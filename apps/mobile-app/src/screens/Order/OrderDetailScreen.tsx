import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { COLORS, SIZES } from '../../constants/config';

interface OrderStep {
  key: string;
  label: string;
  icon: string;
  isActive?: boolean;
  isCompleted?: boolean;
}

const OrderDetailScreen = ({ route, navigation }: any) => {
  const { id } = route.params;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrderDetail();
  }, [id]);

  const loadOrderDetail = async () => {
    setLoading(true);
    try {
      const response = await api.getOrderDetail(id);
      if (response.success && response.data) {
        setOrder(response.data);
      }
    } catch (error: any) {
      console.error('Error loading order detail:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin đơn hàng');
    }
    setLoading(false);
  };

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
        icon: 'time-outline',
      },
      'dang-xu-ly': {
        backgroundColor: COLORS.primary + '20',
        borderColor: COLORS.primary,
        color: COLORS.primary,
        icon: 'settings-outline',
      },
      'dang-giao': {
        backgroundColor: COLORS.info + '20',
        borderColor: COLORS.info,
        color: COLORS.info,
        icon: 'bicycle-outline',
      },
      'da-giao': {
        backgroundColor: COLORS.success + '20',
        borderColor: COLORS.success,
        color: COLORS.success,
        icon: 'checkmark-circle-outline',
      },
      'da-huy': {
        backgroundColor: COLORS.danger + '20',
        borderColor: COLORS.danger,
        color: COLORS.danger,
        icon: 'close-circle-outline',
      },
    };
    return (
      styleMap[status] || {
        backgroundColor: COLORS.gray[200],
        borderColor: COLORS.gray[400],
        color: COLORS.gray[700],
        icon: 'ellipse-outline',
      }
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải thông tin đơn hàng...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={80} color={COLORS.danger} />
        <Text style={styles.errorText}>Không tìm thấy đơn hàng</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusStyle = getStatusStyle(order.trangThai);

  const getOrderSteps = (): OrderStep[] => {
    const steps: OrderStep[] = [
      { key: 'cho-xac-nhan', label: 'Chờ xác nhận', icon: 'time-outline' },
      { key: 'dang-xu-ly', label: 'Đang xử lý', icon: 'settings-outline' },
      { key: 'dang-giao', label: 'Đang giao', icon: 'bicycle-outline' },
      { key: 'da-giao', label: 'Đã giao', icon: 'checkmark-circle' },
    ];

    if (order.trangThai === 'da-huy') {
      return [
        { key: 'da-huy', label: 'Đã hủy', icon: 'close-circle', isActive: true, isCompleted: false },
      ];
    }

    const currentIndex = steps.findIndex((s) => s.key === order.trangThai);
    return steps.map((step, index) => ({
      ...step,
      isActive: index <= currentIndex,
      isCompleted: index < currentIndex,
    }));
  };

  const handleReorder = () => {
    // Navigate to products and add to cart
    Alert.alert(
      'Mua lại đơn hàng',
      'Bạn có muốn thêm tất cả sản phẩm vào giỏ hàng?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đồng ý',
          onPress: () => {
            Alert.alert('Thành công', 'Đã thêm sản phẩm vào giỏ hàng');
            navigation.navigate('Cart');
          },
        },
      ]
    );
  };

  const handleCancelOrder = () => {
    Alert.alert(
      'Hủy đơn hàng',
      'Bạn có chắc muốn hủy đơn hàng này?',
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Hủy đơn',
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: Call API to cancel order
              Alert.alert('Thành công', 'Đơn hàng đã được hủy');
              loadOrderDetail();
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể hủy đơn hàng');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Order Status */}
      <View style={styles.statusSection}>
        <View
          style={[
            styles.statusCard,
            {
              backgroundColor: statusStyle.backgroundColor,
              borderColor: statusStyle.borderColor,
            },
          ]}
        >
          <Ionicons name={statusStyle.icon} size={48} color={statusStyle.color} />
          <Text style={[styles.statusTitle, { color: statusStyle.color }]}>
            {getStatusText(order.trangThai)}
          </Text>
          <Text style={styles.statusDescription}>
            {order.trangThai === 'cho-xac-nhan' &&
              'Đơn hàng của bạn đang chờ được xác nhận'}
            {order.trangThai === 'dang-xu-ly' &&
              'Đơn hàng đang được chuẩn bị'}
            {order.trangThai === 'dang-giao' &&
              'Đơn hàng đang được giao đến bạn'}
            {order.trangThai === 'da-giao' &&
              'Đơn hàng đã được giao thành công'}
            {order.trangThai === 'da-huy' && 'Đơn hàng đã bị hủy'}
          </Text>
        </View>
      </View>

      {/* Order Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin đơn hàng</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Mã đơn hàng:</Text>
          <Text style={styles.infoValue}>#{order.maDonHang}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Ngày đặt:</Text>
          <Text style={styles.infoValue}>
            {new Date(order.createdAt).toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Phương thức thanh toán:</Text>
          <Text style={styles.infoValue}>
            {order.phuongThucThanhToan === 'COD'
              ? 'Thanh toán khi nhận hàng'
              : order.phuongThucThanhToan === 'BANK_TRANSFER'
              ? 'Chuyển khoản ngân hàng'
              : order.phuongThucThanhToan}
          </Text>
        </View>
      </View>

      {/* Products */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sản phẩm ({order.sanPham?.length || 0})</Text>
        {order.sanPham?.map((item: any, index: number) => (
          <View key={index}>
            <View style={styles.productCard}>
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>
                  {item.tenSanPham || 'Sản phẩm'}
                </Text>
                <View style={styles.productVariants}>
                  {item.mauSac && (
                    <Text style={styles.variantText}>Màu: {item.mauSac}</Text>
                  )}
                  {item.size && (
                    <Text style={styles.variantText}>Size: {item.size}</Text>
                  )}
                </View>
                <View style={styles.productPriceRow}>
                  <Text style={styles.productPrice}>
                    ₫{item.gia?.toLocaleString('vi-VN')}
                  </Text>
                  <Text style={styles.productQuantity}>x{item.soLuong}</Text>
                </View>
              </View>
              <Text style={styles.productTotal}>
                ₫{((item.gia || 0) * (item.soLuong || 0)).toLocaleString('vi-VN')}
              </Text>
            </View>
            {order.trangThai === 'da-giao' && item.sanPham && (
              <TouchableOpacity
                style={styles.reviewProductButton}
                onPress={() => navigation.navigate('WriteReview', {
                  productId: item.sanPham,
                  productName: item.tenSanPham,
                  productImage: item.hinhAnh,
                  orderId: order._id,
                })}
              >
                <Ionicons name="star-outline" size={16} color={COLORS.primary} />
                <Text style={styles.reviewProductText}>Viết đánh giá</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

      {/* Shipping Address */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Địa chỉ giao hàng</Text>
        <View style={styles.addressCard}>
          <View style={styles.addressRow}>
            <Ionicons name="person-outline" size={20} color={COLORS.primary} />
            <Text style={styles.addressText}>{order.diaChiGiaoHang?.hoTen}</Text>
          </View>
          <View style={styles.addressRow}>
            <Ionicons name="call-outline" size={20} color={COLORS.primary} />
            <Text style={styles.addressText}>
              {order.diaChiGiaoHang?.soDienThoai}
            </Text>
          </View>
          <View style={styles.addressRow}>
            <Ionicons name="location-outline" size={20} color={COLORS.primary} />
            <Text style={styles.addressText}>
              {order.diaChiGiaoHang?.diaChi}, {order.diaChiGiaoHang?.phuongXa},{' '}
              {order.diaChiGiaoHang?.quanHuyen}, {order.diaChiGiaoHang?.tinhThanh}
            </Text>
          </View>
          {order.ghiChu && (
            <View style={styles.addressRow}>
              <Ionicons name="document-text-outline" size={20} color={COLORS.primary} />
              <Text style={styles.addressText}>Ghi chú: {order.ghiChu}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Order Timeline */}
      {order.trangThai !== 'da-huy' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trạng thái đơn hàng</Text>
          <View style={styles.timeline}>
            {getOrderSteps().map((step, index) => (
              <View key={step.key} style={styles.timelineStep}>
                <View style={styles.timelineIconContainer}>
                  <View
                    style={[
                      styles.timelineIcon,
                      step.isActive && styles.timelineIconActive,
                      step.isCompleted && styles.timelineIconCompleted,
                    ]}
                  >
                    <Ionicons
                      name={step.icon as any}
                      size={20}
                      color={
                        step.isActive || step.isCompleted
                          ? COLORS.white
                          : COLORS.gray[400]
                      }
                    />
                  </View>
                  {index < getOrderSteps().length - 1 && (
                    <View
                      style={[
                        styles.timelineLine,
                        step.isCompleted && styles.timelineLineCompleted,
                      ]}
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.timelineLabel,
                    step.isActive && styles.timelineLabelActive,
                  ]}
                >
                  {step.label}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Price Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Chi tiết thanh toán</Text>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Tạm tính</Text>
          <Text style={styles.priceValue}>
            ₫
            {(
              (order.tongTien || 0) - (order.phiVanChuyen || 0)
            ).toLocaleString('vi-VN')}
          </Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Phí vận chuyển</Text>
          <Text style={styles.priceValue}>
            {order.phiVanChuyen === 0 ? (
              <Text style={{ color: COLORS.success }}>Miễn phí</Text>
            ) : (
              `₫${order.phiVanChuyen?.toLocaleString('vi-VN')}`
            )}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tổng cộng</Text>
          <Text style={styles.totalValue}>
            ₫{order.tongTien?.toLocaleString('vi-VN')}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.section}>
        {order.trangThai === 'cho-xac-nhan' && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancelOrder}
          >
            <Ionicons name="close-circle-outline" size={20} color={COLORS.danger} />
            <Text style={styles.cancelButtonText}>Hủy đơn hàng</Text>
          </TouchableOpacity>
        )}
        {order.trangThai === 'da-giao' && (
          <TouchableOpacity style={styles.reorderButton} onPress={handleReorder}>
            <Ionicons name="cart-outline" size={20} color={COLORS.white} />
            <Text style={styles.reorderButtonText}>Mua lại</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.gray[100],
    padding: SIZES.padding * 2,
  },
  errorText: {
    fontSize: SIZES.h3,
    color: COLORS.danger,
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadius,
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: SIZES.body,
    fontWeight: '600',
  },
  statusSection: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding * 2,
    marginBottom: 12,
  },
  statusCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: SIZES.borderRadius,
    borderWidth: 2,
  },
  statusTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  statusDescription: {
    fontSize: SIZES.body,
    color: COLORS.gray[600],
    textAlign: 'center',
  },
  section: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: SIZES.body,
    color: COLORS.gray[600],
  },
  infoValue: {
    fontSize: SIZES.body,
    color: COLORS.dark,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  productCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: COLORS.gray[100],
    borderRadius: SIZES.borderRadius,
    marginBottom: 8,
  },
  productInfo: {
    flex: 1,
    marginRight: 12,
  },
  productName: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 4,
  },
  productVariants: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  variantText: {
    fontSize: SIZES.small,
    color: COLORS.gray[600],
  },
  productPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  productPrice: {
    fontSize: SIZES.body,
    color: COLORS.danger,
    fontWeight: '600',
  },
  productQuantity: {
    fontSize: SIZES.small,
    color: COLORS.gray[600],
  },
  productTotal: {
    fontSize: SIZES.body,
    fontWeight: 'bold',
    color: COLORS.danger,
  },
  addressCard: {
    backgroundColor: COLORS.gray[100],
    padding: 16,
    borderRadius: SIZES.borderRadius,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  addressText: {
    flex: 1,
    fontSize: SIZES.body,
    color: COLORS.dark,
    lineHeight: 22,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: SIZES.body,
    color: COLORS.gray[700],
  },
  priceValue: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.dark,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray[200],
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  totalValue: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.danger,
  },
  timeline: {
    paddingVertical: 8,
  },
  timelineStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  timelineIconContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineIconActive: {
    backgroundColor: COLORS.primary,
  },
  timelineIconCompleted: {
    backgroundColor: COLORS.success,
  },
  timelineLine: {
    width: 2,
    height: 24,
    backgroundColor: COLORS.gray[200],
    marginTop: 4,
  },
  timelineLineCompleted: {
    backgroundColor: COLORS.success,
  },
  timelineLabel: {
    fontSize: SIZES.body,
    color: COLORS.gray[600],
    paddingTop: 10,
  },
  timelineLabelActive: {
    color: COLORS.dark,
    fontWeight: '600',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.danger,
    backgroundColor: COLORS.white,
  },
  cancelButtonText: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.danger,
  },
  reorderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: SIZES.borderRadius,
    backgroundColor: COLORS.primary,
  },
  reorderButtonText: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.white,
  },
  reviewProductButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.primary + '10',
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginTop: 8,
    marginBottom: 8,
  },
  reviewProductText: {
    fontSize: SIZES.small,
    fontWeight: '600',
    color: COLORS.primary,
  },
});

export default OrderDetailScreen;
