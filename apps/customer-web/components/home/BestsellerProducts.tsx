'use client'

import { useState, useEffect } from 'react'
import ProductCard from '@/components/ui/ProductCard'
import { ChevronLeft, ChevronRight } from 'lucide-react'
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

export default function BestsellerProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [startIndex, setStartIndex] = useState(0)
  const itemsPerPage = 4

  useEffect(() => {
    loadBestsellerProducts()
  }, [])

  const loadBestsellerProducts = async () => {
    setLoading(true)
    try {
      const response = await api.getBestsellerProducts()
      if (response.success && response.data) {
        const data = Array.isArray(response.data) ? response.data : response.data.products || []
        setProducts(data)
      }
    } catch (error) {
      console.error('Lỗi khi tải sản phẩm bán chạy:', error)
    }
    setLoading(false)
  }

  const nextSlide = () => {
    if (startIndex + itemsPerPage < products.length) {
      setStartIndex(startIndex + itemsPerPage)
    }
  }

  const prevSlide = () => {
    if (startIndex > 0) {
      setStartIndex(Math.max(0, startIndex - itemsPerPage))
    }
  }

  const visibleProducts = products.slice(startIndex, startIndex + itemsPerPage)

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {[...Array(4)].map((_, i) => (
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
    <div className="relative">
      {/* Navigation Arrows */}
      {startIndex > 0 && (
        <button
          onClick={prevSlide}
          className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-100 transition-colors"
          aria-label="Previous products"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {startIndex + itemsPerPage < products.length && (
        <button
          onClick={nextSlide}
          className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-100 transition-colors"
          aria-label="Next products"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {visibleProducts.map((product) => (
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
            stock={product.soLuongTonKho}
          />
        ))}
      </div>

      {/* Dots Indicator */}
      {products.length > itemsPerPage && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: Math.ceil(products.length / itemsPerPage) }).map((_, index) => (
            <button
              key={index}
              onClick={() => setStartIndex(index * itemsPerPage)}
              className={`w-2 h-2 rounded-full transition-all ${
                Math.floor(startIndex / itemsPerPage) === index
                  ? 'bg-primary-400 w-6'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
