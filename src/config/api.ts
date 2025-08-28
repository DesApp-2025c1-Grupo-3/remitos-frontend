// Configuración centralizada de la API
export const API_CONFIG = {
  // URL de Render (producción)
  RENDER_API_URL: import.meta.env.VITE_RENDER_API_URL,
  
  // URL local para desarrollo
  LOCAL_API_URL: import.meta.env.VITE_API_URL,
  
  // URL activa - usa la de Render si está disponible, sino la local
  get ACTIVE_API_URL() {
    return this.RENDER_API_URL || this.LOCAL_API_URL;
  },
  
  // URL específica para desarrollo local
  get DEV_API_URL() {
    return this.LOCAL_API_URL || 'http://localhost:3002';
  }
};

// Función helper para obtener la URL base de la API
export const getApiUrl = (): string => {
  // Usar la URL de Render si está configurada explícitamente
  if (import.meta.env.VITE_USE_RENDER_API === 'true') {
    return API_CONFIG.RENDER_API_URL || 'https://remitos-backend.onrender.com';
  }
  
  // Por defecto, usar la URL local
  const localUrl = API_CONFIG.LOCAL_API_URL || 'http://localhost:3002';
  return localUrl;
};

// Función helper para construir URLs completas
export const buildApiUrl = (endpoint: string): string => {
  const baseUrl = getApiUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${baseUrl}/${cleanEndpoint}`.replace(/([^:]\/)\/+/, '$1');
}; 