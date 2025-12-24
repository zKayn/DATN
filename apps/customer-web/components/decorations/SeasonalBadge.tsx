'use client'

interface SeasonalBadgeProps {
  type: 'noel-special' | 'tet-deal' | 'lucky-sale' | 'out-of-stock' | 'new'
  discount?: number
  className?: string
}

export default function SeasonalBadge({ type, discount, className = '' }: SeasonalBadgeProps) {
  const getBadgeConfig = () => {
    switch (type) {
      case 'noel-special':
        return {
          text: 'Noel Special',
          icon: (
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L9 9L2 9.5L7.5 14L6 21L12 17L18 21L16.5 14L22 9.5L15 9L12 2Z" />
            </svg>
          ),
          gradient: 'from-primary-600 to-primary-700',
          textColor: 'text-white',
          animation: 'animate-glow'
        }
      case 'tet-deal':
        return {
          text: discount ? `-${discount}%` : 'Tết Deal',
          icon: (
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <ellipse cx="12" cy="8" rx="6" ry="2" />
              <rect x="6" y="8" width="12" height="10" rx="2" />
              <ellipse cx="12" cy="18" rx="6" ry="2" />
              <circle cx="12" cy="13" r="3" opacity="0.6" />
            </svg>
          ),
          gradient: 'from-accent-500 to-accent-600',
          textColor: 'text-gray-900',
          animation: 'animate-shimmer bg-gradient-to-r from-accent-400 via-accent-500 to-accent-400'
        }
      case 'lucky-sale':
        return {
          text: 'Lucky Sale',
          icon: (
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10" />
              <text x="12" y="16" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">¥</text>
            </svg>
          ),
          gradient: 'from-accent-600 to-accent-700',
          textColor: 'text-white',
          animation: 'animate-sparkle'
        }
      case 'new':
        return {
          text: 'Mới',
          icon: (
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L15 9L22 10L17 15L18 22L12 19L6 22L7 15L2 10L9 9L12 2Z" />
            </svg>
          ),
          gradient: 'from-secondary-500 to-secondary-600',
          textColor: 'text-white',
          animation: ''
        }
      case 'out-of-stock':
        return {
          text: 'Hết hàng',
          icon: null,
          gradient: 'from-gray-700 to-gray-800',
          textColor: 'text-white',
          animation: ''
        }
      default:
        return {
          text: 'Sale',
          icon: null,
          gradient: 'from-primary-500 to-primary-600',
          textColor: 'text-white',
          animation: ''
        }
    }
  }

  const config = getBadgeConfig()

  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold
        bg-gradient-to-r ${config.gradient} ${config.textColor} ${config.animation}
        shadow-md ${className}
      `}
      style={
        config.animation.includes('shimmer')
          ? { backgroundSize: '200% 100%' }
          : undefined
      }
    >
      {config.icon}
      <span>{config.text}</span>
    </span>
  )
}
