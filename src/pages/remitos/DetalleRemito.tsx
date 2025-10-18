import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Pencil, ChevronLeft, ChevronRight } from 'lucide-react';
import { remitosService, Remito } from '../../services/remitosService';
import { estadosService, Estado } from '../../services/estadosService';
import { useNotification } from '../../contexts/NotificationContext';
import styles from './remitos.module.css';
import detalleStyles from './DetalleRemito.module.css';
import { getApiUrl } from '../../config/api';

// Interfaz para la mercadería
interface MercaderiaDisplay {
  id: number;
  tipoMercaderia: string;
  tipoMercaderiaId: number;
  valorDeclarado: number;
  volumenMetrosCubico: number;
  pesoMercaderia: number;
  cantidadBobinas?: number;
  cantidadRacks?: number;
  cantidadBultos?: number;
  cantidadPallets?: number;
  requisitosEspeciales?: string;
}

// Estados posibles del remito
type EstadoRemito = 'Autorizado' | 'En preparación' | 'En carga' | 'En camino' | 'Entregado' | 'No entregado' | 'Retenido' | 'Agendado';

interface EstadoAnterior {
  estado: EstadoRemito;
  mercaderia: MercaderiaDisplay[];
}

function truncateNumber(num: number | string, maxDigits = 10): string {
  const str = String(num);
  if (str.length > maxDigits) {
    return str.slice(0, maxDigits) + '...';
  }
  return str;
}

function formatAndTruncateNumber(num: number | string, maxChars = 18): string {
  if (num === null || num === undefined) return '';
  const n = typeof num === 'string' ? parseInt(num) : num;
  if (isNaN(n)) return String(num);
  const formatted = n.toLocaleString('es-AR');
  if (formatted.length > maxChars) {
    return formatted.slice(0, maxChars) + '...';
  }
  return formatted;
}

