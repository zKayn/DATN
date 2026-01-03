'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Star, ArrowLeft, MessageSquare, Filter } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface Review {
  _id: string;
  nguoiDung: {
    hoTen: string;
    email: string;
  };
  danhGia: number;
  tieuDe: string;
  noiDung: string;
  phanHoi?: {
    noiDung: string;
    thoiGian: Date;
  };
  createdAt: Date;
}

interface Product {
  _id: string;
  ten: string;
  slug: string;
  danhGiaTrungBinh: number;
  soLuongDanhGia: number;
}

export default function ProductReviewsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadProduct();
  }, [slug]);

  useEffect(() => {
    if (product) {
      loadReviews();
    }
  }, [product, selectedFilter, page]);

  const loadProduct = async () => {
    try {
      const response = await api.getProductBySlug(slug);
      if (response.success && response.data) {
        setProduct(response.data);
      }
    } catch (error) {
      console.error('Error loading product:', error);
      toast.error('Không thể tải thông tin sản phẩm');
    }
  };

  const loadReviews = async () => {
    if (!product) return;

    setLoading(true);
    try {
      const response = await api.getProductReviews(product._id);
      if (response.success && response.data) {
        let reviewsList = Array.isArray(response.data) ? response.data : [];

        // Filter by rating if selected
        if (selectedFilter !== null) {
          reviewsList = reviewsList.filter((r: Review) => r.danhGia === selectedFilter);
        }

        setReviews(reviewsList);
        setTotalPages(Math.ceil(reviewsList.length / 10));
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((review) => {
      distribution[review.danhGia as keyof typeof distribution]++;
    });
    return distribution;
  };

  const renderRatingDistribution = () => {
    const distribution = getRatingDistribution();
    const total = reviews.length || 1;

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = distribution[star as keyof typeof distribution];
          const percentage = (count / total) * 100;

          return (
            <button
              key={star}
              onClick={() => setSelectedFilter(selectedFilter === star ? null : star)}
              className={`w-full flex items-center gap-3 hover:bg-gray-50 p-2 rounded transition-colors ${
                selectedFilter === star ? 'bg-primary-50' : ''
              }`}
            >
              <div className="flex items-center gap-1 w-16">
                <span className="text-sm font-medium">{star}</span>
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              </div>
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
              <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
            </button>
          );
        })}
      </div>
    );
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  const displayedReviews = reviews.slice((page - 1) * 10, page * 10);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-primary-400">Trang chủ</Link>
          <span>/</span>
          <Link href="/san-pham" className="hover:text-primary-400">Sản phẩm</Link>
          <span>/</span>
          <Link href={`/san-pham/${slug}`} className="hover:text-primary-400">
            {product.ten}
          </Link>
          <span>/</span>
          <span className="text-gray-900">Đánh giá</span>
        </div>

        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-primary-400 hover:text-primary-500 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Quay lại sản phẩm</span>
        </button>

        {/* Header */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Đánh giá sản phẩm
          </h1>
          <p className="text-gray-700 mb-6">{product.ten}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Overall Rating */}
            <div className="text-center bg-gray-50 rounded-lg p-6">
              <div className="text-5xl font-bold text-gray-900 mb-2">
                {product.danhGiaTrungBinh.toFixed(1)}
              </div>
              <div className="flex justify-center mb-2">
                {renderStars(Math.floor(product.danhGiaTrungBinh))}
              </div>
              <p className="text-gray-600 text-sm">
                {product.soLuongDanhGia} đánh giá
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="md:col-span-2">
              {renderRatingDistribution()}
            </div>
          </div>
        </div>

        {/* Filter Info */}
        {selectedFilter !== null && (
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-primary-500" />
              <span className="text-primary-900">
                Đang hiển thị đánh giá {selectedFilter} sao
              </span>
            </div>
            <button
              onClick={() => setSelectedFilter(null)}
              className="text-primary-500 hover:text-primary-800 font-medium"
            >
              Xóa bộ lọc
            </button>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-lg p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400 mx-auto mb-4" />
              <p className="text-gray-600">Đang tải đánh giá...</p>
            </div>
          ) : displayedReviews.length > 0 ? (
            <>
              {displayedReviews.map((review) => (
                <div key={review._id} className="bg-white rounded-lg p-6 shadow-sm">
                  {/* Review Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-400 flex items-center justify-center text-white font-semibold">
                        {review.nguoiDung?.hoTen?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {review.nguoiDung?.hoTen || 'Người dùng'}
                        </p>
                        {renderStars(review.danhGia)}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>

                  {/* Review Content */}
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {review.tieuDe}
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {review.noiDung}
                  </p>

                  {/* Shop Reply */}
                  {review.phanHoi && (
                    <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-primary-400">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="w-4 h-4 text-primary-400" />
                        <span className="text-sm font-semibold text-primary-400">
                          Phản hồi từ người bán
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {review.phanHoi.noiDung}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(review.phanHoi.thoiGian).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  )}
                </div>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Trước
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`px-4 py-2 border rounded-lg ${
                        page === i + 1
                          ? 'bg-primary-400 text-white border-primary-400'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sau
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-lg p-12 text-center">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {selectedFilter !== null
                  ? `Chưa có đánh giá ${selectedFilter} sao`
                  : 'Chưa có đánh giá nào'}
              </h3>
              <p className="text-gray-600 mb-6">
                Hãy là người đầu tiên đánh giá sản phẩm này
              </p>
              <Link
                href={`/san-pham/${slug}`}
                className="inline-block bg-primary-400 text-white px-6 py-3 rounded-lg hover:bg-primary-500 transition-colors"
              >
                Quay lại sản phẩm
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
