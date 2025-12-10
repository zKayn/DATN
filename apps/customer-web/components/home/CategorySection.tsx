'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'

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
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Danh Mục Sản Phẩm
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Đang tải...
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Danh Mục Sản Phẩm
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Khám phá bộ sưu tập đa dạng từ các thương hiệu hàng đầu thế giới
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const categoryImage = getCategoryImage(category.slug, category.hinhAnh)
            const productCount = category.loaiSanPham?.length || 0

            return (
              <Link
                key={category._id}
                href={`/danh-muc/${category.slug}`}
                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                {/* Background Image with Overlay */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={categoryImage}
                    alt={category.ten}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* Dark overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl font-bold mb-2 group-hover:text-primary-400 transition-colors">
                      {category.ten}
                    </h3>
                    <p className="text-sm text-gray-200 mb-3">
                      {category.moTa || 'Sản phẩm chuyên nghiệp'}
                    </p>

                    {/* Product types */}
                    {category.loaiSanPham && category.loaiSanPham.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {category.loaiSanPham.slice(0, 3).map((type, index) => (
                          <span
                            key={index}
                            className="text-xs bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full"
                          >
                            {type}
                          </span>
                        ))}
                        {category.loaiSanPham.length > 3 && (
                          <span className="text-xs bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                            +{category.loaiSanPham.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* View More Button */}
                    <div className="flex items-center text-sm font-medium">
                      <span className="group-hover:mr-2 transition-all">Xem chi tiết</span>
                      <svg
                        className="w-5 h-5 transform group-hover:translate-x-2 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* View All Categories Button */}
        <div className="text-center mt-12">
          <Link
            href="/san-pham"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-primary-700 hover:to-secondary-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <span>Xem Tất Cả Sản Phẩm</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
