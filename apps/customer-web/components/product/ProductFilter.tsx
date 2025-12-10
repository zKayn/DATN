'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface FilterProps {
  filters: {
    category: string;
    productType: string;
    priceRange: [number, number];
    brands: string[];
    sizes: string[];
    colors: string[];
    rating: number;
    sort: string;
  };
  onChange: (filters: any) => void;
}

interface Category {
  _id: string;
  ten: string;
  slug: string;
  trangThai: string;
  loaiSanPham?: string[];
}

export default function ProductFilter({ filters, onChange }: FilterProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [availableProductTypes, setAvailableProductTypes] = useState<string[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingBrands, setLoadingBrands] = useState(true);

  const sizes = ['S', 'M', 'L', 'XL', '2XL', '3XL', '38', '39', '40', '41', '42', '43', '44', '45'];
  const colors = [
    { name: 'Đen', code: '#000000' },
    { name: 'Trắng', code: '#FFFFFF' },
    { name: 'Xanh', code: '#3B82F6' },
    { name: 'Đỏ', code: '#EF4444' },
    { name: 'Xanh Lá', code: '#10B981' },
    { name: 'Vàng', code: '#F59E0B' },
    { name: 'Xám', code: '#6B7280' },
    { name: 'Hồng', code: '#EC4899' }
  ];

  useEffect(() => {
    loadCategories();
    loadBrands();
  }, []);

  useEffect(() => {
    // Update available product types when category changes
    if (filters.category) {
      const selectedCategory = categories.find(cat => cat._id === filters.category);
      if (selectedCategory && selectedCategory.loaiSanPham) {
        setAvailableProductTypes(selectedCategory.loaiSanPham);
      } else {
        setAvailableProductTypes([]);
      }
      // Reset product type when category changes
      if (filters.productType) {
        onChange({ ...filters, productType: '' });
      }
    } else {
      setAvailableProductTypes([]);
    }
  }, [filters.category, categories]);

  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await api.getCategories();
      if (response.success && response.data) {
        const data = Array.isArray(response.data) ? response.data : response.data.categories || [];
        const activeCategories = data.filter((cat: Category) => cat.trangThai === 'active');
        setCategories(activeCategories);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh mục:', error);
    }
    setLoadingCategories(false);
  };

  const loadBrands = async () => {
    setLoadingBrands(true);
    try {
      // Fetch all products to get unique brands
      const response = await api.getProducts({ limit: 1000 });
      if (response.success && response.data) {
        const products = Array.isArray(response.data) ? response.data : response.data.products || [];
        const uniqueBrands = [...new Set(products.map((p: any) => p.thuongHieu).filter(Boolean))];
        setBrands(uniqueBrands as string[]);
      }
    } catch (error) {
      console.error('Lỗi khi tải thương hiệu:', error);
    }
    setLoadingBrands(false);
  };

  const toggleArrayFilter = (key: 'brands' | 'sizes' | 'colors', value: string) => {
    const current = filters[key];
    const updated = current.includes(value)
      ? current.filter((v: string) => v !== value)
      : [...current, value];
    onChange({ ...filters, [key]: updated });
  };

  return (
    <div className="space-y-4">
      {/* Main Horizontal Filters */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sắp xếp</label>
              <select
                value={filters.sort}
                onChange={(e) => onChange({ ...filters, sort: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="newest">Mới nhất</option>
                <option value="price-low">Giá thấp → cao</option>
                <option value="price-high">Giá cao → thấp</option>
                <option value="popular">Bán chạy</option>
                <option value="rating">Đánh giá cao</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục</label>
              {loadingCategories ? (
                <div className="h-[38px] bg-gray-200 rounded-md animate-pulse" />
              ) : (
                <select
                  value={filters.category}
                  onChange={(e) => onChange({ ...filters, category: e.target.value, productType: '' })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Tất cả</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.ten}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Product Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Loại sản phẩm</label>
              <select
                value={filters.productType}
                onChange={(e) => onChange({ ...filters, productType: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={!filters.category || availableProductTypes.length === 0}
              >
                <option value="">Tất cả</option>
                {availableProductTypes.map((type, index) => (
                  <option key={index} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Brand */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Thương hiệu</label>
              {loadingBrands ? (
                <div className="h-[38px] bg-gray-200 rounded-md animate-pulse" />
              ) : (
                <select
                  value={filters.brands.length > 0 ? filters.brands[0] : ''}
                  onChange={(e) => onChange({ ...filters, brands: e.target.value ? [e.target.value] : [] })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Tất cả</option>
                  {brands.sort().map((brand) => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Size giày</label>
              <select
                value={filters.sizes.length > 0 ? filters.sizes[0] : ''}
                onChange={(e) => onChange({ ...filters, sizes: e.target.value ? [e.target.value] : [] })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tất cả</option>
                {['38', '39', '40', '41', '42', '43', '44', '45'].map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>

            {/* Size Clothing */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Size quần áo</label>
              <select
                value={filters.sizes.length > 0 && !['38', '39', '40', '41', '42', '43', '44', '45'].includes(filters.sizes[0]) ? filters.sizes[0] : ''}
                onChange={(e) => onChange({ ...filters, sizes: e.target.value ? [e.target.value] : [] })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tất cả</option>
                {['S', 'M', 'L', 'XL', '2XL', '3XL'].map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Filters */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Bộ lọc bổ sung</h3>
            <button
              onClick={() => onChange({
                category: '',
                productType: '',
                priceRange: [0, 10000000],
                brands: [],
                sizes: [],
                colors: [],
                rating: 0,
                sort: 'newest'
              })}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline"
            >
              Xóa bộ lọc
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Price Range */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Khoảng giá</h4>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="0"
                  value={filters.priceRange[0]}
                  onChange={(e) => onChange({ ...filters, priceRange: [+e.target.value, filters.priceRange[1]] })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  placeholder="10000000"
                  value={filters.priceRange[1]}
                  onChange={(e) => onChange({ ...filters, priceRange: [filters.priceRange[0], +e.target.value] })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Colors */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Màu sắc</h4>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => toggleArrayFilter('colors', color.name)}
                    className={`w-9 h-9 rounded-full border-2 transition-all ${
                      filters.colors.includes(color.name)
                        ? 'border-blue-600 scale-110'
                        : 'border-gray-300 hover:scale-105'
                    }`}
                    style={{
                      backgroundColor: color.code,
                      boxShadow: filters.colors.includes(color.name) ? '0 0 0 2px white, 0 0 0 4px #3B82F6' : 'none'
                    }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
