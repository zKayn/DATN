import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Chính Sách Bảo Mật - LP SHOP',
  description: 'Chính sách bảo mật thông tin khách hàng tại LP SHOP'
}

export default function ChinhSachBaoMatPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">
          Chính Sách Bảo Mật
        </h1>
        <p className="text-xl text-gray-600 text-center mb-12">
          LP SHOP cam kết bảo vệ thông tin cá nhân của khách hàng
        </p>

        <div className="prose prose-lg max-w-none">
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cam Kết Bảo Mật</h2>
            <p className="text-gray-700">
              Chúng tôi cam kết bảo vệ thông tin cá nhân của khách hàng và chỉ sử dụng
              thông tin thu thập được cho mục đích cung cấp dịch vụ tốt nhất. Thông tin
              của bạn sẽ được mã hóa và bảo vệ bằng các biện pháp an ninh cao nhất.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Thu Thập Thông Tin</h2>
          <p className="text-gray-600 mb-4">
            Chúng tôi thu thập các thông tin sau khi bạn mua hàng hoặc đăng ký tài khoản:
          </p>
          <ul className="list-disc list-inside mb-6 text-gray-600">
            <li>Họ và tên</li>
            <li>Địa chỉ email</li>
            <li>Số điện thoại</li>
            <li>Địa chỉ giao hàng</li>
            <li>Thông tin thanh toán (được mã hóa an toàn)</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Mục Đích Sử Dụng</h2>
          <p className="text-gray-600 mb-4">
            Thông tin của bạn được sử dụng cho các mục đích sau:
          </p>
          <ul className="list-disc list-inside mb-6 text-gray-600">
            <li>Xử lý đơn hàng và giao hàng</li>
            <li>Gửi thông báo về đơn hàng, khuyến mãi</li>
            <li>Cải thiện chất lượng dịch vụ</li>
            <li>Hỗ trợ khách hàng</li>
            <li>Tuân thủ các quy định pháp luật</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Bảo Vệ Thông Tin</h2>
          <p className="text-gray-600 mb-4">
            Chúng tôi sử dụng các biện pháp bảo mật sau:
          </p>
          <ul className="list-disc list-inside mb-6 text-gray-600">
            <li>Mã hóa SSL/TLS cho tất cả giao dịch</li>
            <li>Hệ thống tường lửa và phần mềm diệt virus</li>
            <li>Kiểm soát truy cập nghiêm ngặt</li>
            <li>Sao lưu dữ liệu định kỳ</li>
            <li>Đào tạo nhân viên về bảo mật thông tin</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Chia Sẻ Thông Tin</h2>
          <p className="text-gray-600 mb-4">
            Chúng tôi KHÔNG bán, cho thuê hoặc trao đổi thông tin cá nhân của bạn với
            bên thứ ba cho mục đích thương mại. Thông tin chỉ được chia sẻ trong các trường hợp:
          </p>
          <ul className="list-disc list-inside mb-6 text-gray-600">
            <li>Với đơn vị vận chuyển (chỉ thông tin cần thiết)</li>
            <li>Với cổng thanh toán (được mã hóa an toàn)</li>
            <li>Theo yêu cầu của cơ quan pháp luật</li>
            <li>Với sự đồng ý của bạn</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Cookies</h2>
          <p className="text-gray-600 mb-4">
            Website sử dụng cookies để:
          </p>
          <ul className="list-disc list-inside mb-6 text-gray-600">
            <li>Ghi nhớ đăng nhập và giỏ hàng</li>
            <li>Phân tích lưu lượng truy cập</li>
            <li>Cá nhân hóa trải nghiệm người dùng</li>
            <li>Hiển thị quảng cáo phù hợp</li>
          </ul>
          <p className="text-gray-600 mb-6">
            Bạn có thể tắt cookies trong cài đặt trình duyệt, nhưng một số tính năng
            có thể không hoạt động đầy đủ.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Quyền Của Khách Hàng</h2>
          <p className="text-gray-600 mb-4">
            Bạn có quyền:
          </p>
          <ul className="list-disc list-inside mb-6 text-gray-600">
            <li>Truy cập và xem thông tin cá nhân</li>
            <li>Yêu cầu chỉnh sửa thông tin không chính xác</li>
            <li>Yêu cầu xóa thông tin cá nhân</li>
            <li>Từ chối nhận email marketing</li>
            <li>Khiếu nại về việc xử lý thông tin</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Liên Kết Bên Thứ Ba</h2>
          <p className="text-gray-600 mb-6">
            Website có thể chứa liên kết đến các trang web khác. Chúng tôi không chịu
            trách nhiệm về chính sách bảo mật của các trang web đó. Vui lòng đọc kỹ
            chính sách bảo mật trước khi cung cấp thông tin.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Thay Đổi Chính Sách</h2>
          <p className="text-gray-600 mb-6">
            Chúng tôi có thể cập nhật chính sách bảo mật này theo thời gian. Mọi thay đổi
            sẽ được thông báo trên website. Phiên bản mới nhất luôn có hiệu lực.
          </p>

          <div className="bg-green-50 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Báo Cáo Vi Phạm</h2>
            <p className="text-gray-700 mb-3">
              Nếu bạn phát hiện bất kỳ hoạt động đáng ngờ nào liên quan đến tài khoản
              hoặc thông tin cá nhân, vui lòng liên hệ ngay:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li><strong>Email:</strong> security@sportstore.vn</li>
              <li><strong>Hotline:</strong> 0855062747</li>
            </ul>
          </div>

          <div className="bg-gray-100 rounded-lg p-6">
            <p className="text-sm text-gray-600">
              <strong>Cập nhật lần cuối:</strong> 20/12/2025
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Bằng việc sử dụng website, bạn đồng ý với chính sách bảo mật này.
            </p>
          </div>
        </div>

        {/* Contact */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Có Câu Hỏi?</h2>
          <p className="text-gray-600 mb-6">
            Liên hệ với chúng tôi nếu bạn có bất kỳ thắc mắc nào
          </p>
          <a
            href="/lien-he"
            className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Liên Hệ Ngay
          </a>
        </div>
      </div>
    </div>
  )
}
