// API Configuration
export const API_URL = __DEV__
  ? 'http://192.168.1.68:5000/api' // Android Emulator
  : 'https://your-production-api.com/api';

// Alternative for iOS Simulator: 'http://localhost:5000/api'
// Alternative for Physical Device: 'http://YOUR_IP:5000/api'

export const CONFIG = {
  API_TIMEOUT: 30000,
  IMAGE_PLACEHOLDER: 'https://via.placeholder.com/400',
  PRODUCTS_PER_PAGE: 20,
  MAX_CART_QUANTITY: 99,
};

export const COLORS = {
  primary: '#3B82F6',
  primaryDark: '#2563EB',
  secondary: '#8B5CF6',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  dark: '#1F2937',
  light: '#F3F4F6',
  white: '#FFFFFF',
  black: '#000000',
  background: '#F9FAFB',
  error: '#DC2626',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  light: 'System',
};

export const SIZES = {
  // App dimensions
  width: 375,
  height: 812,

  // Font sizes
  h1: 32,
  h2: 24,
  h3: 20,
  h4: 18,
  body: 16,
  small: 14,
  tiny: 12,

  // Spacing
  padding: 16,
  margin: 16,
  borderRadius: 8,
  borderRadiusLg: 16,

  // Icon sizes
  icon: 24,
  iconSmall: 16,
  iconLarge: 32,

  // Safe Area constants for consistent header spacing
  safeAreaTop: 16, // Base padding to add to insets.top
  safeAreaBottom: 16, // Base padding to add to insets.bottom
};
