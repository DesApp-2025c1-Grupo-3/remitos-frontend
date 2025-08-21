# Sistema de Remitos - Frontend

Aplicación web para gestión de remitos desarrollada con React, Vite y Tailwind CSS.

## 🚀 Inicio Rápido

### Prerrequisitos
- [Node.js](https://nodejs.org/) (versión 16 o superior)
- [npm](https://www.npmjs.com/) o [yarn](https://yarnpkg.com/)

### Instalación y Configuración

1. **Instalar dependencias:**
```bash
npm install
```

2. **Configurar variables de entorno:**
```bash
cp .env.example .env
```

3. **Ejecutar en modo desarrollo:**
```bash
# Desarrollo con API local (localhost:3002)
npm run dev

# Desarrollo con API de Render
npm run dev:render
```

## 📋 Variables de Entorno

Configura las siguientes variables en tu archivo `.env`:

```env
# URL base de la API
VITE_API_URL=http://localhost:3002
VITE_RENDER_API_URL=https://remitos-backend.onrender.com

# Configuración para elegir qué API usar
# true = usar API de Render, false = usar API local
VITE_USE_RENDER_API=false
```

## 🛠️ Comandos Disponibles

### Desarrollo
```bash
# Servidor de desarrollo con API local (localhost:3002)
npm run dev

# Servidor de desarrollo con API de Render
npm run dev:render

# Ver preview de la build
npm run preview
```

### Build
```bash
# Build para producción con API local
npm run build

# Build para producción con API de Render
npm run build:render
```

### Calidad de Código
```bash
# Ejecutar linter
npm run lint
```

## 📁 Estructura del Proyecto

```
remitos-frontend/
├── public/                 # Archivos estáticos
├── src/
│   ├── components/         # Componentes reutilizables
│   ├── pages/             # Páginas de la aplicación
│   ├── services/          # Servicios para comunicación con API
│   ├── config/            # Configuración (API, etc.)
│   ├── hooks/             # Custom hooks de React
│   ├── utils/             # Utilidades y helpers
│   └── App.jsx            # Componente principal
├── .env.example           # Variables de entorno de ejemplo
├── vite.config.js         # Configuración de Vite
├── tailwind.config.js     # Configuración de Tailwind CSS
└── package.json           # Dependencias y scripts
```

## 🎨 Tecnologías Utilizadas

- **React 18** - Biblioteca de interfaz de usuario
- **Vite** - Herramienta de build rápida
- **Tailwind CSS** - Framework de CSS utilitario
- **Axios** - Cliente HTTP para llamadas a la API
- **React Router** - Enrutamiento de la aplicación
- **Lucide React** - Iconos modernos
- **Recharts** - Gráficos y visualizaciones

## 🔧 Desarrollo

### Modos de Desarrollo
- **API Local**: Conecta con el backend corriendo en `localhost:3002`
- **API Render**: Conecta con el backend desplegado en Render

### Cambiar entre APIs
Para cambiar entre usar la API local y la de Render, puedes:

1. **Modificar el archivo `.env`:**
   ```bash
   # Para usar API local
   VITE_USE_RENDER_API=false
   
   # Para usar API de Render
   VITE_USE_RENDER_API=true
   ```

2. **Usar los comandos predefinidos:**
   ```bash
   # Desarrollo con API local
   npm run dev
   
   # Desarrollo con API de Render
   npm run dev:render
   ```

3. **Cambiar temporalmente desde la línea de comandos:**
   ```bash
   # Usar API de Render temporalmente
   VITE_USE_RENDER_API=true npm run dev
   ```

### Hot Reload
La aplicación se recarga automáticamente cuando detecta cambios en el código.

### Linting
El proyecto incluye ESLint configurado para mantener la calidad del código.

## 🚀 Despliegue

### Build de Producción
```bash
# Para API local
npm run build

# Para API de Render
npm run build:render
```

### Servir Build
```bash
npm run preview
```

## 📝 Notas

- La aplicación corre en `http://localhost:5173` por defecto en desarrollo
- Asegúrate de que el backend esté corriendo en `localhost:3002` antes de usar la API local
- El comando `npm run dev` usa por defecto la API local (`localhost:3002`)
- El comando `npm run dev:render` usa la API de Render
