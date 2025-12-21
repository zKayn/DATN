import { Metadata } from 'next'
import { Trophy, Target, Heart, Award } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Giới Thiệu - LP SHOP',
  description: 'Tìm hiểu về LP SHOP - Cửa hàng thể thao hàng đầu Việt Nam'
}

export default function GioiThieuPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Về Chúng Tôi
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          LP SHOP - Đồng hành cùng đam mê thể thao của bạn
        </p>
      </div>

      {/* Story Section */}
      <div className="max-w-4xl mx-auto mb-16">
        <div className="prose prose-lg max-w-none">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Câu Chuyện Của Chúng Tôi</h2>
          <p className="text-gray-600 mb-4">
            LP SHOP được thành lập với sứ mệnh mang đến những sản phẩm thể thao chất lượng cao,
            chính hãng đến tay người tiêu dùng Việt Nam với giá cả hợp lý nhất.
          </p>
          <p className="text-gray-600 mb-4">
            Với hơn 10 năm kinh nghiệm trong ngành thể thao, chúng tôi tự hào là đối tác
            ủy quyền chính thức của nhiều thương hiệu thể thao hàng đầu thế giới.
          </p>
          <p className="text-gray-600">
            Chúng tôi cam kết mang đến trải nghiệm mua sắm tuyệt vời nhất với dịch vụ
            chăm sóc khách hàng tận tâm và chính sách hậu mãi chu đáo.
          </p>
        </div>
      </div>

      {/* Values Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Giá Trị Cốt Lõi</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Chất Lượng</h3>
            <p className="text-gray-600">
              100% sản phẩm chính hãng, cam kết chất lượng tốt nhất
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Uy Tín</h3>
            <p className="text-gray-600">
              Đối tác chính thức của các thương hiệu hàng đầu
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Tận Tâm</h3>
            <p className="text-gray-600">
              Dịch vụ khách hàng chuyên nghiệp, nhiệt tình
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Đổi Mới</h3>
            <p className="text-gray-600">
              Luôn cập nhật xu hướng và công nghệ mới nhất
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-12 text-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-5xl font-bold mb-2">10+</div>
            <div className="text-primary-100">Năm Kinh Nghiệm</div>
          </div>
          <div>
            <div className="text-5xl font-bold mb-2">50K+</div>
            <div className="text-primary-100">Khách Hàng Tin Dùng</div>
          </div>
          <div>
            <div className="text-5xl font-bold mb-2">100+</div>
            <div className="text-primary-100">Thương Hiệu Uy Tín</div>
          </div>
        </div>
      </div>

      {/* Contact CTA */}
      <div className="mt-16 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Hãy Để Chúng Tôi Đồng Hành Cùng Bạn
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Liên hệ với chúng tôi để được tư vấn và hỗ trợ tốt nhất
        </p>
        <a
          href="/lien-he"
          className="inline-block bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
        >
          Liên Hệ Ngay
        </a>
      </div>
    </div>
  )
}
