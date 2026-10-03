/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      animation: {
        marquee: 'marquee 22s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%':   { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      // Palette: 60% white/cream · 25% navy · 10% gold · 5% pale gold
      // The original key names are kept so any existing `bg-brand-*` /
      // `text-brand-*` classes keep working and pick up the new palette.
      colors: {
        brand: {
          pink: '#C9A227',       // was bright red — gold accent
          magenta: '#102A56',    // primary brand color (wordmark, CTAs, prices) is now navy
          rose: '#071A3A',       // hover/secondary tone is now deep navy
          green: '#E6D39A',      // neutral accent slot is now pale gold
          deepgreen: '#071A3A',  // darkest tone: deep navy
          gold: '#C9A227',       // gold accent
          cream: '#F8F6EF',      // warm off-white background
          ink: '#071A3A',        // text color

          // Helpers that match the constants used on the redesigned pages
          navy: '#102A56',
          navydark: '#071A3A',
          goldpale: '#E6D39A',
          goldwash: '#F8F6EF',   // cream tint for hovers and placeholders (replaces the old gold wash)
          inksoft: 'rgba(16, 42, 86, 0.65)', // secondary text
          line: 'rgba(230, 211, 154, 0.9)'   // pale-gold hairline borders
        }
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)']
      },
      boxShadow: {
        soft: '0 8px 30px -8px rgba(7, 26, 58, 0.15)'
      },
      borderRadius: {
        xl2: '1.25rem'
      }
    }
  },
  plugins: []
};