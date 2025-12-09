'use client';

import { useState } from 'react';
import ProductGrid from '@/components/product/ProductGrid';
import ProductFilter from '@/components/product/ProductFilter';

export default function ProductsPage() {
  const [filters, setFilters] = useState({
    category: '',
    priceRange: [0, 10000000],
    brands: [] as string[],
    sizes: [] as string[],
    colors: [] as string[],
    rating: 0,
    sort: 'newest'
  });

  const [showMobileFilter, setShowMobileFilter] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Sản Phẩm</h1>
          <p className="text-gray-600 mt-2">Khám phá bộ sưu tập đồ thể thao chất lượng cao</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-4">
              <ProductFilter filters={filters} onChange={setFilters} />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setShowMobileFilter(true)}
                className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-3 hover:bg-gray-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Bộ Lọc
              </button>
            </div>

            {/* Product Grid */}
            <ProductGrid filters={filters} />
          </div>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {showMobileFilter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-4 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Bộ Lọc</h2>
              <button
                onClick={() => setShowMobileFilter(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <ProductFilter filters={filters} onChange={setFilters} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
