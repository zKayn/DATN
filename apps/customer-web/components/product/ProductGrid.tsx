'use client';

import { useState, useEffect } from 'react';
import ProductCard from '../ui/ProductCard';
import { api } from '@/lib/api';

interface ProductGridProps {
  filters: any;
}

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
  thuongHieu: string;
  danhMuc: any;
  kichThuoc?: string[];
  mauSac?: Array<{ ten: string; ma: string }>;
  soLuongTonKho: number;
}

export default function ProductGrid({ filters }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  // Fetch products from API
  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when filters change
    loadProducts();
  }, [filters]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      // Build API params from filters
      const params: any = {
        limit: 1000 // Fetch all products for client-side pagination
      };

      if (filters.category) {
        params.danhMuc = filters.category;
      }

      if (filters.productType) {
        params.loaiSanPham = filters.productType;
      }

      if (filters.priceRange) {
        params.minPrice = filters.priceRange[0];
        params.maxPrice = filters.priceRange[1];
      }

      if (filters.search) {
        params.search = filters.search;
      }

      // Map sort options
      if (filters.sort) {
        switch (filters.sort) {
          case 'price-low':
            params.sort = 'gia';
            break;
          case 'price-high':
            params.sort = '-gia';
            break;
          case 'popular':
            params.sort = '-daBan';
            break;
          case 'rating':
            params.sort = '-danhGiaTrungBinh';
            break;
          case 'newest':
          default:
            params.sort = '-createdAt';
            break;
        }
      }

      const response = await api.getProducts(params);

      if (response.success && response.data) {
        let data = Array.isArray(response.data) ? response.data : response.data.products || [];

        // Client-side filtering for filters not supported by API
        if (filters.brands && filters.brands.length > 0) {
          data = data.filter((p: Product) => filters.brands.includes(p.thuongHieu));
        }

        if (filters.sizes && filters.sizes.length > 0) {
          data = data.filter((p: Product) => {
            // Check if product has any of the selected sizes
            return filters.sizes.some((size: string) => p.kichThuoc?.includes(size));
          });
        }

        if (filters.colors && filters.colors.length > 0) {
          data = data.filter((p: Product) => {
            // Check if product has any of the selected colors
            return filters.colors.some((color: string) =>
              p.mauSac?.some((mau: any) => mau.ten === color)
            );
          });
        }

        if (filters.rating > 0) {
          data = data.filter((p: Product) => p.danhGiaTrungBinh >= filters.rating);
        }

        setProducts(data);
      }
    } catch (error) {
      console.error('Lỗi khi tải sản phẩm:', error);
      setProducts([]);
    }
    setLoading(false);
  };

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const paginatedProducts = products.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
            <div className="aspect-square bg-gray-200 rounded-lg mb-4" />
            <div className="h-4 bg-gray-200 rounded mb-2" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Không tìm thấy sản phẩm</h3>
        <p className="text-gray-600">Hãy thử thay đổi bộ lọc để xem nhiều sản phẩm hơn</p>
      </div>
    );
  }

  return (
    <div>
      {/* Results Count */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Hiển thị <span className="font-semibold">{paginatedProducts.length}</span> trong{' '}
          <span className="font-semibold">{products.length}</span> sản phẩm
        </p>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6 items-stretch">
        {paginatedProducts.map((product) => (
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-700 focus:ring-offset-2"
          >
            Trước
          </button>

          {/* Smart pagination - show first, last, and nearby pages */}
          {(() => {
            const pages = [];
            const showEllipsisStart = currentPage > 3;
            const showEllipsisEnd = currentPage < totalPages - 2;

            // Always show first page
            pages.push(
              <button
                key={1}
                onClick={() => setCurrentPage(1)}
                className={`px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-700 focus:ring-offset-2 ${
                  currentPage === 1
                    ? 'bg-primary-500 text-white'
                    : 'border hover:bg-gray-50'
                }`}
              >
                1
              </button>
            );

            // Show ellipsis after first page if needed
            if (showEllipsisStart) {
              pages.push(
                <span key="ellipsis-start" className="px-2 text-gray-400">
                  ...
                </span>
              );
            }

            // Show pages around current page
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
              pages.push(
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-700 focus:ring-offset-2 ${
                    currentPage === i
                      ? 'bg-primary-500 text-white'
                      : 'border hover:bg-gray-50'
                  }`}
                >
                  {i}
                </button>
              );
            }

            // Show ellipsis before last page if needed
            if (showEllipsisEnd) {
              pages.push(
                <span key="ellipsis-end" className="px-2 text-gray-400">
                  ...
                </span>
              );
            }

            // Always show last page (if more than 1 page)
            if (totalPages > 1) {
              pages.push(
                <button
                  key={totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  className={`px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-700 focus:ring-offset-2 ${
                    currentPage === totalPages
                      ? 'bg-primary-500 text-white'
                      : 'border hover:bg-gray-50'
                  }`}
                >
                  {totalPages}
                </button>
              );
            }

            return pages;
          })()}

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-700 focus:ring-offset-2"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
}
