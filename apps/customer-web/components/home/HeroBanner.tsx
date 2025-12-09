'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const banners = [
  {
    id: 1,
    title: 'Bộ Sưu Tập Mùa Hè 2025',
    subtitle: 'Giảm giá đến 50% cho đồ thể thao cao cấp',
    cta: 'Mua Ngay',
    ctaLink: '/san-pham',
    image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1920&h=600&fit=crop',
    bgColor: 'from-blue-600 to-purple-600'
  },
  {
    id: 2,
    title: 'Giày Chạy Bộ Chuyên Nghiệp',
    subtitle: 'Công nghệ đệm khí mới nhất từ Nike & Adidas',
    cta: 'Khám Phá',
    ctaLink: '/danh-muc/giay-the-thao',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1920&h=600&fit=crop',
    bgColor: 'from-orange-600 to-red-600'
  },
  {
    id: 3,
    title: 'Dụng Cụ Tập Gym',
    subtitle: 'Trang bị đầy đủ cho phòng tập tại nhà',
    cta: 'Xem Thêm',
    ctaLink: '/danh-muc/dung-cu-tap',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&h=600&fit=crop',
    bgColor: 'from-green-600 to-teal-600'
  }
]

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length)
    }, 5000) // Auto-play every 5 seconds

    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)
  }

  return (
    <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
      {/* Slides */}
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src={banner.image}
              alt={banner.title}
              fill
              className="object-cover"
              priority={index === 0}
            />
            <div className={`absolute inset-0 bg-gradient-to-r ${banner.bgColor} opacity-70`} />
          </div>

          {/* Content */}
          <div className="relative h-full container mx-auto px-4 flex items-center">
            <div className="max-w-2xl text-white animate-fade-in">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 animate-slide-up">
                {banner.title}
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                {banner.subtitle}
              </p>
              <Link
                href={banner.ctaLink}
                className="inline-block bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all hover:scale-105 shadow-lg animate-slide-up"
                style={{ animationDelay: '0.2s' }}
              >
                {banner.cta}
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white p-3 rounded-full backdrop-blur-sm transition-all z-10"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white p-3 rounded-full backdrop-blur-sm transition-all z-10"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-10">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide
                ? 'bg-white w-8'
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
