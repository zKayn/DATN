import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center gap-2 text-sm text-gray-600 py-4 ${className}`}
    >
      {/* Home */}
      <Link
        href="/"
        className="hover:text-primary-500 transition-colors duration-200 flex items-center gap-1"
        aria-label="Trang chủ"
      >
        <Home className="w-4 h-4" />
        <span className="sr-only">Trang chủ</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <div key={index} className="flex items-center gap-2">
            {/* Separator */}
            <ChevronRight className="w-4 h-4 text-gray-400" />

            {/* Item */}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="hover:text-primary-500 transition-colors duration-200 truncate max-w-xs"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={`truncate max-w-xs ${
                  isLast ? 'text-gray-900 font-medium' : ''
                }`}
                aria-current={isLast ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}
          </div>
        )
      })}
    </nav>
  )
}
