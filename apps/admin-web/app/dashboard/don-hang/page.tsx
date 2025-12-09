'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Order {
  _id: string;
  maDonHang: string;
  nguoiDung: {
    _id: string;
    hoTen: string;
    email: string;
  };
  sanPham: Array<{
    sanPham: string;
    tenSanPham: string;
    hinhAnh: string;
    soLuong: number;
    gia: number;
    size?: string;
    mauSac?: string;
    thanhTien: number;
  }>;
  tongTien: number;
  phiVanChuyen: number;
  giamGia: number;
  tongThanhToan: number;
  trangThaiDonHang: string;
  phuongThucThanhToan: string;
  trangThaiThanhToan: string;
  diaChiGiaoHang: {
    hoTen: string;
    soDienThoai: string;
    tinh: string;
    huyen: string;
    xa: string;
    diaChiChiTiet: string;
  };
  createdAt: string;
}

const ORDER_STATUS = [
  { value: '', label: 'Tất cả' },
  { value: 'cho-xac-nhan', label: 'Chờ xác nhận' },
  { value: 'da-xac-nhan', label: 'Đã xác nhận' },
  { value: 'dang-chuan-bi', label: 'Đang chuẩn bị' },
  { value: 'dang-giao', label: 'Đang giao' },
  { value: 'da-giao', label: 'Đã giao' },
  { value: 'da-huy', label: 'Đã hủy' },
  { value: 'tra-hang', label: 'Trả hàng' }
];

const STATUS_COLORS: Record<string, string> = {
  'cho-xac-nhan': 'bg-yellow-100 text-yellow-700',
  'da-xac-nhan': 'bg-blue-100 text-blue-700',
  'dang-chuan-bi': 'bg-indigo-100 text-indigo-700',
  'dang-giao': 'bg-purple-100 text-purple-700',
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

export default function OrdersManagementPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadOrders();
  }, [currentPage, statusFilter]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await api.getOrders({
        page: currentPage,
        limit: itemsPerPage,
        status: statusFilter
      });

      if (response.success && response.data) {
        const responseData = response.data as any;
        const orders = Array.isArray(responseData)
          ? responseData
          : (responseData.orders || []);
        setOrders(orders);
        setTotalPages(Math.ceil((responseData.total || orders.length || 0) / itemsPerPage));
      } else if (response.error) {
        console.error('Lỗi khi tải đơn hàng:', response.error);
        // Don't show alert for auth errors, just show empty state
      }
    } catch (error) {
      console.error('Lỗi khi tải đơn hàng:', error);
    }
    setLoading(false);
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    const response = await api.updateOrderStatus(orderId, newStatus);

    if (response.success) {
      alert('Cập nhật trạng thái đơn hàng thành công!');
      loadOrders();
    } else {
      alert('Lỗi: ' + response.error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quản Lý Đơn Hàng</h1>
          <p className="text-gray-600 mt-2">Quản lý và theo dõi tất cả đơn hàng</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-wrap gap-2">
            {ORDER_STATUS.map((status) => (
              <button
                key={status.value}
                onClick={() => setStatusFilter(status.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === status.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 mt-4">Đang tải dữ liệu...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Không có đơn hàng nào</h3>
              <p className="text-gray-600">Chưa có đơn hàng nào trong hệ thống</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Mã đơn hàng</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Khách hàng</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Sản phẩm</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tổng tiền</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Thanh toán</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Trạng thái</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Ngày đặt</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <span className="font-semibold text-blue-600">{order.maDonHang}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{order.diaChiGiaoHang.hoTen}</p>
                            <p className="text-sm text-gray-600">{order.diaChiGiaoHang.soDienThoai}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900">
                            {order.sanPham.length} sản phẩm
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-gray-900">
                            ₫{order.tongThanhToan.toLocaleString('vi-VN')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm text-gray-900">{order.phuongThucThanhToan}</p>
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                                order.trangThaiThanhToan === 'da-thanh-toan'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}
                            >
                              {order.trangThaiThanhToan === 'da-thanh-toan' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={order.trangThaiDonHang}
                            onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium border-0 cursor-pointer ${
                              STATUS_COLORS[order.trangThaiDonHang]
                            }`}
                          >
                            {ORDER_STATUS.slice(1).map((status) => (
                              <option key={status.value} value={status.value}>
                                {status.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">
                            {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/dashboard/don-hang/${order._id}`}
                              className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-50 rounded transition-colors"
                              title="Xem chi tiết"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Trang {currentPage} / {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Trước
                    </button>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
