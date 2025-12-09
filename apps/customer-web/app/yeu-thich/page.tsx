'use client';

import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, ShoppingCart, Heart } from 'lucide-react';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleAddToCart = (item: any) => {
    // Navigate to product page to select size/color
    window.location.href = `/san-pham/${item.slug}`;
  };

  const handleRemove = (productId: string) => {
    removeFromWishlist(productId);
    toast.success('Đã xóa khỏi danh sách yêu thích');
  };

  const handleClearAll = () => {
    if (window.confirm('Bạn có chắc muốn xóa tất cả sản phẩm yêu thích?')) {
      clearWishlist();
      toast.success('Đã xóa tất cả sản phẩm yêu thích');
    }
  };

  // Empty wishlist state
  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
            <Link href="/" className="hover:text-primary-600">Trang chủ</Link>
            <span>/</span>
            <span className="text-gray-900">Danh sách yêu thích</span>
          </div>

          {/* Empty State */}
          <div className="bg-white rounded-lg p-12 text-center">
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-16 h-16 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Danh sách yêu thích trống
            </h2>
            <p className="text-gray-600 mb-6">
              Bạn chưa có sản phẩm nào trong danh sách yêu thích.
            </p>
            <Link
              href="/san-pham"
              className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              Khám phá sản phẩm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-primary-600">Trang chủ</Link>
          <span>/</span>
          <span className="text-gray-900">Danh sách yêu thích</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Danh sách yêu thích
            </h1>
            <p className="text-gray-600 mt-1">
              {wishlistItems.length} sản phẩm
            </p>
          </div>
          {wishlistItems.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-red-600 hover:text-red-700 font-medium flex items-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              Xóa tất cả
            </button>
          )}
        </div>

        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
            >
              {/* Product Image */}
              <Link href={`/san-pham/${item.slug}`} className="block relative aspect-square bg-gray-100">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {item.salePrice && (
                  <div className="absolute top-3 left-3">
                    <span className="bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      -{Math.round(((item.price - item.salePrice) / item.price) * 100)}%
                    </span>
                  </div>
                )}

                {/* Remove Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleRemove(item.productId);
                  }}
                  className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                  aria-label="Xóa khỏi yêu thích"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </Link>

              {/* Product Info */}
              <div className="p-4">
                <Link href={`/san-pham/${item.slug}`}>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-primary-600 transition-colors">
                    {item.name}
                  </h3>
                </Link>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(item.rating)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    ({item.reviewCount})
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2 mb-3">
                  {item.salePrice ? (
                    <>
                      <span className="text-xl font-bold text-red-600">
                        {formatPrice(item.salePrice)}
                      </span>
                      <span className="text-sm text-gray-400 line-through">
                        {formatPrice(item.price)}
                      </span>
                    </>
                  ) : (
                    <span className="text-xl font-bold text-gray-900">
                      {formatPrice(item.price)}
                    </span>
                  )}
                </div>

                {/* Stock Status */}
                {item.stock > 0 ? (
                  <p className="text-sm text-green-600 mb-3">
                    Còn {item.stock} sản phẩm
                  </p>
                ) : (
                  <p className="text-sm text-red-600 mb-3">
                    Hết hàng
                  </p>
                )}

                {/* Add to Cart Button */}
                <button
                  onClick={() => handleAddToCart(item)}
                  disabled={item.stock === 0}
                  className="w-full bg-primary-600 text-white py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {item.stock > 0 ? 'Thêm vào giỏ' : 'Hết hàng'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
