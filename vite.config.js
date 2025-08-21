import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Cargar variables de entorno según el modo
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    define: {
      // Hacer las variables de entorno disponibles globalmente
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL),
      'import.meta.env.VITE_RENDER_API_URL': JSON.stringify(env.VITE_RENDER_API_URL),
      'import.meta.env.VITE_USE_RENDER_API': JSON.stringify(env.VITE_USE_RENDER_API),
    }
  }
})
