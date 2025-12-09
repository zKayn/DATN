'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface Category {
  _id: string;
  ten: string;
}

interface Brand {
  _id: string;
  ten: string;
  slug: string;
}

interface Product {
  _id: string;
  ten: string;
  moTa: string;
  moTaChiTiet: string;
  gia: number;
  giaKhuyenMai?: number;
  danhMuc: string;
  thuongHieu: string;
  hinhAnh: string[];
  kichThuoc: string[];
  mauSac: Array<{ ten: string; ma: string }>;
  soLuongTonKho: number;
  trangThai: 'active' | 'inactive';
  dacDiem: string[];
  thongSoKyThuat: Record<string, string>;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [formData, setFormData] = useState<Product>({
    _id: '',
    ten: '',
    moTa: '',
    moTaChiTiet: '',
    gia: 0,
    giaKhuyenMai: 0,
    danhMuc: '',
    thuongHieu: '',
    hinhAnh: [''],
    kichThuoc: ['S', 'M', 'L', 'XL'],
    mauSac: [{ ten: 'Đen', ma: '#000000' }],
    soLuongTonKho: 0,
    trangThai: 'active',
    dacDiem: [''],
    thongSoKyThuat: {}
  });

  useEffect(() => {
    loadCategories();
    loadBrands();
    loadProduct();
  }, [productId]);

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

  const loadProduct = async () => {
    try {
      const response = await api.getProducts({});
      if (response.success && response.data) {
        const products = response.data as any[];
        const product = products.find((p: any) => p._id === productId);
        if (product) {
          setFormData({
            ...product,
            danhMuc: product.danhMuc?._id || product.danhMuc || '',
            hinhAnh: product.hinhAnh && product.hinhAnh.length > 0 ? product.hinhAnh : [''],
            dacDiem: product.dacDiem && product.dacDiem.length > 0 ? product.dacDiem : [''],
            mauSac: product.mauSac && product.mauSac.length > 0 ? product.mauSac : [{ ten: 'Đen', ma: '#000000' }],
            kichThuoc: product.kichThuoc && product.kichThuoc.length > 0 ? product.kichThuoc : ['S', 'M', 'L', 'XL'],
            thongSoKyThuat: product.thongSoKyThuat || {}
          });
        }
      }
    } catch (error: any) {
      console.error('Lỗi khi tải sản phẩm:', error);
      toast.error(error.message || 'Không thể tải thông tin sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const cleanData = {
        ten: formData.ten,
        moTa: formData.moTa,
        moTaChiTiet: formData.moTaChiTiet,
        gia: Number(formData.gia),
        giaKhuyenMai: formData.giaKhuyenMai ? Number(formData.giaKhuyenMai) : undefined,
        danhMuc: formData.danhMuc,
        thuongHieu: formData.thuongHieu,
        hinhAnh: formData.hinhAnh.filter(url => url.trim()),
        kichThuoc: formData.kichThuoc,
        mauSac: formData.mauSac,
        soLuongTonKho: Number(formData.soLuongTonKho),
        trangThai: formData.trangThai,
        dacDiem: formData.dacDiem.filter(item => item.trim()),
        thongSoKyThuat: formData.thongSoKyThuat
      };

      const response = await api.updateProduct(productId, cleanData);

      if (response.success) {
        toast.success('Cập nhật sản phẩm thành công!');
        router.push('/dashboard/san-pham');
      } else {
        toast.error(response.error || 'Có lỗi xảy ra');
      }
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast.error(error.message || 'Không thể cập nhật sản phẩm');
    } finally {
      setSaving(false);
    }
  };

  const addImageField = () => {
    setFormData({ ...formData, hinhAnh: [...formData.hinhAnh, ''] });
  };

  const updateImage = (index: number, value: string) => {
    const newImages = [...formData.hinhAnh];
    newImages[index] = value;
    setFormData({ ...formData, hinhAnh: newImages });
  };

  const removeImage = (index: number) => {
    if (formData.hinhAnh.length > 1) {
      const newImages = formData.hinhAnh.filter((_, i) => i !== index);
      setFormData({ ...formData, hinhAnh: newImages });
    }
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
    if (formData.dacDiem.length > 1) {
      const newFeatures = formData.dacDiem.filter((_, i) => i !== index);
      setFormData({ ...formData, dacDiem: newFeatures });
    }
  };

  const addColor = () => {
    setFormData({ ...formData, mauSac: [...formData.mauSac, { ten: '', ma: '#000000' }] });
  };

  const updateColor = (index: number, field: 'ten' | 'ma', value: string) => {
    const newColors = [...formData.mauSac];
    newColors[index][field] = value;
    setFormData({ ...formData, mauSac: newColors });
  };

