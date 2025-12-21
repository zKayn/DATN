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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl animate-pulse border border-white/30">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gray-200"></div>
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
        <p className="text-white/70 text-lg">Chưa có đánh giá nào</p>
      </div>
    )
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {reviews.map((review) => (
        <div
          key={review._id}
          className="group bg-white/95 backdrop-blur-lg rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 relative overflow-hidden border border-white/30 hover:transform hover:-translate-y-2"
        >
          {/* Festive Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent-200/20 via-transparent to-primary-200/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Quote Icon */}
          <Quote className="absolute top-6 right-6 w-12 h-12 text-accent-200/40 group-hover:text-accent-300/60 transition-colors" />

          {/* User Info */}
          <div className="flex items-center gap-4 mb-6 relative z-10">
            <div className="relative w-16 h-16 rounded-full overflow-hidden ring-4 ring-accent-200 group-hover:ring-accent-400 transition-all bg-gradient-to-br from-primary-400 via-accent-400 to-secondary-400 shadow-lg">
              {review.nguoiDung?.avatar ? (
                <Image
                  src={review.nguoiDung.avatar}
                  alt={review.nguoiDung.ten}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-bold text-2xl">
                  {review.nguoiDung?.ten?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-lg">{review.nguoiDung?.ten || 'Người dùng'}</h4>
              <p className="text-sm text-gray-600">{getTimeAgo(review.createdAt)}</p>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-4 relative z-10">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < review.danhGia
                    ? 'text-accent-500 fill-accent-500'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Comment */}
          <p className="text-gray-800 mb-6 leading-relaxed text-base italic relative z-10">
            "{review.noiDung}"
          </p>

          {/* Product */}
          <div className="pt-4 border-t border-gray-200 relative z-10">
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <span className="font-medium">Sản phẩm:</span>
              <span className="text-primary-600 font-semibold">{review.sanPham?.ten || 'N/A'}</span>
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
