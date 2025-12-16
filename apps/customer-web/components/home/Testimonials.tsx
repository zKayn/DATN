'use client'

import { Star, Quote } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import api from '@/lib/api'

interface Review {
  _id: string
  nguoiDung: {
    _id: string
    ten: string
    avatar?: string
  }
  sanPham: {
    _id: string
    ten: string
  }
  danhGia: number
  noiDung: string
  createdAt: string
}

export default function Testimonials() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // Lấy 6 đánh giá gần nhất có rating cao (4-5 sao)
        const response = await api.getReviews({
          page: 1,
          limit: 6,
          minRating: 4 // Chỉ lấy đánh giá 4-5 sao
        })

        if (response.success && response.data) {
          setReviews(response.data.slice(0, 6))
        }
      } catch (error) {
        console.error('Error fetching reviews:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [])

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return 'Hôm nay'
    if (days === 1) return 'Hôm qua'
    if (days < 7) return `${days} ngày trước`
    if (days < 30) return `${Math.floor(days / 7)} tuần trước`
    return `${Math.floor(days / 30)} tháng trước`
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-lg animate-pulse">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-gray-200"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Chưa có đánh giá nào</p>
      </div>
    )
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {reviews.map((review) => (
        <div
          key={review._id}
          className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-shadow relative"
        >
          {/* Quote Icon */}
          <Quote className="absolute top-4 right-4 w-10 h-10 text-primary-100" />

          {/* User Info */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative w-14 h-14 rounded-full overflow-hidden ring-4 ring-primary-100 bg-gradient-to-br from-primary-400 to-secondary-400">
              {review.nguoiDung?.avatar ? (
                <Image
                  src={review.nguoiDung.avatar}
                  alt={review.nguoiDung.ten}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-bold text-xl">
                  {review.nguoiDung?.ten?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{review.nguoiDung?.ten || 'Người dùng'}</h4>
              <p className="text-sm text-gray-500">{getTimeAgo(review.createdAt)}</p>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < review.danhGia
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Comment */}
          <p className="text-gray-700 mb-4 leading-relaxed">
            "{review.noiDung}"
          </p>

          {/* Product */}
          <div className="pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Sản phẩm: <span className="text-primary-600 font-medium">{review.sanPham?.ten || 'N/A'}</span>
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
