'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  pendingOrders: number;
  completedOrders: number;
}

interface SalesData {
  date: string;
  revenue: number;
  orders: number;
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    pendingOrders: 0,
    completedOrders: 0
  });
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState('7days');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Load orders
      const ordersRes = await api.getOrders();
      if (ordersRes.success && ordersRes.data) {
        const orders = ordersRes.data as any[];

        // Calculate stats - use correct field names
        const totalRevenue = orders.reduce((sum: number, order: any) => {
          const status = order.trangThaiDonHang || order.trangThai;
          const amount = order.tongThanhToan || order.tongTien || 0;
          return status === 'da-giao' ? sum + amount : sum;
        }, 0);

        const pendingOrders = orders.filter((o: any) => {
          const status = o.trangThaiDonHang || o.trangThai;
          return ['cho-xac-nhan', 'da-xac-nhan', 'dang-chuan-bi', 'dang-giao'].includes(status);
        }).length;

        const completedOrders = orders.filter((o: any) => {
          const status = o.trangThaiDonHang || o.trangThai;
          return status === 'da-giao';
        }).length;

        // Generate sales data for chart
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
        setStats(prev => ({
          ...prev,
          totalRevenue,
          totalOrders: orders.length,
          pendingOrders,
          completedOrders
        }));

        // Calculate top products from orders
        const productSales: Record<string, any> = {};
        orders.forEach((order: any) => {
          const status = order.trangThaiDonHang || order.trangThai;
          if (status === 'da-giao' && order.sanPham) {
            order.sanPham.forEach((item: any) => {
              // Use tenSanPham and hinhAnh from order item
              const productKey = item.tenSanPham || 'Unknown';
              if (!productSales[productKey]) {
                productSales[productKey] = {
                  ten: item.tenSanPham,
                  hinhAnh: item.hinhAnh ? [item.hinhAnh] : [],
                  quantity: 0,
                  revenue: 0
                };
              }
              productSales[productKey].quantity += item.soLuong || 0;
              // Use thanhTien if available, otherwise calculate from gia * soLuong
              const itemRevenue = item.thanhTien || ((item.gia || 0) * (item.soLuong || 0));
              productSales[productKey].revenue += itemRevenue;
            });
          }
        });

        const topProductsArray = Object.values(productSales)
          .sort((a: any, b: any) => b.revenue - a.revenue)
          .slice(0, 5);
        setTopProducts(topProductsArray);
      }

      // Load users
      const usersRes = await api.getUsers({ limit: 1000 });
      if (usersRes.success && (usersRes as any).pagination) {
        setStats(prev => ({
          ...prev,
          totalCustomers: (usersRes as any).pagination.total
        }));
      }

      // Load products
      const productsRes = await api.getProducts({ limit: 1000 });
      if (productsRes.success && (productsRes as any).pagination) {
        setStats(prev => ({
          ...prev,
          totalProducts: (productsRes as any).pagination.total
        }));
      }

    } catch (error: any) {
      console.error('Error loading analytics:', error);
      toast.error(error.message || 'Không thể tải dữ liệu thống kê');
    } finally {
      setLoading(false);
    }
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Thống Kê & Báo Cáo</h1>
            <p className="text-gray-600 mt-2">Theo dõi hiệu quả kinh doanh</p>
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7days">7 ngày qua</option>
            <option value="30days">30 ngày qua</option>
            <option value="90days">90 ngày qua</option>
          </select>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-4">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Doanh thu</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {formatCurrency(stats.totalRevenue)}
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4">Tổng doanh thu từ đơn đã giao</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Đơn hàng</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {stats.totalOrders}
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
              </div>
              <div className="flex gap-4 mt-4 text-xs">
                <span className="text-yellow-600">Chờ xử lý: {stats.pendingOrders}</span>
                <span className="text-green-600">Hoàn thành: {stats.completedOrders}</span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Khách hàng</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {stats.totalCustomers}
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4">Tổng số người dùng đã đăng ký</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sản phẩm</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {stats.totalProducts}
                  </p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4">Tổng sản phẩm trong kho</p>
            </div>
          </div>

            {/* Sales Chart */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Doanh Thu 7 Ngày Qua</h2>
            <div className="h-64">
              <div className="flex items-end justify-between h-full gap-2">
                {salesData.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center justify-end h-full">
                    <div className="w-full bg-blue-100 rounded-t-lg hover:bg-blue-200 transition-colors relative group"
                         style={{ height: `${(data.revenue / maxRevenue) * 100}%`, minHeight: data.revenue > 0 ? '8px' : '2px' }}>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
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
          </div>

            {/* Top Products */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Top 5 Sản Phẩm Bán Chạy</h2>
            {topProducts.length > 0 ? (
              <div className="space-y-4">
                {topProducts.map((item: any, index: number) => (
                  <div key={index} className="flex items-center gap-4 pb-4 border-b last:border-b-0">
                    <div className="text-2xl font-bold text-gray-400 w-8">{index + 1}</div>
                    <div className="w-16 h-16 flex-shrink-0">
                      <img
                        src={item.hinhAnh?.[0] || '/placeholder.png'}
                        alt={item.ten || 'Product'}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.ten || 'Không rõ tên'}</h3>
                      <p className="text-sm text-gray-500">Đã bán: {item.quantity} sản phẩm</p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-blue-600">{formatCurrency(item.revenue)}</div>
                      <div className="text-sm text-gray-500">Doanh thu</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có dữ liệu sản phẩm</h3>
                <p className="text-gray-600">Dữ liệu sẽ xuất hiện khi có đơn hàng thành công</p>
              </div>
            )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
