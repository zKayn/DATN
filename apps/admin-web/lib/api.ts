const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiService {
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    // Read token fresh from localStorage on each request
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Đã có lỗi xảy ra');
      }

      // Return the API response directly (it already has success, data, message structure)
      return result;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Đã có lỗi xảy ra',
      };
    }
  }

  // Auth APIs
  async login(email: string, password: string) {
    const response = await this.request<{ token: string; user: any }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, matKhau: password }),
      }
    );
    if (response.success && response.data?.token) {
      localStorage.setItem('admin_token', response.data.token);
    }
    return response;
  }

  async registerAdmin(data: {
    hoTen: string;
    email: string;
    matKhau: string;
    soDienThoai?: string;
  }) {
    const response = await this.request<{ token: string; user: any }>(
      '/auth/register-admin',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    if (response.success && response.data?.token) {
      localStorage.setItem('admin_token', response.data.token);
    }
    return response;
  }

  logout() {
    localStorage.removeItem('admin_token');
  }

  // Product APIs
  async getProducts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.category) queryParams.append('category', params.category);

    return this.request(`/products?${queryParams.toString()}`);
  }

  async getProduct(id: string) {
    return this.request(`/products/${id}`);
  }

  async createProduct(data: any) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProduct(id: string, data: any) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: string) {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Category APIs
  async getCategories() {
    return this.request('/categories');
  }

  async createCategory(data: any) {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: string, data: any) {
    return this.request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: string) {
    return this.request(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Brand APIs
  async getBrands() {
    return this.request('/brands');
  }

  async getBrand(id: string) {
    return this.request(`/brands/${id}`);
  }

  async createBrand(data: any) {
    return this.request('/brands', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBrand(id: string, data: any) {
    return this.request(`/brands/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBrand(id: string) {
    return this.request(`/brands/${id}`, {
      method: 'DELETE',
    });
  }

  // Order APIs
  async getOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);

    return this.request(`/orders?${queryParams.toString()}`);
  }

  async getOrder(id: string) {
    return this.request(`/orders/${id}`);
  }

  async updateOrderStatus(id: string, status: string) {
    return this.request(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ trangThai: status }),
    });
  }

  // User APIs
  async getUsers(params?: { page?: number; limit?: number; role?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.role) queryParams.append('role', params.role);

    return this.request(`/users?${queryParams.toString()}`);
  }

  async updateUser(id: string, data: any) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: string) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Stats APIs
  async getStats() {
    return this.request('/stats');
  }

  // Review APIs
  async getReviews(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);

    return this.request(`/reviews?${queryParams.toString()}`);
  }

  async approveReview(id: string) {
    return this.request(`/reviews/${id}/approve`, {
      method: 'PUT',
    });
  }

  async rejectReview(id: string) {
    return this.request(`/reviews/${id}/reject`, {
      method: 'PUT',
    });
  }

  // Upload APIs
  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append('image', file);

    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;

    const response = await fetch(`${API_URL}/upload/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    return await response.json();
  }

  async uploadMultipleImages(files: File[]) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;

    const response = await fetch(`${API_URL}/upload/images`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    return await response.json();
  }

  // Settings APIs
  async getSettings() {
    return this.request('/settings');
  }

  async updateSettings(data: any) {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Voucher APIs
  async getVouchers(params?: {
    page?: number;
    limit?: number;
    trangThai?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.trangThai) queryParams.append('trangThai', params.trangThai);

    return this.request(`/vouchers?${queryParams.toString()}`);
  }

  async getVoucher(id: string) {
    return this.request(`/vouchers/${id}`);
  }

  async createVoucher(data: any) {
    return this.request('/vouchers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateVoucher(id: string, data: any) {
    return this.request(`/vouchers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteVoucher(id: string) {
    return this.request(`/vouchers/${id}`, {
      method: 'DELETE',
    });
  }

  // Notification APIs
  async getNotifications(params?: {
    page?: number;
    limit?: number;
    daDoc?: boolean;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.daDoc !== undefined) queryParams.append('daDoc', params.daDoc.toString());

    return this.request(`/notifications?${queryParams.toString()}`);
  }

  async getUnreadCount() {
    return this.request('/notifications/unread-count');
  }

  async markNotificationAsRead(id: string) {
    return this.request(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsAsRead() {
    return this.request('/notifications/mark-all-read', {
      method: 'PUT',
    });
  }

  async deleteNotification(id: string) {
    return this.request(`/notifications/${id}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiService();