export default function DetalleRemito() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  
  const [remito, setRemito] = useState<Remito | null>(null);
  const [loading, setLoading] = useState(true);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [estadoActual, setEstadoActual] = useState<EstadoRemito>('Autorizado');
  const [mercaderias, setMercaderias] = useState<MercaderiaDisplay[]>([]);
  const [currentMercaderiaPage, setCurrentMercaderiaPage] = useState(1);
  const mercaderiasPerPage = 3;

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
      // Si no hay estado, buscar el estado "Autorizado" por ID (1)
      if (!data.estado && estados.length > 0) {
        const estadoAutorizado = estados.find(e => e.id === 1);
        if (estadoAutorizado) {
          setEstadoActual(estadoAutorizado.nombre as EstadoRemito);
        } else {
          setEstadoActual(estadoInicial);
        }
      } else {
        setEstadoActual(estadoInicial);
      }
      
      // Procesar TODAS las mercaderías
      if (data.mercaderias && data.mercaderias.length > 0) {
        const mercaderiaItems: MercaderiaDisplay[] = data.mercaderias.map(m => ({
          id: m.id,
          tipoMercaderia: m.tipoMercaderia?.nombre || 'Sin tipo',
          tipoMercaderiaId: m.tipoMercaderiaId,
          valorDeclarado: m.valorDeclarado,
          volumenMetrosCubico: m.volumenMetrosCubico,
          pesoMercaderia: m.pesoMercaderia,
          cantidadBobinas: m.cantidadBobinas,
          cantidadRacks: m.cantidadRacks,
          cantidadBultos: m.cantidadBultos,
          cantidadPallets: m.cantidadPallets,
          requisitosEspeciales: m.requisitosEspeciales
        }));
        
        setMercaderias(mercaderiaItems);
        setCurrentMercaderiaPage(1); // Resetear página al cargar nuevo remito
      }
    } catch (error) {
      console.error('Error al cargar el remito:', error);
      showNotification('Error al cargar el remito', 'error');
    } finally {
      setLoading(false);
    }
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
      case 'Agendado':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  const handleComenzarPreparacion = async () => {
    if (!remito || !estados.length) {
      return;
    }
    
    const estadoEnPreparacion = estados.find(e => e.nombre === 'En preparación');
    
    if (!estadoEnPreparacion) {
      showNotification('Estado "En preparación" no encontrado', 'error');
      return;
    }
    
    try {
      const remitoActualizado = await remitosService.updateEstadoRemito(remito.id, estadoEnPreparacion.id);
      
      setRemito(remitoActualizado);
      setEstadoActual(remitoActualizado.estado?.nombre as EstadoRemito);
      showNotification('Preparación iniciada exitosamente', 'success');
    } catch (error) {
      console.error('Error al comenzar preparación:', error);
      showNotification('Error al comenzar la preparación del remito', 'error');
    }
  };

  const handleIniciarReentrega = async () => {
    if (!remito) {
      showNotification('Error: No hay remito para reentrega', 'error');
      return;
    }

    try {
      const remitoActualizado = await remitosService.iniciarReentrega(remito.id);
      setRemito(remitoActualizado);
      setEstadoActual(remitoActualizado.estado?.nombre as EstadoRemito);
      
      // Actualizar mercaderías
      if (remitoActualizado.mercaderias && remitoActualizado.mercaderias.length > 0) {
        const mercaderiaItems: MercaderiaDisplay[] = remitoActualizado.mercaderias.map(m => ({
          id: m.id,
          tipoMercaderia: m.tipoMercaderia?.nombre || 'Sin tipo',
          tipoMercaderiaId: m.tipoMercaderiaId,
          valorDeclarado: m.valorDeclarado,
          volumenMetrosCubico: m.volumenMetrosCubico,
          pesoMercaderia: m.pesoMercaderia,
          cantidadBobinas: m.cantidadBobinas,
          cantidadRacks: m.cantidadRacks,
          cantidadBultos: m.cantidadBultos,
          cantidadPallets: m.cantidadPallets,
          requisitosEspeciales: m.requisitosEspeciales
        }));
        setMercaderias(mercaderiaItems);
        setCurrentMercaderiaPage(1); // Resetear página al iniciar reentrega
      }
      
      showNotification('Reentrega iniciada exitosamente', 'success');
    } catch (error) {
      console.error('Error al iniciar reentrega:', error);
      const errorMessage = error.response?.data?.message || 'Error al iniciar la reentrega';
      showNotification(errorMessage, 'error');
    }
  };

  const getBotonPrincipal = () => {
    // Solo permitir acciones en estados específicos
    if (estadoActual === 'Autorizado') {
      return (
        <button className={styles.crearBtn} onClick={handleComenzarPreparacion}>
          COMENZAR PREPARACIÓN
        </button>
      );
    }
    
    if (estadoActual === 'No entregado') {
      // Validar si puede hacer reentrega (solo si no es ya una reentrega)
      if (remito && !remito.esReentrega) {
        return (
          <button className={styles.crearBtn} onClick={handleIniciarReentrega}>
            HABILITAR REENTREGA
          </button>
        );
      } else {
        return (
          <div className={detalleStyles.mensajeReentrega}>
            Reentrega no disponible (este remito ya fue reenviado una vez)
          </div>
        );
      }
    }
    
    // Para otros estados, no mostrar botones
    return null;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  // Lógica de paginación para mercaderías
  const totalMercaderiaPages = Math.ceil(mercaderias.length / mercaderiasPerPage);
  const startIndex = (currentMercaderiaPage - 1) * mercaderiasPerPage;
  const endIndex = startIndex + mercaderiasPerPage;
  const currentMercaderias = mercaderias.slice(startIndex, endIndex);

  const handleMercaderiaPageChange = (page: number) => {
    setCurrentMercaderiaPage(page);
  };

  function ArchivoAdjunto({ archivoAdjunto }: { archivoAdjunto?: string }) {
    if (!archivoAdjunto) {
      return <span className={`${styles.infoValue} ${detalleStyles.sinArchivo}`}>No hay archivo adjunto</span>;
    }
    let path = archivoAdjunto.startsWith('/') ? archivoAdjunto.slice(1) : archivoAdjunto;
    const url = `${getApiUrl()}/${path}`.replace(/([^:]\/)\/+/, '$1');
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
      <div className={styles.wrapper}>
        {/* Header principal */}
        <div className={`${styles.header} ${styles.detalleHeader}`}> 
          <div className={detalleStyles.headerContainer}>
            <div className={detalleStyles.headerLeft}>
              <h1 className={`${styles.titulo} ${detalleStyles.tituloConBoton}`}>Remito N° {remito.numeroAsignado}</h1>
            </div>
            <div className={detalleStyles.headerRight}>
              <Link to={`/remitos/editar/${remito.id}`} title="Editar remito" className={`${styles.editarRemitoBtn} ${detalleStyles.editarRemitoBtn}`}>
                <Pencil size={20} />
              </Link>
              <div className={styles.estadoBadge} style={{ background: getEstadoColor(estadoActual) }}>
                {estadoActual}
              </div>
            </div>
          </div>
        </div>
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
              <label className={styles.infoLabel}>Volumen Total:</label>
              <span className={styles.infoValue}>
                {formatAndTruncateNumber(
                  remito.mercaderias?.reduce((sum, m) => sum + (m.volumenMetrosCubico || 0), 0) || 0
                )} m³
              </span>
            </div>
            <div className={styles.infoCard}>
              <label className={styles.infoLabel}>Valor Total:</label>
              <span className={styles.infoValue}>
                ${formatAndTruncateNumber(
                  remito.mercaderias?.reduce((sum, m) => sum + (m.valorDeclarado || 0), 0) || 0
                )}
              </span>
            </div>
            <div className={styles.infoCard}>
              <label className={styles.infoLabel}>Peso Total:</label>
              <span className={styles.infoValue}>
                {formatAndTruncateNumber(
                  remito.mercaderias?.reduce((sum, m) => sum + (m.pesoMercaderia || 0), 0) || 0
                )} kg
              </span>
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
            {remito.mercaderias?.[0]?.requisitosEspeciales && (
              <div className={styles.infoCard}>
                <label className={styles.infoLabel}>Requisitos Especiales:</label>
                <span className={styles.infoValue}>{remito.mercaderias[0].requisitosEspeciales}</span>
              </div>
            )}
            <div className={styles.infoCard}>
              <label className={styles.infoLabel}>Archivo Adjunto:</label>
              <ArchivoAdjunto archivoAdjunto={remito.archivoAdjunto} />
            </div>
            {remito.razonesNoEntrega && remito.razonesNoEntrega.length > 0 && (
              <div className={styles.infoCard}>
                <label className={styles.infoLabel}>
                  Razón{remito.razonesNoEntrega.length > 1 ? 'es' : ''} de no entrega:
                </label>
                <div className={detalleStyles.razonesContainer}>
                  {remito.razonesNoEntrega.map((razon, index) => (
                    <div key={index} className={detalleStyles.razonItem}>
                      <span className={detalleStyles.razonNumero}>
                        {remito.razonesNoEntrega!.length > 1 ? `${index + 1}.` : ''}
                      </span>
                      <span className={styles.infoValue}>{razon}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lista de mercadería */}
        <div className={styles.tablaContenedor}>
          <div className={styles.mercaderiaContainer}>
            <h2 className={styles.mercaderiaTitle}>
              Mercadería ({mercaderias.length})
            </h2>
            {mercaderias.length > 0 ? (
              <>
                <div className={styles.mercaderiaGrid}>
                  {currentMercaderias.map(item => (
                  <div
                    key={item.id}
                    className={styles.mercaderiaItem}
                  >
                    <div className={styles.mercaderiaItemContent}>
                      <div style={{ width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <span className={styles.badgeTipoMercaderia}>{item.tipoMercaderia}</span>
                        </div>
                        <div className={detalleStyles.mercaderiaDetalles}>
                          <div><strong>Valor:</strong> ${formatAndTruncateNumber(item.valorDeclarado)}</div>
                          <div><strong>Volumen:</strong> {formatAndTruncateNumber(item.volumenMetrosCubico)} m³</div>
                          <div><strong>Peso:</strong> {formatAndTruncateNumber(item.pesoMercaderia)} kg</div>
                          {item.cantidadBobinas && item.cantidadBobinas > 0 && (
                            <div><strong>Bobinas:</strong> {item.cantidadBobinas}</div>
                          )}
                          {item.cantidadRacks && item.cantidadRacks > 0 && (
                            <div><strong>Racks:</strong> {item.cantidadRacks}</div>
                          )}
                          {item.cantidadBultos && item.cantidadBultos > 0 && (
                            <div><strong>Bultos:</strong> {item.cantidadBultos}</div>
                          )}
                          {item.cantidadPallets && item.cantidadPallets > 0 && (
                            <div><strong>Pallets:</strong> {item.cantidadPallets}</div>
                          )}
                        </div>
                        {item.requisitosEspeciales && (
                          <div className={detalleStyles.mercaderiaDetalles}>
                            <div><strong>Requisitos:</strong> {item.requisitosEspeciales}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  ))}
                </div>
                
                {/* Paginación para mercaderías */}
                {totalMercaderiaPages > 1 && (
                  <div className={detalleStyles.mercaderiaPagination}>
                    <div className={detalleStyles.paginationInfo}>
                      Mostrando {startIndex + 1}-{Math.min(endIndex, mercaderias.length)} de {mercaderias.length} mercaderías
                    </div>
                    <div className={detalleStyles.paginationControls}>
                      <button
                        onClick={() => handleMercaderiaPageChange(currentMercaderiaPage - 1)}
                        disabled={currentMercaderiaPage === 1}
                        className={detalleStyles.paginationBtn}
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <span className={detalleStyles.paginationPage}>
                        {currentMercaderiaPage} de {totalMercaderiaPages}
                      </span>
                      <button
                        onClick={() => handleMercaderiaPageChange(currentMercaderiaPage + 1)}
                        disabled={currentMercaderiaPage === totalMercaderiaPages}
                        className={detalleStyles.paginationBtn}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                border: '2px dashed #d1d5db',
                color: '#6b7280',
                fontSize: '1.1rem',
                fontWeight: '500'
              }}>
                📦 No hay mercadería registrada
              </div>
            )}
          </div>
          {/* Botones de acción */}
          <div className={styles.accionesContainer}>
            <div className={styles.botonesGrupo}>
              {getBotonPrincipal()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 