'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function PayOSSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const verifyPayment = async () => {
      const orderId = searchParams.get('orderId');

      if (!orderId) {
        toast.error('Không tìm thấy thông tin đơn hàng');
        router.push('/');
        return;
      }

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Vui lòng đăng nhập');
          router.push('/dang-nhap');
          return;
        }

        // Get payment status
        const statusResponse = await api.getPayOSPaymentStatus(token, orderId);

        if (statusResponse.success) {
          const paymentStatus = statusResponse.paymentStatus;

          if (paymentStatus === 'da-thanh-toan') {
            // Payment successful - get order details
            const orderResponse = await api.getOrderById(token, orderId);
            if (orderResponse.success) {
              setOrder(orderResponse.data);
              // Clear cart on successful payment
              clearCart();
            }
          } else if (paymentStatus === 'that-bai' || paymentStatus === 'da-huy') {
            // Payment failed or cancelled
            toast.error('Thanh toán không thành công');
            router.push(`/payment/payos/cancel?orderId=${orderId}`);
            return;
          } else {
            // Payment pending
            toast('Đang xác nhận thanh toán...');
          }
        }
      } catch (error: any) {
        console.error('Error verifying payment:', error);
        toast.error('Không thể xác nhận thanh toán');
      } finally {
        setVerifying(false);
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams, router, clearCart]);

  if (loading || verifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang xác nhận thanh toán...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Không tìm thấy thông tin đơn hàng</p>
          <Link href="/" className="text-primary-500 hover:text-primary-700 mt-4 inline-block">
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Thanh Toán Thành Công!</h1>
          <p className="text-lg text-gray-600">
            Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đang được xử lý.
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="border-b border-gray-200 pb-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Thông Tin Đơn Hàng</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Mã đơn hàng</p>
                <p className="text-lg font-semibold text-gray-900">{order.maDonHang}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Trạng thái thanh toán</p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Đã thanh toán
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phương thức thanh toán</p>
                <p className="text-lg font-semibold text-gray-900">PayOS - QR Code</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tổng thanh toán</p>
                <p className="text-lg font-semibold text-red-600">
                  ₫{order.tongThanhToan?.toLocaleString('vi-VN')}
                </p>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Địa Chỉ Giao Hàng</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-medium text-gray-900">{order.diaChiGiaoHang?.hoTen}</p>
              <p className="text-gray-600">{order.diaChiGiaoHang?.soDienThoai}</p>
              <p className="text-gray-600 mt-2">
                {order.diaChiGiaoHang?.diaChiChiTiet}, {order.diaChiGiaoHang?.xa},{' '}
                {order.diaChiGiaoHang?.huyen}, {order.diaChiGiaoHang?.tinh}
              </p>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Sản Phẩm Đã Đặt</h3>
            <div className="space-y-3">
              {order.sanPham?.map((item: any, index: number) => (
                <div key={index} className="flex items-center gap-4 bg-gray-50 rounded-lg p-3">
                  <div className="relative w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.hinhAnh}
                      alt={item.tenSanPham}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{item.tenSanPham}</h4>
                    <p className="text-sm text-gray-600">
                      {item.size} / {item.mauSac} × {item.soLuong}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ₫{item.thanhTien?.toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/tai-khoan/don-hang"
            className="inline-flex items-center justify-center gap-2 bg-primary-500 text-white px-8 py-4 rounded-lg hover:bg-primary-600 transition-colors font-semibold"
          >
            <Package className="w-5 h-5" />
            Xem Đơn Hàng
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 px-8 py-4 rounded-lg hover:bg-gray-50 transition-colors font-semibold border border-gray-300"
          >
            Tiếp Tục Mua Sắm
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 inline-block">
            <p className="text-sm text-blue-800">
              📧 Chúng tôi đã gửi email xác nhận đơn hàng đến địa chỉ email của bạn.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
