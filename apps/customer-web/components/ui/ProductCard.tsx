'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react'
import { useWishlist } from '@/contexts/WishlistContext'
import toast from 'react-hot-toast'
import QuickViewModal from './QuickViewModal'
import SeasonalBadge from '@/components/decorations/SeasonalBadge'

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
    <div className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-transparent hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col h-full">
      {/* Image Container */}
      <Link href={`/san-pham/${slug}`} className="block relative aspect-square overflow-hidden bg-gray-50 flex-shrink-0">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isOutOfStock && (
            <SeasonalBadge type="out-of-stock" />
          )}
          {!isOutOfStock && isNew && (
            <SeasonalBadge type="new" />
          )}
          {!isOutOfStock && discountPercent > 0 && discountPercent >= 30 && (
            <SeasonalBadge type="noel-special" discount={discountPercent} />
          )}
          {!isOutOfStock && discountPercent > 0 && discountPercent < 30 && (
            <SeasonalBadge type="tet-deal" discount={discountPercent} />
          )}
          {!isOutOfStock && isFeatured && (
            <SeasonalBadge type="lucky-sale" />
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <button
            onClick={handleWishlistToggle}
            className={`p-2 rounded-full backdrop-blur-md transition-all shadow-lg ${
              isWishlisted
                ? 'bg-primary-500 text-white shadow-glow-red'
                : 'bg-white/80 text-gray-700 hover:bg-primary-500 hover:text-white hover:shadow-glow-red'
            }`}
            aria-label="Add to wishlist"
          >
            <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault()
              setIsQuickViewOpen(true)
            }}
            className="p-2 bg-white/80 backdrop-blur-md text-gray-700 rounded-full hover:bg-accent-500 hover:text-white hover:shadow-glow-gold transition-all shadow-lg"
            aria-label="Quick view"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-gray-900 text-white px-6 py-3 rounded-lg font-bold text-lg">
              HẾT HÀNG
            </span>
          </div>
        )}

        {/* Add to Cart Overlay */}
        {!isOutOfStock && (
          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <Link
              href={`/san-pham/${slug}`}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 shadow-lg shadow-glow-red"
            >
              <ShoppingCart className="w-5 h-5" />
              Thêm vào giỏ
            </Link>
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Product Name */}
        <Link href={`/san-pham/${slug}`} className="block">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-accent-600 transition-colors min-h-[3rem]">
            {name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(rating)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500">
            ({reviewCount})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-2">
          {salePrice ? (
            <>
              <span className="text-2xl font-bold text-primary-600">
                {formatPrice(salePrice)}
              </span>
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(price)}
              </span>
            </>
          ) : (
            <span className="text-2xl font-bold text-gray-900">
              {formatPrice(price)}
            </span>
          )}
        </div>

        {/* Sold Count */}
        <p className="text-sm text-gray-500">
          Đã bán: {soldCount || 0}
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
