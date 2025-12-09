'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import AddressModal from '@/components/account/AddressModal';

export default function AccountPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'male',
    birthday: '',
    avatar: 'https://i.pravatar.cc/150?img=12'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [addresses, setAddresses] = useState<any[]>([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Vui lòng đăng nhập');
        router.push('/dang-nhap');
        return;
      }

      const response = await api.getProfile(token);
      if (response.success && response.data) {
        const user = response.data;
        setUserInfo({
          name: user.hoTen || user.ten || '',
          email: user.email || '',
          phone: user.soDienThoai || '',
          gender: user.gioiTinh || 'male',
          birthday: user.ngaySinh || '',
          avatar: user.anhDaiDien || user.avatar || 'https://i.pravatar.cc/150?img=12'
        });
        // Load addresses
        setAddresses(user.diaChi || []);
      }
    } catch (error: any) {
      console.error('Lỗi khi tải thông tin người dùng:', error);
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại');
        localStorage.removeItem('token');
        router.push('/dang-nhap');
      } else {
        toast.error('Không thể tải thông tin người dùng');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    setUploadingAvatar(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Vui lòng đăng nhập');
        return;
      }

      // Upload image to Cloudinary
      const uploadResponse = await api.uploadImage(file, token);

      if (uploadResponse.success && uploadResponse.data) {
        const avatarUrl = uploadResponse.data.url;

        // Update profile with new avatar URL
        const updateResponse = await api.updateProfile(token, {
          anhDaiDien: avatarUrl
        });

        if (updateResponse.success) {
          setUserInfo({ ...userInfo, avatar: avatarUrl });
          toast.success('Cập nhật ảnh đại diện thành công!');
        } else {
          toast.error('Không thể cập nhật ảnh đại diện');
        }
      } else {
        toast.error(uploadResponse.message || 'Không thể tải ảnh lên');
      }
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error(error.message || 'Lỗi khi tải ảnh lên');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Vui lòng đăng nhập');
        return;
      }

      const updateData = {
        hoTen: userInfo.name,
        soDienThoai: userInfo.phone,
        gioiTinh: userInfo.gender,
        ngaySinh: userInfo.birthday
      };

      const response = await api.updateProfile(token, updateData);
      if (response.success) {
        toast.success('Cập nhật thông tin thành công!');
      } else {
        toast.error(response.message || 'Cập nhật thất bại');
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật thông tin:', error);
      toast.error('Không thể cập nhật thông tin');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp!');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Vui lòng đăng nhập');
        return;
      }

      const response = await api.changePassword(token, {
        matKhauCu: passwordData.currentPassword,
        matKhauMoi: passwordData.newPassword
      });

      if (response.success) {
        toast.success('Đổi mật khẩu thành công!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(response.message || 'Đổi mật khẩu thất bại');
      }
    } catch (error: any) {
      console.error('Lỗi khi đổi mật khẩu:', error);
      toast.error(error.message || 'Không thể đổi mật khẩu');
    }
  };

  const handleLogout = () => {
    toast.success('Đăng xuất thành công');
    logout();
  };

  // Address functions
  const handleAddAddress = () => {
    setModalMode('add');
    setEditingAddress(null);
    setIsAddressModalOpen(true);
  };

  const handleEditAddress = (address: any) => {
    setModalMode('edit');
    setEditingAddress(address);
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = async (addressData: any) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Vui lòng đăng nhập');
        return;
      }

      if (modalMode === 'add') {
        const response = await api.addAddress(token, addressData);
        if (response.success) {
          toast.success('Thêm địa chỉ thành công!');
          setAddresses(response.data);
        }
      } else {
        const response = await api.updateAddress(token, editingAddress._id, addressData);
        if (response.success) {
          toast.success('Cập nhật địa chỉ thành công!');
          setAddresses(response.data);
        }
      }
    } catch (error: any) {
      console.error('Error saving address:', error);
      toast.error(error.message || 'Không thể lưu địa chỉ');
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Bạn có chắc muốn xóa địa chỉ này?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Vui lòng đăng nhập');
        return;
      }

      const response = await api.deleteAddress(token, addressId);
      if (response.success) {
        toast.success('Xóa địa chỉ thành công!');
        setAddresses(response.data);
      }
    } catch (error: any) {
      console.error('Error deleting address:', error);
      toast.error(error.message || 'Không thể xóa địa chỉ');
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Vui lòng đăng nhập');
        return;
      }

      const response = await api.setDefaultAddress(token, addressId);
      if (response.success) {
        toast.success('Đã đặt làm địa chỉ mặc định!');
        setAddresses(response.data);
      }
    } catch (error: any) {
      console.error('Error setting default address:', error);
      toast.error(error.message || 'Không thể đặt địa chỉ mặc định');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const menuItems = [
    { id: 'profile', label: 'Thông Tin Cá Nhân', icon: 'user' },
    { id: 'orders', label: 'Đơn Hàng Của Tôi', icon: 'shopping-bag', href: '/tai-khoan/don-hang' },
    { id: 'wishlist', label: 'Sản Phẩm Yêu Thích', icon: 'heart', href: '/tai-khoan/yeu-thich' },
    { id: 'addresses', label: 'Địa Chỉ Nhận Hàng', icon: 'map-pin' },
    { id: 'password', label: 'Đổi Mật Khẩu', icon: 'lock' },
    { id: 'points', label: 'Điểm Tích Lũy', icon: 'gift' }
  ];

  const renderIcon = (iconName: string) => {
    const icons: Record<string, JSX.Element> = {
      'user': (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      ),
      'shopping-bag': (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      ),
      'heart': (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      ),
      'map-pin': (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      ),
      'lock': (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      ),
      'gift': (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
      )
    };
    return icons[iconName] || icons['user'];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Tài Khoản Của Tôi</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* User Avatar */}
              <div className="text-center mb-6 pb-6 border-b">
                <div className="relative w-24 h-24 mx-auto mb-4 group">
                  <Image
                    src={userInfo.avatar}
                    alt={userInfo.name}
                    fill
                    className="rounded-full object-cover"
                  />
                  {/* Upload Avatar Button */}
                  <label
                    htmlFor="avatar-upload"
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    {uploadingAvatar ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    ) : (
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    disabled={uploadingAvatar}
                    className="hidden"
                  />
                </div>
                <h3 className="font-bold text-gray-900">{userInfo.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{userInfo.email}</p>
              </div>

              {/* Menu Items */}
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  if (item.href) {
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {renderIcon(item.icon)}
                        </svg>
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    );
                  }
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === item.id
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {renderIcon(item.icon)}
                      </svg>
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors mt-4"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="font-medium">Đăng Xuất</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông Tin Cá Nhân</h2>
                <form onSubmit={handleUpdateProfile}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-900 mb-2">Họ và tên</label>
                      <input
                        type="text"
                        value={userInfo.name}
                        onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Email</label>
                      <input
                        type="email"
                        value={userInfo.email}
                        onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Số điện thoại</label>
                      <input
                        type="tel"
                        value={userInfo.phone}
                        onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Giới tính</label>
                      <select
                        value={userInfo.gender}
                        onChange={(e) => setUserInfo({ ...userInfo, gender: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                        <option value="other">Khác</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Ngày sinh</label>
                      <input
                        type="date"
                        value={userInfo.birthday}
                        onChange={(e) => setUserInfo({ ...userInfo, birthday: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                    >
                      Cập Nhật Thông Tin
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Địa Chỉ Nhận Hàng</h2>
                  <button
                    onClick={handleAddAddress}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    + Thêm Địa Chỉ
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-gray-600 mb-4">Bạn chưa có địa chỉ nào</p>
                    <button
                      onClick={handleAddAddress}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Thêm địa chỉ đầu tiên
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {addresses.map((address: any) => (
                      <div
                        key={address._id}
                        className={`rounded-lg p-4 ${
                          address.macDinh
                            ? 'border-2 border-blue-600 bg-blue-50'
                            : 'border border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            {address.macDinh ? (
                              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                                Mặc định
                              </span>
                            ) : (
                              <button
                                onClick={() => handleSetDefaultAddress(address._id)}
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                              >
                                Đặt làm mặc định
                              </button>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditAddress(address)}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              Sửa
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(address._id)}
                              className="text-red-600 hover:text-red-700 text-sm font-medium"
                            >
                              Xóa
                            </button>
                          </div>
                        </div>
                        <p className="font-semibold text-gray-900 mb-1">
                          {address.hoTen} | {address.soDienThoai}
                        </p>
                        <p className="text-gray-700">
                          {address.diaChiChiTiet}, {address.xa}, {address.huyen}, {address.tinh}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Đổi Mật Khẩu</h2>
                <form onSubmit={handleChangePassword} className="max-w-md">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Mật khẩu hiện tại</label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Mật khẩu mới</label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Xác nhận mật khẩu mới</label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                    >
                      Đổi Mật Khẩu
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Points Tab */}
            {activeTab === 'points' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Điểm Tích Lũy</h2>

                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white mb-6">
                  <p className="text-sm opacity-90 mb-2">Tổng điểm hiện có</p>
                  <p className="text-4xl font-bold mb-1">500 điểm</p>
                  <p className="text-sm opacity-90">≈ ₫50,000</p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Lịch sử điểm</h3>

                  {[
                    { date: '2025-11-25', action: 'Mua hàng #DH00123', points: '+50', color: 'green' },
                    { date: '2025-11-20', action: 'Sử dụng điểm', points: '-100', color: 'red' },
                    { date: '2025-11-15', action: 'Mua hàng #DH00098', points: '+30', color: 'green' },
                    { date: '2025-11-10', action: 'Thưởng sinh nhật', points: '+100', color: 'green' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-3 border-b border-gray-200">
                      <div>
                        <p className="font-medium text-gray-900">{item.action}</p>
                        <p className="text-sm text-gray-600">{item.date}</p>
                      </div>
                      <span className={`font-bold ${item.color === 'green' ? 'text-green-600' : 'text-red-600'}`}>
                        {item.points}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Address Modal */}
      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSave={handleSaveAddress}
        address={editingAddress}
        mode={modalMode}
      />
    </div>
  );
}
