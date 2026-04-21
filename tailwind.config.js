module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        glass: {
          100: 'rgba(255, 255, 255, 0.10)',
          200: 'rgba(255, 255, 255, 0.15)',
          300: 'rgba(255, 255, 255, 0.20)',
          400: 'rgba(255, 255, 255, 0.25)',
          500: 'rgba(255, 255, 255, 0.30)',
          border: 'rgba(255, 255, 255, 0.18)',
        },
        primary: {
          DEFAULT: '#dc2626',
          light: '#ef4444',
          dark: '#b91c1c',
        },
        sky: {
          DEFAULT: '#0ea5e9',
          light: '#38bdf8',
          dark: '#0284c7',
        },
        accent: {
          red: '#dc2626',
          blue: '#0ea5e9',
        },
        gold: {
          light: '#F9E29C',
          DEFAULT: '#D4AF37',
          dark: '#B8962E',
        },
      },
      backgroundImage: {
        'premium-gradient': 'linear-gradient(135deg, #dc2626 0%, #0ea5e9 100%)',
        'red-gradient': 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
        'blue-gradient': 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)',
        'dark-gradient': 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
        'gold-gradient': 'linear-gradient(135deg, #D4AF37 0%, #F9E29C 50%, #D4AF37 100%)',
        'radial-dark': 'radial-gradient(ellipse at top, #1e293b 0%, #0f172a 50%, #010409 100%)',
      },
      backdropBlur: {
        glass: '16px',
        xl: '24px',
      },
      boxShadow: {
        'crimson-glow': '0 0 20px rgba(225, 29, 72, 0.2)',
        'crimson-strong': '0 0 30px rgba(225, 29, 72, 0.3)',
        'crimson-intense': '0 8px 24px rgba(220, 38, 38, 0.4)',
        'gold-glow': '0 0 20px rgba(212, 175, 55, 0.3)',
        'glass-lift': '0 12px 40px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'liquid': 'liquid 1.5s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s ease-in-out infinite',
      },
      keyframes: {
        liquid: {
          '0%, 100%': { transform: 'scaleY(1)' },
          '50%': { transform: 'scaleY(1.02)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(220, 38, 38, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(14, 165, 233, 0.5)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
    },
  },
  plugins: [],
}