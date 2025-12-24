'use client'

import { Shield, TruckIcon, RefreshCw, HeadphonesIcon } from 'lucide-react'

const features = [
  {
    icon: Shield,
    title: 'Sản Phẩm Chính Hãng',
    description: '100% hàng chính hãng, bảo hành toàn quốc'
  },
  {
    icon: TruckIcon,
    title: 'Miễn Phí Vận Chuyển',
    description: 'Đơn hàng từ 500K - Giao nhanh 2h'
  },
  {
    icon: RefreshCw,
    title: 'Đổi Trả Dễ Dàng',
    description: 'Đổi trả miễn phí trong 7 ngày'
  },
  {
    icon: HeadphonesIcon,
    title: 'Hỗ Trợ 24/7',
    description: 'Tư vấn nhiệt tình, chu đáo'
  }
]

export default function TrustSection() {
  return (
    <section className="bg-gradient-to-br from-gray-50 to-white py-12 border-y border-gray-200">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center gap-3 p-4 rounded-xl hover:bg-white hover:shadow-md transition-all duration-300 group"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-7 h-7 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1 text-sm md:text-base">
                    {feature.title}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
