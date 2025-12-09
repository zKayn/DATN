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

  // Product APIs
  async getProducts(params?: {
    page?: number;
    limit?: number;
    danhMuc?: string;
    timKiem?: string;
    sapXep?: string;
  }) {
    const response = await this.api.get('/products', { params });
    return response.data;
  }

  async getProductDetail(id: string) {
    const response = await this.api.get(`/products/${id}`);
    return response.data;
  }

  async getFeaturedProducts() {
    const response = await this.api.get('/products/featured');
    return response.data;
  }

  async getNewProducts() {
    const response = await this.api.get('/products/new-arrivals');
    return response.data;
  }

  // Category APIs
  async getCategories() {
    const response = await this.api.get('/categories');
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

  // Review APIs
  async getProductReviews(productId: string, params?: { page?: number; limit?: number }) {
    const response = await this.api.get(`/reviews/product/${productId}`, { params });
    return response.data;
  }

  async createReview(data: {
    sanPham: string;
    donHang: string;
    danhGia: number;
    binhLuan: string;
  }) {
    const response = await this.api.post('/reviews', data);
    return response.data;
  }
}

export default new ApiService();
