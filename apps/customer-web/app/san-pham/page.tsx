'use client';

import { useState } from 'react';
import ProductGrid from '@/components/product/ProductGrid';
import ProductFilter from '@/components/product/ProductFilter';

export default function ProductsPage() {
  const [filters, setFilters] = useState({
    category: '',
    productType: '',
    priceRange: [0, 10000000],
    brands: [] as string[],
    sizes: [] as string[],
    colors: [] as string[],
    rating: 0,
    sort: 'newest'
  });

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
        {/* Horizontal Filters */}
        <div className="mb-6">
          <ProductFilter filters={filters} onChange={setFilters} />
        </div>

        {/* Product Grid */}
        <ProductGrid filters={filters} />
      </div>
    </div>
  );
}
