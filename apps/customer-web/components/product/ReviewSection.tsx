'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { api } from '@/lib/api';

interface ReviewSectionProps {
  productId: string;
  productSlug?: string;
  productName?: string;
  averageRating?: number;
  totalReviews?: number;
}

interface Review {
  _id: string;
  nguoiDung: {
    hoTen: string;
    email: string;
  };
  danhGia: number;
  tieuDe: string;
  noiDung: string;
  hinhAnh?: string[];
  createdAt: string;
  huuIch?: number;
  trangThai?: string;
}

// Removed mock data - now only using real database reviews

export default function ReviewSection({
  productId,
  productSlug,
  productName,
  averageRating: propAverageRating,
  totalReviews: propTotalReviews
}: ReviewSectionProps) {
  const router = useRouter();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<number>(0); // 0 = all, 1-5 = specific rating
  const [sort, setSort] = useState<'newest' | 'helpful'>('newest');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    content: ''
  });

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const response = await api.getProductReviews(productId);
      if (response.success && response.data) {
        const reviewsData = Array.isArray(response.data) ? response.data : response.data.reviews || [];
        // Convert API data to component format
        const formattedReviews = reviewsData.map((review: Review) => ({
          id: review._id,
          user: {
            name: review.nguoiDung?.hoTen || 'Người dùng',
            avatar: `https://i.pravatar.cc/150?u=${review.nguoiDung?.email || review._id}`
          },
          rating: review.danhGia,
          title: review.tieuDe,
          content: review.noiDung,
          images: review.hinhAnh || [],
          date: review.createdAt,
          helpful: review.huuIch || 0,
          verified: review.trangThai === 'da-duyet'
        }));
        setReviews(formattedReviews);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error('Lỗi khi tải đánh giá:', error);
      setReviews([]);
    }
    setLoading(false);
  };

  // Calculate rating statistics
  const totalReviews = reviews.length;
  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
  const ratingCounts = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: (reviews.filter(r => r.rating === rating).length / totalReviews) * 100
  }));

  // Filter and sort reviews
  const filteredReviews = reviews
    .filter(r => filter === 0 || r.rating === filter)
    .sort((a, b) => {
      if (sort === 'helpful') return b.helpful - a.helpful;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.createReview(productId, {
        danhGia: newReview.rating,
        tieuDe: newReview.title,
        noiDung: newReview.content
      });

      if (response.success) {
        alert('Cảm ơn bạn đã đánh giá sản phẩm!');
        setShowReviewForm(false);
        setNewReview({ rating: 5, title: '', content: '' });
        loadReviews(); // Reload reviews
      } else {
        alert('Có lỗi xảy ra. Vui lòng đăng nhập để đánh giá sản phẩm.');
      }
    } catch (error) {
      console.error('Lỗi khi gửi đánh giá:', error);
      alert('Có lỗi xảy ra. Vui lòng đăng nhập để đánh giá sản phẩm.');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="h-32 bg-gray-200 rounded" />
            <div className="h-32 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Đánh Giá Sản Phẩm</h2>

      {/* Rating Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b">
        {/* Overall Rating */}
        <div className="text-center">
          <div className="text-6xl font-bold text-gray-900 mb-3">
            {averageRating.toFixed(1)}
          </div>
          <div className="flex items-center justify-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-8 h-8 ${i < Math.round(averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                viewBox="0 0 20 20"
              >
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            ))}
          </div>
          <p className="text-sm text-gray-600">{totalReviews} đánh giá</p>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-3">
          {ratingCounts.map(({ rating, count, percentage }) => (
            <button
              key={rating}
              onClick={() => setFilter(filter === rating ? 0 : rating)}
              className={`w-full flex items-center gap-3 hover:bg-gray-50 p-2 rounded transition-colors ${
                filter === rating ? 'bg-primary-50' : ''
              }`}
            >
              <div className="flex items-center gap-1 w-16">
                <span className="text-sm font-medium">{rating}</span>
                <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              </div>
              <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filter & Sort */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <select
            value={filter}
            onChange={(e) => setFilter(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-700 focus:border-transparent"
          >
            <option value={0}>Tất cả đánh giá</option>
            <option value={5}>5 sao</option>
            <option value={4}>4 sao</option>
            <option value={3}>3 sao</option>
            <option value={2}>2 sao</option>
            <option value={1}>1 sao</option>
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as 'newest' | 'helpful')}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-700 focus:border-transparent"
          >
            <option value="newest">Mới nhất</option>
            <option value="helpful">Hữu ích nhất</option>
          </select>
        </div>

        <button
          onClick={() => setShowReviewForm(!showReviewForm)}
          className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-800 transition-colors font-medium"
        >
          Viết Đánh Giá
        </button>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <form onSubmit={handleSubmitReview} className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Đánh giá của bạn</h3>

          {/* Rating Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">Đánh giá</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNewReview({ ...newReview, rating: star })}
                  className="focus:outline-none"
                >
                  <svg
                    className={`w-8 h-8 ${star <= newReview.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Title Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">Tiêu đề</label>
            <input
              type="text"
              value={newReview.title}
              onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-700 focus:border-transparent"
              placeholder="Tóm tắt đánh giá của bạn"
              required
            />
          </div>

          {/* Content Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">Nội dung</label>
            <textarea
              value={newReview.content}
              onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 h-32 focus:ring-2 focus:ring-primary-700 focus:border-transparent"
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
              required
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-800 transition-colors font-medium"
            >
              Gửi Đánh Giá
            </button>
            <button
              type="button"
              onClick={() => setShowReviewForm(false)}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Hủy
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {filteredReviews.map((review) => (
          <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
            {/* User Info */}
            <div className="flex items-start gap-4 mb-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={review.user.avatar}
                  alt={review.user.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900">{review.user.name}</h4>
                  {review.verified && (
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">
                      ✓ Đã mua hàng
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {new Date(review.date).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Review Content */}
            <div className="ml-16">
              <h5 className="font-semibold text-gray-900 mb-2">{review.title}</h5>
              <p className="text-gray-700 mb-3">{review.content}</p>

              {/* Review Images */}
              {review.images.length > 0 && (
                <div className="flex gap-2 mb-3">
                  {review.images.map((img: string, idx: number) => (
                    <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden">
                      <Image
                        src={img}
                        alt={`Review image ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Helpful Button */}
              <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-500 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
                Hữu ích ({review.helpful})
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* View All Reviews Button */}
      {filteredReviews.length > 0 && totalReviews > 5 && productSlug && (
        <div className="text-center mt-8">
          <button
            onClick={() => router.push(`/san-pham/${productSlug}/danh-gia`)}
            className="text-primary-500 hover:text-primary-800 font-medium inline-flex items-center gap-2"
          >
            Xem tất cả {totalReviews} đánh giá
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {/* No Reviews */}
      {filteredReviews.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">Chưa có đánh giá nào phù hợp với bộ lọc</p>
        </div>
      )}
    </div>
  );
}
