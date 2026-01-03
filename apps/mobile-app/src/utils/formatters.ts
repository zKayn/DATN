import { COLORS } from '../constants/config';

export const formatPrice = (price: number): string => {
  return `₫${price.toLocaleString('vi-VN')}`;
};

export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const formatDateTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const calculateDiscount = (
  originalPrice: number,
  salePrice: number
): number => {
  if (!salePrice || salePrice >= originalPrice) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
};

export const formatPhoneNumber = (phone: string): string => {
  // Format: 0xxx xxx xxx
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length !== 10) return phone;
  return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
};

export const truncateText = (text: string, maxLength: number): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

export const getOrderStatusColor = (status: string): string => {
  const statusColors: { [key: string]: string } = {
    'cho-xac-nhan': COLORS.warning, // Orange - Waiting
    'dang-xu-ly': COLORS.warning, // Orange - Processing
    'dang-giao': COLORS.accent, // Blue - Delivering
    'hoan-thanh': COLORS.success, // Green - Completed
    'da-huy': COLORS.danger, // Red - Cancelled
  };
  return statusColors[status] || COLORS.gray[500];
};

export const getOrderStatusText = (status: string): string => {
  const statusTexts: { [key: string]: string } = {
    'cho-xac-nhan': 'Chờ xác nhận',
    'dang-xu-ly': 'Đang xử lý',
    'dang-giao': 'Đang giao',
    'hoan-thanh': 'Hoàn thành',
    'da-huy': 'Đã hủy',
  };
  return statusTexts[status] || status;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^0\d{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};
