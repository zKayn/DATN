'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface User {
  _id: string;
  hoTen: string;
  email: string;
  soDienThoai?: string;
  vaiTro: 'khach-hang' | 'nhan-vien' | 'quan-tri';
  trangThai: 'hoat-dong' | 'khoa';
  gioiTinh?: 'nam' | 'nu' | 'khac';
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    loadUsers();
  }, [currentPage, roleFilter, statusFilter]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await api.getUsers({ page: currentPage, limit: 20 });
      if (response.success && response.data) {
        // Handle different response structures
        const data = response.data as any;
        const usersList = Array.isArray(data) ? data : (data.users || data.data || []);
        setUsers(usersList);

        // Calculate total pages from pagination
        const pagination = (response as any).pagination;
        if (pagination?.pages) {
          setTotalPages(pagination.pages);
        } else if (pagination?.total) {
          setTotalPages(Math.ceil(pagination.total / 20));
        } else {
          setTotalPages(1);
        }
      }
    } catch (error: any) {
      console.error('Error loading users:', error);
      toast.error(error.message || 'Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const response = await api.updateUser(editingUser._id, {
        hoTen: editingUser.hoTen,
        email: editingUser.email,
        soDienThoai: editingUser.soDienThoai,
        vaiTro: editingUser.vaiTro,
        trangThai: editingUser.trangThai,
        gioiTinh: editingUser.gioiTinh
      });

      if (response.success) {
        toast.success('Cập nhật người dùng thành công!');
        setShowEditModal(false);
        loadUsers();
      }
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error(error.message || 'Không thể cập nhật người dùng');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;

    try {
      const response = await api.deleteUser(userId);
      if (response.success) {
        toast.success('Xóa người dùng thành công!');
        loadUsers();
      }
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error.message || 'Không thể xóa người dùng');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.hoTen.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.vaiTro === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.trangThai === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'quan-tri': return 'bg-red-100 text-red-800';
      case 'nhan-vien': return 'bg-blue-100 text-blue-800';
      case 'khach-hang': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'quan-tri': return 'Quản trị';
      case 'nhan-vien': return 'Nhân viên';
      case 'khach-hang': return 'Khách hàng';
      default: return role;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    return status === 'hoat-dong' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getStatusText = (status: string) => {
    return status === 'hoat-dong' ? 'Hoạt động' : 'Khóa';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quản Lý Người Dùng</h1>
          <p className="text-gray-600 mt-2">Quản lý tất cả người dùng trong hệ thống</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="khach-hang">Khách hàng</option>
              <option value="nhan-vien">Nhân viên</option>
              <option value="quan-tri">Quản trị</option>
            </select>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="hoat-dong">Hoạt động</option>
              <option value="khoa">Khóa</option>
            </select>
          </div>
        </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-4">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Người dùng
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Số điện thoại
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Vai trò
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-medium">
                              {user.hoTen.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.hoTen}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{user.email}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{user.soDienThoai || '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 inline-flex text-xs font-medium rounded-full ${getRoleBadgeColor(user.vaiTro)}`}>
                        {getRoleText(user.vaiTro)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 inline-flex text-xs font-medium rounded-full ${getStatusBadgeColor(user.trangThai)}`}>
                        {getStatusText(user.trangThai)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{new Date(user.createdAt).toLocaleDateString('vi-VN')}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-50 rounded transition-colors"
                          title="Chỉnh sửa"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
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
                ))}
              </tbody>
            </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="p-12 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Không tìm thấy người dùng nào</h3>
                <p className="text-gray-600">Thử điều chỉnh bộ lọc hoặc tìm kiếm</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Trang {currentPage} / {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Trước
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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

        {/* Edit User Modal */}
        {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Chỉnh Sửa Người Dùng</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700 p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={handleUpdateUser}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Họ tên <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={editingUser.hoTen}
                      onChange={(e) => setEditingUser({ ...editingUser, hoTen: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Email <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="email"
                      value={editingUser.email}
                      onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Số điện thoại
                    </label>
                    <input
                      type="text"
                      value={editingUser.soDienThoai || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, soDienThoai: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Vai trò
                    </label>
                    <select
                      value={editingUser.vaiTro}
                      onChange={(e) => setEditingUser({ ...editingUser, vaiTro: e.target.value as any })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="khach-hang">Khách hàng</option>
                      <option value="nhan-vien">Nhân viên</option>
                      <option value="quan-tri">Quản trị</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Trạng thái
                    </label>
                    <select
                      value={editingUser.trangThai}
                      onChange={(e) => setEditingUser({ ...editingUser, trangThai: e.target.value as any })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="hoat-dong">Hoạt động</option>
                      <option value="khoa">Khóa</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Giới tính
                    </label>
                    <select
                      value={editingUser.gioiTinh || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, gioiTinh: e.target.value as any })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Không xác định</option>
                      <option value="nam">Nam</option>
                      <option value="nu">Nữ</option>
                      <option value="khac">Khác</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t mt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    Lưu Thay Đổi
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
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
      </div>
    </div>
  );
}
