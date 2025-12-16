'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';

interface Product {
  _id: string;
  ten: string;
  slug: string;
  gia: number;
  giaKhuyenMai?: number;
  hinhAnh: string[];
  danhMuc: {
    _id: string;
    ten: string;
    loaiSanPham?: string[];
  };
  loaiSanPham?: string;
  thuongHieu: string;
  soLuongTonKho: number;
  daBan: number;
  trangThai: 'active' | 'inactive';
  createdAt: string;
}

interface Category {
  _id: string;
  ten: string;
  loaiSanPham?: string[];
}

interface Brand {
  _id: string;
  ten: string;
}

export default function ProductsManagementPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProductType, setSelectedProductType] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [availableProductTypes, setAvailableProductTypes] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadCategories();
    loadBrands();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [currentPage, searchTerm, selectedCategory, selectedProductType, selectedBrand, selectedStatus]);

  useEffect(() => {
    // Cập nhật loại sản phẩm khi chọn danh mục
    if (selectedCategory) {
      const category = categories.find(cat => cat._id === selectedCategory);
      if (category && category.loaiSanPham) {
        setAvailableProductTypes(category.loaiSanPham);
      } else {
        setAvailableProductTypes([]);
      }
      setSelectedProductType(''); // Reset loại sản phẩm khi đổi danh mục
    } else {
      setAvailableProductTypes([]);
      setSelectedProductType('');
    }
  }, [selectedCategory, categories]);

  const loadCategories = async () => {
    try {
      const response = await api.getCategories();
      if (response.success && response.data) {
        const responseData = response.data as any;
        const data = Array.isArray(responseData) ? responseData : responseData.categories || [];
        setCategories(data);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh mục:', error);
    }
  };

  const loadBrands = async () => {
    try {
      const response = await api.getBrands();
      if (response.success && response.data) {
        const responseData = response.data as any;
        const data = Array.isArray(responseData) ? responseData : responseData.brands || [];
        setBrands(data);
      }
    } catch (error) {
      console.error('Lỗi khi tải thương hiệu:', error);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        trangThai: selectedStatus || 'all', // Show all products if no status filter selected
      };

      if (selectedCategory) params.danhMuc = selectedCategory;
      if (selectedProductType) params.loaiSanPham = selectedProductType;
      if (selectedBrand) params.thuongHieu = selectedBrand;

      const response = await api.getProducts(params);

      if (response.success && response.data) {
        const responseData = response.data as any;
        const products = Array.isArray(responseData)
          ? responseData
          : (responseData.products || []);
        setProducts(products);

        // Use pagination.pages from API response if available
        const pagination = (response as any).pagination;
        if (pagination?.pages) {
          setTotalPages(pagination.pages);
        } else if (pagination?.total) {
          setTotalPages(Math.ceil(pagination.total / itemsPerPage));
        } else {
          setTotalPages(Math.ceil(products.length / itemsPerPage));
        }
      } else if (response.error) {
        console.error('Lỗi khi tải sản phẩm:', response.error);
        // Don't show alert for auth errors, just show empty state
      }
    } catch (error) {
      console.error('Lỗi khi tải sản phẩm:', error);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}"?`)) return;

    const response = await api.deleteProduct(id);
    if (response.success) {
      alert('Xóa sản phẩm thành công!');
      loadProducts();
    } else {
      alert('Lỗi: ' + response.error);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const response = await api.updateProduct(id, { trangThai: newStatus });

    if (response.success) {
      alert('Cập nhật trạng thái thành công!');
      loadProducts();
    } else {
      alert('Lỗi: ' + response.error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản Lý Sản Phẩm</h1>
            <p className="text-gray-600 mt-2">Quản lý toàn bộ sản phẩm trong hệ thống</p>
          </div>
          <Link
            href="/dashboard/san-pham/them-moi"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Thêm Sản Phẩm Mới
          </Link>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm theo tên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setSelectedProductType('');
                  setSelectedBrand('');
                  setSelectedStatus('');
                  setSearchTerm('');
                }}
                className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-200 transition-colors font-medium whitespace-nowrap"
              >
                Xóa bộ lọc
              </button>
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.ten}
                  </option>
                ))}
              </select>

              {/* Product Type Filter */}
              <select
                value={selectedProductType}
                onChange={(e) => setSelectedProductType(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                disabled={!selectedCategory || availableProductTypes.length === 0}
              >
                <option value="">Tất cả loại sản phẩm</option>
                {availableProductTypes.map((type, index) => (
                  <option key={index} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              {/* Brand Filter */}
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">Tất cả thương hiệu</option>
                {brands.map((brand) => (
                  <option key={brand._id} value={brand.ten}>
                    {brand.ten}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="active">Đang bán</option>
                <option value="inactive">Tạm ẩn</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 mt-4">Đang tải dữ liệu...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có sản phẩm nào</h3>
              <p className="text-gray-600 mb-6">Bắt đầu bằng cách thêm sản phẩm đầu tiên</p>
              <Link
                href="/dashboard/san-pham/them-moi"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Thêm Sản Phẩm Mới
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Sản phẩm</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Danh mục</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Giá</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tồn kho</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Đã bán</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Trạng thái</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {products.map((product) => {
                      const finalPrice = product.giaKhuyenMai || product.gia;
                      const discount = product.giaKhuyenMai
                        ? Math.round((1 - product.giaKhuyenMai / product.gia) * 100)
                        : 0;

                      return (
                        <tr key={product._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                {product.hinhAnh?.[0] ? (
                                  <Image
                                    src={product.hinhAnh[0]}
                                    alt={product.ten}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-gray-900 truncate">{product.ten}</p>
                                <p className="text-sm text-gray-600">{product.thuongHieu}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-900">
                              {product.danhMuc?.ten || 'Chưa phân loại'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-semibold text-gray-900">
                                ₫{finalPrice.toLocaleString('vi-VN')}
                              </p>
                              {product.giaKhuyenMai && (
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-sm text-gray-500 line-through">
                                    ₫{product.gia.toLocaleString('vi-VN')}
                                  </span>
                                  <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">
                                    -{discount}%
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`font-medium ${product.soLuongTonKho < 10 ? 'text-red-600' : 'text-gray-900'}`}>
                              {product.soLuongTonKho}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-900">{product.daBan}</span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleToggleStatus(product._id, product.trangThai)}
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                product.trangThai === 'active'
                                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {product.trangThai === 'active' ? 'Đang bán' : 'Tạm ẩn'}
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={`/dashboard/san-pham/chinh-sua/${product._id}`}
                                className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-50 rounded transition-colors"
                                title="Chỉnh sửa"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </Link>
                              <button
                                onClick={() => handleDelete(product._id, product.ten)}
                                className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded transition-colors"
                                title="Xóa"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Trang {currentPage} / {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Trước
                    </button>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
