'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Suspense } from 'react';
import StripePaymentForm from '@/components/checkout/StripePaymentForm';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function StripePaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const clientSecret = searchParams.get('clientSecret');
  const orderId = searchParams.get('orderId');

  if (!clientSecret || !orderId) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="text-red-500 text-6xl mb-4">⚠</div>
        <h1 className="text-2xl font-bold mb-4">Link thanh toán không hợp lệ</h1>
        <p className="text-gray-600 mb-6">
          Vui lòng quay lại giỏ hàng và thử lại.
        </p>
        <button
          onClick={() => router.push('/gio-hang')}
          className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-6 rounded-lg"
        >
          Quay lại giỏ hàng
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Thanh toán</h1>
          <p className="text-gray-600">
            Mã đơn hàng: <span className="font-semibold">{orderId}</span>
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: 'stripe',
                variables: {
                  colorPrimary: '#10b981',
                  colorBackground: '#ffffff',
                  colorText: '#1f2937',
                  colorDanger: '#ef4444',
                  fontFamily: 'system-ui, sans-serif',
                  spacingUnit: '4px',
                  borderRadius: '8px',
                }
              }
            }}
          >
            <StripePaymentForm clientSecret={clientSecret} orderId={orderId} />
          </Elements>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/tai-khoan/don-hang')}
            className="text-primary-500 hover:text-primary-600 font-semibold"
          >
            ← Quay lại đơn hàng
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StripePaymentPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Đang tải...</p>
      </div>
    }>
      <StripePaymentContent />
    </Suspense>
  );
}
