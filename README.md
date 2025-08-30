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
```
