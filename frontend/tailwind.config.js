/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f5f5',
          100: '#d9e5e5',
          200: '#b3cbcc',
          300: '#8db1b2',
          400: '#679799',
          500: '#3d5a5c', // Color principal Sierra Yara
          600: '#314849',
          700: '#253637',
          800: '#192425',
          900: '#0d1212',
        },
        accent: {
          50: '#faf8f5',
          100: '#f5f1eb',
          200: '#e8dfd0',
          300: '#d4c4a8',
          400: '#c0a980',
          500: '#a68d5f', // Beige/crema del diseño
          600: '#8b7550',
          700: '#6a5a3d',
          800: '#4a3f2a',
          900: '#2a2418',
        },
        cafe: {
          50: '#fdf8f6',
          100: '#f2e8e5',
          200: '#eaddd7',
          300: '#e0cec7',
          400: '#d2bab0',
          500: '#bfa094',
          600: '#a18072',
          700: '#977669',
          800: '#846358',
          900: '#43302b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Cinzel', 'Playfair Display', 'Georgia', 'serif'],
        elegant: ['Cormorant Garamond', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
