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
        // FRESH GREEN TO CYAN Gradient - Modern Fresh Theme
        primary: {
          // FRESH GREEN - Main brand (#43e97b)
          50: '#e8fdf0',
          100: '#c6fad7',
          200: '#a4f7be',
          300: '#82f4a5',
          400: '#60f18c',
          500: '#43e97b', // Main - Fresh green
          600: '#36ba62',
          700: '#298c4a',
          800: '#1c5d31',
          900: '#0f2f19',
        },
        accent: {
          // VIBRANT CYAN - Accent (#38f9d7)
          50: '#e7fef9',
          100: '#c4fcf0',
          200: '#a1fae7',
          300: '#7ef8de',
          400: '#5bf6d5',
          500: '#38f9d7', // Main - Vibrant cyan
          600: '#2dc7ac',
          700: '#229581',
          800: '#176456',
          900: '#0c322b',
        },
        secondary: {
          // TEAL BLEND - Secondary accent
          50: '#e8fcf5',
          100: '#c5f7e5',
          200: '#a2f2d5',
          300: '#7fedc5',
          400: '#5ce8b5',
          500: '#3ee3a5',
          600: '#32b684',
          700: '#258863',
          800: '#195b42',
          900: '#0d2d21',
        },
        success: {
          // LIGHT GREEN - Success states
          50: '#e9fef1',
          100: '#c8fcd9',
          200: '#a7fac1',
          300: '#86f8a9',
          400: '#65f691',
          500: '#44f479',
          600: '#37c361',
          700: '#2a9249',
          800: '#1c6131',
          900: '#0e3118',
        },
        warning: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
      },
      // Professional spacing scale
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      // Enhanced typography with display sizes
      fontSize: {
        // Display sizes - BOLD & IMPACTFUL
        'display-xl': ['5rem', { lineHeight: '1', letterSpacing: '-0.05em', fontWeight: '900' }],
        'display-lg': ['4rem', { lineHeight: '1.1', letterSpacing: '-0.04em', fontWeight: '800' }],
        'display-md': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.03em', fontWeight: '800' }],
        // Headings
        'h1': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.03em', fontWeight: '700' }],
        'h2': ['2rem', { lineHeight: '1.3', letterSpacing: '-0.02em', fontWeight: '700' }],
        'h3': ['1.5rem', { lineHeight: '1.4', letterSpacing: '-0.01em', fontWeight: '600' }],
        // Standard sizes
        'xs': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.02em' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.01em' }],
        'base': ['1rem', { lineHeight: '1.5rem', letterSpacing: '0' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
        '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.02em' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.02em' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.03em' }],
        '5xl': ['3rem', { lineHeight: '1', letterSpacing: '-0.03em' }],
        '6xl': ['3.75rem', { lineHeight: '1', letterSpacing: '-0.04em' }],
        // Body sizes
        'body-lg': ['1.125rem', { lineHeight: '1.75', letterSpacing: '0', fontWeight: '400' }],
        'body': ['1rem', { lineHeight: '1.6', letterSpacing: '0', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0.01em', fontWeight: '400' }],
      },
      // Professional shadows
      boxShadow: {
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'DEFAULT': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['var(--font-montserrat)', 'sans-serif'], // Bold headings
        body: ['var(--font-inter)', 'sans-serif'], // Clean readable body
        accent: ['var(--font-poppins)', 'sans-serif'], // CTAs, badges
      },
      // Professional animations
      animation: {
        // Fade animations
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-in-slow': 'fadeIn 0.5s ease-out',
        'fade-out': 'fadeOut 0.2s ease-in',
        // Slide animations
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-left': 'slideLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-right': 'slideRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        // Scale animations
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-out': 'scaleOut 0.15s cubic-bezier(0.4, 0, 1, 1)',
        // Bounce animation
        'bounce-subtle': 'bounceSubtle 0.6s ease-out',
        // Shimmer for loading
        'shimmer': 'shimmer 2s linear infinite',
        // Pulse for emphasis
        'pulse-subtle': 'pulseSubtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        // NEW BOLD ANIMATIONS
        'gradient-shift': 'gradientShift 8s ease infinite',
        'float-particle': 'floatParticle 20s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shine': 'shine 2s linear infinite',
        'bounce-in': 'bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'slide-in-right': 'slideInRight 0.5s ease-out',
        'slide-in-left': 'slideInLeft 0.5s ease-out',
        'zoom-in': 'zoomIn 0.5s ease-out',
        'rotate-in': 'rotateIn 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.95)', opacity: '0' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        // NEW BOLD KEYFRAMES
        gradientShift: {
          '0%, 100%': {
            backgroundPosition: '0% 50%',
            backgroundSize: '200% 200%'
          },
          '50%': {
            backgroundPosition: '100% 50%',
            backgroundSize: '200% 200%'
          },
        },
        floatParticle: {
          '0%, 100%': {
            transform: 'translateY(0) translateX(0) rotate(0deg)',
            opacity: '0.3'
          },
          '25%': {
            transform: 'translateY(-100px) translateX(50px) rotate(90deg)',
            opacity: '0.5'
          },
          '50%': {
            transform: 'translateY(-150px) translateX(-50px) rotate(180deg)',
            opacity: '0.3'
          },
          '75%': {
            transform: 'translateY(-100px) translateX(-100px) rotate(270deg)',
            opacity: '0.5'
          },
        },
        pulseGlow: {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(67,233,123,0.6)',
            transform: 'scale(1)'
          },
          '50%': {
            boxShadow: '0 0 40px rgba(67,233,123,0.9)',
            transform: 'scale(1.05)'
          },
        },
        shine: {
          '0%': {
            transform: 'translateX(-100%) skewX(-15deg)',
            opacity: '0'
          },
          '50%': {
            opacity: '0.5'
          },
          '100%': {
            transform: 'translateX(200%) skewX(-15deg)',
            opacity: '0'
          },
        },
        bounceIn: {
          '0%': {
            transform: 'scale(0.3)',
            opacity: '0'
          },
          '50%': {
            transform: 'scale(1.05)'
          },
          '70%': {
            transform: 'scale(0.9)'
          },
          '100%': {
            transform: 'scale(1)',
            opacity: '1'
          },
        },
        slideInRight: {
          '0%': {
            transform: 'translateX(100%)',
            opacity: '0'
          },
          '100%': {
            transform: 'translateX(0)',
            opacity: '1'
          },
        },
        slideInLeft: {
          '0%': {
            transform: 'translateX(-100%)',
            opacity: '0'
          },
          '100%': {
            transform: 'translateX(0)',
            opacity: '1'
          },
        },
        zoomIn: {
          '0%': {
            transform: 'scale(0)',
            opacity: '0'
          },
          '100%': {
            transform: 'scale(1)',
            opacity: '1'
          },
        },
        rotateIn: {
          '0%': {
            transform: 'rotate(-180deg) scale(0)',
            opacity: '0'
          },
          '100%': {
            transform: 'rotate(0) scale(1)',
            opacity: '1'
          },
        },
      },
      // Smooth transitions
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },
  plugins: [],
}
export default config
