'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { useScrollAnimation, useStaggeredScrollAnimation } from '@/hooks/useScrollAnimation'

// Default category images
const defaultImages: Record<string, string> = {
  'bong-ro': 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&h=400&fit=crop',
  'bong-chuyen': 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=600&h=400&fit=crop',
  'bong-da': 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&h=400&fit=crop',
  'tap-gym': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop',
  'chay-bo': 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&h=400&fit=crop',
  'cau-long': 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&h=400&fit=crop',
  'pickleball': 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600&h=400&fit=crop',
  'bi-a': 'https://images.unsplash.com/photo-1604147706283-d7119b5b822c?w=600&h=400&fit=crop',
  'default': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&h=400&fit=crop'
}

interface Category {
  _id: string
  ten: string
  slug: string
  moTa?: string
  hinhAnh?: string
  trangThai: string
  loaiSanPham?: string[]
}

export default function CategorySection() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  // Scroll animations
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation({ threshold: 0.2 })
  const { containerRef: gridRef, itemsVisible } = useStaggeredScrollAnimation(3, { threshold: 0.1 })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    setLoading(true)
    try {
      const response = await api.getCategories()
      if (response.success && response.data) {
        const data = Array.isArray(response.data) ? response.data : response.data.categories || []
        // Filter only active categories
        const activeCategories = data.filter((cat: Category) => cat.trangThai === 'active')

        // Get product count for each category to determine popularity
        const categoriesWithProducts = await Promise.all(
          activeCategories.map(async (cat: Category) => {
            try {
              const productsResponse = await api.getProducts({ danhMuc: cat._id })
              const productCount = productsResponse.data?.length || 0
              return { ...cat, productCount }
            } catch {
              return { ...cat, productCount: 0 }
            }
          })
        )

        // Sort by product count and take top 3
        const topCategories = categoriesWithProducts
          .sort((a, b) => b.productCount - a.productCount)
          .slice(0, 3)

        setCategories(topCategories)
      }
    } catch (error) {
      console.error('Lỗi khi tải danh mục:', error)
    }
    setLoading(false)
  }

  const getCategoryImage = (slug: string, hinhAnh?: string) => {
    if (hinhAnh) return hinhAnh
    return defaultImages[slug] || defaultImages['default']
  }

  if (loading) {
    return (
      <section className="py-20 md:py-24 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-6 relative inline-block">
              <span className="text-gray-900">
                Danh Mục Sản Phẩm
              </span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Đang tải...
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 md:py-24 bg-gradient-to-br from-white via-primary-50/30 to-accent-50/20 relative overflow-hidden">
      {/* Decorative gradient blobs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-primary-400/10 to-secondary-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-gradient-to-tr from-accent-400/10 to-success-400/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header with scroll animation */}
        <div
          ref={headerRef}
          className="text-center mb-16 transition-all duration-1000 opacity-100 translate-y-0"
        >
          {/* Small badge above title */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                        bg-gradient-to-r from-primary-500/10 to-secondary-500/10
                        border border-primary-500/30 mb-6">
            <span className="w-2 h-2 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 animate-pulse" />
            <span className="text-sm font-accent font-bold text-primary-600 tracking-wide">
              DANH MỤC NỔI BẬT
            </span>
          </div>

          {/* Main heading with gradient */}
          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-6 relative inline-block">
            <span className="text-gray-900">
              Danh Mục Sản Phẩm
            </span>
            {/* Animated underline */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-1.5
                          bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500
                          rounded-full animate-pulse-glow" />
          </h2>

          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Khám phá bộ sưu tập đa dạng từ các thương hiệu hàng đầu thế giới
          </p>
        </div>

        {/* Category Grid with staggered animation */}
        <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => {
            const categoryImage = getCategoryImage(category.slug, category.hinhAnh)
            const productCount = category.loaiSanPham?.length || 0

            return (
              <Link
                key={category._id}
                href={`/danh-muc/${category.slug}`}
                className="group relative overflow-hidden rounded-2xl
                         transition-all duration-700 ease-smooth
                         hover:shadow-[0_20px_60px_rgba(67,233,123,0.4)]
                         hover:-translate-y-2 hover:scale-105 hover:rotate-1
                         focus:outline-none focus:ring-4 focus:ring-primary-500/30
                         opacity-100 translate-y-0 scale-100"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {/* Background Image with Overlay */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={categoryImage}
                    alt={category.ten}
                    className="w-full h-full object-cover transform group-hover:scale-125 group-hover:rotate-3 transition-transform duration-700 ease-smooth"
                  />
                  {/* Vibrant gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-900/90 via-secondary-900/50 to-accent-900/70
                               transition-all duration-500 group-hover:from-primary-800/80 group-hover:via-secondary-800/40 group-hover:to-accent-800/60" />

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="font-heading text-2xl md:text-3xl font-bold mb-2
                                 transition-all duration-300
                                 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-accent-400 group-hover:to-success-400
                                 drop-shadow-lg">
                      {category.ten}
                    </h3>
                    <p className="text-sm md:text-base text-gray-100 mb-3 font-medium">
                      {category.moTa || 'Sản phẩm chuyên nghiệp'}
                    </p>

                    {/* Product types */}
                    {category.loaiSanPham && category.loaiSanPham.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {category.loaiSanPham.slice(0, 3).map((type, index) => (
                          <span
                            key={index}
                            className="text-xs font-accent font-semibold
                                     bg-gradient-to-r from-white/30 to-white/10
                                     backdrop-blur-md border border-white/30
                                     px-3 py-1.5 rounded-full
                                     transition-all duration-300
                                     group-hover:bg-gradient-to-r group-hover:from-accent-500/30 group-hover:to-success-500/30
                                     group-hover:border-accent-400/50"
                          >
                            {type}
                          </span>
                        ))}
                        {category.loaiSanPham.length > 3 && (
                          <span className="text-xs font-accent font-semibold
                                         bg-gradient-to-r from-white/30 to-white/10
                                         backdrop-blur-md border border-white/30
                                         px-3 py-1.5 rounded-full">
                            +{category.loaiSanPham.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* View More Button */}
                    <div className="flex items-center gap-2 text-sm font-accent font-bold
                                  opacity-0 group-hover:opacity-100
                                  transform translate-y-2 group-hover:translate-y-0
                                  transition-all duration-300">
                      <span>Xem chi tiết</span>
                      <svg
                        className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* View All Categories Button */}
        <div className="text-center mt-16 animate-fade-in">
          <Link
            href="/san-pham"
            className="group/btn inline-flex items-center gap-3
                     px-10 py-5 rounded-2xl font-accent font-bold text-lg
                     bg-gradient-to-r from-primary-500 via-accent-500 to-secondary-500
                     text-white relative overflow-hidden
                     transition-all duration-500 ease-smooth
                     hover:shadow-[0_20px_60px_rgba(26,117,255,0.5)]
                     hover:scale-110 active:scale-95
                     focus:outline-none focus:ring-4 focus:ring-primary-500/30"
          >
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent
                          transform -translate-x-full group-hover/btn:translate-x-full
                          transition-transform duration-1000" />

            <span className="relative z-10">Xem Tất Cả Sản Phẩm</span>
            <svg className="relative z-10 w-6 h-6 transition-transform group-hover/btn:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
