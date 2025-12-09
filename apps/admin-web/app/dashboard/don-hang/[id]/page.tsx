'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface OrderItem {
  sanPham: string;
  tenSanPham: string;
  hinhAnh: string;
  gia: number;
  soLuong: number;
  mauSac?: string;
  size?: string;
  thanhTien: number;
}

interface Order {
  _id: string;
  maDonHang: string;
  nguoiDung: {
    _id: string;
    hoTen: string;
    email: string;
    soDienThoai?: string;
  };
  sanPham: OrderItem[];
  tongTien: number;
  trangThai: string;
  phuongThucThanhToan: string;
  diaChiGiaoHang: {
    hoTen: string;
    soDienThoai: string;
    tinh: string;
    huyen: string;
    xa: string;
    diaChiChiTiet: string;
  };
  ghiChu?: string;
  createdAt: string;
  updatedAt: string;
}

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const response = await api.getOrders();
      if (response.success && response.data) {
        const orders = response.data as Order[];
        const foundOrder = orders.find((o: Order) => o._id === orderId);
        if (foundOrder) {
          setOrder(foundOrder);
        } else {
          toast.error('Không tìm thấy đơn hàng');
          router.push('/dashboard/don-hang');
        }
      }
    } catch (error: any) {
      console.error('Error loading order:', error);
      toast.error(error.message || 'Không thể tải đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!order) return;

    setUpdating(true);
    try {
      const response = await api.updateOrderStatus(order._id, newStatus);
      if (response.success) {
        toast.success('Cập nhật trạng thái thành công!');
        setOrder({ ...order, trangThai: newStatus });
      }
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error(error.message || 'Không thể cập nhật trạng thái');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; class: string }> = {
      'cho-xac-nhan': { label: 'Chờ xác nhận', class: 'bg-yellow-100 text-yellow-800' },
      'da-xac-nhan': { label: 'Đã xác nhận', class: 'bg-blue-100 text-blue-800' },
      'dang-chuan-bi': { label: 'Đang chuẩn bị', class: 'bg-purple-100 text-purple-800' },
      'dang-giao': { label: 'Đang giao', class: 'bg-indigo-100 text-indigo-800' },
      'da-giao': { label: 'Đã giao', class: 'bg-green-100 text-green-800' },
      'da-huy': { label: 'Đã hủy', class: 'bg-red-100 text-red-800' },
      'tra-hang': { label: 'Trả hàng', class: 'bg-gray-100 text-gray-800' }
    };

    const config = statusConfig[status] || { label: status, class: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${config.class}`}>
        {config.label}
      </span>
    );
  };

  const getPaymentMethod = (method: string) => {
    const methods: Record<string, string> = {
      'cod': 'Thanh toán khi nhận hàng (COD)',
      'vnpay': 'VNPay',
      'momo': 'MoMo',
      'banking': 'Chuyển khoản ngân hàng'
    };
    return methods[method] || method;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-600">Không tìm thấy đơn hàng</p>
          <Link href="/dashboard/don-hang" className="text-blue-600 hover:text-blue-700 mt-2 inline-block">
            Quay lại danh sách đơn hàng
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/dashboard/don-hang" className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block">
            ← Quay lại danh sách
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Chi Tiết Đơn Hàng</h1>
          <p className="text-gray-600">Mã đơn: {order.maDonHang}</p>
        </div>
        <div>
          {getStatusBadge(order.trangThai)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Products */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Sản Phẩm ({order.sanPham.length})</h2>
            <div className="space-y-4">
              {order.sanPham.map((item, index) => (
                <div key={index} className="flex gap-4 pb-4 border-b last:border-b-0">
                  <div className="w-20 h-20 flex-shrink-0">
                    <img
                      src={item.hinhAnh || '/placeholder.png'}
                      alt={item.tenSanPham}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.tenSanPham}</h3>
                    <div className="text-sm text-gray-500 mt-1">
                      {item.mauSac && <span>Màu: {item.mauSac}</span>}
                      {item.size && <span className="ml-4">Size: {item.size}</span>}
                    </div>
                    <div className="mt-2">
                      <span className="text-sm text-gray-600">Số lượng: {item.soLuong}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {(item.gia * item.soLuong).toLocaleString('vi-VN')}₫
                    </div>
                    <div className="text-sm text-gray-500">
                      {item.gia.toLocaleString('vi-VN')}₫/sp
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Tổng tiền:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {order.tongTien.toLocaleString('vi-VN')}₫
                </span>
              </div>
            </div>
          </div>

          {/* Status Update */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Cập Nhật Trạng Thái</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['cho-xac-nhan', 'da-xac-nhan', 'dang-chuan-bi', 'dang-giao', 'da-giao', 'da-huy', 'tra-hang'].map((status) => (
                <button
                  key={status}
                  onClick={() => handleUpdateStatus(status)}
                  disabled={updating || order.trangThai === status}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                    order.trangThai === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {getStatusBadge(status).props.children}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Thông Tin Khách Hàng</h2>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-500">Họ tên</div>
                <div className="font-medium">{order.nguoiDung.hoTen}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Email</div>
                <div className="font-medium">{order.nguoiDung.email}</div>
              </div>
              {order.nguoiDung.soDienThoai && (
                <div>
                  <div className="text-sm text-gray-500">Số điện thoại</div>
                  <div className="font-medium">{order.nguoiDung.soDienThoai}</div>
                </div>
              )}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Địa Chỉ Giao Hàng</h2>
            <div className="space-y-2 text-sm">
              <div className="font-medium">{order.diaChiGiaoHang.hoTen}</div>
              <div>{order.diaChiGiaoHang.soDienThoai}</div>
              <div className="text-gray-600">
                {order.diaChiGiaoHang.diaChiChiTiet}, {order.diaChiGiaoHang.xa}, {order.diaChiGiaoHang.huyen}, {order.diaChiGiaoHang.tinh}
              </div>
            </div>
          </div>

          {/* Payment & Notes */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Thanh Toán & Ghi Chú</h2>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-500">Phương thức thanh toán</div>
                <div className="font-medium">{getPaymentMethod(order.phuongThucThanhToan)}</div>
              </div>
              {order.ghiChu && (
                <div>
                  <div className="text-sm text-gray-500">Ghi chú</div>
                  <div className="font-medium">{order.ghiChu}</div>
                </div>
              )}
              <div>
                <div className="text-sm text-gray-500">Ngày đặt</div>
                <div className="font-medium">{new Date(order.createdAt).toLocaleString('vi-VN')}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Cập nhật lần cuối</div>
                <div className="font-medium">{new Date(order.updatedAt).toLocaleString('vi-VN')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
