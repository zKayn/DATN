'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { getBrands } from '@/lib/api'

interface Brand {
  _id: string
  ten: string
  slug: string
  logo?: string
  moTa?: string
  thuTu: number
  trangThai: 'active' | 'inactive'
}

export default function BrandSlider() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const data = await getBrands()
        // Filter only active brands
        const activeBrands = data.filter((brand: Brand) => brand.trangThai === 'active')
        setBrands(activeBrands)
      } catch (error) {
        console.error('Error fetching brands:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBrands()
  }, [])

  // Duplicate brands for seamless infinite scroll
  const duplicatedBrands = [...brands, ...brands]

  if (loading || brands.length === 0) {
    return null
  }

  return (
    <section className="py-12 md:py-16 bg-gradient-to-br from-white via-gray-50 to-primary-50/20 relative overflow-hidden">
      {/* Decorative gradient blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-primary-400/10 to-secondary-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-tl from-accent-400/10 to-success-400/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-10">
          {/* Title badge */}
          <div className="inline-flex items-center gap-3 px-8 py-4 rounded-full
                        bg-gradient-to-r from-accent-500/10 to-secondary-500/10
                        border border-accent-500/30 mb-5">
            <span className="w-3 h-3 rounded-full bg-gradient-to-r from-accent-500 to-secondary-500 animate-pulse" />
            <span className="text-2xl md:text-3xl font-sans font-extrabold text-accent-600 tracking-normal">
              THƯƠNG HIỆU NỔI BẬT
            </span>
          </div>

          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Đối tác với các thương hiệu thể thao hàng đầu thế giới
          </p>
        </div>

        {/* Slider Container */}
        <div className="relative overflow-hidden">
          {/* Gradient overlays for fade effect */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />

          {/* Sliding brands */}
          <div className="flex animate-slide-infinite">
            {duplicatedBrands.map((brand, index) => (
              <div
                key={`${brand._id}-${index}`}
                className="flex-shrink-0 px-8 md:px-12"
              >
                <div className="group relative w-40 h-24 md:w-48 md:h-28
                              flex items-center justify-center
                              bg-white rounded-2xl shadow-md
                              hover:shadow-xl hover:-translate-y-2
                              transition-all duration-300 ease-smooth
                              border border-gray-200 hover:border-primary-300">
                  {/* Brand logo container */}
                  <div className="relative w-full h-full p-4 flex items-center justify-center">
                    {brand.logo ? (
                      <Image
                        src={brand.logo}
                        alt={brand.ten}
                        fill
                        className="object-contain p-4 grayscale group-hover:grayscale-0 transition-all duration-300"
                        sizes="(max-width: 768px) 160px, 192px"
                      />
                    ) : (
                      <div className="text-center">
                        <div className="text-2xl md:text-3xl font-bold text-gray-700 group-hover:text-primary-600 transition-colors">
                          {brand.ten}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Hover shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent
                                opacity-0 group-hover:opacity-100
                                transform -translate-x-full group-hover:translate-x-full
                                transition-all duration-1000 pointer-events-none rounded-2xl" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust badge */}
        <div className="mt-10 text-center">
          <p className="text-gray-500 text-sm md:text-base">
            Sản phẩm chính hãng • Bảo hành toàn cầu • Giao hàng toàn quốc
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-infinite {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-slide-infinite {
          animation: slide-infinite 30s linear infinite;
        }

        .animate-slide-infinite:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  )
}
