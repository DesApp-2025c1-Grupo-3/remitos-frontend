# Notas de Migración - Material UI

## Cambios Realizados

### ✅ Configuración de Material UI

1. **Tema personalizado**: Creado en `src/config/customMuiTheme.ts`
   - Color primario actualizado a `#E65F2B`
   - Tipografía: Poppins
   - Estilos personalizados para componentes MUI

2. **ThemeProvider**: Implementado en `src/providers/ThemeProvider.tsx`
   - Integrado en `src/main.jsx`

3. **Actualización de colores**:
   - CSS Variables en `src/index.css` actualizadas
   - Tailwind config actualizado para consistencia

### ✅ Componentes Migrados desde "estilos combinados"

Los siguientes componentes fueron adaptados desde la carpeta de referencia:

- `EntityCard` - Cards responsive para móvil/tablet
- `PaginationEntity` - Paginación con Material UI
- `SectionHeader` - Encabezado de secciones con botón de acción
- `LoadingState` - Estado de carga
- `ConfirmDialog` - Diálogo de confirmación MUI
- `MenuItem` - Menú contextual con Popover
- `ButtonAdd` - Botón de agregar

### ✅ Páginas Refactorizadas

#### Remitos (`src/pages/remitos/Remitos.jsx`)
- ✅ Tabla MUI en desktop
- ✅ EntityCards en móvil/tablet
- ✅ PaginationEntity
- ✅ SectionHeader
- ✅ MenuItem para acciones
- ✅ ConfirmDialog

#### Clientes (`src/pages/clientes/Clientes.jsx`)
- ✅ Tabla MUI en desktop
- ✅ EntityCards en móvil/tablet
- ✅ PaginationEntity
- ✅ SectionHeader
- ✅ MenuItem para acciones
- ✅ ConfirmDialog

#### Destinos (`src/pages/destinos/Destinos.jsx`)
- ✅ Tabla MUI en desktop
- ✅ EntityCards en móvil/tablet
- ✅ PaginationEntity
- ✅ SectionHeader
- ✅ MenuItem para acciones
- ✅ ConfirmDialog

### ✅ Archivos Eliminados

- `src/components/ConfirmModal/ConfirmModal.module.css` (reemplazado por MUI)
- `src/components/Pagination/Pagination.tsx` (reemplazado por PaginationEntity)
- `src/components/Pagination/Pagination.module.css` (reemplazado por PaginationEntity)

### ⚠️ Archivos Mantenidos

Los siguientes archivos CSS se mantienen porque contienen estilos específicos no cubiertos por MUI:

- `src/styles/table.module.css` - Mantiene estilos para compatibilidad con otras páginas
- `src/pages/remitos/remitos.module.css` - Estilos específicos de remitos (prioridad, estados)
- `src/pages/clientes/clientes.module.css` - Container y wrapper styles
- `src/pages/destinos/destinos.module.css` - Container y wrapper styles

## Diseño Responsive

### Breakpoints MUI
- **Mobile**: < 768px (md) → EntityCards
- **Tablet**: 768px - 1024px (md-lg) → EntityCards
- **Desktop**: > 1024px (lg) → Tablas MUI

### Características
- Detección automática con `useMediaQuery` y `useTheme` de MUI
- En móvil/tablet: Grid de cards con iconos
- En desktop: Tablas Material UI con hover effects

## Compatibilidad Tailwind + Material UI

✅ **Sin conflictos**
- Material UI usa CSS-in-JS (emotion) con mayor especificidad
- Tailwind solo para utilidades específicas (grid, flex, spacing)
- MUI tiene prioridad en componentes nativos

## Testing Realizado

- ✅ No hay errores de linter
- ✅ Importaciones correctas
- ✅ Tipos TypeScript válidos
- ✅ Componentes responsive

## Próximos Pasos (Opcional)

1. **Sidebar**: Considerar migrar sidebar con los estilos de "estilos combinados"
2. **Filtros avanzados**: Implementar `DistributionFilters` si se necesita
3. **Otros componentes**: Migrar formularios y otros componentes según necesidad
4. **Optimización**: Evaluar lazy loading de EntityCard en móvil

## Iconos

Se mantiene **lucide-react** para todos los iconos:
- Consistencia con el diseño actual
- Mejor integración visual
- Más ligero que Material Icons

## Performance

- Material UI ya estaba instalado (no aumenta bundle)
- EntityCard solo se renderiza en móvil/tablet
- Lazy loading de componentes MUI según necesidad
- Sin impacto significativo en performance