  const removeColor = (index: number) => {
    if (formData.mauSac.length > 1) {
      const newColors = formData.mauSac.filter((_, i) => i !== index);
      setFormData({ ...formData, mauSac: newColors });
    }
  };

  const addSpec = () => {
    const key = prompt('Nhập tên thông số kỹ thuật:');
    if (key && key.trim()) {
      setFormData({
        ...formData,
        thongSoKyThuat: { ...formData.thongSoKyThuat, [key]: '' }
      });
    }
  };

  const updateSpec = (key: string, value: string) => {
    setFormData({
      ...formData,
      thongSoKyThuat: { ...formData.thongSoKyThuat, [key]: value }
    });
  };

  const removeSpec = (key: string) => {
    const newSpecs = { ...formData.thongSoKyThuat };
    delete newSpecs[key];
    setFormData({ ...formData, thongSoKyThuat: newSpecs });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Chỉnh Sửa Sản Phẩm</h1>
        <p className="text-gray-600">Cập nhật thông tin sản phẩm</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold">Thông Tin Cơ Bản</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm *</label>
            <input
              type="text"
              required
              value={formData.ten}
              onChange={(e) => setFormData({ ...formData, ten: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả ngắn *</label>
            <textarea
              required
              value={formData.moTa}
              onChange={(e) => setFormData({ ...formData, moTa: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết</label>
            <textarea
              value={formData.moTaChiTiet}
              onChange={(e) => setFormData({ ...formData, moTaChiTiet: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={5}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục *</label>
              <select
                required
                value={formData.danhMuc}
                onChange={(e) => setFormData({ ...formData, danhMuc: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Chọn danh mục</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.ten}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thương hiệu *</label>
              <select
                required
                value={formData.thuongHieu}
                onChange={(e) => setFormData({ ...formData, thuongHieu: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Chọn thương hiệu</option>
                {brands.map((brand) => (
                  <option key={brand._id} value={brand.ten}>
                    {brand.ten}
                  </option>
                ))}
              </select>
              {brands.length === 0 && (
                <p className="mt-1 text-sm text-gray-500">
                  Chưa có thương hiệu nào. Vui lòng thêm thương hiệu mới trong phần quản lý thương hiệu.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold">Giá & Tồn Kho</h2>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giá gốc (₫) *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.gia}
                onChange={(e) => setFormData({ ...formData, gia: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giá khuyến mãi (₫)</label>
              <input
                type="number"
                min="0"
                value={formData.giaKhuyenMai || ''}
                onChange={(e) => setFormData({ ...formData, giaKhuyenMai: Number(e.target.value) || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tồn kho *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.soLuongTonKho}
                onChange={(e) => setFormData({ ...formData, soLuongTonKho: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Hình Ảnh</h2>
            <button
              type="button"
              onClick={addImageField}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              + Thêm hình
            </button>
          </div>

          {formData.hinhAnh.map((url, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => updateImage(index, e.target.value)}
                placeholder={`URL hình ${index + 1}`}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {formData.hinhAnh.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="px-3 py-2 text-red-600 hover:text-red-700"
                >
                  Xóa
                </button>
              )}
            </div>
          ))}
        </div>

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

        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Đặc Điểm Nổi Bật</h2>
            <button
              type="button"
              onClick={addFeature}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              + Thêm đặc điểm
            </button>
          </div>

          {formData.dacDiem.map((feature, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={feature}
                onChange={(e) => updateFeature(index, e.target.value)}
                placeholder={`Đặc điểm ${index + 1}`}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {formData.dacDiem.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeFeature(index)}
                  className="px-3 py-2 text-red-600 hover:text-red-700"
                >
                  Xóa
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Thông Số Kỹ Thuật</h2>
            <button
              type="button"
              onClick={addSpec}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              + Thêm thông số
            </button>
          </div>

          {Object.entries(formData.thongSoKyThuat).map(([key, value]) => (
            <div key={key} className="flex gap-2">
              <input
                type="text"
                value={key}
                disabled
                className="w-1/3 px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
              />
              <input
                type="text"
                value={value}
                onChange={(e) => updateSpec(key, e.target.value)}
                placeholder="Giá trị"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => removeSpec(key)}
                className="px-3 py-2 text-red-600 hover:text-red-700"
              >
                Xóa
              </button>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="status"
              checked={formData.trangThai === 'active'}
              onChange={(e) => setFormData({ ...formData, trangThai: e.target.checked ? 'active' : 'inactive' })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="status" className="text-sm font-medium text-gray-700">
              Kích hoạt sản phẩm
            </label>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
          >
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}
