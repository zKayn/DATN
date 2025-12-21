'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

interface Settings {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  storeLogo: string;
  storeDescription: string;
  currency: string;
  taxRate: number;
  shippingFee: number;
  freeShippingThreshold: number;
  emailNotifications: boolean;
  orderNotifications: boolean;
  reviewNotifications: boolean;
  lowStockAlert: boolean;
  lowStockThreshold: number;
  maintenanceMode: boolean;
  paymentMethods: {
    cod: boolean;
    vnpay: boolean;
    momo: boolean;
    bankTransfer: boolean;
  };
  socialLinks: {
    facebook: string;
    instagram: string;
    youtube: string;
    tiktok: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
  };
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [recalculating, setRecalculating] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    storeName: 'Sport Store',
    storeEmail: 'contact@sportstore.vn',
    storePhone: '0123456789',
    storeAddress: 'Hà Nội, Việt Nam',
    storeLogo: '',
    storeDescription: 'Cửa hàng thể thao hàng đầu Việt Nam',
    currency: 'VND',
    taxRate: 10,
    shippingFee: 30000,
    freeShippingThreshold: 500000,
    emailNotifications: true,
    orderNotifications: true,
    reviewNotifications: true,
    lowStockAlert: true,
    lowStockThreshold: 10,
    maintenanceMode: false,
    paymentMethods: {
      cod: true,
      vnpay: true,
      momo: false,
      bankTransfer: false
    },
    socialLinks: {
      facebook: '',
      instagram: '',
      youtube: '',
      tiktok: ''
    },
    seo: {
      metaTitle: '',
      metaDescription: '',
      metaKeywords: ''
    }
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await api.getSettings();
      if (response.success && response.data) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Không thể tải cài đặt');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await api.updateSettings(settings);

