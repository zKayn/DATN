'use client';

import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useState, FormEvent } from 'react';
import toast from 'react-hot-toast';

export default function StripePaymentForm({
  clientSecret,
  orderId
}: {
  clientSecret: string;
  orderId: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success?orderId=${orderId}`,
        },
      });

      if (error) {
        toast.error(error.message || 'Thanh toán thất bại');
        setProcessing(false);
      }
    } catch (err: any) {
      toast.error(err.message || 'Có lỗi xảy ra');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {processing ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Đang xử lý...</span>
          </div>
        ) : (
          'Thanh toán'
        )}
      </button>

      <p className="text-sm text-gray-500 text-center">
        Thanh toán được bảo mật bởi Stripe
      </p>
    </form>
  );
}
