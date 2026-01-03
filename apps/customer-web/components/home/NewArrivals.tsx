'use client'

import { useState, useEffect } from 'react'
import ProductCard from '@/components/ui/ProductCard'
import ProductCardSkeleton from '@/components/ui/ProductCardSkeleton'
import { api } from '@/lib/api'

interface Product {
  _id: string
  ten: string
  slug?: string
  gia: number
  giaKhuyenMai?: number
  hinhAnh: string[]
  danhGiaTrungBinh: number
  soLuongDanhGia: number
  noiBat: boolean
  sanPhamMoi: boolean
  daBan: number
  soLuongTonKho: number
}

export default function NewArrivals() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNewProducts()
  }, [])

  const loadNewProducts = async () => {
    setLoading(true)
    try {
      const response = await api.getNewProducts()
      if (response.success && response.data) {
        const data = Array.isArray(response.data) ? response.data : response.data.products || []
        setProducts(data)
      }
    } catch (error) {
      console.error('Lỗi khi tải sản phẩm mới:', error)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 items-stretch">
        {[...Array(5)].map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Chưa có sản phẩm mới</p>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 items-stretch">
        {products.map((product, index) => (
          <div
            key={product._id}
            className="opacity-100 translate-y-0 scale-100 transition-all duration-700 ease-smooth"
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <ProductCard
              id={product._id}
              name={product.ten}
              slug={product.slug || product._id}
              price={product.gia}
              salePrice={product.giaKhuyenMai}
              image={product.hinhAnh[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop'}
              rating={product.danhGiaTrungBinh}
              reviewCount={product.soLuongDanhGia}
              isNew={product.sanPhamMoi}
              isFeatured={product.noiBat}
              soldCount={product.daBan}
              stock={product.soLuongTonKho}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
