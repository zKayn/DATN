'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface Category {
  _id: string;
  ten: string;
  loaiSanPham?: string[];
}

interface Brand {
  _id: string;
  ten: string;
  slug: string;
}

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [sizeType, setSizeType] = useState<'clothing' | 'shoes'>('clothing');
  const [selectedCategoryTypes, setSelectedCategoryTypes] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    ten: '',
    moTa: '',
    moTaChiTiet: '',
    gia: 0,
    giaKhuyenMai: 0,
    danhMuc: '',
    loaiSanPham: '',
    thuongHieu: '',
    hinhAnh: [] as string[],
    kichThuoc: ['S', 'M', 'L', 'XL'],
    mauSac: [{ ten: 'Đen', ma: '#000000' }],
    soLuongTonKho: 0,
    trangThai: 'active' as 'active' | 'inactive',
    dacDiem: [''],
    thongSoKyThuat: {} as Record<string, string>
  });

  useEffect(() => {
    loadCategories();
    loadBrands();
  }, []);

  useEffect(() => {
    // Cập nhật loại sản phẩm khi chọn danh mục
    if (formData.danhMuc) {
      const selectedCategory = categories.find(cat => cat._id === formData.danhMuc);
      if (selectedCategory && selectedCategory.loaiSanPham) {
        setSelectedCategoryTypes(selectedCategory.loaiSanPham);
      } else {
        setSelectedCategoryTypes([]);
      }
      // Reset loại sản phẩm khi đổi danh mục
      setFormData(prev => ({ ...prev, loaiSanPham: '' }));
    }
  }, [formData.danhMuc, categories]);

  const loadCategories = async () => {
    try {
      const response = await api.getCategories();
      if (response.success && response.data) {
        const responseData = response.data as any;
        const data = Array.isArray(responseData) ? responseData : responseData.categories || [];
        setCategories(data);
      } else if (response.error) {
        console.error('Lỗi khi tải danh mục:', response.error);
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
      } else if (response.error) {
        console.error('Lỗi khi tải thương hiệu:', response.error);
      }
    } catch (error) {
      console.error('Lỗi khi tải thương hiệu:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that at least one image is uploaded
    if (formData.hinhAnh.length === 0) {
      toast.error('Vui lòng tải lên ít nhất một hình ảnh');
      return;
    }

    setLoading(true);

    try {
      // Filter out empty values
      const cleanData = {
        ...formData,
        dacDiem: formData.dacDiem.filter(item => item.trim()),
        giaKhuyenMai: formData.giaKhuyenMai || undefined
      };

      const response = await api.createProduct(cleanData);

      if (response.success) {
        toast.success('Thêm sản phẩm thành công!');
        router.push('/dashboard/san-pham');
      } else {
        toast.error(response.error || 'Không thể thêm sản phẩm');
      }
    } catch (error: any) {
      toast.error(error.message || 'Đã có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    setSelectedFiles(prev => [...prev, ...newFiles]);

    // Create preview URLs
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrls(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUploadImages = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Vui lòng chọn ảnh trước');
      return;
    }

    setUploading(true);
    try {
      const response = await api.uploadMultipleImages(selectedFiles);

      if (response.success && response.data) {
        const uploadedUrls = response.data.map((item: any) => item.url);
        setFormData(prev => ({
          ...prev,
          hinhAnh: [...prev.hinhAnh, ...uploadedUrls]
        }));

        // Clear selected files and previews
        setSelectedFiles([]);
        setPreviewUrls([]);

        toast.success(`Đã tải lên ${uploadedUrls.length} ảnh thành công`);
      } else {
        toast.error(response.message || 'Không thể tải ảnh lên');
      }
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi tải ảnh lên');
    } finally {
      setUploading(false);
    }
  };

  const removeUploadedImage = (index: number) => {
    const newImages = formData.hinhAnh.filter((_, i) => i !== index);
    setFormData({ ...formData, hinhAnh: newImages });
  };

  const removePreviewImage = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const addFeature = () => {
    setFormData({ ...formData, dacDiem: [...formData.dacDiem, ''] });
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...formData.dacDiem];
    newFeatures[index] = value;
    setFormData({ ...formData, dacDiem: newFeatures });
  };

  const removeFeature = (index: number) => {
    const newFeatures = formData.dacDiem.filter((_, i) => i !== index);
    setFormData({ ...formData, dacDiem: newFeatures });
  };

  const addColor = () => {
    setFormData({
      ...formData,
      mauSac: [...formData.mauSac, { ten: '', ma: '#000000' }]
    });
  };

  const updateColor = (index: number, field: 'ten' | 'ma', value: string) => {
    const newColors = [...formData.mauSac];
    newColors[index][field] = value;
    setFormData({ ...formData, mauSac: newColors });
  };

  const removeColor = (index: number) => {
    const newColors = formData.mauSac.filter((_, i) => i !== index);
    setFormData({ ...formData, mauSac: newColors });
  };

  const addSize = () => {
    setFormData({
      ...formData,
      kichThuoc: [...formData.kichThuoc, '']
    });
  };

  const updateSize = (index: number, value: string) => {
    const newSizes = [...formData.kichThuoc];
    newSizes[index] = value;
    setFormData({ ...formData, kichThuoc: newSizes });
  };

  const removeSize = (index: number) => {
    const newSizes = formData.kichThuoc.filter((_, i) => i !== index);
    setFormData({ ...formData, kichThuoc: newSizes });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Thêm Sản Phẩm Mới</h1>
          <p className="text-gray-600 mt-2">Điền thông tin để thêm sản phẩm mới vào hệ thống</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Thông Tin Cơ Bản</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Tên sản phẩm <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.ten}
                  onChange={(e) => setFormData({ ...formData, ten: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nike Air Max 2024"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Danh mục <span className="text-red-600">*</span>
                </label>
                <select
                  value={formData.danhMuc}
                  onChange={(e) => setFormData({ ...formData, danhMuc: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.ten}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCategoryTypes.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Loại sản phẩm
                  </label>
                  <select
                    value={formData.loaiSanPham}
                    onChange={(e) => setFormData({ ...formData, loaiSanPham: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Chọn loại sản phẩm</option>
                    {selectedCategoryTypes.map((type, index) => (
                      <option key={index} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Thương hiệu <span className="text-red-600">*</span>
                </label>
                <select
                  value={formData.thuongHieu}
                  onChange={(e) => setFormData({ ...formData, thuongHieu: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Chọn thương hiệu</option>
                  {brands.map((brand) => (
                    <option key={brand._id} value={brand.ten}>
                      {brand.ten}
                    </option>
                  ))}
                </select>
                {brands.length === 0 && (
                  <p className="mt-2 text-sm text-gray-500">
                    Chưa có thương hiệu nào. Vui lòng thêm thương hiệu mới trong phần quản lý thương hiệu.
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Mô tả ngắn <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={formData.moTa}
                  onChange={(e) => setFormData({ ...formData, moTa: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 h-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Mô tả ngắn về sản phẩm..."
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Mô tả chi tiết
                </label>
                <textarea
                  value={formData.moTaChiTiet}
                  onChange={(e) => setFormData({ ...formData, moTaChiTiet: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Mô tả chi tiết về sản phẩm..."
                />
              </div>
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Giá & Tồn Kho</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Giá gốc (₫) <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  value={formData.gia}
                  onChange={(e) => setFormData({ ...formData, gia: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="2500000"
                  required
                  min="0"
                />
                {formData.gia > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    {formData.gia.toLocaleString('vi-VN')}₫
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Giá khuyến mãi (₫)
                </label>
                <input
                  type="number"
                  value={formData.giaKhuyenMai}
                  onChange={(e) => setFormData({ ...formData, giaKhuyenMai: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="2000000"
                  min="0"
                />
                {formData.giaKhuyenMai > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    {formData.giaKhuyenMai.toLocaleString('vi-VN')}₫
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Số lượng tồn kho <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  value={formData.soLuongTonKho}
                  onChange={(e) => setFormData({ ...formData, soLuongTonKho: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="100"
                  required
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Hình Ảnh</h2>

            {/* File Upload Section */}
            <div className="mb-6">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Chọn ảnh
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
                {selectedFiles.length > 0 && (
                  <button
                    type="button"
                    onClick={handleUploadImages}
                    disabled={uploading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? 'Đang tải lên...' : `Tải lên (${selectedFiles.length})`}
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Chọn nhiều ảnh cùng lúc. Kích thước tối đa: 5MB/ảnh
              </p>
            </div>

            {/* Preview Selected Images */}
            {previewUrls.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Ảnh đã chọn (chưa tải lên)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2 border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => removePreviewImage(index)}
                        className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                        {selectedFiles[index]?.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Uploaded Images */}
            {formData.hinhAnh.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Ảnh đã tải lên ({formData.hinhAnh.length})</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.hinhAnh.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Product ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2 border-green-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeUploadedImage(index)}
                        className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <div className="absolute bottom-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                        Ảnh {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {formData.hinhAnh.length === 0 && previewUrls.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="mt-2 text-sm text-gray-500">Chưa có ảnh nào được chọn</p>
              </div>
            )}
          </div>

          {/* Colors */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Màu Sắc</h2>
              <button
                type="button"
                onClick={addColor}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Thêm màu
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.mauSac.map((color, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative">
                      <input
                        type="color"
                        value={color.ma}
                        onChange={(e) => updateColor(index, 'ma', e.target.value)}
                        className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-300"
                        title="Chọn màu"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={color.ten}
                        onChange={(e) => updateColor(index, 'ten', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Tên màu (VD: Đen, Trắng, Xanh...)"
                        required
                      />
                    </div>
                    {formData.mauSac.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeColor(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa màu"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium">Mã màu:</span>
                    <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">{color.ma}</code>
                  </div>
                </div>
              ))}
            </div>

            {formData.mauSac.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500">Chưa có màu sắc nào. Nhấn "Thêm màu" để thêm màu cho sản phẩm</p>
              </div>
            )}
          </div>

          {/* Sizes */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Kích Thước</h2>
              <button
                type="button"
                onClick={addSize}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Thêm kích thước
              </button>
            </div>

            {/* Size Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-900 mb-3">Loại kích thước</label>
              <div className="flex gap-4">
                <label className="flex items-center cursor-pointer px-4 py-3 border-2 rounded-lg transition-all hover:bg-gray-50"
                  style={{
                    borderColor: sizeType === 'clothing' ? '#2563eb' : '#d1d5db',
                    backgroundColor: sizeType === 'clothing' ? '#eff6ff' : 'white'
                  }}>
                  <input
                    type="radio"
                    name="sizeType"
                    value="clothing"
                    checked={sizeType === 'clothing'}
                    onChange={(e) => setSizeType(e.target.value as 'clothing' | 'shoes')}
                    className="w-4 h-4 text-blue-600 mr-3"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">Size quần áo</div>
                    <div className="text-xs text-gray-500">S, M, L, XL, XXL...</div>
                  </div>
                </label>
                <label className="flex items-center cursor-pointer px-4 py-3 border-2 rounded-lg transition-all hover:bg-gray-50"
                  style={{
                    borderColor: sizeType === 'shoes' ? '#2563eb' : '#d1d5db',
                    backgroundColor: sizeType === 'shoes' ? '#eff6ff' : 'white'
                  }}>
                  <input
                    type="radio"
                    name="sizeType"
                    value="shoes"
                    checked={sizeType === 'shoes'}
                    onChange={(e) => setSizeType(e.target.value as 'clothing' | 'shoes')}
                    className="w-4 h-4 text-blue-600 mr-3"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">Size giày</div>
                    <div className="text-xs text-gray-500">35, 36, 37, 38, 39...</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Quick Add Buttons */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Thêm nhanh</label>
              {sizeType === 'clothing' ? (
                <div className="flex flex-wrap gap-2">
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        if (!formData.kichThuoc.includes(size)) {
                          setFormData({ ...formData, kichThuoc: [...formData.kichThuoc, size] });
                        }
                      }}
                      className="px-3 py-1.5 text-sm border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      {size}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        if (!formData.kichThuoc.includes(size)) {
                          setFormData({ ...formData, kichThuoc: [...formData.kichThuoc, size] });
                        }
                      }}
                      className="px-3 py-1.5 text-sm border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      {size}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {formData.kichThuoc.map((size, index) => (
                <div key={index} className="relative border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors">
                  <input
                    type="text"
                    value={size}
                    onChange={(e) => updateSize(index, sizeType === 'clothing' ? e.target.value.toUpperCase() : e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-center font-semibold focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={sizeType === 'clothing' ? 'S' : '39'}
                    required
                  />
                  {formData.kichThuoc.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSize(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors flex items-center justify-center"
                      title="Xóa kích thước"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>

            {formData.kichThuoc.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500">Chưa có kích thước nào. Nhấn "Thêm kích thước" hoặc chọn từ các size phổ biến ở trên</p>
              </div>
            )}
          </div>

          {/* Features */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Đặc Điểm Nổi Bật</h2>
              <button
                type="button"
                onClick={addFeature}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                + Thêm đặc điểm
              </button>
            </div>

            <div className="space-y-3">
              {formData.dacDiem.map((feature, index) => (
                <div key={index} className="flex gap-3">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="VD: Công nghệ đệm Air Max cải tiến"
                  />
                  {formData.dacDiem.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="text-red-600 hover:text-red-700 px-3"
                    >
                      Xóa
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Trạng Thái</h2>
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
                <span className="ml-2 text-gray-900">Đang bán</span>
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

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang lưu...' : 'Thêm Sản Phẩm'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
