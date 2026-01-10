'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react'
import { useWishlist } from '@/contexts/WishlistContext'
import toast from 'react-hot-toast'
import QuickViewModal from './QuickViewModal'
import SimpleBadge from './SimpleBadge'

interface ProductCardProps {
  id: string
  name: string
  slug: string
  price: number
  salePrice?: number
  image: string
  rating: number
  reviewCount: number
  isNew?: boolean
  isFeatured?: boolean
  soldCount?: number
  stock?: number
}

export default function ProductCard({
  id,
  name,
  slug,
  price,
  salePrice,
  image,
  rating,
  reviewCount,
  isNew,
  isFeatured,
  soldCount,
  stock
}: ProductCardProps) {
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false)
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const isWishlisted = isInWishlist(id)
  const discountPercent = salePrice ? Math.round(((price - salePrice) / price) * 100) : 0
  const isOutOfStock = (stock !== undefined && stock !== null) ? stock <= 0 : false

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (isWishlisted) {
      await removeFromWishlist(id)
      toast.success('Đã xóa khỏi danh sách yêu thích')
    } else {
      await addToWishlist({
        _id: id,
        ten: name,
        slug,
        hinhAnh: [image],
        gia: price,
        giaKhuyenMai: salePrice || undefined,
        danhGia: {
          trungBinh: rating,
          soLuong: reviewCount
        },
        tonKho: stock
      })
      toast.success('Đã thêm vào danh sách yêu thích')
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden
                    transition-all duration-500 ease-smooth
                    hover:shadow-[0_20px_60px_rgba(26,117,255,0.3)]
                    hover:-translate-y-2
                    flex flex-col h-full
                    before:absolute before:inset-0 before:-z-10 before:rounded-2xl
                    before:bg-gradient-to-br before:from-primary-500 before:to-accent-500
                    before:opacity-0 hover:before:opacity-100 before:blur-xl before:transition-all
                    border-2 border-gray-200 hover:border-transparent">

      {/* Image Container */}
      <Link
        href={`/san-pham/${slug}`}
        className="block relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200
                   flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-primary-700 focus:ring-inset"
        aria-label={`Xem sản phẩm ${name}`}
      >
        <Image
          src={image}
          alt={name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover group-hover:scale-125 group-hover:rotate-2
                     transition-all duration-700 ease-smooth"
          loading="lazy"
        />

        {/* Sale Badge - Bold & Rotating */}
        {!isOutOfStock && discountPercent > 0 && (
          <div className="absolute top-4 left-4 z-20">
            <div className="relative">
              {/* Pulsing Glow Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-orange-500
                            rounded-2xl animate-pulse blur-sm" />

              {/* Badge Content */}
              <div className="relative bg-gradient-to-br from-red-500 to-orange-500
                            text-white px-4 py-2 rounded-2xl font-accent font-bold
                            shadow-lg transform rotate-[-5deg]
                            hover:rotate-0 transition-transform">
                <span className="text-2xl">-{discountPercent}%</span>
              </div>
            </div>
          </div>
        )}

        {/* New Badge - Glowing */}
        {!isOutOfStock && !salePrice && isNew && (
          <div className="absolute top-4 left-4 z-20">
            <div className="relative px-4 py-2 bg-gradient-to-r from-success-400 to-primary-400
                          text-white font-accent font-bold rounded-full
                          shadow-[0_0_20px_rgba(26,255,141,0.6)]
                          animate-pulse-glow">
              MỚI
            </div>
          </div>
        )}

        {/* Floating Quick Actions - Slide from Right */}
        <div className="absolute top-4 right-4 flex flex-col gap-3 z-20
                      opacity-0 group-hover:opacity-100 transition-all duration-300
                      transform translate-x-8 group-hover:translate-x-0">
          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            className={`w-12 h-12 rounded-full shadow-lg
                       transition-all duration-300 ease-smooth
                       hover:scale-125 hover:rotate-12 active:scale-95
                       flex items-center justify-center
                       focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2
                       ${isWishlisted
                         ? 'bg-gradient-to-br from-secondary-500 to-secondary-600 text-white shadow-[0_8px_30px_rgba(62,227,165,0.4)]'
                         : 'bg-white text-gray-700 hover:bg-gradient-to-br hover:from-secondary-500 hover:to-secondary-600 hover:text-white hover:shadow-[0_8px_30px_rgba(62,227,165,0.4)]'
                       }`}
            aria-label={isWishlisted ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
            title={isWishlisted ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
          >
            <Heart className={`w-5 h-5 transition-all ${isWishlisted ? 'fill-current animate-bounce-subtle' : ''}`} />
          </button>

          {/* Quick View Button */}
          <button
            onClick={(e) => {
              e.preventDefault()
              setIsQuickViewOpen(true)
            }}
            className="w-12 h-12 bg-white text-gray-700 rounded-full shadow-lg
                     hover:bg-gradient-to-br hover:from-primary-500 hover:to-primary-600 hover:text-white
                     transition-all duration-300 ease-smooth
                     hover:scale-125 hover:rotate-[-12deg] active:scale-95
                     hover:shadow-[0_8px_30px_rgba(67,233,123,0.4)]
                     flex items-center justify-center
                     focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
            aria-label="Xem nhanh sản phẩm"
            title="Xem nhanh"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
            <span className="bg-gray-900 text-white px-6 py-3 rounded-lg font-bold text-lg
                           shadow-2xl animate-bounce-in">
              HẾT HÀNG
            </span>
          </div>
        )}

        {/* Gradient Add to Cart Button - Slide from Bottom */}
        {!isOutOfStock && (
          <div className="absolute bottom-0 left-0 right-0 p-4
                        translate-y-full group-hover:translate-y-0
                        transition-all duration-300 ease-smooth">
            <Link
              href={`/san-pham/${slug}`}
              className="group/btn w-full relative overflow-hidden
                       bg-gradient-to-r from-primary-500 to-accent-500
                       text-white py-3.5 rounded-xl font-accent font-bold
                       flex items-center justify-center gap-2
                       transform transition-all duration-300
                       hover:shadow-[0_10px_40px_rgba(67,233,123,0.5)]
                       hover:scale-105 active:scale-95
                       focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
              aria-label={`Xem chi tiết ${name}`}
            >
              {/* Button Content */}
              <span className="relative z-10 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                THÊM VÀO GIỎ
              </span>

              {/* Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent
                            transform -translate-x-full group-hover/btn:translate-x-full
                            transition-transform duration-1000" />
            </Link>
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Product Name */}
        <Link href={`/san-pham/${slug}`} className="block">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2
                       hover:text-primary-500 transition-colors min-h-[3rem]">
            {name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 transition-colors ${
                  i < Math.floor(rating)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">
            ({reviewCount})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-2">
          {salePrice ? (
            <>
              <span className="text-xl font-bold text-red-600">
                {formatPrice(salePrice)}
              </span>
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(price)}
              </span>
            </>
          ) : (
            <span className="text-xl font-bold text-red-600">
              {formatPrice(price)}
            </span>
          )}
        </div>

        {/* Sold Count */}
        <p className="text-sm text-gray-500">
          Đã bán <span className="font-semibold text-gray-700">{(soldCount || 0).toLocaleString()}</span>
        </p>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        productId={id}
      />
    </div>
  )
}
