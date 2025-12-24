'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface Review {
  _id: string;
  sanPham: {
    _id: string;
    ten: string;
    slug: string;
  };
  nguoiDung: {
    _id: string;
    hoTen: string;
    email: string;
  };
  donHang: {
    _id: string;
    maDonHang: string;
  };
  danhGia: number;
  tieuDe: string;
  noiDung: string;
  hinhAnh?: string[];
  trangThai: 'cho-duyet' | 'da-duyet' | 'tu-choi';
  createdAt: string;
}

const REVIEW_STATUS = [
  { value: '', label: 'Tất cả' },
  { value: 'cho-duyet', label: 'Chờ duyệt' },
  { value: 'da-duyet', label: 'Đã duyệt' },
  { value: 'tu-choi', label: 'Từ chối' }
];

const STATUS_COLORS: Record<string, string> = {
  'cho-duyet': 'bg-yellow-100 text-yellow-700',
  'da-duyet': 'bg-green-100 text-green-700',
  'tu-choi': 'bg-red-100 text-red-700'
};

const STATUS_LABELS: Record<string, string> = {
  'cho-duyet': 'Chờ duyệt',
  'da-duyet': 'Đã duyệt',
  'tu-choi': 'Từ chối'
};

export default function ReviewsManagementPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    loadReviews();
  }, [currentPage, statusFilter]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const response = await api.getReviews({
        page: currentPage,
        limit: itemsPerPage,
        status: statusFilter
      });

      if (response.success && response.data) {
        const data = response.data as any;
        // Handle different response structures
        const reviewsList = Array.isArray(data) ? data : (data.reviews || data.data || []);
        setReviews(reviewsList);

        // Calculate total pages from pagination or data
        const pagination = (response as any).pagination;
        if (pagination?.pages) {
          setTotalPages(pagination.pages);
        } else if (pagination?.total) {
          setTotalPages(Math.ceil(pagination.total / itemsPerPage));
        } else if (data.totalPages) {
          setTotalPages(data.totalPages);
        } else {
          setTotalPages(1);
        }
      } else if (response.error) {
        console.error('Lỗi khi tải đánh giá:', response.error);
      }
    } catch (error) {
      console.error('Lỗi khi tải đánh giá:', error);
    }
    setLoading(false);
  };

  const handleApprove = async (reviewId: string) => {
    if (!confirm('Bạn có chắc chắn muốn duyệt đánh giá này?')) return;

    try {
      const response = await api.approveReview(reviewId);

      if (response.success) {
        toast.success('Duyệt đánh giá thành công!');
        loadReviews();
      } else {
        toast.error((response as any).error || 'Không thể duyệt đánh giá');
      }
    } catch (error) {
      console.error('Error approving review:', error);
      toast.error('Có lỗi xảy ra khi duyệt đánh giá');
    }
  };

  const handleReject = async (reviewId: string) => {
    if (!confirm('Bạn có chắc chắn muốn từ chối đánh giá này?')) return;

    try {
      const response = await api.rejectReview(reviewId);

      if (response.success) {
        toast.success('Từ chối đánh giá thành công!');
        loadReviews();
      } else {
        toast.error((response as any).error || 'Không thể từ chối đánh giá');
      }
    } catch (error) {
      console.error('Error rejecting review:', error);
      toast.error('Có lỗi xảy ra khi từ chối đánh giá');
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
            viewBox="0 0 20 20"
          >
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quản Lý Đánh Giá</h1>
          <p className="text-gray-600 mt-2">Quản lý và kiểm duyệt đánh giá từ khách hàng</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-wrap gap-2">
            {REVIEW_STATUS.map((status) => (
              <button
                key={status.value}
                onClick={() => {
                  setStatusFilter(status.value);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === status.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reviews Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 mt-4">Đang tải dữ liệu...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Không có đánh giá nào</h3>
              <p className="text-gray-600">Chưa có đánh giá nào trong hệ thống</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Sản phẩm</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Khách hàng</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Đánh giá</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Nội dung</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Trạng thái</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Ngày tạo</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {reviews.map((review) => (
                      <tr key={review._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              {review.sanPham?.ten || (typeof review.sanPham === 'string' ? 'Sản phẩm đã xóa' : 'N/A')}
                            </p>
                            <p className="text-sm text-gray-600">
                              #{review.donHang?.maDonHang || (review.donHang ? 'Không có mã' : 'N/A')}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              {review.nguoiDung?.hoTen || (typeof review.nguoiDung === 'string' ? 'Người dùng đã xóa' : 'N/A')}
                            </p>
                            <p className="text-sm text-gray-600">{review.nguoiDung?.email || ''}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {renderStars(review.danhGia || 0)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            <p className="font-medium text-gray-900 mb-1">{review.tieuDe || 'Không có tiêu đề'}</p>
                            <p className="text-sm text-gray-600 line-clamp-2">{review.noiDung || ''}</p>
                            <button
                              onClick={() => setSelectedReview(review)}
                              className="text-sm text-blue-600 hover:text-blue-700 mt-1"
                            >
                              Xem chi tiết
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                              STATUS_COLORS[review.trangThai]
                            }`}
                          >
                            {STATUS_LABELS[review.trangThai]}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">
                            {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {review.trangThai === 'cho-duyet' && (
                              <>
                                <button
                                  onClick={() => handleApprove(review._id)}
                                  className="text-green-600 hover:text-green-700 p-2 hover:bg-green-50 rounded transition-colors"
                                  title="Duyệt"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleReject(review._id)}
                                  className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded transition-colors"
                                  title="Từ chối"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </>
                            )}
                            {review.trangThai === 'da-duyet' && (
                              <button
                                onClick={() => handleReject(review._id)}
                                className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded transition-colors"
                                title="Từ chối"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            )}
                            {review.trangThai === 'tu-choi' && (
                              <button
                                onClick={() => handleApprove(review._id)}
                                className="text-green-600 hover:text-green-700 p-2 hover:bg-green-50 rounded transition-colors"
                                title="Duyệt"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
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

      {/* Review Detail Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Chi tiết đánh giá</h2>
                <button
                  onClick={() => setSelectedReview(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Sản phẩm</p>
                  <p className="font-semibold text-gray-900">{selectedReview.sanPham?.ten || 'N/A'}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Khách hàng</p>
                  <p className="font-semibold text-gray-900">{selectedReview.nguoiDung?.hoTen || 'N/A'}</p>
                  <p className="text-sm text-gray-600">{selectedReview.nguoiDung?.email || 'N/A'}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Mã đơn hàng</p>
                  <p className="font-semibold text-gray-900">{selectedReview.donHang?.maDonHang || 'N/A'}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Đánh giá</p>
                  {renderStars(selectedReview.danhGia)}
                </div>

                <div>
                  <p className="text-sm text-gray-600">Tiêu đề</p>
                  <p className="font-semibold text-gray-900">{selectedReview.tieuDe}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Nội dung</p>
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedReview.noiDung}</p>
                </div>

                {selectedReview.hinhAnh && selectedReview.hinhAnh.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Hình ảnh</p>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedReview.hinhAnh.map((img, index) => (
                        <img
                          key={index}
                          src={img}
                          alt={`Review ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-600">Trạng thái</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      STATUS_COLORS[selectedReview.trangThai]
                    }`}
                  >
                    {STATUS_LABELS[selectedReview.trangThai]}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Ngày tạo</p>
                  <p className="text-gray-900">
                    {new Date(selectedReview.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mt-6 pt-6 border-t">
                {selectedReview.trangThai === 'cho-duyet' && (
                  <>
                    <button
                      onClick={() => {
                        handleApprove(selectedReview._id);
                        setSelectedReview(null);
                      }}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Duyệt đánh giá
                    </button>
                    <button
                      onClick={() => {
                        handleReject(selectedReview._id);
                        setSelectedReview(null);
                      }}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Từ chối
                    </button>
                  </>
                )}
                {selectedReview.trangThai === 'da-duyet' && (
                  <button
                    onClick={() => {
                      handleReject(selectedReview._id);
                      setSelectedReview(null);
                    }}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Từ chối đánh giá
                  </button>
                )}
                {selectedReview.trangThai === 'tu-choi' && (
                  <button
                    onClick={() => {
                      handleApprove(selectedReview._id);
                      setSelectedReview(null);
                    }}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Duyệt đánh giá
                  </button>
                )}
                <button
                  onClick={() => setSelectedReview(null)}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
