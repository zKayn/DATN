'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface SalesData {
  date: string;
  revenue: number;
  orders: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    totalProducts: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
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
        const responseData = ordersResponse.data as any;
        const orders = Array.isArray(responseData) ? responseData : responseData.orders || [];

        // Calculate stats from orders - use correct field names from backend
        const totalRevenue = orders.reduce((sum: number, order: any) => {
          // Backend uses trangThaiDonHang, not trangThai
          const status = order.trangThaiDonHang || order.trangThai;
          return status === 'da-giao' ? sum + (order.tongThanhToan || order.tongTien || 0) : sum;
        }, 0);

        setStats(prev => ({
          ...prev,
          totalOrders: (ordersResponse as any).pagination?.total || orders.length,
          totalRevenue: totalRevenue
        }));

        // Set recent orders (last 5)
        setRecentOrders(orders.slice(0, 5));

        // Generate sales data for last 7 days
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          return date.toISOString().split('T')[0];
        });

        const salesByDate = last7Days.map(date => {
          const dayOrders = orders.filter((o: any) => {
            const status = o.trangThaiDonHang || o.trangThai;
            const createdAt = o.createdAt || o.ngayTao || '';
            return createdAt.startsWith(date) && status === 'da-giao';
          });
          return {
            date,
            revenue: dayOrders.reduce((sum: number, o: any) => {
              const amount = o.tongThanhToan || o.tongTien || 0;
              return sum + amount;
            }, 0),
            orders: dayOrders.length
          };
        });

        setSalesData(salesByDate);
      }

      // Load users count
      const usersResponse = await api.getUsers({ limit: 1 });
      if (usersResponse.success) {
        const pagination = (usersResponse as any).pagination;
        setStats(prev => ({
          ...prev,
          totalCustomers: pagination?.total || 0
        }));
      }

      // Calculate top selling products from completed orders
      const productSales: Record<string, any> = {};
      if (ordersResponse.success && ordersResponse.data) {
        const orders = Array.isArray(ordersResponse.data) ? ordersResponse.data : (ordersResponse.data as any).orders || [];

        orders.forEach((order: any) => {
          const status = order.trangThaiDonHang || order.trangThai;
          if (status === 'da-giao' && order.sanPham) {
            order.sanPham.forEach((item: any) => {
              const productId = item.sanPham?._id || item.sanPham;
              const productName = item.tenSanPham || item.sanPham?.ten || 'Unknown';
              const productImage = item.hinhAnh || (item.sanPham?.hinhAnh ? item.sanPham.hinhAnh[0] : null);

              if (!productSales[productId]) {
                productSales[productId] = {
                  _id: productId,
                  ten: productName,
                  hinhAnh: productImage ? [productImage] : [],
                  daBan: 0,
                  gia: item.gia || item.sanPham?.gia || 0,
                  revenue: 0
                };
              }
              productSales[productId].daBan += item.soLuong || 0;
              productSales[productId].revenue += (item.gia || 0) * (item.soLuong || 0);
            });
          }
        });
      }

      const topProductsArray = Object.values(productSales)
        .sort((a: any, b: any) => b.daBan - a.daBan)
        .slice(0, 5);
      setTopProducts(topProductsArray);

      // Load total products count
      const productsResponse = await api.getProducts({ limit: 1 });
      if (productsResponse.success && (productsResponse as any).pagination) {
        setStats(prev => ({
          ...prev,
          totalProducts: (productsResponse as any).pagination.total
        }));
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu dashboard:', error);
    }

    setLoading(false);
  };

  // Use Vietnamese status codes from backend
  const STATUS_COLORS: Record<string, string> = {
    'cho-xac-nhan': 'bg-yellow-100 text-yellow-700',
    'da-xac-nhan': 'bg-blue-100 text-blue-700',
    'dang-chuan-bi': 'bg-purple-100 text-purple-700',
    'dang-giao': 'bg-indigo-100 text-indigo-700',
    'da-giao': 'bg-green-100 text-green-700',
    'da-huy': 'bg-red-100 text-red-700',
    'tra-hang': 'bg-orange-100 text-orange-700'
  };

  const STATUS_LABELS: Record<string, string> = {
    'cho-xac-nhan': 'Chờ xác nhận',
    'da-xac-nhan': 'Đã xác nhận',
    'dang-chuan-bi': 'Đang chuẩn bị',
    'dang-giao': 'Đang giao',
    'da-giao': 'Đã giao',
    'da-huy': 'Đã hủy',
    'tra-hang': 'Trả hàng'
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + '₫';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  const maxRevenue = Math.max(...salesData.map(d => d.revenue), 1);

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

          {/* Revenue Chart */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Doanh Thu 7 Ngày Qua</h2>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="h-64">
                  <div className="flex items-end justify-between h-full gap-2">
                    {salesData.map((data, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center justify-end h-full">
                        <div className="w-full bg-blue-100 rounded-t-lg hover:bg-blue-200 transition-colors relative group"
                             style={{ height: `${(data.revenue / maxRevenue) * 100}%`, minHeight: data.revenue > 0 ? '8px' : '2px' }}>
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                            {formatCurrency(data.revenue)}
                            <br />
                            {data.orders} đơn
                          </div>
                        </div>
                        <div className="text-xs text-gray-600 mt-2">{formatDate(data.date)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                        <td className="py-4 font-medium">₫{(order.tongThanhToan || order.tongTien || 0).toLocaleString('vi-VN')}</td>
                        <td className="py-4">
                          {(() => {
                            const status = order.trangThaiDonHang || order.trangThai || 'cho-xac-nhan';
                            return (
                              <span className={`px-3 py-1 rounded-full text-xs ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-700'}`}>
                                {STATUS_LABELS[status] || status}
                              </span>
                            );
                          })()}
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
