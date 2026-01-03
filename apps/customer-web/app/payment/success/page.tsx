'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';
import toast from 'react-hot-toast';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();
  const [confirming, setConfirming] = useState(true);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    const confirmPayment = async () => {
      const paymentIntentId = searchParams.get('payment_intent');
      const token = localStorage.getItem('token');

      if (!paymentIntentId || !token) {
        setConfirming(false);
        toast.error('Thông tin thanh toán không hợp lệ');
        return;
      }

      try {
        const response = await api.confirmStripePayment(token, paymentIntentId);

        if (response.success) {
          setConfirmed(true);
          toast.success('Thanh toán thành công!');

          // Clear cart from state, localStorage, and API
          await clearCart();

          // Redirect after 3 seconds
          setTimeout(() => {
            router.push('/tai-khoan/don-hang');
          }, 3000);
        } else {
          toast.error(response.message || 'Không thể xác nhận thanh toán');
        }
      } catch (error: any) {
        console.error('Confirm payment error:', error);
        toast.error(error.message || 'Có lỗi xảy ra');
      } finally {
        setConfirming(false);
      }
    };

    confirmPayment();
  }, [searchParams, router]);

  if (confirming) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="mb-6">
            <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
          <h1 className="text-2xl font-bold mb-4">Đang xác nhận thanh toán...</h1>
          <p className="text-gray-600">
            Vui lòng đợi trong giây lát.
          </p>
        </div>
      </div>
    );
  }

  if (confirmed) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-green-600 mb-4">Thanh toán thành công!</h1>
          <p className="text-gray-600 mb-2">
            Đơn hàng của bạn đã được xác nhận và đang được xử lý.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Chúng tôi sẽ gửi email xác nhận đến bạn.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => router.push('/tai-khoan/don-hang')}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Xem đơn hàng
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Về trang chủ
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-6">
            Đang chuyển hướng tự động sau 3 giây...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-red-600 mb-4">Không thể xác nhận thanh toán</h1>
        <p className="text-gray-600 mb-6">
          Vui lòng kiểm tra lại thông tin hoặc liên hệ với chúng tôi.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => router.push('/tai-khoan/don-hang')}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Xem đơn hàng
          </button>
          <button
            onClick={() => router.push('/gio-hang')}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Quay lại giỏ hàng
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Đang tải...</p>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
