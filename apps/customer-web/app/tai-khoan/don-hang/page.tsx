'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, ChevronRight, Search, Filter } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface OrderItem {
  sanPham: string;
  tenSanPham: string;
  hinhAnh: string;
  soLuong: number;
  gia: number;
  size?: string;
  mauSac?: string;
  thanhTien: number;
}

interface Order {
  _id: string;
  maDonHang: string;
  createdAt: string;
  tongThanhToan: number;
  trangThaiDonHang: string;
  sanPham: OrderItem[];
  diaChiGiaoHang: {
    hoTen: string;
    soDienThoai: string;
    tinh: string;
    huyen: string;
    xa: string;
    diaChiChiTiet: string;
  };
}

const statusLabels: Record<string, { label: string; color: string; bgColor: string }> = {
  'cho-xac-nhan': { label: 'Chờ xác nhận', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  'da-xac-nhan': { label: 'Đã xác nhận', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  'dang-chuan-bi': { label: 'Đang chuẩn bị', color: 'text-indigo-700', bgColor: 'bg-indigo-100' },
  'dang-giao': { label: 'Đang giao', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  'da-giao': { label: 'Đã giao', color: 'text-green-700', bgColor: 'bg-green-100' },
  'da-huy': { label: 'Đã hủy', color: 'text-red-700', bgColor: 'bg-red-100' },
  'tra-hang': { label: 'Trả hàng', color: 'text-orange-700', bgColor: 'bg-orange-100' },
};

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Vui lòng đăng nhập để xem đơn hàng');
        window.location.href = '/dang-nhap';
        return;
      }

      const response = await api.getMyOrders(token);
      if (response.success && response.data) {
        const ordersData = Array.isArray(response.data) ? response.data : response.data.orders || [];
        setOrders(ordersData);
      }
    } catch (error: any) {
      console.error('Lỗi khi tải đơn hàng:', error);
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại');
        localStorage.removeItem('token');
        window.location.href = '/dang-nhap';
      } else {
        toast.error('Không thể tải đơn hàng');
      }
    }
    setLoading(false);
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Vui lòng đăng nhập');
        return;
      }

      const response = await api.cancelOrder(token, orderId, 'Khách hàng yêu cầu hủy');
      if (response.success) {
        toast.success('Đã hủy đơn hàng thành công');
        loadOrders(); // Reload orders
      }
    } catch (error) {
      console.error('Lỗi khi hủy đơn hàng:', error);
      toast.error('Không thể hủy đơn hàng');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesStatus = selectedStatus === 'all' || order.trangThaiDonHang === selectedStatus;
    const matchesSearch = order.maDonHang.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.sanPham.some(item => item.tenSanPham.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-lg p-6 h-48" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
            {/* Header */}
            <div className="bg-white rounded-lg p-6 mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Đơn Hàng Của Tôi</h1>

              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm đơn hàng..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">Tất cả đơn hàng</option>
                  <option value="pending">Chờ xác nhận</option>
                  <option value="confirmed">Đã xác nhận</option>
                  <option value="shipping">Đang giao</option>
                  <option value="delivered">Đã giao</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-lg p-12 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-12 h-12 text-gray-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchQuery || selectedStatus !== 'all' ? 'Không tìm thấy đơn hàng' : 'Chưa có đơn hàng nào'}
                </h2>
                <p className="text-gray-600 mb-6">
                  {searchQuery || selectedStatus !== 'all'
                    ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                    : 'Hãy khám phá và đặt hàng ngay!'}
                </p>
                <Link
                  href="/san-pham"
                  className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                >
                  Khám phá sản phẩm
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => {
                  const status = statusLabels[order.trangThaiDonHang] || statusLabels['cho-xac-nhan'];

                  return (
                    <div key={order._id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      {/* Order Header */}
                      <div className="bg-gray-50 px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Mã đơn hàng</p>
                            <p className="font-semibold text-gray-900">{order.maDonHang}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.bgColor} ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Ngày đặt</p>
                          <p className="text-sm font-medium text-gray-900">{formatDate(order.createdAt)}</p>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="p-6">
                        <div className="space-y-4 mb-4">
                          {order.sanPham.map((item, index) => (
                            <div key={index} className="flex gap-4">
                              <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                <Image
                                  src={item.hinhAnh || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200'}
                                  alt={item.tenSanPham}
                                  width={80}
                                  height={80}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-medium text-gray-900 mb-1">{item.tenSanPham}</h3>
                                <p className="text-sm text-gray-600">
                                  {item.size && `Size: ${item.size}`}
                                  {item.size && item.mauSac && ' | '}
                                  {item.mauSac && `Màu: ${item.mauSac}`}
                                </p>
                                <p className="text-sm text-gray-600">Số lượng: {item.soLuong}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-gray-900">{formatPrice(item.gia)}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Shipping Address */}
                        <div className="border-t pt-4 mb-4">
                          <p className="text-sm font-medium text-gray-900 mb-2">Địa chỉ giao hàng:</p>
                          <p className="text-sm text-gray-600">
                            {order.diaChiGiaoHang.hoTen} - {order.diaChiGiaoHang.soDienThoai}
                          </p>
                          <p className="text-sm text-gray-600">
                            {order.diaChiGiaoHang.diaChiChiTiet}, {order.diaChiGiaoHang.xa}, {order.diaChiGiaoHang.huyen}, {order.diaChiGiaoHang.tinh}
                          </p>
                        </div>

                        {/* Order Total and Actions */}
                        <div className="border-t pt-4 flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Tổng tiền:</p>
                            <p className="text-2xl font-bold text-primary-600">{formatPrice(order.tongThanhToan)}</p>
                          </div>
                          <div className="flex gap-3">
                            <Link
                              href={`/tai-khoan/don-hang/${order._id}`}
                              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                            >
                              Xem chi tiết
                            </Link>
                            {order.trangThaiDonHang === 'cho-xac-nhan' && (
                              <button
                                onClick={() => handleCancelOrder(order._id)}
                                className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                              >
                                Hủy đơn
                              </button>
                            )}
                            {order.trangThaiDonHang === 'da-giao' && (
                              <button className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors">
                                Mua lại
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
    </>
  );
}
