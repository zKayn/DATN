'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';

interface Review {
  _id: string;
  sanPham: {
    _id: string;
    ten: string;
    slug: string;
    hinhAnh: string[];
    gia: number;
    giaKhuyenMai?: number;
  };
  donHang: {
    _id: string;
    maDonHang: string;
  };
  danhGia: number;
  tieuDe: string;
  noiDung: string;
  phanHoi?: {
    noiDung: string;
    thoiGian: Date;
  };
  trangThai: 'cho-duyet' | 'da-duyet' | 'tu-choi';
  createdAt: string;
}

export default function MyReviewsPage() {
  const { user, token, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingIds, setDeletingIds] = useState<string[]>([]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/dang-nhap?callbackUrl=/tai-khoan/danh-gia');
      return;
    }

    if (!authLoading && isAuthenticated && token) {
      loadReviews();
    }
  }, [authLoading, isAuthenticated, token, router]);

  const loadReviews = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await api.getUserReviews(token);
      if (response.success && response.data) {
        const reviewList = Array.isArray(response.data)
          ? response.data
          : response.data.reviews || [];
        setReviews(reviewList);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
    setLoading(false);
  };

  const handleDeleteReview = async (reviewId: string, productName: string) => {
    if (!token) return;

    const confirmed = confirm(`Bạn có chắc muốn xóa đánh giá cho "${productName}"?`);
    if (!confirmed) return;

    setDeletingIds([...deletingIds, reviewId]);
    try {
      const response = await api.deleteReview(token, reviewId);
      if (response.success) {
        setReviews(reviews.filter((r) => r._id !== reviewId));
        alert('Đã xóa đánh giá thành công');
      }
    } catch (error: any) {
      console.error('Error deleting review:', error);
      alert(error.message || 'Không thể xóa đánh giá');
    }
    setDeletingIds(deletingIds.filter((id) => id !== reviewId));
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: {
      [key: string]: { label: string; className: string };
    } = {
      'cho-duyet': {
        label: 'Chờ duyệt',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      },
      'da-duyet': {
        label: 'Đã duyệt',
        className: 'bg-green-100 text-green-800 border-green-200',
      },
      'tu-choi': {
        label: 'Từ chối',
        className: 'bg-red-100 text-red-800 border-red-200',
      },
    };
    const config = statusConfig[status] || statusConfig['cho-duyet'];
    return (
      <span
        className={`inline-block px-3 py-1 text-xs font-semibold border rounded-full ${config.className}`}
      >
        {config.label}
      </span>
    );
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Đánh giá của tôi</h2>
        <p className="mt-2 text-gray-600">
          Quản lý tất cả đánh giá sản phẩm của bạn
        </p>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg
              className="w-24 h-24 mx-auto text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Chưa có đánh giá
            </h3>
            <p className="text-gray-600 mb-6">
              Bạn chưa có đánh giá nào. Hãy mua sắm và đánh giá sản phẩm để giúp
              người khác!
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="bg-white rounded-lg shadow overflow-hidden"
              >
                {/* Product Section */}
                <Link
                  href={`/san-pham/${review.sanPham.slug}`}
                  className="flex items-center gap-4 p-4 bg-gray-50 border-b border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <Image
                      src={review.sanPham.hinhAnh[0] || '/placeholder.png'}
                      alt={review.sanPham.ten}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {review.sanPham.ten}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      {review.sanPham.giaKhuyenMai ? (
                        <>
                          <span className="text-red-600 font-semibold">
                            ₫{review.sanPham.giaKhuyenMai.toLocaleString('vi-VN')}
                          </span>
                          <span className="text-sm text-gray-400 line-through">
                            ₫{review.sanPham.gia.toLocaleString('vi-VN')}
                          </span>
                        </>
                      ) : (
                        <span className="text-primary font-semibold">
                          ₫{review.sanPham.gia.toLocaleString('vi-VN')}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>

                {/* Review Content */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    {renderStars(review.danhGia)}
                    {getStatusBadge(review.trangThai)}
                  </div>

                  <h4 className="font-semibold text-gray-900 mb-2">
                    {review.tieuDe}
                  </h4>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    {review.noiDung}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <span>
                      {new Date(review.createdAt).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </span>
                    {review.donHang?.maDonHang && (
                      <span className="text-primary font-medium">
                        #{review.donHang.maDonHang}
                      </span>
                    )}
                  </div>

                  {/* Reply from shop */}
                  {review.phanHoi && (
                    <div className="bg-primary-50 border-l-4 border-primary-500 p-4 rounded mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <svg
                          className="w-5 h-5 text-primary-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                        <span className="text-sm font-semibold text-primary-500">
                          Phản hồi từ shop
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {review.phanHoi.noiDung}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(review.phanHoi.thoiGian).toLocaleDateString(
                          'vi-VN'
                        )}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end">
                    <button
                      onClick={() =>
                        handleDeleteReview(review._id, review.sanPham.ten)
                      }
                      disabled={deletingIds.includes(review._id)}
                      className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                    >
                      {deletingIds.includes(review._id) ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          <span>Đang xóa...</span>
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          <span>Xóa</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
    </>
  );
}
