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
        // ── Premium Black & Gold ─────────────────────────────────
        noir: {
          950: '#000000', // absolute black
          900: '#050505', // near-black page bg
          800: '#0a0a0a', // card bg
          700: '#111111', // elevated card
          600: '#1a1a1a', // hover state / borders base
          500: '#222222', // subtle borders
        },
        gold: {
          50:  '#FFFDF0',
          100: '#FEF9D7',
          200: '#F9EDAC',
          300: '#F5E07A',
          400: '#EDD148',
          500: '#D4AF37', // primary gold
          600: '#B8960C',
          700: '#8F7209',
          800: '#664F06',
          900: '#3D2F04',
        },
        // Legacy aliases (keep for backward compat)
        champagne: {
          300: '#F5E6D3',
          400: '#E6C9A8',
          500: '#D4AF37',
          600: '#AA8C2C',
        },
        midnight: {
          900: '#000000',
          800: '#0a0a0a',
          700: '#111111',
        },
        accent: {
          gold:    '#D4AF37',
          blue:    '#3B82F6',
          emerald: '#10B981',
          purple:  '#8B5CF6',
          orange:  '#F97316',
          amber:   '#F59E0B',
        },
        pearl: '#F8FAFC',
      },
      fontFamily: {
        display: ['"Outfit"', 'sans-serif'],
        sans:    ['"Inter"',  'sans-serif'],
        serif:   ['"Playfair Display"', 'serif'],
        mono:    ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      boxShadow: {
        'gold-sm':  '0 2px 8px rgba(212,175,55,0.2)',
        'gold':     '0 4px 20px rgba(212,175,55,0.3)',
        'gold-lg':  '0 8px 40px rgba(212,175,55,0.4)',
        'gold-glow': '0 0 30px rgba(212,175,55,0.25), 0 0 60px rgba(212,175,55,0.1)',
        'noir':     '0 4px 30px rgba(0,0,0,0.9)',
        'noir-lg':  '0 10px 60px rgba(0,0,0,1)',
      },
      backgroundImage: {
        'gold-gradient':    'linear-gradient(135deg, #D4AF37 0%, #AA8C2C 50%, #D4AF37 100%)',
        'gold-radial':      'radial-gradient(circle, rgba(212,175,55,0.2) 0%, transparent 70%)',
        'noir-gradient':    'linear-gradient(180deg, #0a0a0a 0%, #000000 100%)',
        'card-gradient':    'linear-gradient(145deg, #111111 0%, #080808 100%)',
      },
      animation: {
        'fade-in':       'fadeIn 0.5s ease-out',
        'slide-up':      'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'gold-pulse':    'goldPulse 2.5s ease-in-out infinite',
        'shimmer':       'shimmer 2s infinite',
        'float':         'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp:   { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        goldPulse: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(212,175,55,0.3)' },
          '50%':      { boxShadow: '0 0 25px rgba(212,175,55,0.6)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
}
