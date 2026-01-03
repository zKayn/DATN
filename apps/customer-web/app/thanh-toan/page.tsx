'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { useSettings } from '@/contexts/SettingsContext';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, clearCart } = useCart();
  const { settings } = useSettings();
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [showAddressSelector, setShowAddressSelector] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    district: '',
    ward: '',
    note: ''
  });
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'stripe' | 'bankTransfer'>('cod');
  const [userPoints, setUserPoints] = useState(0);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Voucher state
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [checkingVoucher, setCheckingVoucher] = useState(false);

  // Location data
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  // Load provinces on mount
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        const response = await fetch('https://provinces.open-api.vn/api/p/');
        const data = await response.json();
        setProvinces(data);
      } catch (error) {
        console.error('Lỗi khi tải danh sách tỉnh/thành phố:', error);
      }
    };
    loadProvinces();
  }, []);

  // Load user info and saved addresses if logged in
  useEffect(() => {
    const loadUserInfo = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.getProfile(token);
          if (response.success && response.data) {
            const user = response.data;

            // Set basic user info
            setShippingInfo(prev => ({
              ...prev,
              fullName: user.hoTen || user.ten || '',
              email: user.email || '',
              phone: user.soDienThoai || ''
            }));

            // Set user points
            setUserPoints(user.diemTichLuy || 0);

            // Load saved addresses
            if (user.diaChi && user.diaChi.length > 0) {
              setSavedAddresses(user.diaChi);
              setShowAddressSelector(true);

              // Auto-select default address if exists
              const defaultAddress = user.diaChi.find((addr: any) => addr.macDinh);
              if (defaultAddress) {
                setSelectedAddressId(defaultAddress._id);
                setShippingInfo(prev => ({
                  ...prev,
                  fullName: defaultAddress.hoTen,
                  phone: defaultAddress.soDienThoai,
                  address: defaultAddress.diaChiChiTiet,
                  city: defaultAddress.tinh,
                  district: defaultAddress.huyen,
                  ward: defaultAddress.xa
                }));
              }
            }
          }
        } catch (error) {
          console.error('Lỗi khi tải thông tin người dùng:', error);
        }
      }
    };
    loadUserInfo();
  }, []);

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      toast.error('Giỏ hàng trống');
      router.push('/gio-hang');
    }
  }, [cartItems, router]);

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.salePrice || item.price;
    return sum + price * item.quantity;
  }, 0);

  const freeShippingThreshold = settings?.freeShippingThreshold || 500000;
  const shippingFeeAmount = settings?.shippingFee || 30000;
  const shippingFee = subtotal >= freeShippingThreshold ? 0 : shippingFeeAmount;

  // Tỷ lệ quy đổi: 1 điểm = 1,000 VND
  const voucherDiscount = appliedVoucher?.giaTriGiamThucTe || 0;

  // Cap points discount at remaining subtotal (after voucher, can't discount shipping)
  const maxPointsDiscount = Math.max(0, subtotal - voucherDiscount);
  const pointsDiscountValue = pointsToUse * 1000;
  const actualPointsDiscount = Math.min(pointsDiscountValue, maxPointsDiscount);
  const actualPointsUsed = Math.floor(actualPointsDiscount / 1000);

  // Total: (subtotal - discounts) + shipping (always charged)
  const total = subtotal - voucherDiscount - actualPointsDiscount + shippingFee;

  // Handle province/city selection
  const handleCityChange = async (provinceCode: string) => {
    const selectedProvince = provinces.find(p => p.code.toString() === provinceCode);
    if (selectedProvince) {
      setShippingInfo(prev => ({
        ...prev,
        city: selectedProvince.name,
        district: '',
        ward: ''
      }));

      // Load districts
      try {
        const response = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
        const data = await response.json();
        setDistricts(data.districts || []);
        setWards([]);
      } catch (error) {
        console.error('Lỗi khi tải danh sách quận/huyện:', error);
      }
    }
  };

  // Handle district selection
  const handleDistrictChange = async (districtCode: string) => {
    const selectedDistrict = districts.find(d => d.code.toString() === districtCode);
    if (selectedDistrict) {
      setShippingInfo(prev => ({
        ...prev,
        district: selectedDistrict.name,
        ward: ''
      }));

      // Load wards
      try {
        const response = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
        const data = await response.json();
        setWards(data.wards || []);
      } catch (error) {
        console.error('Lỗi khi tải danh sách phường/xã:', error);
      }
    }
  };

  // Handle ward selection
  const handleWardChange = (wardCode: string) => {
    const selectedWard = wards.find(w => w.code.toString() === wardCode);
    if (selectedWard) {
      setShippingInfo(prev => ({
        ...prev,
        ward: selectedWard.name
      }));
    }
  };

  // Handle address selection
  const handleSelectAddress = (addressId: string) => {
    const address = savedAddresses.find(addr => addr._id === addressId);
    if (address) {
      setSelectedAddressId(addressId);
      setShippingInfo(prev => ({
        ...prev,
        fullName: address.hoTen,
        phone: address.soDienThoai,
        address: address.diaChiChiTiet,
        city: address.tinh,
        district: address.huyen,
        ward: address.xa
      }));
    }
  };

  const handleCheckVoucher = async () => {
    if (!voucherCode.trim()) {
      toast.error('Vui lòng nhập mã giảm giá');
      return;
    }

    setCheckingVoucher(true);
    try {
      const token = localStorage.getItem('token');
      const response = await api.checkVoucher(voucherCode.trim().toUpperCase(), subtotal, token || undefined);

      if (response.success && response.data) {
        setAppliedVoucher(response.data);
        toast.success(response.message || 'Áp dụng mã giảm giá thành công!');
      } else {
        toast.error(response.message || 'Mã giảm giá không hợp lệ');
      }
    } catch (error: any) {
      console.error('Error checking voucher:', error);
      toast.error(error.message || 'Không thể kiểm tra mã giảm giá');
    } finally {
      setCheckingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode('');
    toast.success('Đã hủy mã giảm giá');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!shippingInfo.fullName || !shippingInfo.phone || !shippingInfo.address || !shippingInfo.city) {
      toast.error('Vui lòng điền đầy đủ thông tin giao hàng');
      return;
    }

    // Validate phone
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(shippingInfo.phone)) {
      toast.error('Số điện thoại không hợp lệ');
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Vui lòng đăng nhập để đặt hàng');
        router.push('/dang-nhap');
        return;
      }

      // Prepare order data
      const orderData: any = {
        sanPham: cartItems.map(item => {
          const itemPrice = item.salePrice || item.price;
          return {
            sanPham: item.productId,
            tenSanPham: item.name,
            hinhAnh: item.image,
            gia: itemPrice,
            soLuong: item.quantity,
            size: item.size,
            mauSac: item.color,
            thanhTien: itemPrice * item.quantity
          };
        }),
        tongTien: subtotal,
        phiVanChuyen: shippingFee,
        giamGia: actualPointsDiscount + voucherDiscount,
        tongThanhToan: total,
        phuongThucThanhToan: paymentMethod,
        diaChiGiaoHang: {
          hoTen: shippingInfo.fullName,
          soDienThoai: shippingInfo.phone,
          tinh: shippingInfo.city,
          huyen: shippingInfo.district || 'Chưa chọn',
          xa: shippingInfo.ward || 'Chưa chọn',
          diaChiChiTiet: shippingInfo.address
        },
        ghiChu: shippingInfo.note
      };

      // Add voucher info if applied
      if (appliedVoucher && appliedVoucher.voucher) {
        orderData.maGiamGia = {
          voucher: appliedVoucher.voucher._id,
          ma: appliedVoucher.voucher.ma,
          giaTriGiam: appliedVoucher.giaTriGiamThucTe
        };
      }

      // Add points usage if any
      if (actualPointsUsed > 0) {
        orderData.diemSuDung = actualPointsUsed;
      }

      const response = await api.createOrder(token, orderData);

      if (response.success) {
        const order = response.data;

        // Handle payment method
        if (paymentMethod === 'stripe') {
          // Create Stripe payment intent
          toast('Đang khởi tạo thanh toán...');

          const paymentResponse = await api.createStripePaymentIntent(
            token,
            order._id,
            total
          );

          if (paymentResponse.success) {
            // Redirect to Stripe payment page
            router.push(
              `/payment/stripe?orderId=${order._id}&clientSecret=${paymentResponse.data.clientSecret}`
            );
          } else {
            toast.error(paymentResponse.message || 'Không thể khởi tạo thanh toán');
          }
        } else if (paymentMethod === 'cod') {
          // COD - clear cart and redirect
          toast.success('Đặt hàng thành công!');
          clearCart();
          router.push('/tai-khoan/don-hang');
        } else {
          // Other payment methods
          toast.success('Đặt hàng thành công!');
          clearCart();
          router.push('/tai-khoan/don-hang');
        }
      } else {
        toast.error(response.message || 'Đặt hàng thất bại');
      }
    } catch (error: any) {
      console.error('Lỗi khi đặt hàng:', error);
      toast.error(error.message || 'Không thể đặt hàng. Vui lòng thử lại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Link href="/gio-hang" className="hover:text-primary-500">Giỏ hàng</Link>
            <span>/</span>
            <span className="text-gray-900">Thanh toán</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Thanh Toán</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Shipping & Payment Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Thông Tin Giao Hàng</h2>

                {/* Saved Addresses Selector */}
                {showAddressSelector && savedAddresses.length > 0 && (
                  <div className="mb-6 p-4 bg-primary-50 rounded-lg border border-primary-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">Chọn địa chỉ đã lưu</h3>
                      <Link href="/tai-khoan" className="text-sm text-primary-500 hover:text-primary-800">
                        Quản lý địa chỉ
                      </Link>
                    </div>
                    <div className="space-y-2">
                      {savedAddresses.map((address) => (
                        <label
                          key={address._id}
                          className={`flex items-start p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedAddressId === address._id
                              ? 'border-primary-500 bg-white'
                              : 'border-gray-200 bg-white hover:border-primary-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="savedAddress"
                            value={address._id}
                            checked={selectedAddressId === address._id}
                            onChange={() => handleSelectAddress(address._id)}
                            className="mt-1 mr-3"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-900">
                                {address.hoTen} | {address.soDienThoai}
                              </span>
                              {address.macDinh && (
                                <span className="text-xs bg-primary-500 text-white px-2 py-0.5 rounded">
                                  Mặc định
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {address.diaChiChiTiet}, {address.xa}, {address.huyen}, {address.tinh}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-primary-200">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedAddressId('');
                          setShippingInfo(prev => ({
                            ...prev,
                            address: '',
                            city: '',
                            district: '',
                            ward: ''
                          }));
                        }}
                        className="text-sm text-primary-500 hover:text-primary-800 font-medium"
                      >
                        + Nhập địa chỉ mới
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Họ và tên <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.fullName}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-700 focus:border-transparent"
                      placeholder="Nguyễn Văn A"
                      required
                      readOnly={!!selectedAddressId}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Số điện thoại <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-700 focus:border-transparent"
                      placeholder="0123456789"
                      required
                      readOnly={!!selectedAddressId}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={shippingInfo.email}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-700 focus:border-transparent"
                      placeholder="email@example.com"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Địa chỉ <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.address}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-700 focus:border-transparent"
                      placeholder="Số nhà, tên đường"
                      required
                      readOnly={!!selectedAddressId}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Tỉnh/Thành phố <span className="text-red-600">*</span>
                    </label>
                    {selectedAddressId && shippingInfo.city ? (
                      <input
                        type="text"
                        value={shippingInfo.city}
                        readOnly
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 text-gray-700"
                      />
                    ) : (
                      <select
                        value={provinces.find(p => p.name === shippingInfo.city)?.code || ''}
                        onChange={(e) => handleCityChange(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-700 focus:border-transparent"
                        required
                      >
                        <option value="">Chọn Tỉnh/Thành phố</option>
                        {provinces.map((province) => (
                          <option key={province.code} value={province.code}>
                            {province.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Quận/Huyện
                    </label>
                    {selectedAddressId && shippingInfo.district ? (
                      <input
                        type="text"
                        value={shippingInfo.district}
                        readOnly
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 text-gray-700"
                      />
                    ) : (
                      <select
                        value={districts.find(d => d.name === shippingInfo.district)?.code || ''}
                        onChange={(e) => handleDistrictChange(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-700 focus:border-transparent"
                        disabled={!shippingInfo.city}
                      >
                        <option value="">Chọn Quận/Huyện</option>
                        {districts.map((district) => (
                          <option key={district.code} value={district.code}>
                            {district.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Phường/Xã
                    </label>
                    {selectedAddressId && shippingInfo.ward ? (
                      <input
                        type="text"
                        value={shippingInfo.ward}
                        readOnly
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 text-gray-700"
                      />
                    ) : (
                      <select
                        value={wards.find(w => w.name === shippingInfo.ward)?.code || ''}
                        onChange={(e) => handleWardChange(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-700 focus:border-transparent"
                        disabled={!shippingInfo.district}
                      >
                        <option value="">Chọn Phường/Xã</option>
                        {wards.map((ward) => (
                          <option key={ward.code} value={ward.code}>
                            {ward.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Ghi chú đơn hàng (tùy chọn)
                    </label>
                    <textarea
                      value={shippingInfo.note}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, note: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 h-24 focus:ring-2 focus:ring-primary-700 focus:border-transparent"
                      placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Phương Thức Thanh Toán</h2>

                <div className="space-y-3">
                  {settings?.paymentMethods?.cod && (
                    <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${paymentMethod === 'cod' ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}`}>
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'cod')}
                        className="w-5 h-5 text-primary-500"
                      />
                      <div className="ml-4 flex-1">
                        <div className="flex items-center gap-2">
                          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span className="font-semibold text-gray-900">Thanh toán khi nhận hàng (COD)</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Thanh toán bằng tiền mặt khi nhận hàng</p>
                      </div>
                    </label>
                  )}

                  {settings?.paymentMethods?.stripe && (
                    <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${paymentMethod === 'stripe' ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}`}>
                      <input
                        type="radio"
                        name="payment"
                        value="stripe"
                        checked={paymentMethod === 'stripe'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'stripe')}
                        className="w-5 h-5 text-primary-500"
                      />
                      <div className="ml-4 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <svg className="w-16 h-6" viewBox="0 0 60 25" fill="none">
                            <path fill="#635BFF" d="M13.3 11.5c0-.9-.5-1.3-1.5-1.3H9.6v2.8h2.1c1 0 1.6-.4 1.6-1.5zm-1-4.4c0-.8-.5-1.2-1.3-1.2H9.6v2.5H11c.9 0 1.3-.4 1.3-1.3zM15.6 11.6c0 1.8-1.2 3.1-3.2 3.1H7.3V3.6h4.8c1.9 0 3 1.1 3 2.7 0 1-.5 1.8-1.3 2.2 1 .3 1.8 1.3 1.8 3.1zM22.4 7.1c-1 0-1.7.4-2.2 1V7.2h-2.3v10.5h2.3v-3.6c.5.6 1.2.9 2.2.9 2.2 0 3.6-1.7 3.6-4.5s-1.4-4.4-3.6-4.4zm-.6 6.8c-1.2 0-2-.9-2-2.4s.8-2.4 2-2.4 2 .9 2 2.4-.8 2.4-2 2.4zM29.3 7.2h-2.3v7.5h2.3V7.2zm-1.2-1c.8 0 1.4-.6 1.4-1.4s-.6-1.4-1.4-1.4-1.4.6-1.4 1.4.6 1.4 1.4 1.4zM35 7.1c-1 0-1.8.5-2.2 1.2V7.2h-2.3v7.5h2.3v-4.2c0-1.2.7-1.8 1.6-1.8.9 0 1.4.6 1.4 1.6v4.4h2.3v-5c0-2-1.1-3.2-3.1-3.2zM44.4 12.5h-4.2c.2 1 .9 1.5 1.9 1.5.6 0 1.2-.2 1.6-.7l1.3 1.3c-.7.8-1.8 1.3-3.1 1.3-2.4 0-4.1-1.7-4.1-4.5s1.7-4.4 4-4.4c2.2 0 3.9 1.7 3.9 4.4 0 .4 0 .8-.1 1.1zm-4.2-1.5h2.3c-.1-.9-.7-1.5-1.5-1.5s-1.4.6-1.5 1.5zM49.7 7.1c-1 0-1.8.5-2.2 1.2V7.2h-2.3v10.5h2.3v-3.6c.4.7 1.2 1.1 2.2 1.1 2.2 0 3.6-1.7 3.6-4.5s-1.4-4.6-3.6-4.6zm-.6 6.8c-1.2 0-2-.9-2-2.4s.8-2.4 2-2.4 2 .9 2 2.4-.8 2.4-2 2.4z"/>
                          </svg>
                          <span className="font-semibold text-gray-900">Thẻ quốc tế</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Thanh toán an toàn qua Stripe (Visa, Mastercard, JCB)</p>
                        <div className="flex gap-2 mt-2">
                          <div className="w-8 h-6 bg-gray-100 rounded flex items-center justify-center text-xs font-bold text-gray-700">VISA</div>
                          <div className="w-8 h-6 bg-gray-100 rounded flex items-center justify-center text-xs font-bold text-gray-700">MC</div>
                          <div className="w-8 h-6 bg-gray-100 rounded flex items-center justify-center text-xs font-bold text-gray-700">JCB</div>
                        </div>
                      </div>
                    </label>
                  )}

                  {settings?.paymentMethods?.bankTransfer && (
                    <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${paymentMethod === 'bankTransfer' ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}`}>
                      <input
                        type="radio"
                        name="payment"
                        value="bankTransfer"
                        checked={paymentMethod === 'bankTransfer'}
                        onChange={(e) => setPaymentMethod(e.target.value as any)}
                        className="w-5 h-5 text-primary-500"
                      />
                      <div className="ml-4 flex-1">
                        <div className="flex items-center gap-2">
                          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                          <span className="font-semibold text-gray-900">Chuyển khoản ngân hàng</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Thanh toán qua chuyển khoản ngân hàng</p>
                      </div>
                    </label>
                  )}
                </div>
              </div>

              {/* Use Points */}
              {userPoints > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Sử dụng điểm tích lũy</h3>
                  <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Số điểm hiện có:</span>
                      <span className="font-bold text-primary-500 text-lg">{userPoints.toLocaleString()} điểm</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Tỷ lệ: 1 điểm = ₫1,000 • Tối đa: ₫{(userPoints * 1000).toLocaleString('vi-VN')}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Số điểm muốn sử dụng
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="0"
                        max={userPoints}
                        value={pointsToUse}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          if (value <= userPoints && value >= 0) {
                            setPointsToUse(value);
                          }
                        }}
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-700 focus:border-transparent"
                        placeholder="0"
                      />
                      <button
                        type="button"
                        onClick={() => setPointsToUse(userPoints)}
                        className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-800 transition-colors font-medium text-sm whitespace-nowrap"
                      >
                        Dùng hết
                      </button>
                    </div>
                    {pointsToUse > 0 && (
                      <p className="text-sm text-green-600 mt-2">
                        Giảm giá: ₫{actualPointsDiscount.toLocaleString('vi-VN')}
                        {actualPointsUsed < pointsToUse && (
                          <span className="text-xs text-gray-600 ml-1">
                            (sử dụng {actualPointsUsed.toLocaleString()} điểm)
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Đơn Hàng</h2>

                {/* Order Items */}
                <div className="divide-y mb-4">
                  {cartItems.map((item) => {
                    const finalPrice = item.salePrice || item.price;
                    return (
                      <div key={item.id} className="py-4 first:pt-0">
                        <div className="flex gap-3">
                          <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                              {item.quantity}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 text-sm line-clamp-2">{item.name}</h4>
                            <p className="text-xs text-gray-600 mt-1">
                              {item.size} / {item.color}
                            </p>
                            <p className="text-sm font-semibold text-gray-900 mt-1">
                              ₫{(finalPrice * item.quantity).toLocaleString('vi-VN')}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Voucher Input */}
                <div className="mb-4 pb-4 border-b">
                  <h3 className="font-semibold text-gray-900 mb-3">Mã Giảm Giá</h3>
                  {!appliedVoucher ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                        placeholder="Nhập mã giảm giá"
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-700 focus:border-transparent text-sm"
                        disabled={checkingVoucher}
                      />
                      <button
                        type="button"
                        onClick={handleCheckVoucher}
                        disabled={checkingVoucher || !voucherCode.trim()}
                        className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-800 transition-colors font-medium text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {checkingVoucher ? 'Kiểm tra...' : 'Áp dụng'}
                      </button>
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <div>
                            <div className="font-bold text-green-800">{appliedVoucher.voucher.ma}</div>
                            {appliedVoucher.voucher.moTa && (
                              <div className="text-xs text-green-700">{appliedVoucher.voucher.moTa}</div>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveVoucher}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Price Summary */}
                <div className="space-y-3 mb-4 pb-4 border-t pt-4">
                  <div className="flex justify-between text-gray-700">
                    <span>Tạm tính</span>
                    <span className="font-semibold">₫{subtotal.toLocaleString('vi-VN')}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Phí vận chuyển</span>
                    <span className="font-semibold">
                      {shippingFee === 0 ? (
                        <span className="text-green-600">Miễn phí</span>
                      ) : (
                        `₫${shippingFee.toLocaleString('vi-VN')}`
                      )}
                    </span>
                  </div>
                  {pointsToUse > 0 && actualPointsDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Điểm tích lũy ({actualPointsUsed.toLocaleString()} điểm)</span>
                      <span className="font-semibold">-₫{actualPointsDiscount.toLocaleString('vi-VN')}</span>
                    </div>
                  )}
                  {voucherDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Mã giảm giá</span>
                      <span className="font-semibold">-₫{voucherDiscount.toLocaleString('vi-VN')}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between text-lg font-bold text-gray-900 mb-6 pt-4 border-t">
                  <span>Tổng cộng</span>
                  <span className="text-red-600">₫{total.toLocaleString('vi-VN')}</span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary-500 text-white py-4 rounded-lg hover:bg-primary-800 transition-colors font-semibold text-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Đang xử lý...' : 'Đặt Hàng'}
                </button>

                <div className="mt-4 text-center">
                  <Link
                    href="/gio-hang"
                    className="text-primary-500 hover:text-primary-800 text-sm font-medium"
                  >
                    ← Quay lại giỏ hàng
                  </Link>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <svg className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Thanh toán an toàn và bảo mật. Thông tin của bạn được mã hóa.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
