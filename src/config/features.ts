// Feature flags para controlar la visibilidad de funcionalidades
export const FEATURES = {
  // Habilitar/deshabilitar la funcionalidad de contactos en general
  // Cuando está deshabilitado, los contactos no se mostrarán ni en clientes ni en destinos
  ENABLE_CONTACTOS: false,
} as const;

// Tipo para acceder a las keys de los feature flags
export type FeatureKey = keyof typeof FEATURES;

// Función helper para verificar si un feature está habilitado
export const isFeatureEnabled = (feature: FeatureKey): boolean => {
  return FEATURES[feature];
}; 