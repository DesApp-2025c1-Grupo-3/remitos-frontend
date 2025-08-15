// Configuración centralizada de la API
export const API_CONFIG = {
  
  // URL de Render (producción)
  RENDER_API_URL: import.meta.env.VITE_RENDER_API_URL,
  
  // URL activa - usa la de Render si está disponible, sino la local
  get ACTIVE_API_URL() {
    return import.meta.env.VITE_RENDER_API_URL || this.LOCAL_API_URL;
  },
  
  // URL específica para desarrollo local
  get DEV_API_URL() {
    return import.meta.env.VITE_API_URL || this.LOCAL_API_URL;
  }
};

// Función helper para obtener la URL base de la API
export const getApiUrl = (): string => {
  return API_CONFIG.ACTIVE_API_URL;
};

// Función helper para construir URLs completas
export const buildApiUrl = (endpoint: string): string => {
  const baseUrl = getApiUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${baseUrl}/${cleanEndpoint}`.replace(/([^:]\/)\/+/, '$1');
}; 