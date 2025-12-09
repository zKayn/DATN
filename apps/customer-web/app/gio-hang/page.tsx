'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { api } from '@/lib/api';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();
  const [selectedItems, setSelectedItems] = useState<string[]>(cartItems.map(item => item.id));
  const [shippingFeeSettings, setShippingFeeSettings] = useState(30000);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(500000);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await api.getSettings();
      if (response.success && response.data) {
        setShippingFeeSettings(response.data.shippingFee || 30000);
        setFreeShippingThreshold(response.data.freeShippingThreshold || 500000);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItems(selected =>
      selected.includes(id)
        ? selected.filter(itemId => itemId !== id)
        : [...selected, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map(item => item.id));
    }
  };

  const selectedCartItems = cartItems.filter(item => selectedItems.includes(item.id));
  const subtotal = selectedCartItems.reduce((sum, item) => {
    const price = item.salePrice || item.price;
    return sum + price * item.quantity;
  }, 0);

  const shippingFee = subtotal > 0 ? (subtotal >= freeShippingThreshold ? 0 : shippingFeeSettings) : 0;
  const total = subtotal + shippingFee;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-lg p-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Giỏ Hàng Trống</h2>
              <p className="text-gray-600 mb-8">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
              <Link
                href="/san-pham"
                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Tiếp Tục Mua Sắm
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Giỏ Hàng</h1>
          <p className="text-gray-600 mt-2">{cartItems.length} sản phẩm</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              {/* Select All */}
              <div className="p-4 border-b flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedItems.length === cartItems.length}
                  onChange={toggleSelectAll}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <span className="font-medium text-gray-900">
                  Chọn tất cả ({cartItems.length} sản phẩm)
                </span>
              </div>

              {/* Cart Items List */}
              <div className="divide-y">
                {cartItems.map((item) => {
                  const finalPrice = item.salePrice || item.price;
                  const discountPercent = item.salePrice
                    ? Math.round((1 - item.salePrice / item.price) * 100)
                    : 0;

                  return (
                    <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex gap-4">
                        {/* Checkbox */}
                        <div className="flex-shrink-0 pt-1">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={() => toggleSelectItem(item.id)}
                            className="w-5 h-5 text-blue-600 rounded"
                          />
                        </div>

                        {/* Product Image */}
                        <Link
                          href={`/san-pham/${item.slug}`}
                          className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0"
                        >
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </Link>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/san-pham/${item.slug}`}
                            className="font-semibold text-gray-900 hover:text-blue-600 line-clamp-2"
                          >
                            {item.name}
                          </Link>
                          <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                            <span>Size: {item.size}</span>
                            <span>•</span>
                            <span>Màu: {item.color}</span>
                          </div>

                          {/* Price */}
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-lg font-bold text-red-600">
                              ₫{finalPrice.toLocaleString('vi-VN')}
                            </span>
                            {item.salePrice && (
                              <>
                                <span className="text-sm text-gray-500 line-through">
                                  ₫{item.price.toLocaleString('vi-VN')}
                                </span>
                                <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded">
                                  -{discountPercent}%
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Quantity & Remove */}
                        <div className="flex flex-col items-end justify-between">
                          {/* Quantity Control */}
                          <div className="flex items-center border border-gray-300 rounded">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors"
                              disabled={item.quantity <= 1}
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                              className="w-12 text-center border-x border-gray-300 h-8 focus:outline-none"
                              min="1"
                              max={item.stock}
                            />
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors"
                              disabled={item.quantity >= item.stock}
                            >
                              +
                            </button>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            Xóa
                          </button>

                          {/* Stock Info */}
                          <span className="text-xs text-gray-500">
                            Còn {item.stock} sản phẩm
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Continue Shopping */}
            <div className="mt-6">
              <Link
                href="/san-pham"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Tóm Tắt Đơn Hàng</h2>

              <div className="space-y-3 mb-4 pb-4 border-b">
                <div className="flex justify-between text-gray-700">
                  <span>Tạm tính ({selectedCartItems.length} sản phẩm)</span>
                  <span className="font-semibold">₫{subtotal.toLocaleString('vi-VN')}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Phí vận chuyển</span>
                  <span className="font-semibold">
                    {shippingFee === 0 ? (
                      <span className="text-green-600">Miễn phí</span>
                    ) : (
                      `₫${shippingFee.toLocaleString('vi-VN')}`
                    )}
                  </span>
                </div>
              </div>

              {subtotal > 0 && subtotal < freeShippingThreshold && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-800">
                    💡 Mua thêm ₫{(freeShippingThreshold - subtotal).toLocaleString('vi-VN')} để được miễn phí vận chuyển
                  </p>
                </div>
              )}

              <div className="flex justify-between text-lg font-bold text-gray-900 mb-6">
                <span>Tổng cộng</span>
                <span className="text-red-600">₫{total.toLocaleString('vi-VN')}</span>
              </div>

              <Link
                href="/thanh-toan"
                className={`block w-full text-center py-4 rounded-lg font-semibold transition-colors ${
                  selectedCartItems.length > 0
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed pointer-events-none'
                }`}
              >
                Tiến Hành Thanh Toán
              </Link>

              <div className="mt-6 space-y-3">
                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Miễn phí vận chuyển cho đơn hàng từ {freeShippingThreshold.toLocaleString('vi-VN')}₫</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Đổi trả trong vòng 30 ngày</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Thanh toán an toàn & bảo mật</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
