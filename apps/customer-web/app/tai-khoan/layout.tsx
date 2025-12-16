'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, token, isAuthenticated, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    avatar: 'https://i.pravatar.cc/150?img=12'
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/dang-nhap?callbackUrl=' + pathname);
    }
  }, [authLoading, isAuthenticated, router, pathname]);

  useEffect(() => {
    if (user) {
      setUserInfo({
        name: user.hoTen || user.ten || '',
        email: user.email || '',
        avatar: user.anhDaiDien || user.avatar || 'https://i.pravatar.cc/150?img=12'
      });
    }
  }, [user]);

  const handleLogout = () => {
    logout();
  };

  const menuItems = [
    { id: 'profile', label: 'Thông Tin Cá Nhân', icon: 'user', href: '/tai-khoan' },
    { id: 'orders', label: 'Đơn Hàng Của Tôi', icon: 'shopping-bag', href: '/tai-khoan/don-hang' },
    { id: 'reviews', label: 'Đánh Giá Của Tôi', icon: 'star', href: '/tai-khoan/danh-gia' },
    { id: 'wishlist', label: 'Sản Phẩm Yêu Thích', icon: 'heart', href: '/tai-khoan/yeu-thich' },
    { id: 'addresses', label: 'Địa Chỉ Nhận Hàng', icon: 'map-pin', href: '/tai-khoan?tab=addresses' },
    { id: 'password', label: 'Đổi Mật Khẩu', icon: 'lock', href: '/tai-khoan?tab=password' },
    { id: 'points', label: 'Điểm Tích Lũy', icon: 'gift', href: '/tai-khoan?tab=points' },
  ];

  const renderIcon = (iconName: string) => {
    const icons: Record<string, JSX.Element> = {
      'user': (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      ),
      'shopping-bag': (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      ),
      'star': (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
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
      ),
    };
    return icons[iconName] || icons['user'];
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

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
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              {/* User Avatar */}
              <div className="text-center mb-6 pb-6 border-b">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <Image
                    src={userInfo.avatar}
                    alt={userInfo.name}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <h3 className="font-bold text-gray-900">{userInfo.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{userInfo.email}</p>
              </div>

              {/* Menu Items */}
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  // Check if this item is active
                  let isActive = false;
                  if (item.href.includes('?tab=')) {
                    // For tab-based items, check pathname and tab query param
                    const tabMatch = item.href.match(/\?tab=(\w+)/);
                    const tabValue = tabMatch ? tabMatch[1] : null;
                    isActive = pathname === '/tai-khoan' && searchParams.get('tab') === tabValue;
                  } else {
                    // For regular routes, just check pathname
                    isActive = pathname === item.href || (pathname === '/tai-khoan' && item.href === '/tai-khoan' && !searchParams.get('tab'));
                  }

                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {renderIcon(item.icon)}
                      </svg>
                      <span className="font-medium">{item.label}</span>
                    </Link>
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
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
