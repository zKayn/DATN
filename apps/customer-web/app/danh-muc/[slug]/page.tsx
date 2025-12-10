'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import ProductGrid from '@/components/product/ProductGrid';
import ProductFilter from '@/components/product/ProductFilter';
import { api } from '@/lib/api';

interface Category {
  _id: string;
  ten: string;
  slug: string;
  moTa?: string;
  hinhAnh?: string;
}

export default function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params?.slug as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    productType: '',
    priceRange: [0, 10000000] as [number, number],
    brands: [] as string[],
    sizes: [] as string[],
    colors: [] as string[],
    rating: 0,
    sort: 'newest'
  });

  // Load category when slug changes
  useEffect(() => {
    if (slug) {
      loadCategory();
    }
  }, [slug]);

  // Update productType filter when URL query parameter changes
  useEffect(() => {
    const loaiSanPham = searchParams.get('loaiSanPham');
    setFilters(prev => ({
      ...prev,
      productType: loaiSanPham || ''
    }));
  }, [searchParams]);

  const loadCategory = async () => {
    setLoading(true);
    try {
      const response = await api.getCategoryBySlug(slug);
      if (response.success && response.data) {
        const categoryData = response.data.category || response.data;
        setCategory(categoryData);

        // Get current loaiSanPham from URL to preserve it
        const loaiSanPham = searchParams.get('loaiSanPham');

        // Set category filter while preserving productType from URL
        setFilters(prev => ({
          ...prev,
          category: categoryData._id,
          productType: loaiSanPham || ''
        }));
      }
    } catch (error) {
      console.error('Lỗi khi tải danh mục:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy danh mục</h2>
          <a href="/" className="text-blue-600 hover:underline">
            Quay lại trang chủ
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <a href="/" className="hover:text-blue-600">Trang chủ</a>
            <span>/</span>
            <a href="/san-pham" className="hover:text-blue-600">Sản phẩm</a>
            <span>/</span>
            <span className="text-gray-900">{category.ten}</span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900">{category.ten}</h1>
          {category.moTa && (
            <p className="text-gray-600 mt-2">{category.moTa}</p>
          )}
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
