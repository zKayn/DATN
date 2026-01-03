'use client';

import { useState, useEffect } from 'react';

interface Address {
  _id?: string;
  hoTen: string;
  soDienThoai: string;
  tinh: string;
  huyen: string;
  xa: string;
  diaChiChiTiet: string;
  macDinh: boolean;
}

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: Address) => Promise<void>;
  address?: Address | null;
  mode: 'add' | 'edit';
}

export default function AddressModal({ isOpen, onClose, onSave, address, mode }: AddressModalProps) {
  const [formData, setFormData] = useState<Address>({
    hoTen: '',
    soDienThoai: '',
    tinh: '',
    huyen: '',
    xa: '',
    diaChiChiTiet: '',
    macDinh: false
  });
  const [saving, setSaving] = useState(false);

  // Location data
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  // Load provinces on mount
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        const response = await fetch('https://provinces.open-api.vn/api/p/');
        const data = await response.json();
        setProvinces(data);
      } catch (error) {
        console.error('Lỗi khi tải danh sách tỉnh/thành phố:', error);
      }
    };
    loadProvinces();
  }, []);

  useEffect(() => {
    if (address && mode === 'edit') {
      setFormData(address);
    } else {
      setFormData({
        hoTen: '',
        soDienThoai: '',
        tinh: '',
        huyen: '',
        xa: '',
        diaChiChiTiet: '',
        macDinh: false
      });
      // Reset location data when opening for add mode
      setDistricts([]);
      setWards([]);
    }
  }, [address, mode, isOpen]);

  // Handle province/city selection
  const handleCityChange = async (provinceCode: string) => {
    const selectedProvince = provinces.find(p => p.code.toString() === provinceCode);
    if (selectedProvince) {
      setFormData({ ...formData, tinh: selectedProvince.name, huyen: '', xa: '' });
      setWards([]);

      // Load districts
      try {
        const response = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
        const data = await response.json();
        setDistricts(data.districts || []);
      } catch (error) {
        console.error('Lỗi khi tải danh sách quận/huyện:', error);
      }
    }
  };

  // Handle district selection
  const handleDistrictChange = async (districtCode: string) => {
    const selectedDistrict = districts.find(d => d.code.toString() === districtCode);
    if (selectedDistrict) {
      setFormData({ ...formData, huyen: selectedDistrict.name, xa: '' });

      // Load wards
      try {
        const response = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
        const data = await response.json();
        setWards(data.wards || []);
      } catch (error) {
        console.error('Lỗi khi tải danh sách phường/xã:', error);
      }
    }
  };

  // Handle ward selection
  const handleWardChange = (wardCode: string) => {
    const selectedWard = wards.find(w => w.code.toString() === wardCode);
    if (selectedWard) {
      setFormData({ ...formData, xa: selectedWard.name });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving address:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === 'add' ? 'Thêm Địa Chỉ Mới' : 'Cập Nhật Địa Chỉ'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Họ và tên <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.hoTen}
                    onChange={(e) => setFormData({ ...formData, hoTen: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-700 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Số điện thoại <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.soDienThoai}
                    onChange={(e) => setFormData({ ...formData, soDienThoai: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-700 focus:border-transparent"
                    required
                    pattern="[0-9]{10,11}"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Tỉnh/Thành phố <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={provinces.find(p => p.name === formData.tinh)?.code || ''}
                    onChange={(e) => handleCityChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-700 focus:border-transparent"
                    required
                  >
                    <option value="">Chọn Tỉnh/Thành phố</option>
                    {provinces.map((province) => (
                      <option key={province.code} value={province.code}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Quận/Huyện <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={districts.find(d => d.name === formData.huyen)?.code || ''}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-700 focus:border-transparent disabled:bg-gray-100"
                    disabled={!formData.tinh}
                    required
                  >
                    <option value="">Chọn Quận/Huyện</option>
                    {districts.map((district) => (
                      <option key={district.code} value={district.code}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Phường/Xã <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={wards.find(w => w.name === formData.xa)?.code || ''}
                    onChange={(e) => handleWardChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-700 focus:border-transparent disabled:bg-gray-100"
                    disabled={!formData.huyen}
                    required
                  >
                    <option value="">Chọn Phường/Xã</option>
                    {wards.map((ward) => (
                      <option key={ward.code} value={ward.code}>
                        {ward.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Địa chỉ chi tiết <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={formData.diaChiChiTiet}
                  onChange={(e) => setFormData({ ...formData, diaChiChiTiet: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-700 focus:border-transparent"
                  placeholder="Số nhà, tên đường..."
                  rows={3}
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="macDinh"
                  checked={formData.macDinh}
                  onChange={(e) => setFormData({ ...formData, macDinh: e.target.checked })}
                  className="w-4 h-4 text-primary-500 rounded focus:ring-primary-700"
                />
                <label htmlFor="macDinh" className="ml-2 text-sm text-gray-900">
                  Đặt làm địa chỉ mặc định
                </label>
              </div>
            </div>

            <div className="mt-6 flex gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                disabled={saving}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-800 font-medium disabled:bg-primary-400"
                disabled={saving}
              >
                {saving ? 'Đang lưu...' : mode === 'add' ? 'Thêm Địa Chỉ' : 'Cập Nhật'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
