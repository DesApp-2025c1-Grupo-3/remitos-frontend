import { useState } from 'react';

export const useRemitoEstados = (estadoInicial = 'Autorizado') => {
  const [estadoActual, setEstadoActual] = useState(estadoInicial);
  const [estadoAnterior, setEstadoAnterior] = useState(null);

  const cambiarEstado = (nuevoEstado, mercaderia = null) => {
    if (nuevoEstado === 'Retenido') {
      setEstadoAnterior({
        estado: estadoActual,
        mercaderia: mercaderia ? [...mercaderia] : null
      });
    }
    setEstadoActual(nuevoEstado);
  };

  const liberarRetenido = () => {
    if (estadoAnterior) {
      setEstadoActual(estadoAnterior.estado);
      const mercaderiaAnterior = estadoAnterior.mercaderia;
      setEstadoAnterior(null);
      return mercaderiaAnterior;
    }
    return null;
  };

  const siguienteEstado = () => {
    switch (estadoActual) {
      case 'Autorizado':
        return 'En preparación';
      case 'En preparación':
        return 'En carga';
      case 'En carga':
        return 'En camino';
      default:
        return estadoActual;
    }
  };

  const puedeAvanzar = (todaMercaderiaPreparada = true) => {
    if (estadoActual === 'En preparación') {
      return todaMercaderiaPreparada;
    }
    return true;
  };

  return {
    estadoActual,
    estadoAnterior,
    cambiarEstado,
    liberarRetenido,
    siguienteEstado,
    puedeAvanzar
  };
}; 