import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Pencil } from 'lucide-react';
import { remitosService, Remito } from '../../services/remitosService';
import { estadosService, Estado } from '../../services/estadosService';
import { useNotification } from '../../contexts/NotificationContext';
import styles from './remitos.module.css';
import detalleStyles from './DetalleRemito.module.css';

// Interfaz para la mercadería con estado de preparación
interface MercaderiaConEstado {
  id: string; // Cambiado a string para usar 'bobinas', 'racks', etc.
  tipoMercaderia: string;
  cantidad?: number;
  preparada: boolean;
}

// Estados posibles del remito
type EstadoRemito = 'Autorizado' | 'En preparación' | 'En carga' | 'En camino' | 'Entregado' | 'No entregado' | 'Retenido';

interface EstadoAnterior {
  estado: EstadoRemito;
  mercaderia: MercaderiaConEstado[];
}

export default function DetalleRemito() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  
  const [remito, setRemito] = useState<Remito | null>(null);
  const [loading, setLoading] = useState(true);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [estadoActual, setEstadoActual] = useState<EstadoRemito>('Autorizado');
  const [estadoAnterior, setEstadoAnterior] = useState<EstadoAnterior | null>(null);
  const [mercaderiaConEstado, setMercaderiaConEstado] = useState<MercaderiaConEstado[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [razonNoEntrega, setRazonNoEntrega] = useState('');

  useEffect(() => {
    fetchEstados();
    fetchRemito();
  }, [id]);

  const fetchEstados = async () => {
    try {
      const data = await estadosService.getEstados();
      // El backend devuelve {data: [...]}
      if (Array.isArray(data)) {
        setEstados(data);
      } else if (Array.isArray((data as any).data)) {
        setEstados((data as any).data);
      }
    } catch (error) {
      console.error('Error al cargar los estados:', error);
      showNotification('Error al cargar los estados', 'error');
    }
  };

  const fetchRemito = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const data = await remitosService.getRemitoById(parseInt(id));
      setRemito(data);
      
      const estadoInicial: EstadoRemito = data.estado?.nombre as EstadoRemito || 'Autorizado';
      setEstadoActual(estadoInicial);
      
      if (data.mercaderia) {
        const mercaderiaItems: MercaderiaConEstado[] = [];
        const m = data.mercaderia;
        
        if (m.cantidadBobinas && m.cantidadBobinas > 0) {
          mercaderiaItems.push({ id: 'bobinas', tipoMercaderia: 'Bobinas', cantidad: m.cantidadBobinas, preparada: false });
        }
        if (m.cantidadRacks && m.cantidadRacks > 0) {
          mercaderiaItems.push({ id: 'racks', tipoMercaderia: 'Racks', cantidad: m.cantidadRacks, preparada: false });
        }
        if (m.cantidadBultos && m.cantidadBultos > 0) {
          mercaderiaItems.push({ id: 'bultos', tipoMercaderia: 'Bultos', cantidad: m.cantidadBultos, preparada: false });
        }
        if (m.cantidadPallets && m.cantidadPallets > 0) {
          mercaderiaItems.push({ id: 'pallets', tipoMercaderia: 'Pallets', cantidad: m.cantidadPallets, preparada: false });
        }
        
        setMercaderiaConEstado(mercaderiaItems);
      }
    } catch (error) {
      console.error('Error al cargar el remito:', error);
      showNotification('Error al cargar el remito', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMercaderiaCheck = (id: string) => {
    if (estadoActual !== 'En preparación') return;
    
    setMercaderiaConEstado(prev => 
      prev.map(item => 
        item.id === id ? { ...item, preparada: !item.preparada } : item
      )
    );
  };

  const getEstadoColor = (estado: EstadoRemito) => {
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

  const cambiarEstadoRemito = async (nuevoEstadoNombre: EstadoRemito) => {
    if (!remito || !estados.length) return;

    const nuevoEstado = estados.find(e => e.nombre === nuevoEstadoNombre);
    if (!nuevoEstado) {
      showNotification(`Estado "${nuevoEstadoNombre}" no encontrado`, 'error');
      return;
    }

    try {
      const remitoActualizado = await remitosService.updateEstadoRemito(remito.id, nuevoEstado.id);
      setRemito(remitoActualizado);
      setEstadoActual(remitoActualizado.estado?.nombre as EstadoRemito);
      showNotification(`Remito actualizado a "${nuevoEstadoNombre}"`, 'success');
      return remitoActualizado;
    } catch (error) {
      console.error('Error al cambiar el estado del remito:', error);
      showNotification('Error al cambiar el estado del remito', 'error');
    }
  };

  const handleCambiarEstado = async () => {
    let nuevoEstado: EstadoRemito | null = null;
    switch (estadoActual) {
      case 'Autorizado':
        nuevoEstado = 'En preparación';
        break;
      case 'En preparación':
        nuevoEstado = 'En carga';
        break;

      case 'En carga':
        nuevoEstado = 'En camino';
        break;
      default:
        break;
    }

    if (nuevoEstado) {
      await cambiarEstadoRemito(nuevoEstado);
    }
  };

  const handleEntregado = async () => {
    await cambiarEstadoRemito('Entregado');
  };

  const handleNoEntregado = () => {
    setShowModal(true);
  };

  const handleConfirmarNoEntrega = async () => {
    if (razonNoEntrega.trim() && remito) {
      try {
        // Cambiar estado y guardar razón de no entrega
        const remitoActualizado = await remitosService.updateRemito(remito.id, {
          razonNoEntrega: razonNoEntrega.trim(),
          estadoId: estados.find(e => e.nombre === 'No entregado')?.id
        });
        setRemito(remitoActualizado);
        setEstadoActual(remitoActualizado.estado?.nombre as EstadoRemito);
        setShowModal(false);
        setRazonNoEntrega('');
        showNotification('Remito actualizado como No entregado', 'success');
      } catch (error) {
        showNotification('Error al actualizar la razón de no entrega', 'error');
      }
    }
  };

  const handleRetener = async () => {
    setEstadoAnterior({
      estado: estadoActual,
      mercaderia: [...mercaderiaConEstado]
    });
    await cambiarEstadoRemito('Retenido');
  };

  const handleLiberar = async () => {
    if (estadoAnterior) {
      await cambiarEstadoRemito(estadoAnterior.estado);
      setMercaderiaConEstado(estadoAnterior.mercaderia);
      setEstadoAnterior(null);
    }
  };

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
            title={!todaMercaderiaPreparada ? 'Debes preparar toda la mercadería' : ''}
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
          <div className={detalleStyles.botonesViaje}>
            <button className={styles.crearBtn} onClick={handleEntregado}>
              ENTREGADO
            </button>
            <button 
              className={`${styles.crearBtn} ${detalleStyles.botonNoEntregado}`}
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

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  const getCantidadText = (item: MercaderiaConEstado) => {
    return `Cantidad: ${item.cantidad || 0}`;
  };

  function ArchivoAdjunto({ archivoAdjunto }: { archivoAdjunto?: string }) {
    if (!archivoAdjunto) {
      return <span className={`${styles.infoValue} ${detalleStyles.sinArchivo}`}>No hay archivo adjunto</span>;
    }
    let path = archivoAdjunto.startsWith('/') ? archivoAdjunto.slice(1) : archivoAdjunto;
    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/${path}`.replace(/([^:]\/)\/+/, '$1');
    const nombre = path.split('/').pop() || 'Archivo adjunto';
    const esImagen = /\.(jpg|jpeg|png|gif)$/i.test(nombre);
    const esPDF = /\.pdf$/i.test(nombre);
    if (esImagen) {
      return (
        <a href={url} target="_blank" rel="noopener noreferrer" className={detalleStyles.archivoAdjuntoLink}>
          <img src={url} alt={nombre} className={detalleStyles.archivoAdjuntoImagen} />
          <span>{nombre}</span>
        </a>
      );
    } else if (esPDF) {
      return (
        <a href={url} target="_blank" rel="noopener noreferrer" className={detalleStyles.archivoAdjuntoLink}>
          <span className={detalleStyles.archivoAdjuntoIcono}>📄</span>
          <span>{nombre}</span>
        </a>
      );
    } else {
      return (
        <a href={url} target="_blank" rel="noopener noreferrer" className={detalleStyles.archivoAdjuntoTexto}>
          {nombre}
        </a>
      );
    }
  }

  if (loading) {
    return <div className={styles.container}>Cargando...</div>;
  }

  if (!remito) {
    return <div className={styles.container}>Remito no encontrado</div>;
  }

  return (
    <div className={styles.container}>
      <div className={`${styles.header} ${styles.detalleHeader}`}> 
        <div className={detalleStyles.headerContainer}>
          <button className={styles.volverBtn} onClick={() => navigate('/remitos')}>
            <ArrowLeft />
            Volver
          </button>
          <h1 className={`${styles.titulo} ${detalleStyles.tituloConBoton}`}>Remito N° {remito.numeroAsignado}</h1>
          <Link to={`/remitos/editar/${remito.id}`} title="Editar remito" className={`${styles.editarRemitoBtn} ${detalleStyles.editarRemitoBtn}`}>
            <Pencil size={20} />
          </Link>
          <div className={styles.estadoBadge} style={{ background: getEstadoColor(estadoActual) }}>
            {estadoActual}
          </div>
        </div>
      </div>

      <div className={styles.wrapper}>
        {/* Información del remito */}
        <div className={detalleStyles.infoGridContainer}>
          <div className={detalleStyles.infoGrid}>
            <div className={styles.infoCard}>
              <label className={styles.infoLabel}>Cliente:</label>
              <span className={styles.infoValue}>{remito.cliente?.razonSocial || 'Sin cliente'}</span>
            </div>
            <div className={styles.infoCard}>
              <label className={styles.infoLabel}>CUIT/RUT:</label>
              <span className={styles.infoValue}>{remito.cliente?.cuit_rut || 'Sin CUIT'}</span>
            </div>
            <div className={styles.infoCard}>
              <label className={styles.infoLabel}>Dirección Cliente:</label>
              <span className={styles.infoValue}>{remito.cliente?.direccion || 'Sin dirección'}</span>
            </div>
            <div className={styles.infoCard}>
              <label className={styles.infoLabel}>Destino:</label>
              <span className={styles.infoValue}>{remito.destino ? `${remito.destino.nombre}, ${remito.destino.provincia}` : 'Sin destino'}</span>
            </div>
            <div className={styles.infoCard}>
              <label className={styles.infoLabel}>Localidad:</label>
              <span className={styles.infoValue}>{remito.destino?.localidad || 'Sin localidad'}</span>
            </div>
            <div className={styles.infoCard}>
              <label className={styles.infoLabel}>Dirección Destino:</label>
              <span className={styles.infoValue}>{remito.destino?.direccion || 'Sin dirección'}</span>
            </div>
            <div className={styles.infoCard}>
              <label className={styles.infoLabel}>Volumen:</label>
              <span className={styles.infoValue}>{remito.mercaderia?.volumenMetrosCubico || 0} m³</span>
            </div>
            <div className={styles.infoCard}>
              <label className={styles.infoLabel}>Valor:</label>
              <span className={styles.infoValue}>${remito.mercaderia?.valorDeclarado?.toLocaleString() || 0}</span>
            </div>
            <div className={styles.infoCard}>
              <label className={styles.infoLabel}>Peso:</label>
              <span className={styles.infoValue}>{remito.mercaderia?.pesoMercaderia || 0} kg</span>
            </div>
            <div className={styles.infoCard}>
              <label className={styles.infoLabel}>Prioridad:</label>
              <span className={`${styles.infoValue} ${
                remito.prioridad === 'urgente' ? detalleStyles.prioridadUrgente :
                remito.prioridad === 'alta' ? detalleStyles.prioridadAlta :
                detalleStyles.prioridadNormal
              }`}>
                {remito.prioridad}
              </span>
            </div>
            <div className={styles.infoCard}>
              <label className={styles.infoLabel}>Fecha Emisión:</label>
              <span className={styles.infoValue}>{formatDate(remito.fechaEmision)}</span>
            </div>
            <div className={styles.infoCard}>
              <label className={styles.infoLabel}>Observaciones:</label>
              <span className={styles.infoValue}>{remito.observaciones || 'Sin observaciones'}</span>
            </div>
            {remito.mercaderia?.requisitosEspeciales && (
              <div className={styles.infoCard}>
                <label className={styles.infoLabel}>Requisitos Especiales:</label>
                <span className={styles.infoValue}>{remito.mercaderia.requisitosEspeciales}</span>
              </div>
            )}
            <div className={styles.infoCard}>
              <label className={styles.infoLabel}>Archivo Adjunto:</label>
              <ArchivoAdjunto archivoAdjunto={remito.archivoAdjunto} />
            </div>
            {remito.razonNoEntrega && (
              <div className={styles.infoCard}>
                <label className={styles.infoLabel}>Razón de no entrega:</label>
                <span className={styles.infoValue}>{remito.razonNoEntrega}</span>
              </div>
            )}
          </div>
        </div>

        {/* Lista de mercadería */}
        <div className={styles.tablaContenedor}>
          <div className={styles.mercaderiaContainer}>
            <h2 className={styles.mercaderiaTitle}>Mercadería</h2>
            <div className={styles.mercaderiaGrid}>
              {mercaderiaConEstado.map(item => (
                <div
                  key={item.id}
                  onClick={() => estadoActual === 'En preparación' && handleMercaderiaCheck(item.id)}
                  className={`
                    ${styles.mercaderiaItem}
                    ${estadoActual === 'En preparación' ? styles.mercaderiaItemPreparable : ''}
                    ${item.preparada ? styles.mercaderiaItemPreparada : ''}
                  `}
                >
                  <div className={styles.mercaderiaItemContent}>
                    <div>
                      <div className={styles.infoValue}>{item.tipoMercaderia}</div>
                      <div className={styles.mercaderiaItemCantidad}>{getCantidadText(item)}</div>
                    </div>
                  </div>
                  {item.preparada && <CheckCircle className={styles.checkIcon} />}
                </div>
              ))}
            </div>
          </div>
          {/* Botones de acción */}
          <div className={styles.accionesContainer}>
            {estadoActual === 'En preparación' && !todaMercaderiaPreparada && (
              <div className={styles.mensajePreparacion}>Prepara toda la mercadería para continuar</div>
            )}
            <div className={styles.botonesGrupo}>
              {getBotonPrincipal()}
              {estadoActual !== 'Retenido' && estadoActual !== 'Entregado' && estadoActual !== 'No entregado' && (
                <button className={`${styles.crearBtn} ${styles.retenerBtn}`} onClick={handleRetener}>RETENER</button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal para razón de no entrega */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>Razón de no entrega</h3>
            <textarea
              value={razonNoEntrega}
              onChange={(e) => setRazonNoEntrega(e.target.value)}
              placeholder="Ingrese la razón por la que no se pudo entregar el remito"
              className={styles.modalTextarea}
            />
            <div className={styles.modalBotones}>
              <button onClick={() => setShowModal(false)} className={styles.cancelBtn}>Cancelar</button>
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