import { Metadata } from 'next'
import { Search, ShoppingCart, CreditCard, Truck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Hướng Dẫn Mua Hàng - LP SHOP',
  description: 'Hướng dẫn chi tiết cách mua hàng tại LP SHOP'
}

export default function HuongDanMuaHangPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">
          Hướng Dẫn Mua Hàng
        </h1>
        <p className="text-xl text-gray-600 text-center mb-12">
          Quy trình mua hàng đơn giản, nhanh chóng tại LP SHOP
        </p>

        {/* Steps */}
        <div className="space-y-8">
          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                <Search className="w-8 h-8 text-primary-600" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Bước 1: Tìm Kiếm Sản Phẩm</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Sử dụng thanh tìm kiếm để tìm sản phẩm mong muốn</li>
                <li>Lọc sản phẩm theo danh mục, thương hiệu, giá cả</li>
                <li>Xem chi tiết sản phẩm: hình ảnh, mô tả, giá, đánh giá</li>
                <li>Chọn size, màu sắc phù hợp</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-8 h-8 text-primary-600" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Bước 2: Thêm Vào Giỏ Hàng</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Click nút &quot;Thêm vào giỏ hàng&quot; trên trang sản phẩm</li>
                <li>Chọn số lượng sản phẩm muốn mua</li>
                <li>Kiểm tra giỏ hàng bằng cách click vào biểu tượng giỏ hàng</li>
                <li>Có thể cập nhật số lượng hoặc xóa sản phẩm trong giỏ</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                <CreditCard className="w-8 h-8 text-primary-600" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Bước 3: Thanh Toán</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Click &quot;Thanh toán&quot; trong giỏ hàng</li>
                <li>Nhập thông tin giao hàng: họ tên, địa chỉ, số điện thoại</li>
                <li>Chọn phương thức thanh toán (COD, chuyển khoản, ví điện tử)</li>
                <li>Nhập mã giảm giá (nếu có)</li>
                <li>Kiểm tra lại thông tin đơn hàng</li>
                <li>Xác nhận đặt hàng</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                <Truck className="w-8 h-8 text-primary-600" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Bước 4: Nhận Hàng</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Nhận email/SMS xác nhận đơn hàng</li>
                <li>Theo dõi trạng thái đơn hàng trong mục &quot;Đơn hàng của tôi&quot;</li>
                <li>Đơn vị vận chuyển sẽ liên hệ trước khi giao hàng</li>
                <li>Kiểm tra sản phẩm khi nhận hàng</li>
                <li>Thanh toán (với đơn hàng COD)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Lưu Ý Quan Trọng</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-primary-600 font-bold">•</span>
              <span>Vui lòng cung cấp đầy đủ và chính xác thông tin giao hàng</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 font-bold">•</span>
              <span>Kiểm tra kỹ sản phẩm trước khi nhận hàng</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 font-bold">•</span>
              <span>Giữ lại hóa đơn để được hỗ trợ bảo hành, đổi trả</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-600 font-bold">•</span>
              <span>Liên hệ hotline 0855062747 nếu cần hỗ trợ</span>
            </li>
          </ul>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Bắt đầu mua sắm ngay hôm nay!</p>
          <a
            href="/san-pham"
            className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Khám Phá Sản Phẩm
          </a>
        </div>
      </div>
    </div>
  )
}
