'use client'

interface FestiveBorderProps {
  position?: 'top' | 'bottom' | 'both'
  className?: string
}

export default function FestiveBorder({ position = 'top', className = '' }: FestiveBorderProps) {
  const BorderSVG = () => (
    <svg
      className="w-full h-full"
      viewBox="0 0 1200 60"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Snowflake pattern */}
        <g id="snowflake">
          <path
            d="M10,10 L10,15 M10,10 L10,5 M10,10 L15,10 M10,10 L5,10 M7,7 L13,13 M13,7 L7,13"
            stroke="#0ea5e9"
            strokeWidth="0.8"
            fill="none"
          />
        </g>

        {/* Holly leaf */}
        <g id="holly">
          <path
            d="M10,15 Q8,12 10,9 Q12,12 10,15 Z"
            fill="#16a34a"
          />
          <circle cx="10" cy="16" r="1.5" fill="#dc2626" />
        </g>

        {/* Plum blossom (for Tết) */}
        <g id="blossom">
          <circle cx="10" cy="10" r="2" fill="#fbbf24" />
          <circle cx="10" cy="6" r="1.5" fill="#fde68a" />
          <circle cx="6" cy="10" r="1.5" fill="#fde68a" />
          <circle cx="14" cy="10" r="1.5" fill="#fde68a" />
          <circle cx="10" cy="14" r="1.5" fill="#fde68a" />
          <circle cx="10" cy="10" r="0.8" fill="#f59e0b" />
        </g>

        {/* Lantern (for Tết) */}
        <g id="miniLantern">
          <ellipse cx="10" cy="8" rx="4" ry="1.5" fill="#dc2626" />
          <rect x="6" y="8" width="8" height="8" fill="#dc2626" rx="1" />
          <ellipse cx="10" cy="16" rx="4" ry="1.5" fill="#b91c1c" />
          <circle cx="10" cy="12" r="2" fill="#fbbf24" opacity="0.6" />
        </g>
      </defs>

      {/* Background gradient */}
      <rect width="1200" height="60" fill="url(#festiveBorderGradient)" />

      {/* Pattern elements */}
      {Array.from({ length: 60 }).map((_, i) => {
        const x = i * 20 + 10
        const pattern = i % 4

        return (
          <g key={i} opacity="0.7">
            {pattern === 0 && <use href="#snowflake" x={x} y="25" />}
            {pattern === 1 && <use href="#holly" x={x} y="25" />}
            {pattern === 2 && <use href="#blossom" x={x} y="25" />}
            {pattern === 3 && <use href="#miniLantern" x={x} y="20" />}
          </g>
        )
      })}

      {/* Gradient definition */}
      <defs>
        <linearGradient id="festiveBorderGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(220, 38, 38, 0.05)" />
          <stop offset="33%" stopColor="rgba(34, 197, 94, 0.05)" />
          <stop offset="66%" stopColor="rgba(245, 158, 11, 0.05)" />
          <stop offset="100%" stopColor="rgba(220, 38, 38, 0.05)" />
        </linearGradient>
      </defs>
    </svg>
  )

  return (
    <div className={`relative ${className}`} aria-hidden="true">
      {(position === 'top' || position === 'both') && (
        <div className="w-full h-12 md:h-16">
          <BorderSVG />
        </div>
      )}

      {(position === 'bottom' || position === 'both') && (
        <div className="w-full h-12 md:h-16 rotate-180">
          <BorderSVG />
        </div>
      )}
    </div>
  )
}
