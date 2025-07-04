import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { remitosService } from '../../services/remitosService';
import { useNotification } from '../../contexts/NotificationContext';
import styles from './remitos.module.css';
import { getEstadoColor, crearMercaderiaItems } from '../../utils/remitosUtils';

export default function DetalleRemito() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  
  const [remito, setRemito] = useState(null);
  const [loading, setLoading] = useState(true);
  const [estadoActual, setEstadoActual] = useState('Autorizado');
  const [estadoAnterior, setEstadoAnterior] = useState(null);
  const [mercaderiaConEstado, setMercaderiaConEstado] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [razonNoEntrega, setRazonNoEntrega] = useState('');

  useEffect(() => {
    fetchRemito();
  }, [id]);

  const fetchRemito = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const data = await remitosService.getRemitoById(parseInt(id));
      setRemito(data);
      
      // Inicializar estado basado en el estado del remito
      const estadoInicial = data.estado?.nombre || 'Autorizado';
      setEstadoActual(estadoInicial);
      
      // Crear elementos de mercadería usando utilidad compartida
      setMercaderiaConEstado(crearMercaderiaItems());
    } catch (error) {
      console.error('Error al cargar el remito:', error);
      showNotification('Error al cargar el remito', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMercaderiaCheck = (id) => {
    if (estadoActual !== 'En preparación') return;
    
    setMercaderiaConEstado(prev => 
      prev.map(item => 
        item.id === id ? { ...item, preparada: !item.preparada } : item
      )
    );
  };



  const handleCambiarEstado = () => {
    switch (estadoActual) {
      case 'Autorizado':
        setEstadoActual('En preparación');
        showNotification('Remito en preparación', 'success');
        break;
      case 'En preparación':
        setEstadoActual('En carga');
        showNotification('Preparación terminada', 'success');
        break;
      case 'En carga':
        setEstadoActual('En camino');
        showNotification('Viaje asignado', 'success');
        break;
      default:
        break;
    }
  };

  const handleEntregado = () => {
    setEstadoActual('Entregado');
    showNotification('Remito entregado exitosamente', 'success');
  };

  const handleNoEntregado = () => {
    setShowModal(true);
  };

  const handleConfirmarNoEntrega = () => {
    if (razonNoEntrega.trim()) {
      setEstadoActual('No entregado');
      showNotification('Remito marcado como no entregado', 'info');
      setShowModal(false);
      setRazonNoEntrega('');
    }
  };

  const handleRetener = () => {
    setEstadoAnterior({
      estado: estadoActual,
      mercaderia: [...mercaderiaConEstado]
    });
    setEstadoActual('Retenido');
    showNotification('Remito retenido', 'warning');
  };

  const handleLiberar = () => {
    if (estadoAnterior) {
      setEstadoActual(estadoAnterior.estado);
      setMercaderiaConEstado(estadoAnterior.mercaderia);
      setEstadoAnterior(null);
      showNotification('Remito liberado', 'success');
    }
  };

  // Verificar si toda la mercadería está preparada
  const todaMercaderiaPreparada = mercaderiaConEstado.every(item => item.preparada);

  const getBotonPrincipal = () => {
    switch (estadoActual) {
      case 'Autorizado':
        return (
          <button className={styles.crearBtn} onClick={handleCambiarEstado}>
            PREPARAR
          </button>
        );
      case 'En preparación':
        return (
          <button 
            className={styles.crearBtn} 
            onClick={handleCambiarEstado}
            disabled={!todaMercaderiaPreparada}
          >
            TERMINAR PREPARACIÓN
          </button>
        );
      case 'En carga':
        return (
          <button className={styles.crearBtn} onClick={handleCambiarEstado}>
            ASIGNAR VIAJE
          </button>
        );
      case 'En camino':
        return (
          <div className={styles.botonesEnCamino}>
            <button className={styles.crearBtn} onClick={handleEntregado}>
              ENTREGADO
            </button>
            <button 
              className={styles.noEntregadoBtn}
              onClick={handleNoEntregado}
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
          <button className={styles.crearBtn} onClick={handleLiberar}>
            LIBERAR
          </button>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return <div className={styles.container}>Cargando...</div>;
  }

  if (!remito) {
    return <div className={styles.container}>Remito no encontrado</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.volverBtn} onClick={() => navigate('/remitos')}>
          <ArrowLeft />
          Volver
        </button>
        <h1 className={styles.titulo}>Remito N° {remito.numeroAsignado}</h1>
        <div 
          className={styles.estadoBadge}
          style={{ backgroundColor: getEstadoColor(estadoActual) }}
        >
          {estadoActual}
        </div>
      </div>

      <div className={styles.wrapper}>
        {/* Información del remito */}
        <div className={`${styles.tablaContenedor} ${styles.infoContainer}`}>
          <div className={styles.infoGrid}>
            <div className={`${styles.infoCard} ${styles.mediumWidth}`}>
              <label className={styles.infoLabel}>Cliente</label>
              <span className={styles.infoValue}>
                {remito.cliente?.razonSocial || 'Juan Pérez'}
              </span>
            </div>

            <div className={`${styles.infoCard} ${styles.mediumWidth}`}>
              <label className={styles.infoLabel}>Destino</label>
              <span className={styles.infoValue}>
                {remito.destino ? `${remito.destino.nombre}, ${remito.destino.provincia}` : 'sucursal 22, Catamarca'}
              </span>
            </div>

            <div className={`${styles.infoCard} ${styles.mediumWidth}`}>
              <label className={styles.infoLabel}>Volumen</label>
              <span className={styles.infoValue}>3.5 m³</span>
            </div>

            <div className={`${styles.infoCard} ${styles.mediumWidth}`}>
              <label className={styles.infoLabel}>Valor</label>
              <span className={styles.infoValue}>$25.000</span>
            </div>

            <div className={`${styles.infoCard} ${styles.mediumWidth}`}>
              <label className={styles.infoLabel}>Fecha</label>
              <span className={styles.infoValue}>15/04/2023</span>
            </div>

            <div className={`${styles.infoCard} ${styles.mediumWidth}`}>
              <label className={styles.infoLabel}>Peso</label>
              <span className={styles.infoValue}>1500 kg</span>
            </div>

            <div className={`${styles.infoCard} ${styles.fullWidth}`}>
              <label className={styles.infoLabel}>Observaciones</label>
              <span className={styles.infoValue}>Entrega urgente</span>
            </div>
          </div>
        </div>

        {/* Lista de mercadería */}
        <div className={styles.tablaContenedor}>
          <div className={styles.mercaderiaContainer}>
            {mercaderiaConEstado.map((item) => (
              <div
                key={item.id}
                onClick={() => estadoActual === 'En preparación' && handleMercaderiaCheck(item.id)}
                className={`${styles.mercaderiaRow} ${
                  item.preparada ? styles.preparada : ''
                } ${
                  estadoActual !== 'En preparación' ? styles.noClickeable : ''
                }`}
              >
                <div className={styles.mercaderiaInfo}>
                  <div className={`${styles.mercaderiaTitulo} ${
                    item.preparada ? styles.preparada : ''
                  }`}>
                    {item.tipoMercaderia}
                  </div>
                  <div className={`${styles.mercaderiaCantidad} ${
                    item.preparada ? styles.preparada : ''
                  }`}>
                    Cantidad: {item.cantidad}
                  </div>
                </div>
                
                <div className={styles.mercaderiaEstado}>
                  {item.preparada ? (
                    <div className={styles.mercaderiaEstadoPreparada}>
                      <span className={styles.mercaderiaEstadoIcon}>✓</span>
                      <span className={styles.mercaderiaEstadoTexto}>Preparada</span>
                    </div>
                  ) : (
                    <span className={
                      estadoActual === 'En preparación' 
                        ? styles.mercaderiaEstadoTextoClick 
                        : styles.mercaderiaEstadoTexto
                    }>
                      {estadoActual === 'En preparación' ? 'Click para preparar' : 'Preparada'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Botones de acción */}
          <div className={styles.botonesAccion}>
            {estadoActual === 'En preparación' && !todaMercaderiaPreparada && (
              <div className={styles.mensajePreparacion}>
                Prepara toda la mercadería para continuar
              </div>
            )}
            
            <div className={styles.grupoBotonPrincipal}>
              {getBotonPrincipal()}
              
              {estadoActual !== 'Retenido' && estadoActual !== 'Entregado' && estadoActual !== 'No entregado' && (
                <button 
                  className={styles.retenerBtn}
                  onClick={handleRetener}
                >
                  RETENER
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal para razón de no entrega */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitulo}>
              Razón de no entrega
            </h3>
            <textarea
              value={razonNoEntrega}
              onChange={(e) => setRazonNoEntrega(e.target.value)}
              placeholder="Ingrese la razón por la que no se pudo entregar el remito"
              className={styles.modalTextarea}
            />
            <div className={styles.modalBotones}>
              <button 
                onClick={() => setShowModal(false)}
                className={styles.cancelBtn}
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirmarNoEntrega}
                className={styles.crearBtn}
                disabled={!razonNoEntrega.trim()}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
