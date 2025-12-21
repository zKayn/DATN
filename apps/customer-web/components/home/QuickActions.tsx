'use client'

import Link from 'next/link'
import { Zap, TrendingUp, Gift, Tag, Star, Package } from 'lucide-react'

const quickActions = [
  {
    id: 1,
    title: 'Flash Sale',
    icon: Zap,
    link: '/khuyen-mai',
    gradient: 'from-primary-500 to-primary-600',
    iconBg: 'bg-primary-100',
    iconColor: 'text-primary-600'
  },
  {
    id: 2,
    title: 'Bán Chạy',
    icon: TrendingUp,
    link: '/san-pham?sort=bestseller',
    gradient: 'from-accent-500 to-accent-600',
    iconBg: 'bg-accent-100',
    iconColor: 'text-accent-600'
  },
  {
    id: 3,
    title: 'Voucher',
    icon: Gift,
    link: '/khuyen-mai',
    gradient: 'from-secondary-500 to-secondary-600',
    iconBg: 'bg-secondary-100',
    iconColor: 'text-secondary-600'
  },
  {
    id: 4,
    title: 'Khuyến Mãi',
    icon: Tag,
    link: '/khuyen-mai',
    gradient: 'from-pink-500 to-pink-600',
    iconBg: 'bg-pink-100',
    iconColor: 'text-pink-600'
  },
  {
    id: 5,
    title: 'Hàng Mới',
    icon: Star,
    link: '/san-pham?sort=new',
    gradient: 'from-purple-500 to-purple-600',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600'
  },
  {
    id: 6,
    title: 'Miễn Phí Ship',
    icon: Package,
    link: '/san-pham',
    gradient: 'from-blue-500 to-blue-600',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600'
  },
]

export default function QuickActions() {
  return (
    <section className="bg-white py-8 border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.id}
                href={action.link}
                className="group flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-gray-50 transition-all duration-300"
              >
                <div className={`${action.iconBg} w-14 h-14 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-7 h-7 ${action.iconColor}`} />
                </div>
                <span className="text-xs md:text-sm font-medium text-gray-700 group-hover:text-gray-900 text-center">
                  {action.title}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
