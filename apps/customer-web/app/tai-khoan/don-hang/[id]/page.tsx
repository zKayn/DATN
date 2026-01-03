'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Package, MapPin, Phone, User, Clock, Star } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface OrderItem {
  sanPham: string;
  tenSanPham: string;
  hinhAnh: string;
  soLuong: number;
  gia: number;
  size?: string;
  mauSac?: string;
  thanhTien: number;
}

interface OrderHistory {
  trangThai: string;
  moTa: string;
  thoiGian: string;
}

interface Order {
  _id: string;
  maDonHang: string;
  createdAt: string;
  tongTien: number;
  phiVanChuyen: number;
  giamGia: number;
  tongThanhToan: number;
  trangThaiDonHang: string;
  trangThaiThanhToan: string;
  phuongThucThanhToan: string;
  sanPham: OrderItem[];
  diaChiGiaoHang: {
    hoTen: string;
    soDienThoai: string;
    tinh: string;
    huyen: string;
    xa: string;
    diaChiChiTiet: string;
  };
  ghiChu?: string;
  lichSuTrangThai: OrderHistory[];
}

const statusLabels: Record<string, { label: string; color: string; bgColor: string }> = {
  'cho-xac-nhan': { label: 'Chờ xác nhận', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  'da-xac-nhan': { label: 'Đã xác nhận', color: 'text-primary-500', bgColor: 'bg-primary-100' },
  'dang-chuan-bi': { label: 'Đang chuẩn bị', color: 'text-indigo-700', bgColor: 'bg-indigo-100' },
  'dang-giao': { label: 'Đang giao', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  'da-giao': { label: 'Đã giao', color: 'text-green-700', bgColor: 'bg-green-100' },
  'da-huy': { label: 'Đã hủy', color: 'text-red-700', bgColor: 'bg-red-100' },
  'tra-hang': { label: 'Trả hàng', color: 'text-orange-700', bgColor: 'bg-orange-100' },
};

const paymentMethods: Record<string, string> = {
  'tien-mat': 'Thanh toán khi nhận hàng (COD)',
  'chuyen-khoan': 'Chuyển khoản ngân hàng',
  'the': 'Thanh toán bằng thẻ',
  'vi-dien-tu': 'Ví điện tử',
};

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  productImage: string;
  onSubmit: (data: { danhGia: number; tieuDe: string; noiDung: string }) => Promise<void>;
}

function ReviewModal({ isOpen, onClose, productId, productName, productImage, onSubmit }: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin đánh giá');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ danhGia: rating, tieuDe: title, noiDung: content });
      setRating(5);
      setTitle('');
      setContent('');
      onClose();
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Đánh giá sản phẩm</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Product Info */}
        <div className="px-6 py-4 border-b">
          <div className="flex gap-4">
            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={productImage || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200'}
                alt={productName}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{productName}</h3>
            </div>
          </div>
        </div>

        {/* Review Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Rating */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Đánh giá của bạn <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-gray-600">
                {rating === 5 ? 'Rất hài lòng' :
                 rating === 4 ? 'Hài lòng' :
                 rating === 3 ? 'Bình thường' :
                 rating === 2 ? 'Không hài lòng' : 'Rất không hài lòng'}
              </span>
            </div>
          </div>

          {/* Title */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Tóm tắt đánh giá của bạn"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              maxLength={100}
            />
          </div>

          {/* Content */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Nội dung đánh giá <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent resize-none"
              maxLength={1000}
            />
            <p className="text-sm text-gray-500 mt-1">{content.length}/1000 ký tự</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-primary-400 text-white rounded-lg font-medium hover:bg-primary-500 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<OrderItem | null>(null);

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  const loadOrder = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Vui lòng đăng nhập để xem đơn hàng');
        router.push('/dang-nhap');
        return;
      }

      const response = await api.getOrderById(token, orderId);
      if (response.success && response.data) {
        setOrder(response.data);
      }
    } catch (error: any) {
      console.error('Lỗi khi tải đơn hàng:', error);
      toast.error('Không thể tải thông tin đơn hàng');
    }
    setLoading(false);
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Vui lòng đăng nhập');
        return;
      }

      const response = await api.cancelOrder(token, orderId, 'Khách hàng yêu cầu hủy');
      if (response.success) {
        toast.success('Đã hủy đơn hàng thành công');
        loadOrder();
      }
    } catch (error) {
      console.error('Lỗi khi hủy đơn hàng:', error);
      toast.error('Không thể hủy đơn hàng');
    }
  };

  const handleReviewProduct = (product: OrderItem) => {
    setSelectedProduct(product);
    setReviewModalOpen(true);
  };

  const handleSubmitReview = async (data: { danhGia: number; tieuDe: string; noiDung: string }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Vui lòng đăng nhập');
        return;
      }

      if (!selectedProduct || !order) return;

      // Add orderId to review data
      const reviewData = {
        ...data,
        donHang: order._id
      };

      const response = await api.createReview(selectedProduct.sanPham, reviewData, token);
      if (response.success) {
        toast.success('Đánh giá của bạn đã được gửi thành công!');
      } else {
        toast.error(response.message || 'Không thể gửi đánh giá');
      }
    } catch (error: any) {
      console.error('Lỗi khi gửi đánh giá:', error);
      toast.error(error.message || 'Không thể gửi đánh giá');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="bg-white rounded-lg p-6 mb-6 h-64" />
            <div className="bg-white rounded-lg p-6 h-96" />
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy đơn hàng</h2>
          <p className="text-gray-600 mb-6">Đơn hàng không tồn tại hoặc đã bị xóa</p>
          <Link
            href="/tai-khoan/don-hang"
            className="inline-block bg-primary-400 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-500 transition-colors"
          >
            Quay lại danh sách đơn hàng
          </Link>
        </div>
      </div>
    );
  }

  const status = statusLabels[order.trangThaiDonHang] || statusLabels['cho-xac-nhan'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-primary-400">Trang chủ</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/tai-khoan" className="hover:text-primary-400">Tài khoản</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/tai-khoan/don-hang" className="hover:text-primary-400">Đơn hàng</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900">{order.maDonHang}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Order Header */}
          <div className="bg-white rounded-lg p-6 mb-6">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Chi Tiết Đơn Hàng</h1>
                <p className="text-gray-600">Mã đơn hàng: <span className="font-semibold text-gray-900">{order.maDonHang}</span></p>
                <p className="text-sm text-gray-500">Đặt ngày {formatDate(order.createdAt)}</p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${status.bgColor} ${status.color}`}>
                {status.label}
              </span>
            </div>

            {/* Actions */}
            {order.trangThaiDonHang === 'cho-xac-nhan' && (
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={handleCancelOrder}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Hủy đơn hàng
                </button>
              </div>
            )}
          </div>

          {/* Order Status Timeline */}
          <div className="bg-white rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Trạng thái đơn hàng
            </h2>
            <div className="space-y-4">
              {order.lichSuTrangThai.map((history, index) => {
                const historyStatus = statusLabels[history.trangThai] || statusLabels['cho-xac-nhan'];
                return (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${historyStatus.bgColor} ${historyStatus.color} border-2 border-current`} />
                      {index < order.lichSuTrangThai.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-200 mt-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className={`font-medium ${historyStatus.color}`}>{historyStatus.label}</p>
                      <p className="text-sm text-gray-600">{history.moTa}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(history.thoiGian)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Địa chỉ nhận hàng
            </h2>
            <div className="space-y-2">
              <p className="flex items-center gap-2 text-gray-900">
                <User className="w-4 h-4 text-gray-400" />
                <span className="font-medium">{order.diaChiGiaoHang.hoTen}</span>
              </p>
              <p className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4 text-gray-400" />
                {order.diaChiGiaoHang.soDienThoai}
              </p>
              <p className="flex items-start gap-2 text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                <span>
                  {order.diaChiGiaoHang.diaChiChiTiet}, {order.diaChiGiaoHang.xa}, {order.diaChiGiaoHang.huyen}, {order.diaChiGiaoHang.tinh}
                </span>
              </p>
            </div>
            {order.ghiChu && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium text-gray-900 mb-1">Ghi chú:</p>
                <p className="text-sm text-gray-600">{order.ghiChu}</p>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Sản phẩm đã đặt
            </h2>
            <div className="space-y-4">
              {order.sanPham.map((item, index) => (
                <div key={index} className="flex gap-4 pb-4 border-b last:border-b-0">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={item.hinhAnh || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200'}
                      alt={item.tenSanPham}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">{item.tenSanPham}</h3>
                    <p className="text-sm text-gray-600">
                      {item.size && `Size: ${item.size}`}
                      {item.size && item.mauSac && ' | '}
                      {item.mauSac && `Màu: ${item.mauSac}`}
                    </p>
                    <p className="text-sm text-gray-600">Số lượng: x{item.soLuong}</p>

                    {/* Review button for delivered orders */}
                    {order.trangThaiDonHang === 'da-giao' && (
                      <button
                        onClick={() => handleReviewProduct(item)}
                        className="mt-2 text-sm text-primary-400 hover:text-primary-500 font-medium flex items-center gap-1"
                      >
                        <Star className="w-4 h-4" />
                        Đánh giá sản phẩm
                      </button>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatPrice(item.gia)}</p>
                    <p className="text-sm text-gray-500">Tổng: {formatPrice(item.thanhTien)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Thanh toán</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính:</span>
                <span>{formatPrice(order.tongTien)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Phí vận chuyển:</span>
                <span>{formatPrice(order.phiVanChuyen)}</span>
              </div>
              {order.giamGia > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá:</span>
                  <span>-{formatPrice(order.giamGia)}</span>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Tổng cộng:</span>
                <span className="text-2xl font-bold text-primary-400">{formatPrice(order.tongThanhToan)}</span>
              </div>
              <div className="pt-3 border-t">
                <p className="text-sm text-gray-600">
                  Phương thức thanh toán: <span className="font-medium text-gray-900">{paymentMethods[order.phuongThucThanhToan] || order.phuongThucThanhToan}</span>
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Trạng thái: <span className={`font-medium ${order.trangThaiThanhToan === 'da-thanh-toan' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {order.trangThaiThanhToan === 'da-thanh-toan' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {selectedProduct && (
        <ReviewModal
          isOpen={reviewModalOpen}
          onClose={() => {
            setReviewModalOpen(false);
            setSelectedProduct(null);
          }}
          productId={selectedProduct.sanPham}
          productName={selectedProduct.tenSanPham}
          productImage={selectedProduct.hinhAnh}
          onSubmit={handleSubmitReview}
        />
      )}
    </div>
  );
}
