/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        obsidian: { 900: '#0B0C10', 800: '#15161A', 700: '#1F2128' }, // legacy
        champagne: { 300: '#F5E6D3', 400: '#E6C9A8', 500: '#D4AF37', 600: '#AA8C2C' }, // legacy
        midnight: {
          900: '#090A0F', // deep SaaS bg
          800: '#12141D', // cards
          700: '#1C1F2B', // borders/hover
        },
        accent: {
          blue: '#3B82F6', // vivid blue
          emerald: '#10B981', // success green
          purple: '#8B5CF6',
          orange: '#F97316'
        },
        pearl: '#F8FAFC',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'], // legacy
        display: ['"Outfit"', 'sans-serif'],
        sans: ['"Inter"', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-glow': 'pulseGlow 2s infinite',
        'reticle-spin': 'reticleSpin 8s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        reticleSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      }
    },
  },
  plugins: [],
}
