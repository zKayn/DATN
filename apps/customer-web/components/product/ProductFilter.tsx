'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface FilterProps {
  filters: {
    category: string;
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
}

export default function ProductFilter({ filters, onChange }: FilterProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
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
    <div className="space-y-6">
      {/* Sort */}
      <div className="bg-white rounded-lg p-4 border">
        <h3 className="font-semibold text-gray-900 mb-3">Sắp Xếp</h3>
        <select
          value={filters.sort}
          onChange={(e) => onChange({ ...filters, sort: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="newest">Mới nhất</option>
          <option value="price-low">Giá thấp → cao</option>
          <option value="price-high">Giá cao → thấp</option>
          <option value="popular">Bán chạy</option>
          <option value="rating">Đánh giá cao</option>
        </select>
      </div>

      {/* Category */}
      <div className="bg-white rounded-lg p-4 border">
        <h3 className="font-semibold text-gray-900 mb-3">Danh Mục</h3>
        {loadingCategories ? (
          <div className="animate-pulse space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-5 bg-gray-200 rounded" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="category"
                checked={filters.category === ''}
                onChange={() => onChange({ ...filters, category: '' })}
                className="w-4 h-4 text-blue-600"
              />
              <span className="ml-2 text-sm text-gray-700">Tất cả</span>
            </label>
            {categories.map((cat) => (
              <label key={cat._id} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  checked={filters.category === cat._id}
                  onChange={() => onChange({ ...filters, category: cat._id })}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700">{cat.ten}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="bg-white rounded-lg p-4 border">
        <h3 className="font-semibold text-gray-900 mb-3">Khoảng Giá</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Từ"
              value={filters.priceRange[0]}
              onChange={(e) => onChange({ ...filters, priceRange: [+e.target.value, filters.priceRange[1]] })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
            <span className="text-gray-500">-</span>
            <input
              type="number"
              placeholder="Đến"
              value={filters.priceRange[1]}
              onChange={(e) => onChange({ ...filters, priceRange: [filters.priceRange[0], +e.target.value] })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
          <div className="text-xs text-gray-500 text-center">
            {filters.priceRange[0].toLocaleString('vi-VN')} ₫ - {filters.priceRange[1].toLocaleString('vi-VN')} ₫
          </div>
        </div>
      </div>

      {/* Brands */}
      {brands.length > 0 && (
        <div className="bg-white rounded-lg p-4 border">
          <h3 className="font-semibold text-gray-900 mb-3">Thương Hiệu</h3>
          {loadingBrands ? (
            <div className="animate-pulse space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-5 bg-gray-200 rounded" />
              ))}
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {brands.sort().map((brand) => (
                <label key={brand} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.brands.includes(brand)}
                    onChange={() => toggleArrayFilter('brands', brand)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{brand}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sizes */}
      <div className="bg-white rounded-lg p-4 border">
        <h3 className="font-semibold text-gray-900 mb-3">Kích Thước</h3>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => toggleArrayFilter('sizes', size)}
              className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                filters.sizes.includes(size)
                  ? 'border-blue-600 bg-blue-50 text-blue-600'
                  : 'border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div className="bg-white rounded-lg p-4 border">
        <h3 className="font-semibold text-gray-900 mb-3">Màu Sắc</h3>
        <div className="flex flex-wrap gap-3">
          {colors.map((color) => (
            <button
              key={color.name}
              onClick={() => toggleArrayFilter('colors', color.name)}
              className={`w-10 h-10 rounded-full border-2 transition-all ${
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

      {/* Rating */}
      <div className="bg-white rounded-lg p-4 border">
        <h3 className="font-semibold text-gray-900 mb-3">Đánh Giá</h3>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <label key={rating} className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="rating"
                checked={filters.rating === rating}
                onChange={() => onChange({ ...filters, rating })}
                className="w-4 h-4 text-blue-600"
              />
              <div className="ml-2 flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
                <span className="ml-1 text-sm text-gray-600">trở lên</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Reset Button */}
      <button
        onClick={() => onChange({
          category: '',
          priceRange: [0, 10000000],
          brands: [],
          sizes: [],
          colors: [],
          rating: 0,
          sort: 'newest'
        })}
        className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium"
      >
        Xóa Bộ Lọc
      </button>
    </div>
  );
}
