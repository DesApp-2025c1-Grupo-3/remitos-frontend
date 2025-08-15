# Remitos Frontend

Aplicación frontend para gestión de remitos desarrollada con React y Vite.

## Tecnologías utilizadas

- React 18
- Vite
- Tailwind CSS
- Axios
- React Router

## Configuración

### Variables de entorno

La aplicación utiliza las siguientes variables de entorno:

- `VITE_API_URL`: URL de la API para desarrollo local (por defecto: http://localhost:3001)
- `VITE_RENDER_API_URL`: URL de la API desplegada en Render (configurada en tu archivo .env)

### Configuración para Render

Para usar la API de Render, asegúrate de tener en tu archivo `.env`:

```bash
VITE_RENDER_API_URL=https://remitos-backend.onrender.com
```

### Archivos de configuración

- `.env`: Variables de entorno para desarrollo local
- `.env.render`: Variables de entorno para el modo Render (se crea automáticamente cuando usas `--mode render`)

## Comandos disponibles

### Desarrollo
```bash
npm run dev          # Desarrollo local con API local
npm run dev:render   # Desarrollo local con API de Render
```

### Build
```bash
npm run build        # Build para producción con API local
npm run build:render # Build para producción con API de Render
```

### Otros
```bash
npm run lint         # Ejecuta el linter
npm run preview      # Previsualiza el build de producción
```

## Uso

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Configurar variables de entorno en tu archivo `.env`:
   ```
   VITE_RENDER_API_URL=https://remitos-backend.onrender.com
   ```

3. Ejecutar la aplicación:
   - Para desarrollo con API local: `npm run dev`
   - Para desarrollo con API de Render: `npm run dev:render`

## Estructura del proyecto

- `src/config/api.ts`: Configuración centralizada de la API
- `src/services/`: Servicios para comunicación con la API
- `src/components/`: Componentes reutilizables
- `src/pages/`: Páginas de la aplicación
