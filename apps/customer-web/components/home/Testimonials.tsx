'use client'

import { Star, Quote } from 'lucide-react'
import Image from 'next/image'

const testimonials = [
  {
    id: 1,
    name: 'Nguyễn Văn An',
    avatar: 'https://i.pravatar.cc/150?img=12',
    rating: 5,
    comment: 'Sản phẩm chất lượng tuyệt vời! Giày Nike Air Max tôi mua rất êm và bền. Giao hàng nhanh, đóng gói cẩn thận. Sẽ ủng hộ shop lâu dài.',
    product: 'Giày Nike Air Max 2024',
    date: '2 ngày trước'
  },
  {
    id: 2,
    name: 'Trần Thị Bình',
    avatar: 'https://i.pravatar.cc/150?img=45',
    rating: 5,
    comment: 'Mua đồ tập gym ở đây rất hài lòng. Nhân viên tư vấn nhiệt tình, giá cả hợp lý. Chất liệu thoáng mát, form đẹp. Đã giới thiệu cho bạn bè!',
    product: 'Bộ Quần Áo Tập Gym',
    date: '5 ngày trước'
  },
  {
    id: 3,
    name: 'Lê Hoàng Nam',
    avatar: 'https://i.pravatar.cc/150?img=33',
    rating: 5,
    comment: 'Shop uy tín, hàng chính hãng 100%. Tôi đã mua nhiều lần và luôn hài lòng. Website dễ sử dụng, thanh toán tiện lợi. 5 sao!',
    product: 'Đồng Hồ Thông Minh',
    date: '1 tuần trước'
  },
  {
    id: 4,
    name: 'Phạm Thị Diễm',
    avatar: 'https://i.pravatar.cc/150?img=23',
    rating: 5,
    comment: 'Dụng cụ tập yoga chất lượng cao, giá tốt nhất thị trường. Thảm tập dày dặn, chống trượt rất tốt. Giao hàng siêu nhanh chỉ 1 ngày!',
    product: 'Bộ Dụng Cụ Yoga',
    date: '1 tuần trước'
  },
  {
    id: 5,
    name: 'Võ Minh Tuấn',
    avatar: 'https://i.pravatar.cc/150?img=68',
    rating: 5,
    comment: 'Tôi đã tìm kiếm giày chạy bộ chất lượng rất lâu và cuối cùng đã tìm thấy ở đây. Adidas UltraBoost êm ái, thiết kế đẹp. Rất đáng tiền!',
    product: 'Giày Adidas UltraBoost',
    date: '2 tuần trước'
  },
  {
    id: 6,
    name: 'Đặng Thị Hương',
    avatar: 'https://i.pravatar.cc/150?img=27',
    rating: 5,
    comment: 'Dịch vụ tuyệt vời! Chatbot AI hỗ trợ rất nhanh và chính xác. Sản phẩm giao đúng hẹn, chất lượng y như mô tả. 10 điểm!',
    product: 'Túi Tập Gym',
    date: '3 tuần trước'
  }
]

export default function Testimonials() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {testimonials.map((testimonial) => (
        <div
          key={testimonial.id}
          className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-shadow relative"
        >
          {/* Quote Icon */}
          <Quote className="absolute top-4 right-4 w-10 h-10 text-primary-100" />

          {/* User Info */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative w-14 h-14 rounded-full overflow-hidden ring-4 ring-primary-100">
              <Image
                src={testimonial.avatar}
                alt={testimonial.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
              <p className="text-sm text-gray-500">{testimonial.date}</p>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < testimonial.rating
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Comment */}
          <p className="text-gray-700 mb-4 leading-relaxed">
            "{testimonial.comment}"
          </p>

          {/* Product */}
          <div className="pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Sản phẩm: <span className="text-primary-600 font-medium">{testimonial.product}</span>
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
