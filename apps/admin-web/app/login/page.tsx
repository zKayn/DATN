'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loginData, setLoginData] = useState({
    email: '',
    matKhau: ''
  });
  const [registerData, setRegisterData] = useState({
    hoTen: '',
    email: '',
    matKhau: '',
    matKhauXacNhan: '',
    soDienThoai: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.login(loginData.email, loginData.matKhau);

      if (response.success && response.data) {
        // Check if user is admin
        if (response.data.user.vaiTro !== 'quan-tri') {
          alert('Bạn không có quyền truy cập trang quản trị!');
          setLoading(false);
          return;
        }

        // Save token and user info to localStorage
        localStorage.setItem('admin_token', response.data.token);
        localStorage.setItem('admin_user', JSON.stringify({
          ten: response.data.user.hoTen,
          email: response.data.user.email,
          vaiTro: response.data.user.vaiTro
        }));

        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        alert('Lỗi: ' + (response.error || 'Đăng nhập thất bại'));
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Có lỗi xảy ra khi đăng nhập');
    }

    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password match
    if (registerData.matKhau !== registerData.matKhauXacNhan) {
      alert('Mật khẩu xác nhận không khớp!');
      return;
    }

    setLoading(true);

    try {
      const response = await api.registerAdmin({
        hoTen: registerData.hoTen,
        email: registerData.email,
        matKhau: registerData.matKhau,
        soDienThoai: registerData.soDienThoai
      });

      if (response.success && response.data) {
        // Save token and user info to localStorage
        localStorage.setItem('admin_token', response.data.token);
        localStorage.setItem('admin_user', JSON.stringify({
          ten: response.data.user.hoTen,
          email: response.data.user.email,
          vaiTro: response.data.user.vaiTro
        }));

        alert('Đăng ký tài khoản admin thành công!');

        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        alert('Lỗi: ' + (response.error || 'Đăng ký thất bại'));
      }
    } catch (error) {
      console.error('Register error:', error);
      alert('Có lỗi xảy ra khi đăng ký');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center">Quản Trị Viên</h1>
          <p className="text-blue-100 text-center mt-2">
            {isLogin ? 'Đăng nhập vào hệ thống' : 'Tạo tài khoản quản trị'}
          </p>
        </div>

        {/* Toggle Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-4 font-semibold transition-colors ${
              isLogin
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Đăng Nhập
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-4 font-semibold transition-colors ${
              !isLogin
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Đăng Ký
          </button>
        </div>

        {/* Forms */}
        <div className="p-8">
          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="admin@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Mật khẩu
                </label>
                <input
                  type="password"
                  value={loginData.matKhau}
                  onChange={(e) => setLoginData({ ...loginData, matKhau: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Họ tên <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={registerData.hoTen}
                  onChange={(e) => setRegisterData({ ...registerData, hoTen: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nguyễn Văn A"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Email <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="admin@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  value={registerData.soDienThoai}
                  onChange={(e) => setRegisterData({ ...registerData, soDienThoai: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0123456789"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Mật khẩu <span className="text-red-600">*</span>
                </label>
                <input
                  type="password"
                  value={registerData.matKhau}
                  onChange={(e) => setRegisterData({ ...registerData, matKhau: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Xác nhận mật khẩu <span className="text-red-600">*</span>
                </label>
                <input
                  type="password"
                  value={registerData.matKhauXacNhan}
                  onChange={(e) => setRegisterData({ ...registerData, matKhauXacNhan: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang đăng ký...' : 'Đăng Ký Tài Khoản'}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 text-center text-sm text-gray-600">
          <p>Hệ thống quản trị - Sports Store</p>
        </div>
      </div>
    </div>
  );
}
