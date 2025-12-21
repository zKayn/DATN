import { Metadata } from 'next'
import { Banknote, CreditCard, Smartphone, Building } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Phương Thức Thanh Toán - LP SHOP',
  description: 'Các phương thức thanh toán tại LP SHOP'
}

export default function PhuongThucThanhToanPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">
          Phương Thức Thanh Toán
        </h1>
        <p className="text-xl text-gray-600 text-center mb-12">
          LP SHOP hỗ trợ đa dạng phương thức thanh toán để bạn lựa chọn
        </p>

        <div className="space-y-8">
          {/* COD */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Banknote className="w-8 h-8 text-green-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Thanh Toán Khi Nhận Hàng (COD)
                </h2>
                <p className="text-gray-600 mb-4">
                  Thanh toán bằng tiền mặt trực tiếp cho nhân viên giao hàng khi nhận sản phẩm.
                </p>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Ưu điểm:</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>An toàn, không cần thanh toán trước</li>
                    <li>Kiểm tra hàng trước khi thanh toán</li>
                    <li>Phù hợp với người không có tài khoản ngân hàng</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Lưu ý:</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>Phí COD: 0₫ (miễn phí)</li>
                    <li>Vui lòng chuẩn bị đúng số tiền để giao dịch nhanh chóng</li>
                    <li>Không áp dụng cho đơn hàng trên 20.000.000₫</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* VNPay */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Thanh Toán Qua VNPay
                </h2>
                <p className="text-gray-600 mb-4">
                  Thanh toán trực tuyến qua cổng VNPay với thẻ ATM nội địa hoặc thẻ quốc tế.
                </p>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Ưu điểm:</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>Bảo mật cao với mã hóa SSL</li>
                    <li>Thanh toán nhanh chóng, tiện lợi</li>
                    <li>Hỗ trợ nhiều loại thẻ ngân hàng</li>
                    <li>Nhận ưu đãi từ ngân hàng liên kết</li>
                  </ul>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Hướng dẫn:</h3>
                  <ol className="list-decimal list-inside space-y-1 text-gray-600">
                    <li>Chọn &quot;Thanh toán VNPay&quot; khi đặt hàng</li>
                    <li>Chọn ngân hàng và loại thẻ</li>
                    <li>Nhập thông tin thẻ</li>
                    <li>Xác thực OTP</li>
                    <li>Hoàn tất thanh toán</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          {/* MoMo */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-8 h-8 text-pink-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Thanh Toán Qua Ví MoMo
                </h2>
                <p className="text-gray-600 mb-4">
                  Thanh toán qua ví điện tử MoMo - nhanh chóng và an toàn.
                </p>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Ưu điểm:</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>Thanh toán chỉ với vài thao tác</li>
                    <li>Bảo mật với Face ID/Touch ID</li>
                    <li>Hoàn tiền cashback</li>
                    <li>Ưu đãi độc quyền từ MoMo</li>
                  </ul>
                </div>

                <div className="bg-pink-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Hướng dẫn:</h3>
                  <ol className="list-decimal list-inside space-y-1 text-gray-600">
                    <li>Chọn &quot;Thanh toán MoMo&quot;</li>
                    <li>Mở app MoMo và quét QR code</li>
                    <li>Xác nhận thanh toán</li>
                    <li>Nhập mã PIN/sinh trắc học</li>
                    <li>Hoàn tất giao dịch</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          {/* Bank Transfer */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building className="w-8 h-8 text-purple-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Chuyển Khoản Ngân Hàng
                </h2>
                <p className="text-gray-600 mb-4">
                  Chuyển khoản trực tiếp vào tài khoản ngân hàng của LP SHOP.
                </p>

                <div className="bg-purple-50 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Thông tin tài khoản:</h3>
                  <div className="space-y-2 text-gray-700">
                    <p><strong>Ngân hàng:</strong> Vietcombank - Chi nhánh Đà Nẵng</p>
                    <p><strong>Số tài khoản:</strong> 1234567890</p>
                    <p><strong>Chủ tài khoản:</strong> CÔNG TY LP SHOP</p>
                    <p><strong>Nội dung:</strong> Họ tên + Số điện thoại</p>
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Lưu ý:</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>Ghi rõ nội dung chuyển khoản để xử lý nhanh</li>
                    <li>Gửi ảnh chụp biên lai chuyển khoản qua Zalo/Email</li>
                    <li>Đơn hàng được xử lý sau khi nhận được tiền (1-2h)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-12 bg-gray-50 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            Cam Kết Bảo Mật
          </h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto">
            Mọi giao dịch thanh toán tại LP SHOP đều được mã hóa SSL 256-bit và tuân thủ
            tiêu chuẩn bảo mật PCI DSS. Chúng tôi cam kết bảo vệ thông tin thanh toán
            của bạn một cách an toàn tuyệt đối.
          </p>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Sẵn sàng mua sắm?</p>
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
