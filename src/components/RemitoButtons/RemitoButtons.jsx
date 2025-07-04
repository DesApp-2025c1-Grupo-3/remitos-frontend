import React from 'react';
import styles from './RemitoButtons.module.css';

export const RemitoButtons = ({ 
  estadoActual, 
  onCambiarEstado, 
  onEntregado, 
  onNoEntregado, 
  onLiberar,
  puedeAvanzar = true 
}) => {
  const renderBotonPrincipal = () => {
    switch (estadoActual) {
      case 'Autorizado':
        return (
          <button className={styles.crearBtn} onClick={onCambiarEstado}>
            PREPARAR
          </button>
        );
      case 'En preparación':
        return (
          <button 
            className={styles.crearBtn} 
            onClick={onCambiarEstado}
            disabled={!puedeAvanzar}
          >
            TERMINAR PREPARACIÓN
          </button>
        );
      case 'En carga':
        return (
          <button className={styles.crearBtn} onClick={onCambiarEstado}>
            ASIGNAR VIAJE
          </button>
        );
      case 'En camino':
        return (
          <div className={styles.botonesEnCamino}>
            <button className={styles.crearBtn} onClick={onEntregado}>
              ENTREGADO
            </button>
            <button 
              className={styles.noEntregadoBtn}
              onClick={onNoEntregado}
            >
              NO ENTREGADO
            </button>
          </div>
        );
      case 'Entregado':
      case 'No entregado':
        return null;
      case 'Retenido':
        return (
          <button className={styles.crearBtn} onClick={onLiberar}>
            LIBERAR
          </button>
        );
      default:
        return null;
    }
  };

  return renderBotonPrincipal();
}; 