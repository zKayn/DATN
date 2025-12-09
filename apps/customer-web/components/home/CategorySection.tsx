'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Dumbbell, ShoppingBag, Shirt, Watch, Footprints, Trophy, Box } from 'lucide-react'
import { api } from '@/lib/api'

// Icon mapping for categories
const iconMap: Record<string, any> = {
  'giay-the-thao': Footprints,
  'giay': Footprints,
  'quan-ao': Shirt,
  'ao': Shirt,
  'quan': Shirt,
  'dung-cu-tap': Dumbbell,
  'dung-cu': Dumbbell,
  'phu-kien': ShoppingBag,
  'dong-ho': Watch,
  'thiet-bi': Trophy,
  'default': Box
}

// Color mapping for categories
const colorMap: Record<string, string> = {
  'giay-the-thao': 'from-blue-500 to-blue-600',
  'giay': 'from-blue-500 to-blue-600',
  'quan-ao': 'from-purple-500 to-purple-600',
  'ao': 'from-purple-500 to-purple-600',
  'quan': 'from-indigo-500 to-indigo-600',
  'dung-cu-tap': 'from-green-500 to-green-600',
  'dung-cu': 'from-green-500 to-green-600',
  'phu-kien': 'from-orange-500 to-orange-600',
  'dong-ho': 'from-red-500 to-red-600',
  'thiet-bi': 'from-yellow-500 to-yellow-600',
  'default': 'from-gray-500 to-gray-600'
}

interface Category {
  _id: string
  ten: string
  slug: string
  moTa?: string
  hinhAnh?: string
  trangThai: string
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
        setCategories(activeCategories)
      }
    } catch (error) {
      console.error('Lỗi khi tải danh mục:', error)
    }
    setLoading(false)
  }

  const getIcon = (slug: string) => {
    return iconMap[slug] || iconMap['default']
  }

  const getColor = (slug: string) => {
    return colorMap[slug] || colorMap['default']
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
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Danh Mục Sản Phẩm
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Khám phá bộ sưu tập đa dạng từ các thương hiệu hàng đầu thế giới
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {categories.map((category) => {
            const Icon = getIcon(category.slug)
            const color = getColor(category.slug)
            return (
              <Link
                key={category._id}
                href={`/danh-muc/${category.slug}`}
                className="group"
              >
                <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-transparent hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                  {/* Icon with gradient background */}
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Category name */}
                  <h3 className="text-center font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {category.ten}
                  </h3>

                  {/* Product count */}
                  <p className="text-center text-sm text-gray-500">
                    {category.moTa || 'Danh mục sản phẩm'}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
