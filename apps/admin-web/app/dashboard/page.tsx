'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    totalProducts: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);

    try {
      // Load orders and calculate stats
      const ordersResponse = await api.getOrders();
      if (ordersResponse.success && ordersResponse.data) {
        const orders = ordersResponse.data as any[];

        // Calculate stats from orders
        const totalRevenue = orders.reduce((sum: number, order: any) => {
          return order.trangThai === 'da-giao' ? sum + order.tongTien : sum;
        }, 0);

        setStats(prev => ({
          ...prev,
          totalOrders: orders.length,
          totalRevenue: totalRevenue
        }));

        // Set recent orders (last 5)
        setRecentOrders(orders.slice(0, 5));
      }

      // Load users count
      const usersResponse = await api.getUsers({ limit: 1 });
      if (usersResponse.success && (usersResponse as any).pagination) {
        setStats(prev => ({
          ...prev,
          totalCustomers: (usersResponse as any).pagination.total
        }));
      }

      // Load products count and top selling products
      const productsResponse = await api.getProducts({ limit: 100, sort: '-daBan' });
      if (productsResponse.success) {
        const productsData = productsResponse.data as any;
        const products = Array.isArray(productsData) ? productsData : productsData.products || [];

        // Set top 5 selling products
        setTopProducts(products.slice(0, 5));

        if ((productsResponse as any).pagination) {
          setStats(prev => ({
            ...prev,
            totalProducts: (productsResponse as any).pagination.total
          }));
        } else {
          setStats(prev => ({
            ...prev,
            totalProducts: products.length
          }));
        }
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu dashboard:', error);
    }

    setLoading(false);
  };

  const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    shipping: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700'
  };

  const STATUS_LABELS: Record<string, string> = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    shipping: 'Đang giao',
    delivered: 'Đã giao',
    cancelled: 'Đã hủy'
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tổng Quan</h1>
          <p className="text-gray-600 mt-2">Thống kê tổng quan về hoạt động kinh doanh</p>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tổng Đơn Hàng</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalOrders.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Doanh Thu</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">₫{(stats.totalRevenue / 1000000).toFixed(1)}M</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Khách Hàng</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalCustomers.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Sản Phẩm</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalProducts.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Selling Products */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Top 5 Sản Phẩm Bán Chạy</h2>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="animate-pulse flex gap-4">
                      <div className="w-16 h-16 bg-gray-200 rounded"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : topProducts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">Chưa có sản phẩm nào</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={product._id} className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-semibold text-gray-600">
                        {index + 1}
                      </div>
                      <div className="relative w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        {product.hinhAnh && product.hinhAnh[0] ? (
                          <img
                            src={product.hinhAnh[0]}
                            alt={product.ten}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{product.ten}</h4>
                        <p className="text-sm text-gray-600">Đã bán: {product.daBan || 0} sản phẩm</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-blue-600">
                          ₫{((product.gia || 0) * (product.daBan || 0)).toLocaleString('vi-VN')}
                        </p>
                        <p className="text-xs text-gray-500">Doanh thu</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Revenue Chart Placeholder */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Doanh Thu 7 Ngày Qua</h2>
            </div>
            <div className="p-6">
              <div className="h-64 flex items-center justify-center text-gray-400">
                <p>Biểu đồ doanh thu sẽ được hiển thị ở đây</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Đơn Hàng Gần Đây</h2>
            <Link
              href="/dashboard/don-hang"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Xem tất cả →
            </Link>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex gap-4">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Chưa có đơn hàng nào</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-600">
                      <th className="pb-4">Mã ĐH</th>
                      <th className="pb-4">Khách Hàng</th>
                      <th className="pb-4">Sản Phẩm</th>
                      <th className="pb-4">Tổng Tiền</th>
                      <th className="pb-4">Trạng Thái</th>
                      <th className="pb-4">Ngày</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {recentOrders.map((order) => (
                      <tr key={order._id} className="border-t border-gray-100">
                        <td className="py-4 font-medium text-blue-600">{order.maDonHang}</td>
                        <td className="py-4">{order.giaoDich?.nguoiNhan || 'N/A'}</td>
                        <td className="py-4">{order.sanPham?.length || 0} sản phẩm</td>
                        <td className="py-4 font-medium">₫{order.tongTien.toLocaleString('vi-VN')}</td>
                        <td className="py-4">
                          <span className={`px-3 py-1 rounded-full text-xs ${STATUS_COLORS[order.trangThai]}`}>
                            {STATUS_LABELS[order.trangThai] || order.trangThai}
                          </span>
                        </td>
                        <td className="py-4 text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
