/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        abyss: {
          // 50: "#fdf8f6",
          // 100: "#f2e8e5",
          // 200: "#eaddd7",
          // 300: "#e0cec7",
          // 400: "#d2bab0",
          500: '#4f4f4f',
          600: '#454545',
          700: '#393939',
          750: '#2d2d2d',
          800: '#272727',
          850: '#262626',
          900: '#202020',
        },
        haruki: {
          50: '#fefdfc',
          100: '#fcf8f6',
          200: '#f9f1ec',
          300: '#f0e8e4',
          400: '#d4cdc9',
        },
        primary: {
          dark: '#21b5ff',
          light: '#0284c7',
        },
      },
      spacing: {
        15: '3.75rem',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      },
    },
  },
  plugins: [require('tailwind-scrollbar')({ nocompatible: true })],
  variants: {
    scrollbar: ['dark'],
  },
  darkMode: 'class',
};
