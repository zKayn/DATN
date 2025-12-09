'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface Voucher {
  _id: string;
  ma: string;
  loai: 'phan-tram' | 'so-tien';
  giaTriGiam: number;
  giamToiDa?: number;
  donToiThieu: number;
  soLuong: number;
  daSuDung: number;
  ngayBatDau: string;
  ngayKetThuc: string;
  trangThai: 'hoat-dong' | 'tam-dung' | 'het-han';
  moTa?: string;
  createdAt: string;
}

export default function VoucherPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [filterStatus, setFilterStatus] = useState('');

  const [formData, setFormData] = useState({
    ma: '',
    loai: 'phan-tram' as 'phan-tram' | 'so-tien',
    giaTriGiam: 0,
    giamToiDa: 0,
    donToiThieu: 0,
    soLuong: 0,
    ngayBatDau: '',
    ngayKetThuc: '',
    trangThai: 'hoat-dong' as 'hoat-dong' | 'tam-dung' | 'het-han',
    moTa: ''
  });

  useEffect(() => {
    loadVouchers();
  }, [filterStatus]);

  const loadVouchers = async () => {
    try {
      setLoading(true);
      const params = filterStatus ? { trangThai: filterStatus } : {};
      const response = await api.getVouchers(params);

      if (response.success) {
        const data = response.data as any;
        setVouchers(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error loading vouchers:', error);
      toast.error('Không thể tải danh sách voucher');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const submitData = {
        ...formData,
        ma: formData.ma.toUpperCase(),
        giamToiDa: formData.loai === 'phan-tram' ? formData.giamToiDa : undefined
      };

      let response;
      if (editingVoucher) {
        response = await api.updateVoucher(editingVoucher._id, submitData);
      } else {
        response = await api.createVoucher(submitData);
      }

      if (response.success) {
        toast.success(editingVoucher ? 'Cập nhật voucher thành công!' : 'Tạo voucher thành công!');
        setShowModal(false);
        resetForm();
        loadVouchers();
      } else {
        toast.error((response as any).error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error saving voucher:', error);
      toast.error('Có lỗi xảy ra khi lưu voucher');
    }
  };

  const handleEdit = (voucher: Voucher) => {
    setEditingVoucher(voucher);
    setFormData({
      ma: voucher.ma,
      loai: voucher.loai,
      giaTriGiam: voucher.giaTriGiam,
      giamToiDa: voucher.giamToiDa || 0,
      donToiThieu: voucher.donToiThieu,
      soLuong: voucher.soLuong,
      ngayBatDau: new Date(voucher.ngayBatDau).toISOString().slice(0, 16),
      ngayKetThuc: new Date(voucher.ngayKetThuc).toISOString().slice(0, 16),
      trangThai: voucher.trangThai,
      moTa: voucher.moTa || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa voucher này?')) return;

    try {
      const response = await api.deleteVoucher(id);
      if (response.success) {
        toast.success('Xóa voucher thành công!');
        loadVouchers();
      } else {
        toast.error((response as any).error || 'Không thể xóa voucher');
      }
    } catch (error) {
      console.error('Error deleting voucher:', error);
      toast.error('Có lỗi xảy ra');
    }
  };

  const resetForm = () => {
    setFormData({
      ma: '',
      loai: 'phan-tram',
      giaTriGiam: 0,
      giamToiDa: 0,
      donToiThieu: 0,
      soLuong: 0,
      ngayBatDau: '',
      ngayKetThuc: '',
      trangThai: 'hoat-dong',
      moTa: ''
    });
    setEditingVoucher(null);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      'hoat-dong': 'bg-green-100 text-green-800',
      'tam-dung': 'bg-yellow-100 text-yellow-800',
      'het-han': 'bg-red-100 text-red-800'
    };
    const labels = {
      'hoat-dong': 'Hoạt động',
      'tam-dung': 'Tạm dừng',
      'het-han': 'Hết hạn'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản Lý Mã Giảm Giá</h1>
          <p className="text-gray-600 mt-1">Quản lý voucher và mã giảm giá</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Tạo Voucher Mới
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex gap-4 items-center">
          <label className="text-sm font-medium text-gray-700">Lọc theo trạng thái:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả</option>
            <option value="hoat-dong">Hoạt động</option>
            <option value="tam-dung">Tạm dừng</option>
            <option value="het-han">Hết hạn</option>
          </select>
        </div>
      </div>

      {/* Voucher List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mã Voucher
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Loại
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Giá Trị
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sử Dụng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thời Gian
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng Thái
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao Tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {vouchers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  Chưa có voucher nào
                </td>
              </tr>
            ) : (
              vouchers.map((voucher) => (
                <tr key={voucher._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-bold text-blue-600">{voucher.ma}</div>
                    {voucher.moTa && (
                      <div className="text-xs text-gray-500 mt-1">{voucher.moTa}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {voucher.loai === 'phan-tram' ? 'Phần trăm' : 'Số tiền'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="font-semibold text-gray-900">
                      {voucher.loai === 'phan-tram'
                        ? `${voucher.giaTriGiam}%`
                        : `₫${voucher.giaTriGiam.toLocaleString('vi-VN')}`}
                    </div>
                    {voucher.loai === 'phan-tram' && voucher.giamToiDa && (
                      <div className="text-xs text-gray-500">
                        Tối đa: ₫{voucher.giamToiDa.toLocaleString('vi-VN')}
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      Đơn tối thiểu: ₫{voucher.donToiThieu.toLocaleString('vi-VN')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{voucher.daSuDung}</span>
                      <span className="text-gray-500">/ {voucher.soLuong}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(voucher.daSuDung / voucher.soLuong) * 100}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{new Date(voucher.ngayBatDau).toLocaleDateString('vi-VN')}</div>
                    <div className="text-xs">đến</div>
                    <div>{new Date(voucher.ngayKetThuc).toLocaleDateString('vi-VN')}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(voucher.trangThai)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(voucher)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(voucher._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {editingVoucher ? 'Chỉnh Sửa Voucher' : 'Tạo Voucher Mới'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mã Voucher *
                    </label>
                    <input
                      type="text"
                      value={formData.ma}
                      onChange={(e) => setFormData({ ...formData, ma: e.target.value.toUpperCase() })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      placeholder="VD: GIAMGIA50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loại Giảm Giá *
                    </label>
                    <select
                      value={formData.loai}
                      onChange={(e) => setFormData({ ...formData, loai: e.target.value as any })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="phan-tram">Phần trăm (%)</option>
                      <option value="so-tien">Số tiền cố định (₫)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giá Trị Giảm *
                    </label>
                    <input
                      type="number"
                      value={formData.giaTriGiam}
                      onChange={(e) => setFormData({ ...formData, giaTriGiam: Number(e.target.value) })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      min="0"
                      max={formData.loai === 'phan-tram' ? 100 : undefined}
                    />
                  </div>

                  {formData.loai === 'phan-tram' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Giảm Tối Đa (₫)
                      </label>
                      <input
                        type="number"
                        value={formData.giamToiDa}
                        onChange={(e) => setFormData({ ...formData, giamToiDa: Number(e.target.value) })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Đơn Tối Thiểu (₫) *
                    </label>
                    <input
                      type="number"
                      value={formData.donToiThieu}
                      onChange={(e) => setFormData({ ...formData, donToiThieu: Number(e.target.value) })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số Lượng *
                    </label>
                    <input
                      type="number"
                      value={formData.soLuong}
                      onChange={(e) => setFormData({ ...formData, soLuong: Number(e.target.value) })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngày Bắt Đầu *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.ngayBatDau}
                      onChange={(e) => setFormData({ ...formData, ngayBatDau: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngày Kết Thúc *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.ngayKetThuc}
                      onChange={(e) => setFormData({ ...formData, ngayKetThuc: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trạng Thái *
                    </label>
                    <select
                      value={formData.trangThai}
                      onChange={(e) => setFormData({ ...formData, trangThai: e.target.value as any })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="hoat-dong">Hoạt động</option>
                      <option value="tam-dung">Tạm dừng</option>
                      <option value="het-han">Hết hạn</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô Tả
                  </label>
                  <textarea
                    value={formData.moTa}
                    onChange={(e) => setFormData({ ...formData, moTa: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Mô tả về voucher..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingVoucher ? 'Cập Nhật' : 'Tạo Voucher'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
