import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Điều Khoản Sử Dụng - LP SHOP',
  description: 'Điều khoản và điều kiện sử dụng dịch vụ tại LP SHOP'
}

export default function DieuKhoanPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">
          Điều Khoản Sử Dụng
        </h1>
        <p className="text-xl text-gray-600 text-center mb-12">
          Vui lòng đọc kỹ trước khi sử dụng dịch vụ
        </p>

        <div className="prose prose-lg max-w-none">
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <p className="text-gray-700">
              Khi truy cập và sử dụng website LP SHOP, bạn đồng ý tuân thủ các điều khoản
              và điều kiện được nêu dưới đây. Nếu không đồng ý, vui lòng không sử dụng dịch vụ.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Điều Khoản Chung</h2>
          <ul className="list-disc list-inside mb-6 text-gray-600">
            <li>Website được vận hành và sở hữu bởi Công ty LP SHOP</li>
            <li>Chúng tôi có quyền thay đổi, điều chỉnh điều khoản bất kỳ lúc nào</li>
            <li>Người dùng có trách nhiệm cập nhật các thay đổi</li>
            <li>Việc tiếp tục sử dụng sau khi thay đổi đồng nghĩa với việc chấp nhận điều khoản mới</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Tài Khoản Người Dùng</h2>
          <p className="text-gray-600 mb-4">Khi đăng ký tài khoản, bạn cam kết:</p>
          <ul className="list-disc list-inside mb-6 text-gray-600">
            <li>Cung cấp thông tin chính xác, đầy đủ và cập nhật</li>
            <li>Bảo mật thông tin tài khoản và mật khẩu</li>
            <li>Chịu trách nhiệm về mọi hoạt động dưới tên tài khoản</li>
            <li>Thông báo ngay cho chúng tôi nếu phát hiện truy cập trái phép</li>
            <li>Không chia sẻ tài khoản cho người khác sử dụng</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Quy Định Mua Hàng</h2>
          <ul className="list-disc list-inside mb-6 text-gray-600">
            <li>Giá sản phẩm có thể thay đổi mà không cần thông báo trước</li>
            <li>Hình ảnh sản phẩm chỉ mang tính chất minh họa</li>
            <li>Màu sắc thực tế có thể chênh lệch do thiết bị hiển thị</li>
            <li>Chúng tôi có quyền từ chối hoặc hủy đơn hàng bất thường</li>
            <li>Khách hàng phải kiểm tra hàng trước khi nhận</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Thanh Toán</h2>
          <ul className="list-disc list-inside mb-6 text-gray-600">
            <li>Chúng tôi chấp nhận các phương thức thanh toán được nêu trên website</li>
            <li>Thông tin thanh toán được mã hóa và bảo mật</li>
            <li>Khách hàng chịu trách nhiệm về phí giao dịch (nếu có)</li>
            <li>Đơn hàng được xác nhận sau khi thanh toán thành công</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Giao Hàng</h2>
          <ul className="list-disc list-inside mb-6 text-gray-600">
            <li>Thời gian giao hàng dự kiến có thể thay đổi do điều kiện thực tế</li>
            <li>Chúng tôi không chịu trách nhiệm về trễ do bên vận chuyển</li>
            <li>Khách hàng phải cung cấp địa chỉ giao hàng chính xác</li>
            <li>Phí giao hàng được tính theo chính sách hiện hành</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Bảo Hành & Đổi Trả</h2>
          <p className="text-gray-600 mb-6">
            Vui lòng tham khảo <a href="/chinh-sach-doi-tra" className="text-primary-400 hover:text-primary-500">Chính sách đổi trả</a> để biết chi tiết.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Quyền Sở Hữu Trí Tuệ</h2>
          <ul className="list-disc list-inside mb-6 text-gray-600">
            <li>Mọi nội dung trên website thuộc quyền sở hữu của LP SHOP</li>
            <li>Không được sao chép, sử dụng mà không có sự cho phép</li>
            <li>Logo, thương hiệu được bảo hộ bởi luật sở hữu trí tuệ</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Hành Vi Cấm</h2>
          <p className="text-gray-600 mb-4">Người dùng không được:</p>
          <ul className="list-disc list-inside mb-6 text-gray-600">
            <li>Sử dụng website cho mục đích bất hợp pháp</li>
            <li>Tải lên nội dung vi phạm pháp luật, khiêu dâm, bạo lực</li>
            <li>Spam, gửi email quảng cáo trái phép</li>
            <li>Hack, phá hoại hệ thống website</li>
            <li>Thu thập thông tin người dùng khác</li>
            <li>Giả mạo danh tính, lừa đảo</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Giới Hạn Trách Nhiệm</h2>
          <ul className="list-disc list-inside mb-6 text-gray-600">
            <li>Website cung cấp &quot;nguyên trạng&quot; không bảo đảm hoàn hảo</li>
            <li>Chúng tôi không chịu trách nhiệm về thiệt hại gián tiếp</li>
            <li>Không đảm bảo website luôn hoạt động liên tục</li>
            <li>Không chịu trách nhiệm về nội dung từ bên thứ ba</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Luật Áp Dụng</h2>
          <p className="text-gray-600 mb-6">
            Các điều khoản này được điều chỉnh bởi luật pháp Việt Nam. Mọi tranh chấp
            sẽ được giải quyết tại Tòa án có thẩm quyền tại Đà Nẵng.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Liên Hệ</h2>
          <p className="text-gray-600 mb-4">
            Nếu có bất kỳ câu hỏi nào về điều khoản sử dụng, vui lòng liên hệ:
          </p>
          <ul className="list-disc list-inside mb-6 text-gray-600">
            <li>Email: contact@sportstore.vn</li>
            <li>Hotline: 0855062747</li>
            <li>Địa chỉ: 470 Trần Đại Nghĩa, Đà Nẵng</li>
          </ul>

          <div className="bg-gray-100 rounded-lg p-6 mt-8">
            <p className="text-sm text-gray-600">
              <strong>Cập nhật lần cuối:</strong> 20/12/2025
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Bằng việc sử dụng website, bạn xác nhận đã đọc, hiểu và đồng ý với tất cả điều khoản trên.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
