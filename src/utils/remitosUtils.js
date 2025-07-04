export const getEstadoColor = (estado) => {
  switch (estado) {
    case 'Autorizado':
      return '#059669';
    case 'En preparación':
      return '#0891b2';
    case 'En carga':
      return '#059669';
    case 'En camino':
      return '#eab308';
    case 'Entregado':
      return '#16a34a';
    case 'No entregado':
      return '#dc2626';
    case 'Retenido':
      return '#dc2626';
    default:
      return '#6b7280';
  }
};

export const getPrioridadClass = (prioridad, styles) => {
  switch (prioridad) {
    case 'urgente':
      return styles.prioridadUrgente;
    case 'alta':
      return styles.prioridadAlta;
    case 'normal':
    default:
      return styles.prioridadNormal;
  }
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES');
};

export const crearMercaderiaItems = () => {
  return [
    {
      id: 1,
      tipoMercaderia: 'Caja de herramientas',
      cantidad: 5,
      preparada: false
    },
    {
      id: 2,
      tipoMercaderia: 'Repuestos de motor',
      cantidad: 10,
      preparada: false
    },
    {
      id: 3,
      tipoMercaderia: 'Materiales de construcción',
      cantidad: 20,
      preparada: false
    },
    {
      id: 4,
      tipoMercaderia: 'Equipos electrónicos',
      cantidad: 8,
      preparada: false
    },
    {
      id: 5,
      tipoMercaderia: 'Muebles de oficina',
      cantidad: 3,
      preparada: false
    }
  ];
}; 