      if (response.success) {
        toast.success('Lưu cài đặt thành công!');
        // Reload settings to get the updated data from server
        await loadSettings();
      } else {
        toast.error(response.error || 'Không thể lưu cài đặt');
      }
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error(error.message || 'Không thể lưu cài đặt');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success('Đổi mật khẩu thành công!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.error(error.message || 'Không thể đổi mật khẩu');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Kích thước ảnh không được vượt quá 2MB');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        toast.error('Vui lòng đăng nhập');
        return;
      }

      const uploadResponse = await api.uploadImage(file);

      if (uploadResponse.success && uploadResponse.data) {
        const logoUrl = uploadResponse.data.url;
        setSettings({ ...settings, storeLogo: logoUrl });
        toast.success('Tải logo lên thành công!');
      } else {
        toast.error(uploadResponse.message || 'Không thể tải ảnh lên');
      }
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      toast.error(error.message || 'Lỗi khi tải ảnh lên');
    } finally {
      setSaving(false);
    }
  };

  const handleRecalculateSold = async () => {
    if (!confirm('Bạn có chắc chắn muốn tính lại số lượng đã bán cho tất cả sản phẩm?\n\nThao tác này sẽ cập nhật lại số lượng đã bán dựa trên đơn hàng đã giao thành công.')) {
      return;
    }

    setRecalculating(true);
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        toast.error('Vui lòng đăng nhập');
        return;
      }

      const response = await fetch('http://localhost:5000/api/products/recalculate-sold', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message || 'Tính lại số lượng đã bán thành công!');
        console.log('Kết quả:', data.data);
      } else {
        toast.error(data.message || 'Không thể tính lại số lượng đã bán');
      }
    } catch (error: any) {
      console.error('Error recalculating sold:', error);
      toast.error(error.message || 'Lỗi khi tính lại số lượng đã bán');
    } finally {
      setRecalculating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Cài Đặt Hệ Thống</h1>
        <p className="text-gray-600">Quản lý cấu hình và thiết lập hệ thống</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex flex-wrap -mb-px">
            {[
              { id: 'general', label: 'Cài đặt chung', icon: '⚙️' },
              { id: 'store', label: 'Thông tin cửa hàng', icon: '🏪' },
              { id: 'payment', label: 'Thanh toán & Vận chuyển', icon: '💳' },
              { id: 'notifications', label: 'Thông báo', icon: '🔔' },
              { id: 'security', label: 'Bảo mật', icon: '🔒' },
              { id: 'seo', label: 'SEO', icon: '🔍' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      <form onSubmit={handleSaveSettings}>
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            <div className="border-b pb-4">
              <h2 className="text-xl font-semibold text-gray-900">Cài Đặt Chung</h2>
              <p className="text-sm text-gray-500 mt-1">Cấu hình cơ bản cho hệ thống</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                  className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div>
                  <div className="font-medium text-gray-900">⚠️ Chế độ bảo trì</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Khi bật, website sẽ tạm thời đóng cửa và hiển thị thông báo bảo trì cho khách hàng
                  </div>
                </div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đơn vị tiền tệ
                </label>
                <select
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="VND">VND - Việt Nam Đồng</option>
                  <option value="USD">USD - Đô la Mỹ</option>
                  <option value="EUR">EUR - Euro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thuế VAT (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={settings.taxRate}
                  onChange={(e) => setSettings({ ...settings, taxRate: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-medium text-gray-900 mb-4">Cảnh báo tồn kho</h3>
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.lowStockAlert}
                    onChange={(e) => setSettings({ ...settings, lowStockAlert: e.target.checked })}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Bật cảnh báo hết hàng</div>
                    <div className="text-sm text-gray-500">Nhận thông báo khi sản phẩm sắp hết hàng</div>
                  </div>
                </label>

                {settings.lowStockAlert && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngưỡng cảnh báo (số lượng)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={settings.lowStockThreshold}
                      onChange={(e) => setSettings({ ...settings, lowStockThreshold: Number(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="10"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Cảnh báo khi số lượng tồn kho ≤ {settings.lowStockThreshold} sản phẩm
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-medium text-gray-900 mb-4">Công cụ dữ liệu</h3>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-2">Tính lại số lượng đã bán</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Cập nhật lại số lượng đã bán cho tất cả sản phẩm dựa trên đơn hàng đã giao thành công.
                      Sử dụng công cụ này nếu dữ liệu "Top 5 Sản Phẩm Bán Chạy" hiển thị không chính xác.
                    </p>
                    <button
                      type="button"
                      onClick={handleRecalculateSold}
                      disabled={recalculating}
                      className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                    >
                      {recalculating ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Đang tính toán...
                        </span>
                      ) : (
                        '🔄 Tính lại ngay'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Store Info */}
        {activeTab === 'store' && (
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            <div className="border-b pb-4">
              <h2 className="text-xl font-semibold text-gray-900">Thông Tin Cửa Hàng</h2>
              <p className="text-sm text-gray-500 mt-1">Thông tin hiển thị trên website và liên hệ</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo cửa hàng
              </label>
              <div className="flex items-center gap-4">
                {settings.storeLogo && (
                  <img
                    src={settings.storeLogo}
                    alt="Store Logo"
                    className="w-24 h-24 object-cover rounded-lg border-2 border-gray-300"
                  />
                )}
                <div className="flex-1">
                  <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors w-fit">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Tải logo lên
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadLogo}
                      className="hidden"
                    />
                  </label>
                  <p className="text-sm text-gray-500 mt-2">PNG, JPG, GIF tối đa 2MB</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên cửa hàng <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={settings.storeName}
                  onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  value={settings.storeEmail}
                  onChange={(e) => setSettings({ ...settings, storeEmail: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại <span className="text-red-600">*</span>
                </label>
                <input
                  type="tel"
                  value={settings.storePhone}
                  onChange={(e) => setSettings({ ...settings, storePhone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={settings.storeAddress}
                  onChange={(e) => setSettings({ ...settings, storeAddress: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả cửa hàng
              </label>
              <textarea
                value={settings.storeDescription}
                onChange={(e) => setSettings({ ...settings, storeDescription: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Mô tả ngắn về cửa hàng của bạn..."
              />
            </div>

            <div className="border-t pt-6">
              <h3 className="font-medium text-gray-900 mb-4">Mạng xã hội</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Facebook
                  </label>
                  <input
                    type="url"
                    value={settings.socialLinks.facebook}
                    onChange={(e) => setSettings({
                      ...settings,
                      socialLinks: { ...settings.socialLinks, facebook: e.target.value }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://facebook.com/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instagram
                  </label>
                  <input
                    type="url"
                    value={settings.socialLinks.instagram}
                    onChange={(e) => setSettings({
                      ...settings,
                      socialLinks: { ...settings.socialLinks, instagram: e.target.value }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://instagram.com/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    YouTube
                  </label>
                  <input
                    type="url"
                    value={settings.socialLinks.youtube}
                    onChange={(e) => setSettings({
                      ...settings,
                      socialLinks: { ...settings.socialLinks, youtube: e.target.value }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://youtube.com/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    TikTok
                  </label>
                  <input
                    type="url"
                    value={settings.socialLinks.tiktok}
                    onChange={(e) => setSettings({
                      ...settings,
                      socialLinks: { ...settings.socialLinks, tiktok: e.target.value }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://tiktok.com/@..."
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment & Shipping */}
        {activeTab === 'payment' && (
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            <div className="border-b pb-4">
              <h2 className="text-xl font-semibold text-gray-900">Thanh Toán & Vận Chuyển</h2>
              <p className="text-sm text-gray-500 mt-1">Cấu hình phương thức thanh toán và vận chuyển</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phí vận chuyển (₫)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={settings.shippingFee}
                  onChange={(e) => setSettings({ ...settings, shippingFee: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {settings.shippingFee.toLocaleString('vi-VN')}₫
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Miễn phí vận chuyển cho đơn từ (₫)
                </label>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  value={settings.freeShippingThreshold}
                  onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Đơn hàng từ {settings.freeShippingThreshold.toLocaleString('vi-VN')}₫ sẽ được miễn phí ship
                </p>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-medium text-gray-900 mb-4">Phương thức thanh toán</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={settings.paymentMethods.cod}
                    onChange={(e) => setSettings({
                      ...settings,
                      paymentMethods: { ...settings.paymentMethods, cod: e.target.checked }
                    })}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">💵 COD</div>
                    <div className="text-sm text-gray-500">Thanh toán khi nhận hàng</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={settings.paymentMethods.vnpay}
                    onChange={(e) => setSettings({
                      ...settings,
                      paymentMethods: { ...settings.paymentMethods, vnpay: e.target.checked }
                    })}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">💳 VNPay</div>
                    <div className="text-sm text-gray-500">Thanh toán qua VNPay</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={settings.paymentMethods.momo}
                    onChange={(e) => setSettings({
                      ...settings,
                      paymentMethods: { ...settings.paymentMethods, momo: e.target.checked }
                    })}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">📱 MoMo</div>
                    <div className="text-sm text-gray-500">Thanh toán qua ví MoMo</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={settings.paymentMethods.bankTransfer}
                    onChange={(e) => setSettings({
                      ...settings,
                      paymentMethods: { ...settings.paymentMethods, bankTransfer: e.target.checked }
                    })}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">🏦 Chuyển khoản</div>
                    <div className="text-sm text-gray-500">Chuyển khoản ngân hàng</div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Notifications */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            <div className="border-b pb-4">
              <h2 className="text-xl font-semibold text-gray-900">Thông Báo</h2>
              <p className="text-sm text-gray-500 mt-1">Cấu hình thông báo qua email và hệ thống</p>
            </div>

            <div className="space-y-4">
              <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                  className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">📧 Thông báo email</div>
                  <div className="text-sm text-gray-500 mt-1">Nhận tất cả thông báo qua email</div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.orderNotifications}
                  onChange={(e) => setSettings({ ...settings, orderNotifications: e.target.checked })}
                  className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">🛍️ Thông báo đơn hàng</div>
                  <div className="text-sm text-gray-500 mt-1">Nhận thông báo khi có đơn hàng mới hoặc thay đổi trạng thái</div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.reviewNotifications}
                  onChange={(e) => setSettings({ ...settings, reviewNotifications: e.target.checked })}
                  className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">⭐ Thông báo đánh giá</div>
                  <div className="text-sm text-gray-500 mt-1">Nhận thông báo khi có đánh giá mới từ khách hàng</div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.lowStockAlert}
                  onChange={(e) => setSettings({ ...settings, lowStockAlert: e.target.checked })}
                  className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">📦 Cảnh báo hết hàng</div>
                  <div className="text-sm text-gray-500 mt-1">Nhận thông báo khi sản phẩm sắp hết hàng</div>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Security */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="border-b pb-4 mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Bảo Mật</h2>
              <p className="text-sm text-gray-500 mt-1">Thay đổi mật khẩu và cài đặt bảo mật</p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-6 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu hiện tại <span className="text-red-600">*</span>
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu mới <span className="text-red-600">*</span>
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  minLength={6}
                />
                <p className="text-sm text-gray-500 mt-1">Mật khẩu phải có ít nhất 6 ký tự</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Xác nhận mật khẩu mới <span className="text-red-600">*</span>
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {saving ? 'Đang xử lý...' : 'Đổi mật khẩu'}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t">
              <h3 className="font-medium text-gray-900 mb-4">Lịch sử đăng nhập</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Chức năng đang phát triển</p>
              </div>
            </div>
          </div>
        )}

        {/* SEO */}
        {activeTab === 'seo' && (
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            <div className="border-b pb-4">
              <h2 className="text-xl font-semibold text-gray-900">Tối Ưu SEO</h2>
              <p className="text-sm text-gray-500 mt-1">Cài đặt meta tags và SEO cho website</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Title
              </label>
              <input
                type="text"
                value={settings.seo.metaTitle}
                onChange={(e) => setSettings({
                  ...settings,
                  seo: { ...settings.seo, metaTitle: e.target.value }
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Cửa hàng thể thao hàng đầu Việt Nam"
                maxLength={60}
              />
              <p className="text-sm text-gray-500 mt-1">
                {settings.seo.metaTitle.length}/60 ký tự
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Description
              </label>
              <textarea
                value={settings.seo.metaDescription}
                onChange={(e) => setSettings({
                  ...settings,
                  seo: { ...settings.seo, metaDescription: e.target.value }
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Mô tả ngắn gọn về website của bạn..."
                maxLength={160}
              />
              <p className="text-sm text-gray-500 mt-1">
                {settings.seo.metaDescription.length}/160 ký tự
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Keywords
              </label>
              <input
                type="text"
                value={settings.seo.metaKeywords}
                onChange={(e) => setSettings({
                  ...settings,
                  seo: { ...settings.seo, metaKeywords: e.target.value }
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="giày thể thao, quần áo thể thao, phụ kiện..."
              />
              <p className="text-sm text-gray-500 mt-1">
                Phân cách các từ khóa bằng dấu phẩy
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">💡 Mẹo SEO</h4>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Title nên từ 50-60 ký tự</li>
                <li>Description nên từ 150-160 ký tự</li>
                <li>Sử dụng từ khóa liên quan đến sản phẩm</li>
                <li>Tránh nhồi nhét từ khóa</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab !== 'security' && (
          <div className="flex gap-4 mt-6">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
            </button>
            <button
              type="button"
              onClick={loadSettings}
              disabled={saving}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 font-medium"
            >
              Hủy thay đổi
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
