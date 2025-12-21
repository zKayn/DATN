import { Metadata } from 'next'
import { Newspaper } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Tin Tức - LP SHOP',
  description: 'Tin tức và bài viết từ LP SHOP'
}

export default function TinTucPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Newspaper className="w-12 h-12 text-gray-400" />
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Tin Tức
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Trang tin tức đang được cập nhật
        </p>

        <div className="bg-blue-50 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sắp Ra Mắt!</h2>
          <p className="text-gray-600 mb-6">
            Chúng tôi đang hoàn thiện trang tin tức với nhiều nội dung hấp dẫn:
          </p>
          <ul className="text-left max-w-md mx-auto space-y-2 text-gray-600">
            <li className="flex items-center gap-2">
              <span className="text-primary-600">✓</span>
              <span>Xu hướng thể thao mới nhất</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary-600">✓</span>
              <span>Hướng dẫn lựa chọn sản phẩm</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary-600">✓</span>
              <span>Mẹo tập luyện hiệu quả</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary-600">✓</span>
              <span>Tin khuyến mãi và sự kiện</span>
            </li>
          </ul>
        </div>

        <p className="text-gray-600 mb-6">
          Trong thời gian chờ đợi, hãy khám phá các sản phẩm tuyệt vời của chúng tôi!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/san-pham"
            className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Xem Sản Phẩm
          </a>
          <a
            href="/khuyen-mai"
            className="inline-block bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
          >
            Khuyến Mãi
          </a>
        </div>
      </div>
    </div>
  )
}
