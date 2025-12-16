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
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'vnpay' | 'momo'>('cod');
  const [usePoints, setUsePoints] = useState(false);
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
  const pointsDiscount = usePoints ? 50000 : 0;
  const voucherDiscount = appliedVoucher?.giaTriGiamThucTe || 0;
  const total = subtotal + shippingFee - pointsDiscount - voucherDiscount;

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
        giamGia: pointsDiscount + voucherDiscount,
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

      const response = await api.createOrder(token, orderData);

      if (response.success) {
        toast.success('Đặt hàng thành công!');
        clearCart();

        // Redirect based on payment method
        if (paymentMethod === 'cod') {
          router.push(`/tai-khoan/don-hang`);
        } else {
          // For online payment, redirect to payment gateway
          // This would be implemented based on payment provider
          toast.info('Chuyển đến trang thanh toán...');
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
            <Link href="/gio-hang" className="hover:text-blue-600">Giỏ hàng</Link>
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
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">Chọn địa chỉ đã lưu</h3>
                      <Link href="/tai-khoan" className="text-sm text-blue-600 hover:text-blue-700">
                        Quản lý địa chỉ
                      </Link>
                    </div>
                    <div className="space-y-2">
                      {savedAddresses.map((address) => (
                        <label
                          key={address._id}
                          className={`flex items-start p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedAddressId === address._id
                              ? 'border-blue-600 bg-white'
                              : 'border-gray-200 bg-white hover:border-blue-300'
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
                                <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
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
                    <div className="mt-3 pt-3 border-t border-blue-200">
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
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
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
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 h-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${paymentMethod === 'cod' ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'cod')}
                        className="w-5 h-5 text-blue-600"
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

                  {settings?.paymentMethods?.vnpay && (
                    <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${paymentMethod === 'vnpay' ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>
                      <input
                        type="radio"
                        name="payment"
                        value="vnpay"
                        checked={paymentMethod === 'vnpay'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'vnpay')}
                        className="w-5 h-5 text-blue-600"
                      />
                      <div className="ml-4 flex-1">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                            <span className="text-white text-xs font-bold">VP</span>
                          </div>
                          <span className="font-semibold text-gray-900">VNPay</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Thanh toán qua cổng VNPay</p>
                      </div>
                    </label>
                  )}

                  {settings?.paymentMethods?.momo && (
                    <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${paymentMethod === 'momo' ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>
                      <input
                        type="radio"
                        name="payment"
                        value="momo"
                        checked={paymentMethod === 'momo'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'momo')}
                        className="w-5 h-5 text-blue-600"
                      />
                      <div className="ml-4 flex-1">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-pink-600 rounded flex items-center justify-center">
                            <span className="text-white text-xs font-bold">M</span>
                          </div>
                          <span className="font-semibold text-gray-900">MoMo</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Thanh toán qua ví điện tử MoMo</p>
                      </div>
                    </label>
                  )}

                  {settings?.paymentMethods?.bankTransfer && (
                    <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${paymentMethod === 'bankTransfer' ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>
                      <input
                        type="radio"
                        name="payment"
                        value="bankTransfer"
                        checked={paymentMethod === 'bankTransfer'}
                        onChange={(e) => setPaymentMethod(e.target.value as any)}
                        className="w-5 h-5 text-blue-600"
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
              <div className="bg-white rounded-lg shadow-sm p-6">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="font-semibold text-gray-900">Sử dụng điểm tích lũy</div>
                    <p className="text-sm text-gray-600 mt-1">Bạn có 500 điểm (≈ ₫50,000)</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={usePoints}
                    onChange={(e) => setUsePoints(e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                </label>
              </div>
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
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
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
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        disabled={checkingVoucher}
                      />
                      <button
                        type="button"
                        onClick={handleCheckVoucher}
                        disabled={checkingVoucher || !voucherCode.trim()}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
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
                  {usePoints && (
                    <div className="flex justify-between text-green-600">
                      <span>Điểm tích lũy</span>
                      <span className="font-semibold">-₫{pointsDiscount.toLocaleString('vi-VN')}</span>
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
                  className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Đang xử lý...' : 'Đặt Hàng'}
                </button>

                <div className="mt-4 text-center">
                  <Link
                    href="/gio-hang"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    ← Quay lại giỏ hàng
                  </Link>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
