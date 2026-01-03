import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Chính Sách Đổi Trả - LP SHOP',
  description: 'Chính sách đổi trả hàng tại LP SHOP'
}

export default function ChinhSachDoiTraPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">
          Chính Sách Đổi Trả
        </h1>
        <p className="text-xl text-gray-600 text-center mb-12">
          LP SHOP cam kết mang đến trải nghiệm mua sắm tốt nhất
        </p>

        <div className="prose prose-lg max-w-none">
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Điều Kiện Đổi Trả</h2>
            <ul className="space-y-2 text-gray-700">
              <li>Sản phẩm còn nguyên tem, mác, chưa qua sử dụng</li>
              <li>Đầy đủ hóa đơn, phiếu bảo hành (nếu có)</li>
              <li>Đổi trả trong vòng 7 ngày kể từ ngày nhận hàng</li>
              <li>Sản phẩm không thuộc danh mục không đổi trả</li>
            </ul>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quy Trình Đổi Trả</h2>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">1. Liên Hệ</h3>
          <p className="text-gray-600 mb-4">
            Quý khách vui lòng liên hệ với chúng tôi qua:
          </p>
          <ul className="list-disc list-inside mb-6 text-gray-600">
            <li>Hotline: 0855062747</li>
            <li>Email: contact@sportstore.vn</li>
            <li>Hoặc tạo yêu cầu đổi trả trong mục &quot;Đơn hàng của tôi&quot;</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">2. Xác Nhận</h3>
          <p className="text-gray-600 mb-6">
            Bộ phận CSKH sẽ xác nhận yêu cầu đổi trả của bạn trong vòng 24h làm việc.
            Chúng tôi sẽ hướng dẫn chi tiết các bước tiếp theo.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">3. Gửi Hàng</h3>
          <p className="text-gray-600 mb-4">
            Bạn có thể:
          </p>
          <ul className="list-disc list-inside mb-6 text-gray-600">
            <li>Gửi hàng qua đơn vị vận chuyển (phí vận chuyển do khách hàng chi trả)</li>
            <li>Mang trực tiếp đến cửa hàng (nếu thuận tiện)</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">4. Kiểm Tra & Xử Lý</h3>
          <p className="text-gray-600 mb-6">
            Sau khi nhận được sản phẩm, chúng tôi sẽ kiểm tra và xử lý trong vòng 2-3 ngày làm việc:
          </p>
          <ul className="list-disc list-inside mb-6 text-gray-600">
            <li><strong>Đổi hàng:</strong> Gửi sản phẩm mới cho bạn (miễn phí vận chuyển)</li>
            <li><strong>Trả hàng:</strong> Hoàn tiền trong vòng 7-10 ngày làm việc</li>
          </ul>

          <div className="bg-yellow-50 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Trường Hợp Không Được Đổi Trả</h2>
            <ul className="space-y-2 text-gray-700">
              <li>Sản phẩm đã qua sử dụng, có dấu hiệu giặt tẩy</li>
              <li>Sản phẩm bị rách, bẩn, mất tem mác</li>
              <li>Sản phẩm khuyến mãi, giảm giá đặc biệt (trừ lỗi do nhà sản xuất)</li>
              <li>Phụ kiện đã bóc seal, mở hộp</li>
              <li>Đồ bơi, đồ lót (vì lý do vệ sinh)</li>
            </ul>
          </div>

          <div className="bg-red-50 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Đổi Trả Do Lỗi Nhà Sản Xuất</h2>
            <p className="text-gray-700 mb-3">
              Nếu sản phẩm bị lỗi do nhà sản xuất, chúng tôi cam kết:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li>Đổi sản phẩm mới hoàn toàn miễn phí</li>
              <li>Hoàn tiền 100% nếu không còn hàng</li>
              <li>Chịu toàn bộ chi phí vận chuyển</li>
              <li>Không giới hạn thời gian (trong thời gian bảo hành)</li>
            </ul>
          </div>

          <div className="bg-green-50 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Lưu Ý Quan Trọng</h2>
            <ul className="space-y-2 text-gray-700">
              <li>Vui lòng quay video unbox khi nhận hàng để làm bằng chứng nếu cần</li>
              <li>Giữ lại hóa đơn, tem mác sản phẩm</li>
              <li>Đóng gói sản phẩm cẩn thận khi gửi trả</li>
              <li>Liên hệ CSKH để được hỗ trợ tốt nhất</li>
            </ul>
          </div>
        </div>

        {/* Contact */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Cần Hỗ Trợ?</h2>
          <p className="text-gray-600 mb-6">
            Liên hệ với chúng tôi để được tư vấn và hỗ trợ
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:0855062747"
              className="inline-block bg-primary-400 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-500 transition-colors"
            >
              Gọi Ngay: 0855062747
            </a>
            <a
              href="/lien-he"
              className="inline-block bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              Gửi Tin Nhắn
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
