'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { XCircle, ArrowLeft, RefreshCcw } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function PayOSCancelPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrderInfo = async () => {
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

        // Get order details
        const orderResponse = await api.getOrderById(token, orderId);
        if (orderResponse.success) {
          setOrder(orderResponse.data);
        }
      } catch (error: any) {
        console.error('Error loading order:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrderInfo();
  }, [searchParams, router]);

  const handleRetryPayment = async () => {
    if (!order) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Vui lòng đăng nhập');
        router.push('/dang-nhap');
        return;
      }

      toast('Đang khởi tạo thanh toán...');

      const payosResponse = await api.createPayOSPaymentLink(token, order._id);

      if (payosResponse.success) {
        // Redirect to PayOS checkout URL
        window.location.href = payosResponse.data.checkoutUrl;
      } else {
        toast.error(payosResponse.message || 'Không thể khởi tạo thanh toán');
      }
    } catch (error: any) {
      console.error('Error retrying payment:', error);
      toast.error('Không thể thử lại thanh toán');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Cancel Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-6">
            <XCircle className="w-16 h-16 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Thanh Toán Bị Hủy</h1>
          <p className="text-lg text-gray-600">
            Giao dịch của bạn đã bị hủy hoặc không thành công.
          </p>
        </div>

        {/* Order Info */}
        {order && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Thông Tin Đơn Hàng</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-600">Mã đơn hàng</p>
                <p className="text-lg font-semibold text-gray-900">{order.maDonHang}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Trạng thái thanh toán</p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  {order.trangThaiThanhToan === 'da-huy' ? 'Đã hủy' : 'Chưa thanh toán'}
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

            {/* Reason */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Lý do có thể:</h3>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                <li>Bạn đã hủy giao dịch</li>
                <li>Quá thời gian thanh toán</li>
                <li>Thông tin thanh toán không chính xác</li>
                <li>Lỗi kết nối với ngân hàng</li>
              </ul>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-4">
          {order && order.trangThaiThanhToan !== 'da-huy' && (
            <button
              onClick={handleRetryPayment}
              className="w-full inline-flex items-center justify-center gap-2 bg-primary-500 text-white px-8 py-4 rounded-lg hover:bg-primary-600 transition-colors font-semibold"
            >
              <RefreshCcw className="w-5 h-5" />
              Thử Lại Thanh Toán
            </button>
          )}

          <Link
            href="/tai-khoan/don-hang"
            className="w-full inline-flex items-center justify-center gap-2 bg-white text-gray-700 px-8 py-4 rounded-lg hover:bg-gray-50 transition-colors font-semibold border border-gray-300"
          >
            Xem Đơn Hàng Của Tôi
          </Link>

          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 bg-white text-gray-700 px-8 py-4 rounded-lg hover:bg-gray-50 transition-colors font-semibold border border-gray-300"
          >
            <ArrowLeft className="w-5 h-5" />
            Về Trang Chủ
          </Link>
        </div>

        {/* Support Info */}
        <div className="mt-8 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 inline-block">
            <p className="text-sm text-blue-800">
              💬 Cần hỗ trợ? Liên hệ với chúng tôi qua hotline hoặc email để được giúp đỡ.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
