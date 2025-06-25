/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_USE_MOCK_REMITOS: string
  // más variables de entorno...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 