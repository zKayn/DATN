import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

interface User {
  _id: string;
  hoTen: string;
  email: string;
  soDienThoai?: string;
  avatar?: string;
  vaiTro: string;
}

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, matKhau: string) => Promise<void>;
  register: (data: {
    hoTen: string;
    email: string;
    matKhau: string;
    soDienThoai?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const response = await api.getProfile();
        if (response.success) {
          setUser(response.data);
        }
      }
    } catch (error) {
      console.error('Load user error:', error);
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, matKhau: string) => {
    try {
      const response = await api.login(email, matKhau);
      if (response.success && response.data) {
        const { token, user: userData } = response.data;
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      } else {
        throw new Error(response.message || 'Đăng nhập thất bại');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Đăng nhập thất bại');
    }
  };

  const register = async (data: {
    hoTen: string;
    email: string;
    matKhau: string;
    soDienThoai?: string;
  }) => {
    try {
      const response = await api.register(data);
      if (response.success && response.data) {
        const { token, user: userData } = response.data;
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      } else {
        throw new Error(response.message || 'Đăng ký thất bại');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Đăng ký thất bại');
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
