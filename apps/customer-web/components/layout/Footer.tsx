'use client'

import Link from 'next/link'
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin, Video } from 'lucide-react'
import { useSettings } from '@/contexts/SettingsContext'
import FestiveBorder from '@/components/decorations/FestiveBorder'

export default function Footer() {
  const { settings } = useSettings()
  return (
    <footer className="relative bg-gradient-to-br from-primary-900 via-gray-900 to-secondary-900 text-gray-300">
      {/* Festive border at top */}
      <div className="absolute top-0 left-0 right-0">
        <FestiveBorder position="top" />
      </div>

      {/* Festive pattern overlay */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 15l-3 9h-9l7.5 5.5-3 9 7.5-5.5 7.5 5.5-3-9 7.5-5.5h-9z' fill='%23ffffff' fill-opacity='0.3'/%3E%3C/svg%3E")`,
        backgroundSize: '60px 60px'
      }} />
      {/* Main footer */}
      <div className="relative container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company info */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Về Chúng Tôi</h3>
            <p className="text-sm mb-4">
              {settings?.storeDescription || 'Cửa hàng thể thao uy tín, chuyên cung cấp đồ thể thao chính hãng với giá tốt nhất thị trường.'}
            </p>
            <div className="flex gap-4">
              {settings?.socialLinks?.facebook && (
                <a
                  href={settings.socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent-400 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {settings?.socialLinks?.instagram && (
                <a
                  href={settings.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent-400 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {settings?.socialLinks?.youtube && (
                <a
                  href={settings.socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent-400 transition-colors"
                  aria-label="YouTube"
                >
                  <Youtube className="w-5 h-5" />
                </a>
              )}
              {settings?.socialLinks?.tiktok && (
                <a
                  href={settings.socialLinks.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent-400 transition-colors"
                  aria-label="TikTok"
                >
                  <Video className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Liên Kết</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/gioi-thieu" className="hover:text-accent-400 transition-colors">
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link href="/san-pham" className="hover:text-accent-400 transition-colors">
                  Sản phẩm
                </Link>
              </li>
              <li>
                <Link href="/khuyen-mai" className="hover:text-accent-400 transition-colors">
                  Khuyến mãi
                </Link>
              </li>
              <li>
                <Link href="/tin-tuc" className="hover:text-accent-400 transition-colors">
                  Tin tức
                </Link>
              </li>
              <li>
                <Link href="/lien-he" className="hover:text-accent-400 transition-colors">
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
                <Link href="/huong-dan-mua-hang" className="hover:text-accent-400 transition-colors">
                  Hướng dẫn mua hàng
                </Link>
              </li>
              <li>
                <Link href="/chinh-sach-doi-tra" className="hover:text-accent-400 transition-colors">
                  Chính sách đổi trả
                </Link>
              </li>
              <li>
                <Link href="/chinh-sach-bao-mat" className="hover:text-accent-400 transition-colors">
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link href="/phuong-thuc-thanh-toan" className="hover:text-accent-400 transition-colors">
                  Phương thức thanh toán
                </Link>
              </li>
              <li>
                <Link href="/theo-doi-don-hang" className="hover:text-accent-400 transition-colors">
                  Theo dõi đơn hàng
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Liên Hệ</h3>
            <ul className="space-y-3 text-sm">
              {settings?.storeAddress && (
                <li className="flex items-start gap-2">
                  <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{settings.storeAddress}</span>
                </li>
              )}
              {settings?.storePhone && (
                <li className="flex items-center gap-2">
                  <Phone className="w-5 h-5 flex-shrink-0" />
                  <a href={`tel:${settings.storePhone}`} className="hover:text-accent-400 transition-colors">
                    {settings.storePhone}
                  </a>
                </li>
              )}
              {settings?.storeEmail && (
                <li className="flex items-center gap-2">
                  <Mail className="w-5 h-5 flex-shrink-0" />
                  <a href={`mailto:${settings.storeEmail}`} className="hover:text-accent-400 transition-colors">
                    {settings.storeEmail}
                  </a>
                </li>
              )}
            </ul>
            <div className="mt-4">
              <p className="text-sm mb-2">Giờ làm việc:</p>
              <p className="text-sm">8:00 - 22:00 (Tất cả các ngày)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom footer */}
      <div className="relative border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <div className="text-center md:text-left">
              <p>&copy; 2025 {settings?.storeName || 'Thể Thao Pro'}. Tất cả quyền được bảo lưu.</p>
              <p className="mt-1 text-accent-400 font-medium">🎄 Chúc mừng Giáng Sinh & Tết 2025! 🧧</p>
            </div>
            <div className="flex gap-6">
              <Link href="/dieu-khoan" className="hover:text-accent-400 transition-colors">
                Điều khoản sử dụng
              </Link>
              <Link href="/chinh-sach-bao-mat" className="hover:text-accent-400 transition-colors">
                Chính sách bảo mật
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
