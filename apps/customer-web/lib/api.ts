class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;

    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options?.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Đã có lỗi xảy ra');
      }

      return result;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Categories
  async getCategories() {
    return this.request('/categories');
  }

  async getCategoryBySlug(slug: string) {
    return this.request(`/categories/slug/${slug}`);
  }

  // Products
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
  }) {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/products?${queryString}` : '/products';

    return this.request(endpoint);
  }

  async getProductBySlug(slug: string) {
    return this.request(`/products/slug/${slug}`);
  }

  async getProductById(id: string) {
    return this.request(`/products/${id}`);
  }

  async getFeaturedProducts() {
    return this.request('/products?noiBat=true&limit=8');
  }

  async getNewProducts() {
    return this.request('/products?sanPhamMoi=true&limit=8');
  }

  async searchProducts(query: string) {
    return this.request(`/products/search?q=${encodeURIComponent(query)}`);
  }

  // Reviews
  async getReviews(params?: { page?: number; limit?: number; minRating?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.minRating) queryParams.append('minRating', params.minRating.toString());

    const queryString = queryParams.toString();
    return this.request(`/reviews/public${queryString ? `?${queryString}` : ''}`);
  }

  async getProductReviews(productId: string) {
    return this.request(`/reviews/product/${productId}`);
  }

  async createReview(productId: string, data: {
    danhGia: number;
    tieuDe: string;
    noiDung: string;
    donHang?: string;
  }, token?: string) {
    const headers: any = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const reviewData = {
      ...data,
      sanPham: productId
    };

    return this.request(`/reviews`, {
      method: 'POST',
      headers,
      body: JSON.stringify(reviewData),
    });
  }

  async getUserReviews(token: string, params?: { page?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/reviews/my-reviews?${queryString}` : '/reviews/my-reviews';

    return this.request(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async updateReview(token: string, reviewId: string, data: {
    danhGia?: number;
    tieuDe?: string;
    noiDung?: string;
  }) {
    return this.request(`/reviews/${reviewId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  }

  async deleteReview(token: string, reviewId: string) {
    return this.request(`/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Auth
  async login(email: string, matKhau: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, matKhau }),
    });
  }

  async register(data: {
    hoTen: string;
    email: string;
    matKhau: string;
    soDienThoai?: string;
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProfile(token: string) {
    return this.request('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async updateProfile(token: string, data: any) {
    return this.request('/auth/update-profile', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  }

  async changePassword(token: string, data: { matKhauCu: string; matKhauMoi: string }) {
    return this.request('/auth/change-password', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  }

  // Upload
  async uploadImage(file: File, token: string) {
    const formData = new FormData();
    formData.append('image', file);

    const url = `${this.baseURL}/upload/image`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    return await response.json();
  }

  // Orders
  async createOrder(token: string, orderData: any) {
    return this.request('/orders', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });
  }

  async getMyOrders(token: string) {
    return this.request('/orders/my-orders', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getOrderById(token: string, orderId: string) {
    return this.request(`/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async cancelOrder(token: string, orderId: string, lyDoHuy: string) {
    return this.request(`/orders/${orderId}/cancel`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ lyDoHuy }),
    });
  }

  // Chat AI
  async chatWithAI(message: string) {
    return this.request('/chat/ai', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  // Addresses
  async addAddress(token: string, addressData: {
    hoTen: string;
    soDienThoai: string;
    tinh: string;
    huyen: string;
    xa: string;
    diaChiChiTiet: string;
    macDinh?: boolean;
  }) {
    return this.request('/auth/addresses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(addressData),
    });
  }

  async updateAddress(token: string, addressId: string, addressData: {
    hoTen: string;
    soDienThoai: string;
    tinh: string;
    huyen: string;
    xa: string;
    diaChiChiTiet: string;
    macDinh?: boolean;
  }) {
    return this.request(`/auth/addresses/${addressId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(addressData),
    });
  }

  async deleteAddress(token: string, addressId: string) {
    return this.request(`/auth/addresses/${addressId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async setDefaultAddress(token: string, addressId: string) {
    return this.request(`/auth/addresses/${addressId}/set-default`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Settings
  async getSettings() {
    return this.request('/settings');
  }

  // Vouchers
  async getAvailableVouchers() {
    return this.request('/vouchers/kha-dung');
  }

  async checkVoucher(ma: string, tongTien: number, token?: string) {
    const headers: any = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return this.request('/vouchers/kiem-tra', {
      method: 'POST',
      headers,
      body: JSON.stringify({ ma, tongTien }),
    });
  }

  // Wishlist APIs
  async getWishlist(token: string) {
    return this.request('/users/wishlist', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async addToWishlist(token: string, productId: string) {
    return this.request('/users/wishlist', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ sanPham: productId }),
    });
  }

  async removeFromWishlist(token: string, productId: string) {
    return this.request(`/users/wishlist/${productId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Points
  async getMyPoints(token: string) {
    return this.request('/points/my-points', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getPointHistory(token: string, limit?: number) {
    const queryParams = limit ? `?limit=${limit}` : '';
    return this.request(`/points/history${queryParams}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async calculatePointsDiscount(token: string, points: number) {
    return this.request('/points/calculate-discount', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ points }),
    });
  }

  // Notifications
  async getNotifications(token: string, params?: { page?: number; limit?: number; daDoc?: boolean }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.daDoc !== undefined) queryParams.append('daDoc', params.daDoc.toString());

    const queryString = queryParams.toString();
    return this.request(`/notifications${queryString ? `?${queryString}` : ''}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getUnreadNotificationCount(token: string) {
    return this.request('/notifications/unread-count', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async markNotificationAsRead(token: string, notificationId: string) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async markAllNotificationsAsRead(token: string) {
    return this.request('/notifications/mark-all-read', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async deleteNotification(token: string, notificationId: string) {
    return this.request(`/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}

export const api = new ApiService();
export default api;
