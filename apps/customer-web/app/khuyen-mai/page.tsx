'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/ui/ProductCard';
import { api } from '@/lib/api';

interface Product {
  _id: string;
  ten: string;
  slug?: string;
  gia: number;
  giaKhuyenMai?: number;
  hinhAnh: string[];
  danhGiaTrungBinh: number;
  soLuongDanhGia: number;
  noiBat: boolean;
  sanPhamMoi: boolean;
  daBan: number;
  soLuongTonKho: number;
}

export default function PromotionsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('discount-high');

  useEffect(() => {
    loadPromotionalProducts();
  }, [sortBy]);

  const loadPromotionalProducts = async () => {
    setLoading(true);
    try {
      // Get all products and filter those with sale prices
      const response = await api.getProducts({ limit: 100 });
      if (response.success && response.data) {
        let data = Array.isArray(response.data) ? response.data : response.data.products || [];

        // Filter products with promotional prices
        data = data.filter((p: Product) => p.giaKhuyenMai && p.giaKhuyenMai < p.gia);

        // Sort products
        if (sortBy === 'discount-high') {
          data.sort((a: Product, b: Product) => {
            const discountA = a.giaKhuyenMai ? ((a.gia - a.giaKhuyenMai) / a.gia) * 100 : 0;
            const discountB = b.giaKhuyenMai ? ((b.gia - b.giaKhuyenMai) / b.gia) * 100 : 0;
            return discountB - discountA;
          });
        } else if (sortBy === 'price-low') {
          data.sort((a: Product, b: Product) => (a.giaKhuyenMai || a.gia) - (b.giaKhuyenMai || b.gia));
        } else if (sortBy === 'price-high') {
          data.sort((a: Product, b: Product) => (b.giaKhuyenMai || b.gia) - (a.giaKhuyenMai || a.gia));
        }

        setProducts(data);
      }
    } catch (error) {
      console.error('Lỗi khi tải sản phẩm khuyến mãi:', error);
      setProducts([]);
    }
    setLoading(false);
  };

  const getDiscountPercent = (product: Product) => {
    if (!product.giaKhuyenMai) return 0;
    return Math.round((1 - product.giaKhuyenMai / product.gia) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">🔥 Khuyến Mãi Đặc Biệt</h1>
            <p className="text-xl mb-2">Giảm giá cực sốc - Săn ngay kẻo lỡ!</p>
            <p className="text-lg opacity-90">Cơ hội sở hữu sản phẩm chính hãng với giá tốt nhất</p>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <a href="/" className="hover:text-blue-600">Trang chủ</a>
            <span>/</span>
            <span className="text-gray-900">Khuyến mãi</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 border-2 border-red-200">
            <div className="flex items-center gap-4">
              <div className="bg-red-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Giảm đến 50%</h3>
                <p className="text-sm text-gray-600">Nhiều sản phẩm hot</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border-2 border-blue-200">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Freeship</h3>
                <p className="text-sm text-gray-600">Đơn từ 500.000đ</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border-2 border-green-200">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">100% Chính hãng</h3>
                <p className="text-sm text-gray-600">Cam kết hoàn tiền</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-lg p-4 mb-6 flex items-center justify-between">
          <p className="text-gray-600">
            Có <span className="font-semibold text-red-600">{products.length}</span> sản phẩm đang khuyến mãi
          </p>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="discount-high">Giảm giá nhiều nhất</option>
            <option value="price-low">Giá thấp → cao</option>
            <option value="price-high">Giá cao → thấp</option>
          </select>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-stretch">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-lg mb-4" />
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 items-stretch">
            {products.map((product) => (
              <div key={product._id} className="relative">
                {/* Discount Badge */}
                <div className="absolute top-2 left-2 z-10 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                  -{getDiscountPercent(product)}%
                </div>
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
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Hiện không có sản phẩm khuyến mãi</h3>
            <p className="text-gray-600 mb-4">Vui lòng quay lại sau để không bỏ lỡ các ưu đãi hấp dẫn</p>
            <a
              href="/san-pham"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Xem tất cả sản phẩm
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
