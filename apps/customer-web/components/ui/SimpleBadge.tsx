import React from 'react'

type BadgeType = 'sale' | 'new' | 'out-of-stock'

interface SimpleBadgeProps {
  type: BadgeType
  discount?: number
  className?: string
}

export default function SimpleBadge({ type, discount, className = '' }: SimpleBadgeProps) {
  const badgeConfig = {
    sale: {
      bg: 'bg-red-500',
      text: 'text-white',
      label: discount ? `-${discount}%` : 'SALE',
    },
    new: {
      bg: 'bg-green-500',
      text: 'text-white',
      label: 'NEW',
    },
    'out-of-stock': {
      bg: 'bg-gray-500',
      text: 'text-white',
      label: 'HẾT HÀNG',
    },
  }

  const config = badgeConfig[type]

  return (
    <span
      className={`
        ${config.bg}
        ${config.text}
        px-2 py-1
        text-xs font-semibold
        rounded
        uppercase
        ${className}
      `}
    >
      {config.label}
    </span>
  )
}
