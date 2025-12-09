'use client'

import { useState, useEffect } from 'react'
import ProductCard from '@/components/ui/ProductCard'
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
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFeaturedProducts()
  }, [])

  const loadFeaturedProducts = async () => {
    setLoading(true)
    try {
      const response = await api.getFeaturedProducts()
      if (response.success && response.data) {
        const data = Array.isArray(response.data) ? response.data : response.data.products || []
        setProducts(data)
      }
    } catch (error) {
      console.error('Lỗi khi tải sản phẩm nổi bật:', error)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-square bg-gray-200 rounded-2xl mb-4" />
            <div className="h-4 bg-gray-200 rounded mb-2" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product._id}
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
        />
      ))}
    </div>
  )
}
