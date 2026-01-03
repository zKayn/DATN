'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const banners = [
  {
    id: 1,
    title: 'GIẢI PHÓNG SỨC MẠNH',
    titleHighlight: 'TIỀM NĂNG',
    subtitle: 'Khám phá bộ sưu tập thể thao 2025 với công nghệ tiên tiến và thiết kế đột phá',
    cta: 'KHÁM PHÁ NGAY',
    ctaLink: '/san-pham',
  },
  {
    id: 2,
    title: 'TRANG BỊ CHO',
    titleHighlight: 'THÀNH CÔNG',
    subtitle: 'Giày thể thao chính hãng - Đa dạng mẫu mã, chất lượng cao, giá tốt nhất',
    cta: 'MUA NGAY',
    ctaLink: '/danh-muc/giay-the-thao',
  },
  {
    id: 3,
    title: 'ƯU ĐÃI',
    titleHighlight: 'ĐẶC BIỆT',
    subtitle: 'Ưu đãi đặc biệt - Giảm giá lên đến 50% cho các sản phẩm chọn lọc',
    cta: 'XEM NGAY',
    ctaLink: '/khuyen-mai',
  }
]

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length)
    }, 6000)

    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)
  }

  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    size: Math.random() * 80 + 50,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: `${Math.random() * 5}s`,
    duration: `${Math.random() * 10 + 10}s`
  }))

  return (
    <div className="w-full bg-gray-50 py-4">
      <div className="container mx-auto px-4">
        <div className="relative flex items-center gap-6">
          {/* Left Decorative Image */}
          <div className="hidden xl:block flex-shrink-0 w-48 h-[380px] rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-primary-500 to-accent-500 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-32 h-32 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white font-bold text-lg text-center">
              NEW SEASON
            </div>
          </div>

          {/* Main Banner */}
          <div className="relative flex-1 h-[300px] md:h-[340px] lg:h-[380px] rounded-2xl overflow-hidden shadow-2xl">
            {/* Slides */}
            {banners.map((banner, index) => (
              <div
                key={banner.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-smooth ${
                  index === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {/* Animated Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500 bg-[length:200%_200%] animate-gradient-shift" />

                {/* Floating Particles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  {particles.map((particle) => (
                    <div
                      key={particle.id}
                      className="absolute rounded-full bg-white/10 backdrop-blur-sm animate-float-particle"
                      style={{
                        width: `${particle.size}px`,
                        height: `${particle.size}px`,
                        left: particle.left,
                        top: particle.top,
                        animationDelay: particle.delay,
                        animationDuration: particle.duration,
                      }}
                    />
                  ))}
                </div>

                {/* Content */}
                <div className="relative z-10 h-full flex items-center justify-center text-center px-4 md:px-8">
                  <div className="max-w-5xl">
                    {/* Heading */}
                    <h1 className="font-heading text-3xl md:text-5xl lg:text-6xl mb-4 leading-tight">
                      <span className="block text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
                        {banner.title}
                      </span>
                      <span className="block mt-1 text-gradient-vibrant drop-shadow-[0_4px_20px_rgba(0,0,0,0.3)] animate-pulse-subtle">
                        {banner.titleHighlight}
                      </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-base md:text-xl lg:text-2xl text-white/95 mb-6 max-w-3xl mx-auto drop-shadow-md leading-relaxed">
                      {banner.subtitle}
                    </p>

                    {/* CTA Button */}
                    <Link href={banner.ctaLink}>
                      <button className="group relative px-10 md:px-12 py-3.5 md:py-4.5 bg-white text-primary-500 font-accent text-base md:text-xl font-bold rounded-full transform transition-all duration-300 hover:scale-110 hover:shadow-[0_20px_60px_rgba(255,165,0,0.5)] active:scale-95 overflow-hidden focus:outline-none focus:ring-4 focus:ring-white/50">
                        <span className="absolute inset-0 bg-gradient-to-r from-accent-400 to-secondary-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
                        <span className="relative z-10 group-hover:text-white transition-colors duration-300 flex items-center justify-center gap-2">
                          {banner.cta}
                          <svg className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </span>
                        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-white/40 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-full" />
                        <div className="absolute inset-0 -z-20 bg-gradient-to-r from-accent-400 to-secondary-400 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-300" />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white text-gray-800 p-3 md:p-3.5 rounded-full backdrop-blur-sm transition-all duration-300 ease-smooth hover:scale-125 hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)] active:scale-95 shadow-lg z-20 focus:outline-none focus:ring-4 focus:ring-white/50"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6 md:w-7 md:h-7" />
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white text-gray-800 p-3 md:p-3.5 rounded-full backdrop-blur-sm transition-all duration-300 ease-smooth hover:scale-125 hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)] active:scale-95 shadow-lg z-20 focus:outline-none focus:ring-4 focus:ring-white/50"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6 md:w-7 md:h-7" />
            </button>

            {/* Dots Indicator */}
            <div className="absolute bottom-5 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2.5 rounded-full transition-all duration-300 ease-smooth ${
                    index === currentSlide
                      ? 'bg-white w-12 shadow-lg'
                      : 'bg-white/60 hover:bg-white/90 w-2.5 hover:w-5'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Right Decorative Image */}
          <div className="hidden xl:block flex-shrink-0 w-48 h-[380px] rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-secondary-500 to-success-500 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-32 h-32 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white font-bold text-lg text-center">
              BEST DEALS
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
