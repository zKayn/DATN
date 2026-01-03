'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PaymentFailurePage() {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-red-600 mb-4">Thanh toán thất bại</h1>

        <p className="text-gray-600 mb-6">
          Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.
        </p>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold text-yellow-800 mb-2">Nguyên nhân có thể:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Thẻ không đủ số dư</li>
            <li>• Thông tin thẻ không chính xác</li>
            <li>• Thẻ đã hết hạn</li>
            <li>• Giao dịch bị từ chối bởi ngân hàng</li>
          </ul>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => router.push('/thanh-toan')}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Thử lại thanh toán
          </button>

          <button
            onClick={() => router.push('/gio-hang')}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Quay lại giỏ hàng
          </button>

          <Link
            href="/tai-khoan/don-hang"
            className="block w-full text-primary-500 hover:text-primary-600 font-semibold py-2"
          >
            Xem đơn hàng của tôi
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Cần hỗ trợ? Liên hệ với chúng tôi qua{' '}
            <Link href="/lien-he" className="text-primary-500 hover:underline">
              trang liên hệ
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
