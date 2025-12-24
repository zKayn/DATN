'use client'

import { useEffect, useState } from 'react'

export default function FloatingLanterns() {
  const [show, setShow] = useState(true)

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setShow(false)
    }
  }, [])

  if (!show) return null

  const lanterns = [
    { id: 1, left: '5%', delay: '0s', duration: '15s' },
    { id: 2, left: '15%', delay: '3s', duration: '18s' },
    { id: 3, left: '85%', delay: '6s', duration: '20s' },
    { id: 4, left: '92%', delay: '9s', duration: '16s' },
    { id: 5, left: '50%', delay: '12s', duration: '19s' },
  ]

  return (
    <div className="fixed inset-0 pointer-events-none z-[3] overflow-hidden" aria-hidden="true">
      {lanterns.map((lantern) => (
        <div
          key={lantern.id}
          className="absolute bottom-0"
          style={{
            left: lantern.left,
            animation: `floatUp ${lantern.duration} ease-in-out infinite ${lantern.delay}`,
          }}
        >
          <div
            className="relative w-12 h-16 opacity-70"
            style={{
              animation: `sway 3s ease-in-out infinite ${lantern.delay}`,
            }}
          >
            {/* Lantern SVG */}
            <svg
              viewBox="0 0 100 140"
              className="w-full h-full drop-shadow-lg"
            >
              {/* Top cap */}
              <rect x="40" y="5" width="20" height="8" fill="#78350f" rx="2" />

              {/* Hanger */}
              <line x1="50" y1="0" x2="50" y2="5" stroke="#78350f" strokeWidth="2" />

              {/* Lantern body - Red for Tết */}
              <ellipse cx="50" cy="15" rx="25" ry="5" fill="#dc2626" />
              <rect x="25" y="15" width="50" height="60" fill="#dc2626" rx="5" />
              <ellipse cx="50" cy="75" rx="25" ry="5" fill="#b91c1c" />

              {/* Gold decorative patterns */}
              <circle cx="50" cy="35" r="8" fill="#f59e0b" opacity="0.6" />
              <circle cx="50" cy="55" r="8" fill="#f59e0b" opacity="0.6" />

              {/* Glow effect */}
              <ellipse cx="50" cy="45" rx="20" ry="25" fill="url(#lanternGlow)" />

              {/* Bottom tassel */}
              <line x1="50" y1="75" x2="45" y2="90" stroke="#fbbf24" strokeWidth="2" />
              <line x1="50" y1="75" x2="50" y2="95" stroke="#fbbf24" strokeWidth="2" />
              <line x1="50" y1="75" x2="55" y2="90" stroke="#fbbf24" strokeWidth="2" />
              <circle cx="45" cy="90" r="3" fill="#f59e0b" />
              <circle cx="50" cy="95" r="3" fill="#f59e0b" />
              <circle cx="55" cy="90" r="3" fill="#f59e0b" />

              {/* Gradient definition for glow */}
              <defs>
                <radialGradient id="lanternGlow">
                  <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
                </radialGradient>
              </defs>
            </svg>
          </div>
        </div>
      ))}
    </div>
  )
}
