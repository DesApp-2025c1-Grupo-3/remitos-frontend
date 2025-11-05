/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Busca en todos los archivos .js, .ts, .jsx y .tsx dentro de src/
  ],
  theme: {
    extend: {
      colors: {
        // Nuevo sistema de colores basado en las imágenes de referencia
        primary: {
          DEFAULT: '#E65F2B', // Naranja principal actualizado
          light: '#FF8A65',
          dark: '#C94715',
          orange: '#E65F2B', // Naranja específico para sidebar
          50: '#FFF3E0',
          100: '#FFE0B2',
          200: '#FFCC80',
          300: '#FFB74D',
          400: '#FFA726',
          500: '#E65F2B',
          600: '#FF5722',
          700: '#C94715',
          800: '#D84315',
          900: '#BF360C',
        },
        'menu-hover': '#FFF3E0',
        secondary: {
          DEFAULT: '#343A40', // Gris oscuro para sidebar
          light: '#6C757D',
          dark: '#212529',
          50: '#F8F9FA',
          100: '#E9ECEF',
          200: '#DEE2E6',
          300: '#CED4DA',
          400: '#ADB5BD',
          500: '#6C757D',
          600: '#495057',
          700: '#343A40',
          800: '#212529',
          900: '#0D1117',
        },
        accent: {
          blue: '#2196F3', // Para tags AR Nacional
          purple: '#9C27B0', // Para tags International
          blueLight: '#E3F2FD',
          purpleLight: '#F3E5F5',
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
        // Colores adicionales para estados
        status: {
          autorizado: '#2196F3',
          preparacion: '#FF9800',
          carga: '#9C27B0',
          camino: '#FF6B35',
          entregado: '#4CAF50',
          retenido: '#F44336',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};