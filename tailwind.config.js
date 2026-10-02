/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        fashion: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        curvy: ['"Ephesis"', 'cursive'],
        display: ['"Playfair Display"', 'serif'],
        syne: ['"Syne"', 'sans-serif']
      },
      colors: {
        matcha: {
          50: '#f8faf5',
          100: '#eef3e8',
          200: '#dce6d1',
          300: '#c2d4b2',
          400: '#a3be8e',
          500: '#84a56c',
          600: '#678650',
          700: '#506a3e',
          800: '#3f5332',
          900: '#2c3b23',
          950: '#192314',
        },
        cream: {
          50: '#fdfdfb',
          100: '#f9faf6',
          200: '#f2f4ec',
          300: '#e6eae0',
          400: '#d5dbcc',
        },
        linen: '#f4f6f0',
        ink: '#192216'
      },
      boxShadow: {
        'fashion': '0 10px 30px -10px rgba(63, 83, 50, 0.08), 0 4px 6px -2px rgba(63, 83, 50, 0.04)',
        'fashion-lg': '0 20px 40px -15px rgba(44, 59, 35, 0.12)',
        'glow-matcha': '0 0 25px rgba(132, 165, 108, 0.25)',
      }
    },
  },
  plugins: [],
}
