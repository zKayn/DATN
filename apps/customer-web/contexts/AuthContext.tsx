'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';

interface User {
  _id: string;
  hoTen: string;
  ten?: string; // For backward compatibility
  email: string;
  soDienThoai?: string;
  vaiTro: string;
  avatar?: string;
  anhDaiDien?: string;
  gioiTinh?: string;
  ngaySinh?: string;
  diaChi?: any[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: { hoTen: string; email: string; matKhau: string; soDienThoai?: string }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; message?: string }>;
  refreshProfile: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          const response = await api.getProfile(savedToken);
          if (response.success && response.data) {
            setUser(response.data);
            setToken(savedToken);
          } else {
            // Token invalid, clear it
            localStorage.removeItem('token');
          }
        } catch (error) {
          console.error('Error loading user:', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email: string, matKhau: string) => {
    try {
      const response = await api.login(email, matKhau);

      if (response.success && response.data) {
        const { token: newToken, user: userData } = response.data;

        // Save token to localStorage
        localStorage.setItem('token', newToken);

        // Update state
        setToken(newToken);
        setUser(userData);

        // Dispatch login event để load lại cart/wishlist theo user
        window.dispatchEvent(new CustomEvent('user-login'));

        return { success: true };
      } else {
        return { success: false, message: response.message || 'Đăng nhập thất bại' };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, message: error.message || 'Đăng nhập thất bại' };
    }
  };

  const register = async (data: { hoTen: string; email: string; matKhau: string; soDienThoai?: string }) => {
    try {
      const response = await api.register(data);

      if (response.success && response.data) {
        const { token: newToken, user: userData } = response.data;

        // Save token to localStorage
        localStorage.setItem('token', newToken);

        // Update state
        setToken(newToken);
        setUser(userData);

        // Dispatch login event để load lại cart/wishlist theo user
        window.dispatchEvent(new CustomEvent('user-login'));

        return { success: true };
      } else {
        return { success: false, message: response.message || 'Đăng ký thất bại' };
      }
    } catch (error: any) {
      console.error('Register error:', error);
      return { success: false, message: error.message || 'Đăng ký thất bại' };
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!token) {
      return { success: false, message: 'Vui lòng đăng nhập' };
    }

    try {
      const response = await api.updateProfile(token, data);

      if (response.success && response.data) {
        setUser(response.data);
        return { success: true };
      } else {
        return { success: false, message: response.message || 'Cập nhật thất bại' };
      }
    } catch (error: any) {
      console.error('Update profile error:', error);
      return { success: false, message: error.message || 'Cập nhật thất bại' };
    }
  };

  const refreshProfile = async () => {
    if (!token) return;

    try {
      const response = await api.getProfile(token);
      if (response.success && response.data) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Refresh profile error:', error);
    }
  };

  const logout = () => {
    // Xóa token
    localStorage.removeItem('token');

    // Xóa dữ liệu giỏ hàng
    localStorage.removeItem('cart');

    // Xóa dữ liệu yêu thích
    localStorage.removeItem('wishlist');

    // Reset state
    setUser(null);
    setToken(null);

    // Dispatch custom event để force update các context khác ngay lập tức
    window.dispatchEvent(new CustomEvent('user-logout'));

    // Chuyển về trang đăng nhập
    if (typeof window !== 'undefined') {
      window.location.href = '/dang-nhap';
    }
  };

  const isAuthenticated = !!user && !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        refreshProfile,
        isAuthenticated
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
