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

      {/* Sản phẩm bán chạy */}
      <section className="py-20 md:py-24 bg-gradient-to-br from-gray-50 via-white to-primary-50/30 relative overflow-hidden">
        {/* Decorative gradient blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary-400/10 to-accent-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-secondary-400/10 to-success-400/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            {/* Small badge above title */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                          bg-gradient-to-r from-primary-500/10 to-accent-500/10
                          border border-primary-500/30 mb-6">
              <span className="w-2 h-2 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 animate-pulse" />
              <span className="text-sm font-accent font-bold text-primary-600 tracking-wide">
                HOT DEALS
              </span>
            </div>

            {/* Main heading with gradient */}
            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-6 relative inline-block">
              <span className="text-gray-900">
                Sản Phẩm Bán Chạy
              </span>
              {/* Animated underline */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-1.5
                            bg-gradient-to-r from-primary-500 via-accent-500 to-secondary-500
                            rounded-full animate-pulse-glow" />
            </h2>

            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Những sản phẩm được yêu thích nhất, chất lượng đảm bảo từ các thương hiệu hàng đầu
            </p>
          </div>
          <FeaturedProducts />
        </div>
      </section>

      {/* Sản phẩm mới */}
      <section className="py-20 md:py-24 bg-white relative overflow-hidden">
        {/* Decorative gradient blobs */}
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-gradient-to-br from-success-400/10 to-primary-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-gradient-to-tl from-accent-400/10 to-secondary-400/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            {/* Small badge above title */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                          bg-gradient-to-r from-success-500/10 to-primary-500/10
                          border border-success-500/30 mb-6">
              <span className="w-2 h-2 rounded-full bg-gradient-to-r from-success-500 to-primary-500 animate-pulse" />
              <span className="text-sm font-accent font-bold text-success-600 tracking-wide">
                HÀNG MỚI VỀ
              </span>
            </div>

            {/* Main heading with gradient */}
            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-6 relative inline-block">
              <span className="text-gray-900">
                Hàng Mới Về
              </span>
              {/* Animated underline */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-1.5
                            bg-gradient-to-r from-success-500 via-primary-500 to-accent-500
                            rounded-full animate-pulse-glow" />
            </h2>

            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Cập nhật liên tục các sản phẩm mới nhất từ các thương hiệu nổi tiếng
            </p>
          </div>
          <NewArrivals />
        </div>
      </section>

      {/* Đánh giá khách hàng */}
      <section className="py-20 md:py-24 bg-gradient-to-br from-gray-50 via-secondary-50/20 to-accent-50/20 relative overflow-hidden">
        {/* Decorative gradient blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-secondary-400/10 to-accent-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-tr from-primary-400/10 to-success-400/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            {/* Small badge above title */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                          bg-gradient-to-r from-secondary-500/10 to-accent-500/10
                          border border-secondary-500/30 mb-6">
              <span className="w-2 h-2 rounded-full bg-gradient-to-r from-secondary-500 to-accent-500 animate-pulse" />
              <span className="text-sm font-accent font-bold text-secondary-600 tracking-wide">
                ĐÁNH GIÁ KHÁCH HÀNG
              </span>
            </div>

            {/* Main heading with gradient */}
            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-6 relative inline-block">
              <span className="text-gray-900">
                Khách Hàng Nói Gì Về Chúng Tôi
              </span>
              {/* Animated underline */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-1.5
                            bg-gradient-to-r from-secondary-500 via-accent-500 to-primary-500
                            rounded-full animate-pulse-glow" />
            </h2>

            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
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
