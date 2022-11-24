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
          // 500: "#bfa094",
          600: '#454545',
          700: '#393939',
          750: '#2d2d2d',
          800: '#272727',
          850: '#262626',
          900: '#202020',
        },
      },
      spacing: {
        15: '3.75rem',
      },
    },
  },
  plugins: [require('tailwind-scrollbar')({ nocompatible: true })],
  variants: {
    scrollbar: ['dark'],
  },
};
