'use client';

import React from 'react';
import { Calendar, Clock, ArrowRight, TrendingUp, Dumbbell, ShoppingBag, Award, ChevronRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Dữ liệu tin tức thực tế với link bên ngoài
const featuredNews = {
  id: 1,
  title: 'Thể Thao Việt Nam Bước Vào "Kỷ Nguyên Vàng" Của Pickleball',
  slug: 'pickleball-ky-nguyen-vang',
  excerpt: 'Pickleball đang phát triển mạnh mẽ tại Việt Nam với tốc độ tăng trưởng nhanh thứ 2 thế giới. Đây là cơ hội lớn cho thể thao Việt Nam tại các đấu trường quốc tế.',
  content: '',
  category: 'Xu Hướng',
  image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&h=500&fit=crop',
  date: '2025-12-09',
  readTime: '5 phút đọc',
  author: 'Báo Dân Trí',
  featured: true,
  url: 'https://dantri.com.vn/the-thao/the-thao-viet-nam-buoc-vao-ky-nguyen-vang-cua-pickleball-20251209125724155.htm'
};

const newsArticles = [
  {
    id: 2,
    title: 'TOP 23 Bài Tập Cardio Tăng Cơ Giảm Mỡ Hiệu Quả',
    slug: 'bai-tap-cardio-hieu-qua',
    excerpt: 'Tổng hợp 23 bài tập cardio được chuyên gia khuyên dùng giúp đốt cháy calo, giảm cân và tăng cường sức khỏe tim mạch hiệu quả.',
    category: 'Hướng Dẫn',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=500&fit=crop',
    date: '2025-12-20',
    readTime: '8 phút đọc',
    author: 'Hello Bacsi',
    featured: false,
    url: 'https://hellobacsi.com/the-duc-the-thao/cardio-suc-ben/18-bai-tap-cardio-giam-can-hieu-qua/'
  },
  {
    id: 3,
    title: 'Cách Chọn Giày Chạy Bộ Phù Hợp Với Nhu Cầu',
    slug: 'chon-giay-chay-bo',
    excerpt: 'Hướng dẫn chi tiết từ Decathlon về cách chọn giày chạy bộ dựa trên kiểu bàn chân, tần suất chạy và địa hình để tối ưu hiệu suất và tránh chấn thương.',
    category: 'Sản Phẩm',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=500&fit=crop',
    date: '2025-12-18',
    readTime: '10 phút đọc',
    author: 'Decathlon Vietnam',
    featured: false,
    url: 'https://www.decathlon.vn/blog/cach-chon-giay-chay-bo-tot-nhat'
  },
  {
    id: 4,
    title: 'Bóng Đá Việt Nam Và Năm 2026 Đầy Hy Vọng',
    slug: 'bong-da-viet-nam-2026',
    excerpt: 'Năm 2026 hứa hẹn là năm bùng nổ của bóng đá Việt Nam với nhiều giải đấu lớn: U23 châu Á, Futsal châu Á, Asian Cup nữ và AFF Cup.',
    category: 'Xu Hướng',
    image: 'https://images.unsplash.com/photo-1614632537077-d5d5d5eea5f0?w=800&h=500&fit=crop',
    date: '2025-12-15',
    readTime: '6 phút đọc',
    author: 'Thể Thao 247',
    featured: false,
    url: 'https://thethao247.vn/193267-bong-da-viet-nam-va-nam-2026-day-hy-vong-d402974.html'
  },
  {
    id: 5,
    title: 'Vì Sao Môn Thể Thao Mới Lạ Pickleball Gây Sốt Ở Việt Nam?',
    slug: 'pickleball-gay-sot-viet-nam',
    excerpt: 'Với 30.000-35.000 người chơi thường xuyên và hơn 250 CLB trên toàn quốc, Pickleball đang trở thành hiện tượng thể thao mới tại Việt Nam.',
    category: 'Xu Hướng',
    image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&h=500&fit=crop',
    date: '2025-12-12',
    readTime: '7 phút đọc',
    author: 'VietnamNet',
    featured: false,
    url: 'https://vietnamnet.vn/vi-sao-mon-the-thao-moi-la-pickleball-gay-sot-o-viet-nam-2313721.html'
  },
  {
    id: 6,
    title: 'Chế Độ Dinh Dưỡng Cho Người Tập Gym Tăng Cơ Giảm Mỡ',
    slug: 'dinh-duong-tang-co',
    excerpt: 'Hướng dẫn xây dựng thực đơn dinh dưỡng khoa học với tỷ lệ protein, carb và chất béo phù hợp cho người tập gym với mục tiêu tăng cơ.',
    category: 'Dinh Dưỡng',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=500&fit=crop',
    date: '2025-12-10',
    readTime: '12 phút đọc',
    author: 'Vinmec',
    featured: false,
    url: 'https://www.vinmec.com/vie/bai-viet/che-do-dinh-duong-cho-nguoi-tap-gym-hinh-de-tang-co-giam-mo-vi'
  },
  {
    id: 7,
    title: 'Chuyên Gia Hướng Dẫn Cách Chọn Giày Chạy Bộ Chuẩn Nhất',
    slug: 'huong-dan-chon-giay-chuan',
    excerpt: 'Biti\'s chia sẻ kinh nghiệm từ chuyên gia về cách lựa chọn giày chạy bộ phù hợp với từng kiểu bàn chân và mục đích sử dụng.',
    category: 'Sản Phẩm',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=500&fit=crop',
    date: '2025-12-08',
    readTime: '9 phút đọc',
    author: "Biti's Hunter",
    featured: false,
    url: 'https://bitis.com.vn/blogs/kinh-nghiem/cach-chon-giay-chay-bo'
  },
  {
    id: 8,
    title: '7 Bài Tập Yoga Buổi Sáng Giúp Bạn Tràn Đầy Sức Sống',
    slug: 'yoga-buoi-sang',
    excerpt: 'Bắt đầu ngày mới với 7 động tác yoga đơn giản giúp thư giãn cơ thể, tăng cường sức khỏe và mang lại tinh thần tích cực cho cả ngày.',
    category: 'Hướng Dẫn',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=500&fit=crop',
    date: '2025-12-05',
    readTime: '8 phút đọc',
    author: 'Hello Bacsi',
    featured: false,
    url: 'https://hellobacsi.com/the-duc-the-thao/can-bang-deo-dai/bai-tap-yoga-buoi-sang/'
  },
  {
    id: 9,
    title: '15 Phút Bài Tập Yoga Cho Ngày Mới Tràn Đầy Năng Lượng',
    slug: 'yoga-15-phut',
    excerpt: 'Chỉ cần 15 phút mỗi sáng với các bài tập yoga cơ bản, bạn sẽ cảm nhận được sự thay đổi tích cực cho cả cơ thể và tinh thần.',
    category: 'Hướng Dẫn',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=500&fit=crop',
    date: '2025-12-03',
    readTime: '6 phút đọc',
    author: 'California Fitness',
    featured: false,
    url: 'https://cali.vn/blog/15-phut-bai-tap-yoga-buoi-sang-cho-ngay-moi-tran-day-nang-luong'
  },
  {
    id: 10,
    title: 'Chế Độ Ăn Cho Người Tập Gym Tăng Cơ Nhanh Chóng',
    slug: 'che-do-an-tang-co',
    excerpt: 'Thực đơn chi tiết 7 ngày kèm hướng dẫn tính toán calo và tỷ lệ dinh dưỡng giúp tối ưu quá trình tăng cơ khi tập gym.',
    category: 'Dinh Dưỡng',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=500&fit=crop',
    date: '2025-12-01',
    readTime: '10 phút đọc',
    author: 'Nhà Thuốc Long Châu',
    featured: false,
    url: 'https://nhathuoclongchau.com.vn/bai-viet/che-do-an-cho-nguoi-tap-gym-tang-co-nhanh-chong-57607.html'
  }
];

const categories = [
  { name: 'Tất Cả', slug: 'all', icon: '📰' },
  { name: 'Xu Hướng', slug: 'xu-huong', icon: '🔥' },
  { name: 'Hướng Dẫn', slug: 'huong-dan', icon: '📚' },
  { name: 'Sản Phẩm', slug: 'san-pham', icon: '🛍️' },
  { name: 'Dinh Dưỡng', slug: 'dinh-duong', icon: '🥗' }
];

export default function TinTucPage() {
  const [selectedCategory, setSelectedCategory] = React.useState('all');

  const handleArticleClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Helper function to normalize Vietnamese text
  const normalizeCategory = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/đ/g, 'd')
      .replace(/\s+/g, '-');
  };

  const filteredArticles = selectedCategory === 'all'
    ? newsArticles
    : newsArticles.filter(article => {
        const articleSlug = normalizeCategory(article.category);
        return articleSlug === selectedCategory;
      });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-400 to-accent-400 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Tin Tức Thể Thao
            </h1>
            <p className="text-xl text-white/90">
              Cập nhật xu hướng mới nhất, hướng dẫn tập luyện và tin tức thể thao
            </p>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex gap-3 overflow-x-auto py-4 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category.slug}
                onClick={() => setSelectedCategory(category.slug)}
                className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full whitespace-nowrap font-medium transition-all ${
                  selectedCategory === category.slug
                    ? 'bg-gradient-to-r from-primary-400 to-accent-400 text-white shadow-lg shadow-primary-400/30 scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-primary-400/50 hover:shadow-md'
                }`}
              >
                <span className="text-lg">{category.icon}</span>
                <span className="font-semibold">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Featured Article */}
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-6 h-6 text-primary-400" />
            <h2 className="text-3xl font-bold text-gray-900">Nổi Bật</h2>
          </div>

          <div
            onClick={() => handleArticleClick(featuredNews.url)}
            className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer group"
          >
            <div className="grid md:grid-cols-2 gap-8">
              <div className="relative h-[400px] md:h-auto">
                <Image
                  src={featuredNews.image}
                  alt={featuredNews.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-gradient-to-r from-primary-400 to-accent-400 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    {featuredNews.category}
                  </span>
                </div>
              </div>

              <div className="p-8 flex flex-col justify-center">
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(featuredNews.date).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{featuredNews.readTime}</span>
                  </div>
                </div>

                <h3 className="text-3xl font-bold text-gray-900 mb-4 group-hover:text-primary-400 transition-colors">
                  {featuredNews.title}
                </h3>

                <p className="text-gray-600 text-lg mb-6 line-clamp-3">
                  {featuredNews.excerpt}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Bởi {featuredNews.author}
                  </span>
                  <button className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-400 to-accent-400 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all">
                    Đọc Tiếp
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* News Grid */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Award className="w-6 h-6 text-primary-400" />
              <h2 className="text-3xl font-bold text-gray-900">
                {selectedCategory === 'all' ? 'Bài Viết Mới Nhất' : categories.find(c => c.slug === selectedCategory)?.name}
              </h2>
            </div>
            <span className="text-sm text-gray-500">
              {filteredArticles.length} bài viết
            </span>
          </div>

          {filteredArticles.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Chưa có bài viết
              </h3>
              <p className="text-gray-600">
                Hiện chưa có bài viết nào trong danh mục này. Vui lòng quay lại sau!
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArticles.map((article) => (
              <article
                key={article.id}
                onClick={() => handleArticleClick(article.url)}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all group cursor-pointer"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-xs font-semibold">
                      {article.category}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(article.date).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{article.readTime}</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary-400 transition-colors">
                    {article.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-xs text-gray-500">
                      {article.author}
                    </span>
                    <button className="inline-flex items-center gap-1 text-primary-400 font-semibold text-sm hover:gap-2 transition-all">
                      Đọc Thêm
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          )}
        </div>

        {/* Newsletter Signup */}
        <div className="bg-gradient-to-r from-primary-400 to-accent-400 rounded-2xl p-8 md:p-12 text-white text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Đăng Ký Nhận Tin Tức Mới Nhất
            </h2>
            <p className="text-white/90 text-lg mb-8">
              Nhận các bài viết, tips tập luyện và ưu đãi độc quyền gửi thẳng vào email của bạn
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Nhập email của bạn"
                className="flex-1 px-6 py-4 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button className="bg-white text-primary-400 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-colors whitespace-nowrap">
                Đăng Ký Ngay
              </button>
            </div>
            <p className="text-white/70 text-sm mt-4">
              Chúng tôi cam kết không spam. Bạn có thể hủy đăng ký bất cứ lúc nào.
            </p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <Link
            href="/khuyen-mai"
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-primary-400 to-accent-400 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-400 transition-colors" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Khuyến Mãi Hot</h3>
            <p className="text-gray-600 text-sm">
              Xem các chương trình giảm giá đặc biệt
            </p>
          </Link>

          <Link
            href="/danh-muc/pickleball"
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-primary-400 to-accent-400 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-400 transition-colors" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Thiết Bị Pickleball</h3>
            <p className="text-gray-600 text-sm">
              Khám phá dụng cụ cho môn thể thao đang HOT
            </p>
          </Link>

          <Link
            href="/tai-khoan"
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-primary-400 to-accent-400 rounded-lg flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-400 transition-colors" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Tài Khoản Của Bạn</h3>
            <p className="text-gray-600 text-sm">
              Quản lý đơn hàng và theo dõi ưu đãi
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
