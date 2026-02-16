import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        mono: ['var(--font-jetbrains)', 'Courier New', 'monospace'],
        sans: ['var(--font-outfit)', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          50:  '#f9f6f0',
          100: '#f0e8d8',
          200: '#e0cdb0',
          300: '#c9a878',
          400: '#b88a52',
          500: '#9e6e38',
          600: '#7d5328',
          700: '#5e3d1e',
          800: '#3e2810',
          900: '#1e1208',
        },
        paper: {
          DEFAULT: '#faf8f4',
          dark:    '#1a1612',
        },
        amber: {
          glow: '#f5a623',
        }
      },
      animation: {
        'fade-up':    'fadeUp 0.4s ease-out forwards',
        'fade-in':    'fadeIn 0.3s ease-out forwards',
        'slide-in':   'slideIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%':   { opacity: '0', transform: 'translateX(-8px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateX(0) scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
}

export default config
