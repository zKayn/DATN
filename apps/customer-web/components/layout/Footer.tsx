'use client'

import Link from 'next/link'
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin, Video } from 'lucide-react'
import { useSettings } from '@/contexts/SettingsContext'

export default function Footer() {
  const { settings } = useSettings()
  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-300 overflow-hidden">
      {/* Decorative gradient blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-primary-500/10 to-accent-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-secondary-500/10 to-success-500/10 rounded-full blur-3xl" />

      {/* Main footer */}
      <div className="relative container mx-auto px-4 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company info */}
          <div>
            <h3 className="font-heading text-2xl font-bold mb-6 relative inline-block">
              <span className="text-gradient-primary">Về Chúng Tôi</span>
              <div className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full" />
            </h3>
            <p className="text-base text-gray-400 mb-6 leading-relaxed">
              {settings?.storeDescription || 'Cửa hàng thể thao uy tín, chuyên cung cấp đồ thể thao chính hãng với giá tốt nhất thị trường.'}
            </p>
            <div className="flex gap-3">
              {settings?.socialLinks?.facebook && (
                <a
                  href={settings.socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-12 h-12 rounded-xl flex items-center justify-center
                           bg-gradient-to-br from-gray-700 to-gray-800
                           border border-gray-600
                           transition-all duration-300
                           hover:bg-gradient-to-br hover:from-primary-500 hover:to-primary-600
                           hover:border-primary-500 hover:shadow-[0_8px_30px_rgba(26,117,255,0.4)]
                           hover:scale-110 hover:rotate-6"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
                </a>
              )}
              {settings?.socialLinks?.instagram && (
                <a
                  href={settings.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-12 h-12 rounded-xl flex items-center justify-center
                           bg-gradient-to-br from-gray-700 to-gray-800
                           border border-gray-600
                           transition-all duration-300
                           hover:bg-gradient-to-br hover:from-secondary-500 hover:to-accent-500
                           hover:border-secondary-500 hover:shadow-[0_8px_30px_rgba(255,26,163,0.4)]
                           hover:scale-110 hover:rotate-6"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
                </a>
              )}
              {settings?.socialLinks?.youtube && (
                <a
                  href={settings.socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-12 h-12 rounded-xl flex items-center justify-center
                           bg-gradient-to-br from-gray-700 to-gray-800
                           border border-gray-600
                           transition-all duration-300
                           hover:bg-gradient-to-br hover:from-accent-500 hover:to-accent-600
                           hover:border-accent-500 hover:shadow-[0_8px_30px_rgba(255,163,26,0.4)]
                           hover:scale-110 hover:rotate-6"
                  aria-label="YouTube"
                >
                  <Youtube className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
                </a>
              )}
              {settings?.socialLinks?.tiktok && (
                <a
                  href={settings.socialLinks.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-12 h-12 rounded-xl flex items-center justify-center
                           bg-gradient-to-br from-gray-700 to-gray-800
                           border border-gray-600
                           transition-all duration-300
                           hover:bg-gradient-to-br hover:from-success-500 hover:to-primary-500
                           hover:border-success-500 hover:shadow-[0_8px_30px_rgba(26,255,141,0.4)]
                           hover:scale-110 hover:rotate-6"
                  aria-label="TikTok"
                >
                  <Video className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
                </a>
              )}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-heading text-2xl font-bold mb-6 relative inline-block">
              <span className="text-gradient-success">Liên Kết</span>
              <div className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-success-500 to-primary-500 rounded-full" />
            </h3>
            <ul className="space-y-3 text-base">
              <li>
                <Link href="/gioi-thieu" className="group flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-gradient-to-r group-hover:from-success-500 group-hover:to-primary-500 transition-all" />
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link href="/san-pham" className="group flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-gradient-to-r group-hover:from-success-500 group-hover:to-primary-500 transition-all" />
                  Sản phẩm
                </Link>
              </li>
              <li>
                <Link href="/khuyen-mai" className="group flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-gradient-to-r group-hover:from-success-500 group-hover:to-primary-500 transition-all" />
                  Khuyến mãi
                </Link>
              </li>
              <li>
                <Link href="/tin-tuc" className="group flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-gradient-to-r group-hover:from-success-500 group-hover:to-primary-500 transition-all" />
                  Tin tức
                </Link>
              </li>
              <li>
                <Link href="/lien-he" className="group flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-gradient-to-r group-hover:from-success-500 group-hover:to-primary-500 transition-all" />
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer support */}
          <div>
            <h3 className="font-heading text-2xl font-bold mb-6 relative inline-block">
              <span className="text-gradient-vibrant">Hỗ Trợ Khách Hàng</span>
              <div className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-secondary-500 to-accent-500 rounded-full" />
            </h3>
            <ul className="space-y-3 text-base">
              <li>
                <Link href="/huong-dan-mua-hang" className="group flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-gradient-to-r group-hover:from-secondary-500 group-hover:to-accent-500 transition-all" />
                  Hướng dẫn mua hàng
                </Link>
              </li>
              <li>
                <Link href="/chinh-sach-doi-tra" className="group flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-gradient-to-r group-hover:from-secondary-500 group-hover:to-accent-500 transition-all" />
                  Chính sách đổi trả
                </Link>
              </li>
              <li>
                <Link href="/chinh-sach-bao-mat" className="group flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-gradient-to-r group-hover:from-secondary-500 group-hover:to-accent-500 transition-all" />
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link href="/phuong-thuc-thanh-toan" className="group flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-gradient-to-r group-hover:from-secondary-500 group-hover:to-accent-500 transition-all" />
                  Phương thức thanh toán
                </Link>
              </li>
              <li>
                <Link href="/theo-doi-don-hang" className="group flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-gradient-to-r group-hover:from-secondary-500 group-hover:to-accent-500 transition-all" />
                  Theo dõi đơn hàng
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading text-2xl font-bold mb-6 relative inline-block">
              <span className="bg-gradient-to-r from-accent-400 to-primary-400 bg-clip-text text-transparent">Liên Hệ</span>
              <div className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-accent-500 to-primary-500 rounded-full" />
            </h3>
            <ul className="space-y-4 text-base">
              {settings?.storeAddress && (
                <li className="flex items-start gap-3 text-gray-400">
                  <MapPin className="w-5 h-5 flex-shrink-0 mt-1 text-accent-400" />
                  <span className="leading-relaxed">{settings.storeAddress}</span>
                </li>
              )}
              {settings?.storePhone && (
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 flex-shrink-0 text-primary-400" />
                  <a href={`tel:${settings.storePhone}`} className="text-gray-400 hover:text-white transition-colors">
                    {settings.storePhone}
                  </a>
                </li>
              )}
              {settings?.storeEmail && (
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 flex-shrink-0 text-success-400" />
                  <a href={`mailto:${settings.storeEmail}`} className="text-gray-400 hover:text-white transition-colors">
                    {settings.storeEmail}
                  </a>
                </li>
              )}
            </ul>
            <div className="mt-6 pt-6 border-t border-gray-700">
              <p className="text-sm font-semibold text-gray-400 mb-2">Giờ làm việc:</p>
              <p className="text-base text-white font-medium">8:00 - 22:00</p>
              <p className="text-sm text-gray-500">Tất cả các ngày trong tuần</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom footer */}
      <div className="relative border-t border-gray-700/50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Copyright */}
            <div className="text-center md:text-left">
              <p className="text-base text-gray-400">
                &copy; 2025{' '}
                <span className="font-heading font-bold text-gradient-primary">
                  {settings?.storeName || 'Thể Thao Pro'}
                </span>
                . Tất cả quyền được bảo lưu.
              </p>
            </div>

            {/* Links */}
            <div className="flex gap-8">
              <Link
                href="/dieu-khoan"
                className="text-base text-gray-400 hover:text-white transition-colors duration-300 relative group"
              >
                Điều khoản sử dụng
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-accent-500 group-hover:w-full transition-all duration-300" />
              </Link>
              <Link
                href="/chinh-sach-bao-mat"
                className="text-base text-gray-400 hover:text-white transition-colors duration-300 relative group"
              >
                Chính sách bảo mật
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-accent-500 group-hover:w-full transition-all duration-300" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
