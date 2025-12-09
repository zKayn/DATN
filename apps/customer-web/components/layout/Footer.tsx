'use client'

import Link from 'next/link'
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company info */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Về Chúng Tôi</h3>
            <p className="text-sm mb-4">
              Cửa hàng thể thao uy tín, chuyên cung cấp đồ thể thao chính hãng với giá tốt nhất thị trường.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-primary-400 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-primary-400 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-primary-400 transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Liên Kết</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/gioi-thieu" className="hover:text-primary-400 transition-colors">
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link href="/san-pham" className="hover:text-primary-400 transition-colors">
                  Sản phẩm
                </Link>
              </li>
              <li>
                <Link href="/khuyen-mai" className="hover:text-primary-400 transition-colors">
                  Khuyến mãi
                </Link>
              </li>
              <li>
                <Link href="/tin-tuc" className="hover:text-primary-400 transition-colors">
                  Tin tức
                </Link>
              </li>
              <li>
                <Link href="/lien-he" className="hover:text-primary-400 transition-colors">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer support */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Hỗ Trợ Khách Hàng</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/huong-dan-mua-hang" className="hover:text-primary-400 transition-colors">
                  Hướng dẫn mua hàng
                </Link>
              </li>
              <li>
                <Link href="/chinh-sach-doi-tra" className="hover:text-primary-400 transition-colors">
                  Chính sách đổi trả
                </Link>
              </li>
              <li>
                <Link href="/chinh-sach-bao-mat" className="hover:text-primary-400 transition-colors">
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link href="/phuong-thuc-thanh-toan" className="hover:text-primary-400 transition-colors">
                  Phương thức thanh toán
                </Link>
              </li>
              <li>
                <Link href="/theo-doi-don-hang" className="hover:text-primary-400 transition-colors">
                  Theo dõi đơn hàng
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Liên Hệ</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>123 Đường ABC, Quận 1, TP.HCM</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-5 h-5 flex-shrink-0" />
                <span>1900 xxxx</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-5 h-5 flex-shrink-0" />
                <span>support@thethao.com</span>
              </li>
            </ul>
            <div className="mt-4">
              <p className="text-sm mb-2">Giờ làm việc:</p>
              <p className="text-sm">8:00 - 22:00 (Tất cả các ngày)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom footer */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p>&copy; 2025 Thể Thao Pro. Tất cả quyền được bảo lưu.</p>
            <div className="flex gap-6">
              <Link href="/dieu-khoan" className="hover:text-primary-400 transition-colors">
                Điều khoản sử dụng
              </Link>
              <Link href="/chinh-sach-bao-mat" className="hover:text-primary-400 transition-colors">
                Chính sách bảo mật
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
