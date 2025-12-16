'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';

interface PaymentMethods {
  cod: boolean;
  vnpay: boolean;
  momo: boolean;
  bankTransfer: boolean;
}

interface SocialLinks {
  facebook: string;
  instagram: string;
  youtube: string;
  tiktok: string;
}

interface SEO {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
}

export interface Settings {
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
  paymentMethods: PaymentMethods;
  socialLinks: SocialLinks;
  seo: SEO;
}

interface SettingsContextType {
  settings: Settings | null;
  loading: boolean;
  error: string | null;
  refreshSettings: () => Promise<void>;
}

const defaultSettings: Settings = {
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
    bankTransfer: false,
  },
  socialLinks: {
    facebook: '',
    instagram: '',
    youtube: '',
    tiktok: '',
  },
  seo: {
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
  },
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  loading: false,
  error: null,
  refreshSettings: async () => {},
});

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<Settings | null>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.getSettings();

      if (response.success && response.data) {
        setSettings(response.data);
      } else {
        setSettings(defaultSettings);
      }
    } catch (err: any) {
      console.error('Error loading settings:', err);
      setError(err.message || 'Failed to load settings');
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const refreshSettings = async () => {
    await loadSettings();
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        error,
        refreshSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsContext;
