/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'luxury-serif': ['Playfair Display', 'serif'],
        'luxury-script': ['Cormorant Garamond', 'serif'],
        'luxury-sans': ['Inter', 'sans-serif'],
      },
      colors: {
        'gold': {
          50: '#fefdf8',
          100: '#fdf9e7',
          200: '#f4e4a1',
          300: '#ffd700',
          400: '#d4af37',
          500: '#b8860b',
          600: '#9a7209',
          700: '#7d5e08',
          800: '#604806',
          900: '#433305',
        },
        'marble': {
          white: '#f8f8f8',
          cream: '#faf8f3',
          gray: '#e8e6e1',
        },
        'spiritual': {
          'cross-gold': '#daa520',
          'memorial-purple': '#6b46c1',
          'heavenly-blue': '#3b82f6',
        }
      },
      boxShadow: {
        'luxury': '0 20px 40px rgba(0, 0, 0, 0.1)',
        'gold-glow': '0 0 30px rgba(212, 175, 55, 0.3)',
        'diamond-shine': '0 0 20px rgba(255, 255, 255, 0.6)',
      },
      animation: {
        'marble-shift': 'marbleShift 20s ease-in-out infinite',
        'shimmer': 'shimmer 3s ease-in-out infinite',
        'gold-pulse': 'goldPulse 2s ease-in-out infinite alternate',
        'sparkle': 'sparkle 2s ease-in-out infinite',
        'holy-glow': 'holyGlow 3s ease-in-out infinite alternate',
        'luxury-spin': 'luxurySpin 1.5s linear infinite',
        'float': 'float 8s ease-in-out infinite',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      backdropBlur: {
        'xl': '24px',
        '2xl': '40px',
      }
    },
  },
  plugins: [],
}
