/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#effefb',
          100: '#c8fff4',
          200: '#91fee9',
          300: '#52f5da',
          400: '#20e0c5',
          500: '#08c4ac',
          600: '#049e8d',
          700: '#087e72',
          800: '#0c645c',
          900: '#0f524c',
          950: '#013330',
        },
        warm: {
          50: '#fefcf8',
          100: '#fdf8ed',
          200: '#faf0d6',
          300: '#f5e3b3',
          400: '#efd08a',
          500: '#e8b94f',
          600: '#d9a033',
          700: '#b57f28',
          800: '#936527',
          900: '#785324',
        }
      },
      fontFamily: {
        display: ['Bricolage Grotesque', 'sans-serif'],
        body: ['Outfit', 'sans-serif'],
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
}
