'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import Link from 'next/link'
import { X, ShoppingCart, Heart, Star } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useWishlist } from '@/contexts/WishlistContext'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'

interface QuickViewModalProps {
  isOpen: boolean
  onClose: () => void
  productId: string
}

interface Product {
  _id: string
  ten: string
  slug?: string
  gia: number
  giaKhuyenMai?: number
  hinhAnh: string[]
  danhGiaTrungBinh: number
  soLuongDanhGia: number
  daBan: number
  thuongHieu: string
  moTa: string
  kichThuoc: string[]
  mauSac: { ten: string; ma: string }[]
  soLuongTonKho: number
  noiBat: boolean
  sanPhamMoi: boolean
}

export default function QuickViewModal({ isOpen, onClose, productId }: QuickViewModalProps) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [mounted, setMounted] = useState(false)

  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen && productId) {
      loadProduct()
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, productId])

  const loadProduct = async () => {
    setLoading(true)
    try {
      const response = await api.getProductById(productId)
      if (response.success && response.data) {
        const productData = response.data.product || response.data
        setProduct(productData)
        // Set defaults
        if (productData.kichThuoc?.length > 0) {
          setSelectedSize(productData.kichThuoc[0])
        }
        if (productData.mauSac?.length > 0) {
          setSelectedColor(productData.mauSac[0].ten)
        }
      }
    } catch (error) {
      console.error('Error loading product:', error)
      toast.error('Không thể tải thông tin sản phẩm')
    }
    setLoading(false)
  }

  const handleAddToCart = () => {
    if (!product) return

    if (product.kichThuoc?.length > 0 && !selectedSize) {
      toast.error('Vui lòng chọn kích thước')
      return
    }

    if (product.mauSac?.length > 0 && !selectedColor) {
      toast.error('Vui lòng chọn màu sắc')
      return
    }

    addToCart({
      productId: product._id,
      name: product.ten,
      slug: product.slug || product._id,
      image: product.hinhAnh[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
      price: product.gia,
      salePrice: product.giaKhuyenMai || null,
      size: selectedSize || 'Free Size',
      color: selectedColor || 'Mặc định',
      quantity: quantity,
      stock: product.soLuongTonKho
    })

    toast.success('Đã thêm vào giỏ hàng!')
    onClose()
  }

  const handleWishlistToggle = () => {
    if (!product) return

    const isWishlisted = isInWishlist(product._id)

    if (isWishlisted) {
      removeFromWishlist(product._id)
      toast.success('Đã xóa khỏi danh sách yêu thích')
    } else {
      addToWishlist({
        _id: product._id,
        ten: product.ten,
        slug: product.slug || product._id,
        hinhAnh: product.hinhAnh,
        gia: product.gia,
        giaKhuyenMai: product.giaKhuyenMai,
        danhGia: {
          trungBinh: product.danhGiaTrungBinh,
          soLuong: product.soLuongDanhGia
        },
        tonKho: product.soLuongTonKho
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

  const discountPercent = product?.giaKhuyenMai
    ? Math.round((1 - product.giaKhuyenMai / product.gia) * 100)
    : 0

  if (!isOpen || !mounted) return null

  const modalContent = (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-xl">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
          ) : product ? (
            <div className="relative">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 z-10 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                {/* Image Gallery */}
                <div className="space-y-3">
                  <div className="relative aspect-square bg-gray-100 rounded overflow-hidden">
                    <Image
                      src={product.hinhAnh[currentImageIndex] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800'}
                      alt={product.ten}
                      fill
                      className="object-cover"
                    />
                    {/* Badges */}
                    {(product.sanPhamMoi || discountPercent > 0) && (
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {product.sanPhamMoi && (
                          <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                            MỚI
                          </span>
                        )}
                        {discountPercent > 0 && (
                          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                            GIẢM {discountPercent}%
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Thumbnail Images */}
                  {product.hinhAnh.length > 1 && (
                    <div className="flex gap-2">
                      {product.hinhAnh.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`relative w-20 h-20 flex-shrink-0 rounded overflow-hidden border-2 transition-all ${
                            currentImageIndex === index
                              ? 'border-red-500'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Image
                            src={image}
                            alt={`${product.ten} ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-gray-900 leading-tight">{product.ten}</h2>

                  {/* Price */}
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-red-600">
                      {formatPrice(product.giaKhuyenMai || product.gia)}
                    </span>
                    {product.giaKhuyenMai && (
                      <span className="text-lg text-gray-400 line-through">
                        {formatPrice(product.gia)}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <div className="text-sm text-gray-600 border-t border-b border-gray-200 py-3">
                    <p className="line-clamp-2">Thông tin sản phẩm đang cập nhật</p>
                  </div>

                  {/* Size Selection */}
                  {product.kichThuoc && product.kichThuoc.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kích thước:
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {product.kichThuoc.map((size) => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`px-4 py-2 text-sm font-medium border rounded transition-colors ${
                              selectedSize === size
                                ? 'bg-red-500 text-white border-red-500'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-red-500'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Color Selection */}
                  {product.mauSac && product.mauSac.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Màu sắc:
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {product.mauSac.map((color) => (
                          <button
                            key={color.ten}
                            onClick={() => setSelectedColor(color.ten)}
                            className={`relative w-10 h-10 rounded border-2 transition-all ${
                              selectedColor === color.ten
                                ? 'border-red-500 scale-110'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                            style={{ backgroundColor: color.ma }}
                            title={color.ten}
                          >
                            {selectedColor === color.ten && (
                              <span className="absolute inset-0 flex items-center justify-center">
                                <svg className="w-5 h-5 text-white drop-shadow" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quantity */}
                  {product.soLuongTonKho > 0 && (
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border border-gray-300 rounded">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors font-bold text-gray-600 text-lg"
                          disabled={quantity <= 1}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(1, Math.min(product.soLuongTonKho, parseInt(e.target.value) || 1)))}
                          className="w-16 text-center font-medium text-gray-900 border-x border-gray-300 h-10 focus:outline-none"
                          min={1}
                          max={product.soLuongTonKho}
                        />
                        <button
                          onClick={() => setQuantity(Math.min(product.soLuongTonKho, quantity + 1))}
                          className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors font-bold text-gray-600 text-lg"
                          disabled={quantity >= product.soLuongTonKho}
                        >
                          +
                        </button>
                      </div>
                      <span className="text-sm text-gray-600">
                        {product.soLuongTonKho} sản phẩm có sẵn
                      </span>
                    </div>
                  )}

                  {/* Add to Cart Button */}
                  {product.soLuongTonKho > 0 ? (
                    <button
                      onClick={handleAddToCart}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded transition-colors uppercase text-sm"
                    >
                      THÊM VÀO GIỎ HÀNG
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full bg-gray-300 text-gray-500 font-bold py-3 rounded cursor-not-allowed uppercase text-sm"
                    >
                      HẾT HÀNG
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-96">
              <p className="text-gray-500">Không thể tải thông tin sản phẩm</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body) as any
}
