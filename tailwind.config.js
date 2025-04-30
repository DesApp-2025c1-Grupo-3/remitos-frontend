/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Busca en todos los archivos .js, .ts, .jsx y .tsx dentro de src/
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1F7A3D',
          light: '#28A050',
          dark: '#175F2F',
        },
        secondary: {
          DEFAULT: '#4A4A4A',
          light: '#6A6A6A',
          dark: '#333333',
        },
        success: {
          DEFAULT: '#4CAF50',
          light: '#81C784',
          dark: '#388E3C',
        },
        warning: {
          DEFAULT: '#FF9800',
          light: '#FFB74D',
          dark: '#F57C00',
        },
        error: {
          DEFAULT: '#F44336',
          light: '#E57373',
          dark: '#D32F2F',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};