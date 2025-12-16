import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useSettings } from '../../contexts/SettingsContext';
import api from '../../services/api';
import { COLORS, SIZES } from '../../constants/config';

const CheckoutScreen = ({ route, navigation }: any) => {
  const { user, isAuthenticated } = useAuth();
  const { clearCart } = useCart();
  const { settings } = useSettings();
  const { selectedItems = [], subtotal = 0, shipping = 0, total = 0 } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [loadingAddress, setLoadingAddress] = useState(true);

  // Shipping Address
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [hoTen, setHoTen] = useState('');
  const [soDienThoai, setSoDienThoai] = useState('');
  const [diaChi, setDiaChi] = useState('');
  const [phuongXa, setPhuongXa] = useState('');
  const [quanHuyen, setQuanHuyen] = useState('');
  const [tinhThanh, setTinhThanh] = useState('');
  const [ghiChu, setGhiChu] = useState('');

  // Payment
  const [phuongThucThanhToan, setPhuongThucThanhToan] = useState('cod');

  // Voucher state
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [checkingVoucher, setCheckingVoucher] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      Alert.alert('Thông báo', 'Vui lòng đăng nhập để tiếp tục', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
      return;
    }

    if (!selectedItems || selectedItems.length === 0) {
      Alert.alert('Thông báo', 'Không có sản phẩm nào để thanh toán', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
      return;
    }

    loadDefaultAddress();
  }, [isAuthenticated, user, selectedItems]);

  const loadDefaultAddress = async () => {
    setLoadingAddress(true);
    try {
      const response = await api.getAddresses();
      if (response.success && response.data) {
        // Find default address or use first address
        const defaultAddr = response.data.find((addr: any) => addr.macDinh) || response.data[0];

        if (defaultAddr) {
          setSelectedAddress(defaultAddr);
          fillAddressForm(defaultAddr);
        } else {
          // No saved address, pre-fill with user info
          if (user) {
            setHoTen(user.hoTen || '');
            setSoDienThoai(user.soDienThoai || '');
          }
        }
      }
    } catch (error) {
      console.error('Error loading address:', error);
      // Fallback to user info
      if (user) {
        setHoTen(user.hoTen || '');
        setSoDienThoai(user.soDienThoai || '');
      }
    }
    setLoadingAddress(false);
  };

  const fillAddressForm = (address: any) => {
    setHoTen(address.hoTen || '');
    setSoDienThoai(address.soDienThoai || '');
    setDiaChi(address.diaChiChiTiet || '');
    setPhuongXa(address.xa || '');
    setQuanHuyen(address.huyen || '');
    setTinhThanh(address.tinh || '');
  };

  const handleCheckVoucher = async () => {
    if (!voucherCode.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập mã giảm giá');
      return;
    }

    setCheckingVoucher(true);
    try {
      const response = await api.checkVoucher(voucherCode.trim().toUpperCase(), subtotal);

      if (response.success && response.data) {
        setAppliedVoucher(response.data);
        Alert.alert('Thành công', response.message || 'Áp dụng mã giảm giá thành công!');
      } else {
        Alert.alert('Lỗi', response.message || 'Mã giảm giá không hợp lệ');
      }
    } catch (error: any) {
      console.error('Error checking voucher:', error);
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể kiểm tra mã giảm giá');
    } finally {
      setCheckingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode('');
    Alert.alert('Thành công', 'Đã hủy mã giảm giá');
  };

  const handleSelectAddress = (address: any) => {
    setSelectedAddress(address);
    fillAddressForm(address);
  };

  const handleChangeAddress = () => {
    navigation.navigate('AddressList', {
      selectMode: true,
      onSelect: handleSelectAddress,
    });
  };

  const validateForm = () => {
    if (!hoTen.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập họ tên');
      return false;
    }
    if (!soDienThoai.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại');
      return false;
    }
    if (!diaChi.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ');
      return false;
    }
    if (!phuongXa.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập phường/xã');
      return false;
    }
    if (!quanHuyen.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập quận/huyện');
      return false;
    }
    if (!tinhThanh.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tỉnh/thành phố');
      return false;
    }
    return true;
  };

  const voucherDiscount = appliedVoucher?.giaTriGiamThucTe || 0;
  const finalTotal = subtotal + shipping - voucherDiscount;

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Prepare order data matching backend schema
      const orderData: any = {
        sanPham: selectedItems.map((item: any) => ({
          sanPham: item.productId,
          tenSanPham: item.name,
          hinhAnh: item.image || (item.images && item.images[0]) || '',
          gia: item.salePrice || item.price,
          soLuong: item.quantity,
          size: item.size,
          mauSac: item.color,
          thanhTien: (item.salePrice || item.price) * item.quantity,
        })),
        tongTien: subtotal,
        phiVanChuyen: shipping,
        giamGia: voucherDiscount,
        tongThanhToan: finalTotal,
        diaChiGiaoHang: {
          hoTen,
          soDienThoai,
          tinh: tinhThanh,
          huyen: quanHuyen,
          xa: phuongXa,
          diaChiChiTiet: diaChi,
        },
        phuongThucThanhToan: phuongThucThanhToan.toLowerCase(),
        ghiChu,
      };

      // Add voucher info if applied
      if (appliedVoucher && appliedVoucher.voucher) {
        orderData.maGiamGia = {
          voucher: appliedVoucher.voucher._id,
          ma: appliedVoucher.voucher.ma,
          giaTriGiam: appliedVoucher.giaTriGiamThucTe,
        };
      }

      const response = await api.createOrder(orderData);

      if (response.success) {
        // Clear cart after successful order
        clearCart();

        // Navigate to success screen
        navigation.replace('OrderSuccess', {
          orderId: response.data._id,
          orderCode: response.data.maDonHang,
        });
      } else {
        Alert.alert('Lỗi', response.message || 'Không thể tạo đơn hàng');
      }
    } catch (error: any) {
      console.error('Error creating order:', error);
      Alert.alert('Lỗi', error.message || 'Đã có lỗi xảy ra khi đặt hàng');
    }
    setLoading(false);
  };

  if (!selectedItems || selectedItems.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Đơn hàng ({selectedItems.length} sản phẩm)</Text>
          {selectedItems.map((item: any) => (
            <View key={item.id} style={styles.orderItem}>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.itemDetails}>
                {item.size} • {item.color} • x{item.quantity}
              </Text>
              <Text style={styles.itemPrice}>
                ₫{((item.salePrice || item.price) * item.quantity).toLocaleString('vi-VN')}
              </Text>
            </View>
          ))}
        </View>

        {/* Shipping Address */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Địa chỉ giao hàng</Text>
            <TouchableOpacity
              style={styles.changeAddressButton}
              onPress={handleChangeAddress}
            >
              <Ionicons name="location-outline" size={16} color={COLORS.primary} />
              <Text style={styles.changeAddressText}>Thay đổi</Text>
            </TouchableOpacity>
          </View>

          {loadingAddress ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.loadingText}>Đang tải địa chỉ...</Text>
            </View>
          ) : selectedAddress ? (
            <View style={styles.selectedAddressCard}>
              <View style={styles.addressRow}>
                <Ionicons name="person" size={16} color={COLORS.gray[600]} />
                <Text style={styles.addressInfoText}>{hoTen}</Text>
                {selectedAddress.macDinh && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultBadgeText}>Mặc định</Text>
                  </View>
                )}
              </View>
              <View style={styles.addressRow}>
                <Ionicons name="call" size={16} color={COLORS.gray[600]} />
                <Text style={styles.addressInfoText}>{soDienThoai}</Text>
              </View>
              <View style={styles.addressRow}>
                <Ionicons name="location" size={16} color={COLORS.gray[600]} />
                <Text style={styles.addressInfoText}>
                  {diaChi}, {phuongXa}, {quanHuyen}, {tinhThanh}
                </Text>
              </View>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Họ tên người nhận *</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập họ tên"
              value={hoTen}
              onChangeText={setHoTen}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Số điện thoại *</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập số điện thoại"
              value={soDienThoai}
              onChangeText={setSoDienThoai}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Địa chỉ cụ thể *</Text>
            <TextInput
              style={styles.input}
              placeholder="Số nhà, tên đường"
              value={diaChi}
              onChangeText={setDiaChi}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phường/Xã *</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập phường/xã"
              value={phuongXa}
              onChangeText={setPhuongXa}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Quận/Huyện *</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập quận/huyện"
              value={quanHuyen}
              onChangeText={setQuanHuyen}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tỉnh/Thành phố *</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập tỉnh/thành phố"
              value={tinhThanh}
              onChangeText={setTinhThanh}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ghi chú (tùy chọn)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Ghi chú cho đơn hàng"
              value={ghiChu}
              onChangeText={setGhiChu}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>

          {settings?.paymentMethods?.cod && (
            <TouchableOpacity
              style={[
                styles.paymentMethod,
                phuongThucThanhToan === 'cod' && styles.paymentMethodActive,
              ]}
              onPress={() => setPhuongThucThanhToan('cod')}
            >
              <View style={styles.paymentMethodContent}>
                <View style={styles.paymentIcon}>
                  <Ionicons name="cash-outline" size={24} color={COLORS.primary} />
                </View>
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentName}>Thanh toán khi nhận hàng (COD)</Text>
                  <Text style={styles.paymentDescription}>
                    Thanh toán bằng tiền mặt khi nhận hàng
                  </Text>
                </View>
              </View>
              <View style={styles.radio}>
                {phuongThucThanhToan === 'cod' && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          )}

          {settings?.paymentMethods?.vnpay && (
            <TouchableOpacity
              style={[
                styles.paymentMethod,
                phuongThucThanhToan === 'vnpay' && styles.paymentMethodActive,
              ]}
              onPress={() => setPhuongThucThanhToan('vnpay')}
            >
              <View style={styles.paymentMethodContent}>
                <View style={styles.paymentIcon}>
                  <Ionicons name="card-outline" size={24} color={COLORS.primary} />
                </View>
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentName}>VNPay</Text>
                  <Text style={styles.paymentDescription}>
                    Thanh toán qua VNPay
                  </Text>
                </View>
              </View>
              <View style={styles.radio}>
                {phuongThucThanhToan === 'vnpay' && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          )}

          {settings?.paymentMethods?.momo && (
            <TouchableOpacity
              style={[
                styles.paymentMethod,
                phuongThucThanhToan === 'momo' && styles.paymentMethodActive,
              ]}
              onPress={() => setPhuongThucThanhToan('momo')}
            >
              <View style={styles.paymentMethodContent}>
                <View style={styles.paymentIcon}>
                  <Ionicons name="wallet-outline" size={24} color={COLORS.primary} />
                </View>
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentName}>MoMo</Text>
                  <Text style={styles.paymentDescription}>
                    Thanh toán qua ví điện tử MoMo
                  </Text>
                </View>
              </View>
              <View style={styles.radio}>
                {phuongThucThanhToan === 'momo' && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          )}

          {settings?.paymentMethods?.bankTransfer && (
            <TouchableOpacity
              style={[
                styles.paymentMethod,
                phuongThucThanhToan === 'bankTransfer' && styles.paymentMethodActive,
              ]}
              onPress={() => setPhuongThucThanhToan('bankTransfer')}
            >
              <View style={styles.paymentMethodContent}>
                <View style={styles.paymentIcon}>
                  <Ionicons name="business-outline" size={24} color={COLORS.primary} />
                </View>
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentName}>Chuyển khoản ngân hàng</Text>
                  <Text style={styles.paymentDescription}>
                    Thanh toán qua chuyển khoản ngân hàng
                  </Text>
                </View>
              </View>
              <View style={styles.radio}>
                {phuongThucThanhToan === 'bankTransfer' && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Voucher Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mã Giảm Giá</Text>

          {!appliedVoucher ? (
            <View>
              <View style={styles.voucherInputContainer}>
                <TextInput
                  style={styles.voucherInput}
                  placeholder="Nhập mã giảm giá"
                  value={voucherCode}
                  onChangeText={(text) => setVoucherCode(text.toUpperCase())}
                  editable={!checkingVoucher}
                  autoCapitalize="characters"
                />
                <TouchableOpacity
                  style={[
                    styles.voucherButton,
                    (!voucherCode.trim() || checkingVoucher) && styles.voucherButtonDisabled,
                  ]}
                  onPress={handleCheckVoucher}
                  disabled={!voucherCode.trim() || checkingVoucher}
                >
                  {checkingVoucher ? (
                    <ActivityIndicator size="small" color={COLORS.white} />
                  ) : (
                    <Text style={styles.voucherButtonText}>Áp dụng</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.appliedVoucherCard}>
              <View style={styles.appliedVoucherContent}>
                <View style={styles.voucherIconContainer}>
                  <Ionicons name="pricetag" size={20} color={COLORS.success} />
                </View>
                <View style={styles.appliedVoucherInfo}>
                  <Text style={styles.appliedVoucherCode}>{appliedVoucher.voucher.ma}</Text>
                  {appliedVoucher.voucher.moTa && (
                    <Text style={styles.appliedVoucherDesc}>{appliedVoucher.voucher.moTa}</Text>
                  )}
                  <Text style={styles.appliedVoucherDiscount}>
                    -₫{voucherDiscount.toLocaleString('vi-VN')}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={handleRemoveVoucher} style={styles.removeVoucherButton}>
                <Ionicons name="close-circle" size={24} color={COLORS.danger} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Price Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chi tiết thanh toán</Text>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Tạm tính</Text>
            <Text style={styles.priceValue}>₫{subtotal.toLocaleString('vi-VN')}</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Phí vận chuyển</Text>
            <Text style={styles.priceValue}>
              {shipping === 0 ? (
                <Text style={{ color: COLORS.success }}>Miễn phí</Text>
              ) : (
                `₫${shipping.toLocaleString('vi-VN')}`
              )}
            </Text>
          </View>

          {voucherDiscount > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Mã giảm giá</Text>
              <Text style={[styles.priceValue, { color: COLORS.success }]}>
                -₫{voucherDiscount.toLocaleString('vi-VN')}
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.totalValue}>₫{finalTotal.toLocaleString('vi-VN')}</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.footer}>
        <View style={styles.footerInfo}>
          <Text style={styles.footerLabel}>Tổng thanh toán</Text>
          <Text style={styles.footerTotal}>₫{finalTotal.toLocaleString('vi-VN')}</Text>
        </View>
        <TouchableOpacity
          style={[styles.placeOrderButton, loading && styles.buttonDisabled]}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.placeOrderText}>Đặt Hàng</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[100],
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
  orderItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  itemName: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 4,
  },
  itemDetails: {
    fontSize: SIZES.small,
    color: COLORS.gray[600],
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: SIZES.body,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: SIZES.borderRadius,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: SIZES.body,
    color: COLORS.dark,
    backgroundColor: COLORS.white,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: SIZES.borderRadius,
    marginBottom: 12,
  },
  paymentMethodActive: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    backgroundColor: COLORS.primary + '05',
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentName: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 4,
  },
  paymentDescription: {
    fontSize: SIZES.small,
    color: COLORS.gray[600],
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.gray[400],
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
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
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
    padding: SIZES.padding,
  },
  footerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  footerLabel: {
    fontSize: SIZES.body,
    color: COLORS.gray[700],
  },
  footerTotal: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.danger,
  },
  placeOrderButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: SIZES.borderRadius,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  placeOrderText: {
    color: COLORS.white,
    fontSize: SIZES.body,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  changeAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.primary + '10',
    borderRadius: 6,
  },
  changeAddressText: {
    fontSize: SIZES.small,
    color: COLORS.primary,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  loadingText: {
    fontSize: SIZES.body,
    color: COLORS.gray[600],
  },
  selectedAddressCard: {
    backgroundColor: COLORS.gray[50],
    borderRadius: SIZES.borderRadius,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  addressInfoText: {
    flex: 1,
    fontSize: SIZES.body,
    color: COLORS.dark,
  },
  defaultBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultBadgeText: {
    fontSize: SIZES.tiny,
    color: COLORS.white,
    fontWeight: '600',
  },
  // Voucher styles
  voucherInputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  voucherInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: SIZES.borderRadius,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: SIZES.body,
    color: COLORS.dark,
    backgroundColor: COLORS.white,
  },
  voucherButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: SIZES.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
  },
  voucherButtonDisabled: {
    opacity: 0.5,
  },
  voucherButtonText: {
    color: COLORS.white,
    fontSize: SIZES.body,
    fontWeight: '600',
  },
  appliedVoucherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.success + '10',
    borderRadius: SIZES.borderRadius,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.success + '30',
  },
  appliedVoucherContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  voucherIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.success + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appliedVoucherInfo: {
    flex: 1,
  },
  appliedVoucherCode: {
    fontSize: SIZES.body,
    fontWeight: 'bold',
    color: COLORS.success,
    marginBottom: 2,
  },
  appliedVoucherDesc: {
    fontSize: SIZES.small,
    color: COLORS.gray[600],
    marginBottom: 4,
  },
  appliedVoucherDiscount: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.success,
  },
  removeVoucherButton: {
    padding: 4,
  },
});

export default CheckoutScreen;
