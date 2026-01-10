import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, CONFIG } from '../constants/config';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      timeout: CONFIG.API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('user');
          // Navigate to login screen
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth APIs
  async login(email: string, matKhau: string) {
    const response = await this.api.post('/auth/login', { email, matKhau });
    return response.data;
  }

  async register(data: { hoTen: string; email: string; matKhau: string; soDienThoai?: string }) {
    const response = await this.api.post('/auth/register', data);
    return response.data;
  }

  async getProfile() {
    const response = await this.api.get('/auth/me');
    return response.data;
  }

  async updateProfile(data: any) {
    const response = await this.api.put('/auth/update-profile', data);
    return response.data;
  }

  async uploadAvatar(formData: FormData) {
    const response = await this.api.post('/auth/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async changePassword(data: { matKhauCu: string; matKhauMoi: string }) {
    const response = await this.api.put('/auth/change-password', data);
    return response.data;
  }

  // Product APIs
  async getProducts(params?: {
    danhMuc?: string;
    loaiSanPham?: string;
    thuongHieu?: string;
    trangThai?: string;
    page?: number;
    limit?: number;
    sort?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    noiBat?: boolean;
    sanPhamMoi?: boolean;
  }) {
    const response = await this.api.get('/products', { params });
    return response.data;
  }

  async getProductById(id: string) {
    const response = await this.api.get(`/products/${id}`);
    return response.data;
  }

  async getProductBySlug(slug: string) {
    const response = await this.api.get(`/products/slug/${slug}`);
    return response.data;
  }

  async getFeaturedProducts() {
    const response = await this.api.get('/products?noiBat=true&limit=8');
    return response.data;
  }

  async getNewProducts() {
    const response = await this.api.get('/products?sanPhamMoi=true&limit=8');
    return response.data;
  }

  async getBestsellerProducts() {
    const response = await this.api.get('/products?sort=-daBan&limit=8');
    return response.data;
  }

  async searchProducts(query: string) {
    const response = await this.api.get(`/products/search?q=${encodeURIComponent(query)}`);
    return response.data;
  }

  // Category APIs
  async getCategories() {
    const response = await this.api.get('/categories');
    return response.data;
  }

  async getCategoryBySlug(slug: string) {
    const response = await this.api.get(`/categories/slug/${slug}`);
    return response.data;
  }

  // Settings API
  async getSettings() {
    const response = await this.api.get('/settings');
    return response.data;
  }

  // Order APIs
  async createOrder(orderData: any) {
    const response = await this.api.post('/orders', orderData);
    return response.data;
  }

  async getOrders(params?: { page?: number; limit?: number }) {
    const response = await this.api.get('/orders/my-orders', { params });
    return response.data;
  }

  async getOrderDetail(id: string) {
    const response = await this.api.get(`/orders/${id}`);
    return response.data;
  }

  async cancelOrder(orderId: string, lyDoHuy: string) {
    const response = await this.api.put(`/orders/${orderId}/cancel`, { lyDoHuy });
    return response.data;
  }

  // AI Chat API
  async sendChatMessage(message: string, conversationHistory?: any[]) {
    const response = await this.api.post('/ai/chatbot', {
      message,
      conversationHistory,
    });
    return response.data;
  }

  // Wishlist APIs
  async getWishlist() {
    const response = await this.api.get('/users/wishlist');
    return response.data;
  }

  async addToWishlist(productId: string) {
    const response = await this.api.post('/users/wishlist', { sanPham: productId });
    return response.data;
  }

  async removeFromWishlist(productId: string) {
    const response = await this.api.delete(`/users/wishlist/${productId}`);
    return response.data;
  }

  // Cart APIs
  async getCart() {
    const response = await this.api.get('/users/cart');
    return response.data;
  }

  async addToCart(cartItem: {
    sanPham: string;
    ten: string;
    slug: string;
    hinhAnh: string;
    gia: number;
    giaKhuyenMai?: number;
    kichThuoc: string;
    mauSac: string;
    soLuong: number;
    tonKho: number;
  }) {
    const response = await this.api.post('/users/cart', cartItem);
    return response.data;
  }

  async updateCartItem(update: {
    sanPham: string;
    kichThuoc: string;
    mauSac: string;
    soLuong: number;
  }) {
    const response = await this.api.put('/users/cart', update);
    return response.data;
  }

  async removeFromCart(item: {
    sanPham: string;
    kichThuoc: string;
    mauSac: string;
  }) {
    const response = await this.api.delete('/users/cart/item', { data: item });
    return response.data;
  }

  async clearCart() {
    const response = await this.api.delete('/users/cart');
    return response.data;
  }

  // Review APIs
  async getProductReviews(productId: string, params?: { page?: number; limit?: number }) {
    const response = await this.api.get(`/reviews/product/${productId}`, { params });
    return response.data;
  }

  async createReview(productId: string, data: {
    danhGia: number;
    tieuDe: string;
    noiDung: string;
    donHang?: string;
  }, token?: string) {
    const reviewData = {
      ...data,
      sanPham: productId
    };
    const response = await this.api.post('/reviews', reviewData);
    return response.data;
  }

  async getUserReviews(params?: { page?: number; limit?: number }) {
    const response = await this.api.get('/reviews/my-reviews', { params });
    return response.data;
  }

  async updateReview(reviewId: string, data: {
    danhGia?: number;
    tieuDe?: string;
    noiDung?: string;
  }) {
    const response = await this.api.put(`/reviews/${reviewId}`, data);
    return response.data;
  }

  async deleteReview(reviewId: string) {
    const response = await this.api.delete(`/reviews/${reviewId}`);
    return response.data;
  }

  // Address APIs
  async getAddresses() {
    // Addresses are in user profile
    const response = await this.api.get('/auth/me');
    if (response.data.success && response.data.data?.diaChi) {
      return {
        success: true,
        data: response.data.data.diaChi
      };
    }
    return { success: true, data: [] };
  }

  async getAddressById(id: string) {
    const response = await this.api.get('/auth/me');
    if (response.data.success && response.data.data?.diaChi) {
      const address = response.data.data.diaChi.find((addr: any) => addr._id === id);
      return { success: true, data: address };
    }
    return { success: false, data: null };
  }

  async createAddress(data: {
    hoTen: string;
    soDienThoai: string;
    diaChi: string;
    phuongXa: string;
    quanHuyen: string;
    tinhThanh: string;
    macDinh?: boolean;
  }) {
    // Map mobile field names to backend field names
    const addressData = {
      hoTen: data.hoTen,
      soDienThoai: data.soDienThoai,
      diaChiChiTiet: data.diaChi,
      xa: data.phuongXa,
      huyen: data.quanHuyen,
      tinh: data.tinhThanh,
      macDinh: data.macDinh || false
    };
    const response = await this.api.post('/auth/addresses', addressData);
    return response.data;
  }

  async updateAddress(id: string, data: {
    hoTen?: string;
    soDienThoai?: string;
    diaChi?: string;
    phuongXa?: string;
    quanHuyen?: string;
    tinhThanh?: string;
    macDinh?: boolean;
  }) {
    // Map mobile field names to backend field names
    const addressData: any = {};
    if (data.hoTen) addressData.hoTen = data.hoTen;
    if (data.soDienThoai) addressData.soDienThoai = data.soDienThoai;
    if (data.diaChi) addressData.diaChiChiTiet = data.diaChi;
    if (data.phuongXa) addressData.xa = data.phuongXa;
    if (data.quanHuyen) addressData.huyen = data.quanHuyen;
    if (data.tinhThanh) addressData.tinh = data.tinhThanh;
    if (data.macDinh !== undefined) addressData.macDinh = data.macDinh;

    const response = await this.api.put(`/auth/addresses/${id}`, addressData);
    return response.data;
  }

  async deleteAddress(id: string) {
    const response = await this.api.delete(`/auth/addresses/${id}`);
    return response.data;
  }

  async setDefaultAddress(id: string) {
    const response = await this.api.put(`/auth/addresses/${id}/set-default`);
    return response.data;
  }

  // Voucher APIs
  async getAvailableVouchers() {
    const response = await this.api.get('/vouchers/kha-dung');
    return response.data;
  }

  async checkVoucher(ma: string, tongTien: number) {
    const response = await this.api.post('/vouchers/kiem-tra', { ma, tongTien });
    return response.data;
  }

  // Points APIs
  async getMyPoints() {
    const response = await this.api.get('/points/my-points');
    return response.data;
  }

  async getPointHistory(limit?: number) {
    const url = limit ? `/points/history?limit=${limit}` : '/points/history';
    const response = await this.api.get(url);
    return response.data;
  }

  async calculatePointsDiscount(points: number) {
    const response = await this.api.post('/points/calculate-discount', { points });
    return response.data;
  }

  // Notifications APIs
  async getNotifications(params?: { page?: number; limit?: number; daDoc?: boolean }) {
    let url = '/notifications';
    if (params) {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.daDoc !== undefined) queryParams.append('daDoc', params.daDoc.toString());
      const queryString = queryParams.toString();
      if (queryString) url += `?${queryString}`;
    }
    const response = await this.api.get(url);
    return response.data;
  }

  async getUnreadNotificationCount() {
    const response = await this.api.get('/notifications/unread-count');
    return response.data;
  }

  async markNotificationAsRead(notificationId: string) {
    const response = await this.api.put(`/notifications/${notificationId}/read`);
    return response.data;
  }

  async markAllNotificationsAsRead() {
    const response = await this.api.put('/notifications/mark-all-read');
    return response.data;
  }

  async deleteNotification(notificationId: string) {
    const response = await this.api.delete(`/notifications/${notificationId}`);
    return response.data;
  }

  // Newsletter APIs
  async subscribeNewsletter(email: string) {
    const response = await this.api.post('/newsletter/subscribe', { email });
    return response.data;
  }

  async unsubscribeNewsletter(email: string) {
    const response = await this.api.post('/newsletter/unsubscribe', { email });
    return response.data;
  }

  // PayOS Payment APIs
  async createPayOSPaymentLink(orderId: string) {
    const response = await this.api.post('/payos/create-payment-link', { orderId });
    return response.data;
  }

  async getPayOSPaymentStatus(orderId: string) {
    const response = await this.api.get(`/payos/status/${orderId}`);
    return response.data;
  }

  async cancelPayOSPayment(orderId: string) {
    const response = await this.api.post('/payos/cancel', { orderId });
    return response.data;
  }

}

export default new ApiService();
