import HeroBanner from '@/components/home/HeroBanner'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import CategorySection from '@/components/home/CategorySection'
import NewArrivals from '@/components/home/NewArrivals'
import Testimonials from '@/components/home/Testimonials'
import Newsletter from '@/components/home/Newsletter'

export default function HomePage() {
  return (
    <div className="w-full">
      {/* Hero Banner */}
      <HeroBanner />

      {/* Danh mục nổi bật */}
      <CategorySection />

      {/* Sản phẩm nổi bật */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Sản Phẩm Nổi Bật
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Những sản phẩm được yêu thích nhất, chất lượng đảm bảo từ các thương hiệu hàng đầu
            </p>
          </div>
          <FeaturedProducts />
        </div>
      </section>

      {/* Sản phẩm mới */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Hàng Mới Về
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Cập nhật liên tục các sản phẩm mới nhất từ các thương hiệu nổi tiếng
            </p>
          </div>
          <NewArrivals />
        </div>
      </section>

      {/* Đánh giá khách hàng */}
      <section className="py-16 bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Khách Hàng Nói Gì Về Chúng Tôi
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Hàng nghìn khách hàng hài lòng với sản phẩm và dịch vụ của chúng tôi
            </p>
          </div>
          <Testimonials />
        </div>
      </section>

      {/* Newsletter */}
      <Newsletter />
    </div>
  )
}
