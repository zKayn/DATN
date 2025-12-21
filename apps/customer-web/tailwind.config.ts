import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        secondary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        accent: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        festive: {
          cream: '#FFF8DC',
          ivory: '#FFFFF0',
          snow: '#FFFAFA',
          charcoal: '#2C3E50',
          warmGray: '#F5F5F0',
        }
      },
      backgroundImage: {
        'festive-primary': 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
        'festive-secondary': 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
        'festive-accent': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        'festive-hero': 'linear-gradient(135deg, #dc2626 0%, #16a34a 50%, #f59e0b 100%)',
        'festive-glow': 'radial-gradient(circle, rgba(239, 68, 68, 0.15) 0%, transparent 70%)',
        'snow-overlay': 'linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'snowfall': 'snowfall 10s linear infinite',
        'float-up': 'floatUp 15s ease-in-out infinite',
        'sway': 'sway 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
        'sparkle': 'sparkle 1.5s ease-in-out infinite',
        'firework': 'fireworkBurst 1s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        snowfall: {
          '0%': { transform: 'translateY(-10vh) translateX(0)' },
          '100%': { transform: 'translateY(110vh) translateX(20px)' }
        },
        floatUp: {
          '0%': { transform: 'translateY(100vh)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateY(-10vh)', opacity: '0' }
        },
        sway: {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(15px)' }
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(239, 68, 68, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(239, 68, 68, 0.8), 0 0 30px rgba(245, 158, 11, 0.6)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        sparkle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(1.2)' }
        },
        fireworkBurst: {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '50%': { opacity: '1' },
          '100%': { transform: 'scale(4)', opacity: '0' }
        }
      },
    },
  },
  plugins: [],
}
export default config
