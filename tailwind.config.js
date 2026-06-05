/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Warm, refined luxury palette — forest, brass, cream, charcoal
        forest: {
          50: '#f3f6f4', 100: '#e3ebe5', 200: '#c6d6ca', 300: '#9db8a4',
          400: '#6f9279', 500: '#4f7459', 600: '#3d5c46', 700: '#324a3a',
          800: '#2a3c30', 900: '#243228', 950: '#121c16',
        },
        brass: {
          50: '#fbf8f1', 100: '#f5ecd9', 200: '#ead7b1', 300: '#dcba80',
          400: '#cf9d53', 500: '#c4863a', 600: '#ad6c2f', 700: '#905329',
          800: '#764328', 900: '#623923', 950: '#381d11',
        },
        cream: {
          50: '#fdfcf9', 100: '#faf6ee', 200: '#f3ead6', 300: '#ead9bb',
        },
        ink: '#1a1714',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body: ['Jost', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        lux: '0 24px 60px -24px rgba(36, 50, 40, 0.45)',
        soft: '0 8px 30px -12px rgba(26, 23, 20, 0.18)',
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
      keyframes: {
        'fade-up': { '0%': { opacity: '0', transform: 'translateY(24px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
      },
      animation: {
        'fade-up': 'fade-up 0.8s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in': 'fade-in 1s ease both',
      },
    },
  },
  plugins: [],
};
