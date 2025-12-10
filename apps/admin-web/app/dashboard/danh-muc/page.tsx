'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface Category {
  _id: string;
  ten: string;
  slug: string;
  moTa?: string;
  hinhAnh?: string;
  loaiSanPham?: string[];
  thuTu: number;
  trangThai: 'active' | 'inactive';
  createdAt: string;
}

export default function CategoriesManagementPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    ten: '',
    moTa: '',
    hinhAnh: '',
    loaiSanPham: [] as string[],
    thuTu: 0,
    trangThai: 'active' as 'active' | 'inactive'
  });
  const [newProductType, setNewProductType] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await api.getCategories();
      if (response.success && response.data) {
        // Handle both array and object with categories property
        const responseData = response.data as any;
        const data = Array.isArray(responseData) ? responseData : responseData.categories || [];
        setCategories(data);
      } else if (response.error) {
        console.error('Lỗi khi tải danh mục:', response.error);
        // Don't show alert for auth errors, just show empty state
      }
    } catch (error) {
      console.error('Lỗi khi tải danh mục:', error);
    }
    setLoading(false);
  };

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingId(category._id);
      setFormData({
        ten: category.ten,
        moTa: category.moTa || '',
        hinhAnh: category.hinhAnh || '',
        loaiSanPham: category.loaiSanPham || [],
        thuTu: category.thuTu,
        trangThai: category.trangThai
      });
    } else {
      setEditingId(null);
      setFormData({
        ten: '',
        moTa: '',
        hinhAnh: '',
        loaiSanPham: [],
        thuTu: categories.length,
        trangThai: 'active'
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setNewProductType('');
    setFormData({
      ten: '',
      moTa: '',
      hinhAnh: '',
      loaiSanPham: [],
      thuTu: 0,
      trangThai: 'active'
    });
  };

  const handleAddProductType = () => {
    if (newProductType.trim()) {
      if (!formData.loaiSanPham.includes(newProductType.trim())) {
        setFormData({
          ...formData,
          loaiSanPham: [...formData.loaiSanPham, newProductType.trim()]
        });
        setNewProductType('');
      } else {
        alert('Loại sản phẩm này đã tồn tại!');
      }
    }
  };

  const handleRemoveProductType = (index: number) => {
    const newTypes = formData.loaiSanPham.filter((_, i) => i !== index);
    setFormData({ ...formData, loaiSanPham: newTypes });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = editingId
      ? await api.updateCategory(editingId, formData)
      : await api.createCategory(formData);

    if (response.success) {
      alert(editingId ? 'Cập nhật danh mục thành công!' : 'Thêm danh mục thành công!');
      handleCloseModal();
      loadCategories();
    } else {
      alert('Lỗi: ' + response.error);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa danh mục "${name}"?`)) return;

    const response = await api.deleteCategory(id);
    if (response.success) {
      alert('Xóa danh mục thành công!');
      loadCategories();
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
            <h1 className="text-3xl font-bold text-gray-900">Quản Lý Danh Mục</h1>
            <p className="text-gray-600 mt-2">Quản lý các danh mục sản phẩm</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Thêm Danh Mục
          </button>
        </div>

        {/* Categories Grid */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 mt-4">Đang tải dữ liệu...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có danh mục nào</h3>
              <p className="text-gray-600 mb-6">Bắt đầu bằng cách thêm danh mục đầu tiên</p>
              <button
                onClick={() => handleOpenModal()}
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Thêm Danh Mục
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {categories.map((category) => (
                <div
                  key={category._id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{category.ten}</h3>
                      <p className="text-sm text-gray-600">{category.moTa || 'Không có mô tả'}</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        category.trangThai === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {category.trangThai === 'active' ? 'Hoạt động' : 'Tạm ẩn'}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600 mb-4 space-y-1">
                    <p>Thứ tự: {category.thuTu}</p>
                    <p>Slug: {category.slug}</p>
                    {category.loaiSanPham && category.loaiSanPham.length > 0 && (
                      <div className="mt-2">
                        <p className="font-medium text-gray-700 mb-1">Loại sản phẩm:</p>
                        <div className="flex flex-wrap gap-1">
                          {category.loaiSanPham.map((type, idx) => (
                            <span
                              key={idx}
                              className="inline-block bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs"
                            >
                              {type}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <button
                      onClick={() => handleOpenModal(category)}
                      className="flex-1 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(category._id, category.ten)}
                      className="flex-1 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors font-medium"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingId ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục Mới'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-500 hover:text-gray-700 p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Tên danh mục <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.ten}
                    onChange={(e) => setFormData({ ...formData, ten: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Giày Thể Thao"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Mô tả</label>
                  <textarea
                    value={formData.moTa}
                    onChange={(e) => setFormData({ ...formData, moTa: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 h-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Mô tả về danh mục..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Hình ảnh (URL)</label>
                  <input
                    type="url"
                    value={formData.hinhAnh}
                    onChange={(e) => setFormData({ ...formData, hinhAnh: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Loại sản phẩm</label>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newProductType}
                        onChange={(e) => setNewProductType(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddProductType();
                          }
                        }}
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nhập loại sản phẩm (VD: Giày chạy bộ, Giày đá bóng...)"
                      />
                      <button
                        type="button"
                        onClick={handleAddProductType}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium whitespace-nowrap"
                      >
                        Thêm
                      </button>
                    </div>

                    {formData.loaiSanPham.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {formData.loaiSanPham.map((type, index) => (
                          <div
                            key={index}
                            className="relative border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"
                          >
                            <button
                              type="button"
                              onClick={() => handleRemoveProductType(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 transition-colors text-xs"
                            >
                              ×
                            </button>
                            <p className="text-sm text-gray-900 pr-3">{type}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Thứ tự hiển thị</label>
                  <input
                    type="number"
                    value={formData.thuTu}
                    onChange={(e) => setFormData({ ...formData, thuTu: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">Trạng thái</label>
                  <div className="flex gap-6">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="active"
                        checked={formData.trangThai === 'active'}
                        onChange={(e) => setFormData({ ...formData, trangThai: e.target.value as 'active' })}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="ml-2 text-gray-900">Hoạt động</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="inactive"
                        checked={formData.trangThai === 'inactive'}
                        onChange={(e) => setFormData({ ...formData, trangThai: e.target.value as 'inactive' })}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="ml-2 text-gray-900">Tạm ẩn</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    {editingId ? 'Cập Nhật' : 'Thêm Danh Mục'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
