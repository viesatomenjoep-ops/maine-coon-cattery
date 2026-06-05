/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Warm, relaxed Ibiza earth tones: sand, terracotta, beige, cream, ink
        sand: {
          50: '#faf8f5', 100: '#f5f0e6', 200: '#ebe0cc', 300: '#decba9',
          400: '#ceb284', 500: '#bd9861', 600: '#a77e47', 700: '#876335',
          800: '#644825', 900: '#423019', 950: '#261b0e',
        },
        terracotta: {
          50: '#fcf6f4', 100: '#f9ece7', 200: '#f2d3c7', 300: '#e7b39e',
          400: '#db8d72', 500: '#ce6b4c', 600: '#b65436', 700: '#904128',
          800: '#6a301d', 900: '#451e12', 950: '#28110a',
        },
        beige: {
          50: '#faf8f6', 100: '#f5ece5', 200: '#e9d6c8', 300: '#dbc0ac',
          400: '#caaa92', 500: '#b89379', 600: '#a47b62', 700: '#84604c',
          800: '#624536', 900: '#412d23', 950: '#261b14',
        },
        cream: {
          50: '#fdfdfb', 100: '#faf9f5', 200: '#f5f2ea', 300: '#ece6d8',
        },
        ink: '#1c140f',
      },
      fontSize: {
        xs: ['0.95rem', { lineHeight: '1.4' }],
        sm: ['1.1rem', { lineHeight: '1.5' }],
        base: ['1.25rem', { lineHeight: '1.6' }],
        lg: ['1.4rem', { lineHeight: '1.6' }],
        xl: ['1.55rem', { lineHeight: '1.6' }],
        '2xl': ['1.8rem', { lineHeight: '2.25rem' }],
        '3xl': ['2.2rem', { lineHeight: '2.5rem' }],
        '4xl': ['2.8rem', { lineHeight: '1.15' }],
        '5xl': ['3.6rem', { lineHeight: '1.1' }],
        '6xl': ['4.5rem', { lineHeight: '1.05' }],
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        body: ['Montserrat', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        lux: '0 24px 60px -24px rgba(106, 48, 29, 0.2)',
        soft: '0 8px 30px -12px rgba(60, 46, 39, 0.1)',
        glow: '0 0 25px rgba(206, 107, 76, 0.15)',
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
      keyframes: {
        'fade-up': { '0%': { opacity: '0', transform: 'translateY(24px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'fade-slow': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
      },
      animation: {
        'fade-up': 'fade-up 0.8s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in': 'fade-in 1s ease both',
        'fade-slow': 'fade-slow 2.5s ease both',
      },
    },
  },
  plugins: [],
};
