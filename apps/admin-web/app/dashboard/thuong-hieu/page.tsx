'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface Brand {
  _id: string;
  ten: string;
  slug: string;
  moTa?: string;
  logo?: string;
  thuTu: number;
  trangThai: 'active' | 'inactive';
  createdAt: string;
}

export default function BrandsManagementPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    ten: '',
    moTa: '',
    logo: '',
    thuTu: 0,
    trangThai: 'active' as 'active' | 'inactive'
  });

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    setLoading(true);
    try {
      const response = await api.getBrands();
      if (response.success && response.data) {
        const responseData = response.data as any;
        const data = Array.isArray(responseData) ? responseData : responseData.brands || [];
        setBrands(data);
      } else if (response.error) {
        console.error('Lỗi khi tải thương hiệu:', response.error);
      }
    } catch (error) {
      console.error('Lỗi khi tải thương hiệu:', error);
    }
    setLoading(false);
  };

  const handleOpenModal = (brand?: Brand) => {
    if (brand) {
      setEditingId(brand._id);
      setFormData({
        ten: brand.ten,
        moTa: brand.moTa || '',
        logo: brand.logo || '',
        thuTu: brand.thuTu,
        trangThai: brand.trangThai
      });
    } else {
      setEditingId(null);
      setFormData({
        ten: '',
        moTa: '',
        logo: '',
        thuTu: brands.length,
        trangThai: 'active'
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      ten: '',
      moTa: '',
      logo: '',
      thuTu: 0,
      trangThai: 'active'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = editingId
        ? await api.updateBrand(editingId, formData)
        : await api.createBrand(formData);

      if (response.success) {
        toast.success(editingId ? 'Cập nhật thương hiệu thành công!' : 'Thêm thương hiệu thành công!');
        handleCloseModal();
        loadBrands();
      } else {
        toast.error('Lỗi: ' + response.error);
      }
    } catch (error: any) {
      toast.error(error.message || 'Đã có lỗi xảy ra');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa thương hiệu này?')) return;

    try {
      const response = await api.deleteBrand(id);
      if (response.success) {
        toast.success('Xóa thương hiệu thành công!');
        loadBrands();
      } else {
        toast.error('Lỗi: ' + response.error);
      }
    } catch (error: any) {
      toast.error(error.message || 'Đã có lỗi xảy ra');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-4">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Quản Lý Thương Hiệu</h1>
                <p className="text-gray-600 mt-2">Quản lý danh sách thương hiệu sản phẩm</p>
              </div>
              <button
                onClick={() => handleOpenModal()}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Thêm Thương Hiệu
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tổng số thương hiệu</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{brands.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Đang hoạt động</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                      {brands.filter(b => b.trangThai === 'active').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Không hoạt động</p>
                    <p className="text-2xl font-bold text-red-600 mt-1">
                      {brands.filter(b => b.trangThai === 'inactive').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        STT
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Thương hiệu
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Slug
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Mô tả
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Trạng thái
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Thứ tự
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {brands.map((brand, index) => (
                      <tr key={brand._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900">{index + 1}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {brand.logo && (
                              <img
                                src={brand.logo}
                                alt={brand.ten}
                                className="w-10 h-10 rounded object-cover mr-3"
                              />
                            )}
                            <div className="text-sm font-medium text-gray-900">{brand.ten}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {brand.slug}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="max-w-xs truncate">
                            {brand.moTa || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            brand.trangThai === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {brand.trangThai === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {brand.thuTu}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleOpenModal(brand)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(brand._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {brands.length === 0 && (
                <div className="p-12 text-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có thương hiệu nào</h3>
                  <p className="text-gray-600">Bắt đầu bằng cách thêm thương hiệu đầu tiên</p>
                </div>
              )}
            </div>

            {/* Modal */}
            {showModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {editingId ? 'Chỉnh Sửa Thương Hiệu' : 'Thêm Thương Hiệu Mới'}
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

                  <div className="p-6">
                    <form onSubmit={handleSubmit}>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">
                            Tên thương hiệu <span className="text-red-600">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.ten}
                            onChange={(e) => setFormData({ ...formData, ten: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="VD: Nike, Adidas..."
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">
                            Mô tả
                          </label>
                          <textarea
                            value={formData.moTa}
                            onChange={(e) => setFormData({ ...formData, moTa: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 h-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Mô tả ngắn về thương hiệu..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">
                            URL Logo
                          </label>
                          <input
                            type="url"
                            value={formData.logo}
                            onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="https://example.com/logo.png"
                          />
                          {formData.logo && (
                            <div className="mt-2">
                              <img
                                src={formData.logo}
                                alt="Logo preview"
                                className="w-20 h-20 object-cover rounded border border-gray-300"
                              />
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                              Thứ tự hiển thị
                            </label>
                            <input
                              type="number"
                              value={formData.thuTu}
                              onChange={(e) => setFormData({ ...formData, thuTu: parseInt(e.target.value) })}
                              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              min="0"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                              Trạng thái
                            </label>
                            <select
                              value={formData.trangThai}
                              onChange={(e) => setFormData({ ...formData, trangThai: e.target.value as 'active' | 'inactive' })}
                              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="active">Hoạt động</option>
                              <option value="inactive">Không hoạt động</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4 pt-4 border-t mt-6">
                        <button
                          type="submit"
                          className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                        >
                          {editingId ? 'Cập Nhật' : 'Thêm Mới'}
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
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
