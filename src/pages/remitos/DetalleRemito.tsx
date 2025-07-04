import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { remitosService, Remito } from '../../services/remitosService';
import { useNotification } from '../../contexts/NotificationContext';
import styles from './remitos.module.css';

// Interfaz para la mercadería con estado de preparación
interface MercaderiaConEstado {
  id: number;
  tipoMercaderia: string;
  valorDeclarado: number;
  volumenMetrosCubico: number;
  pesoMercaderia: number;
  cantidadBobinas?: number;
  cantidadRacks?: number;
  cantidadBultos?: number;
  cantidadPallets?: number;
  requisitosEspeciales?: string;
  preparada: boolean;
}

// Estados posibles del remito
type EstadoRemito = 'Autorizado' | 'En preparación' | 'En carga' | 'En camino' | 'Entregado' | 'No entregado' | 'Retenido';

// Estado anterior para el botón "Liberar"
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
  const [estadoActual, setEstadoActual] = useState<EstadoRemito>('Autorizado');
  const [estadoAnterior, setEstadoAnterior] = useState<EstadoAnterior | null>(null);
  const [mercaderiaConEstado, setMercaderiaConEstado] = useState<MercaderiaConEstado[]>([]);
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
      const estadoInicial: EstadoRemito = data.estado?.nombre as EstadoRemito || 'Autorizado';
      setEstadoActual(estadoInicial);
      
      // Convertir mercadería a formato con estado
      if (data.mercaderia) {
        const mercaderiaItems: MercaderiaConEstado[] = [];
        
        // Crear elementos de mercadería basados en las cantidades
        if (data.mercaderia.cantidadBobinas && data.mercaderia.cantidadBobinas > 0) {
          mercaderiaItems.push({
            id: 1,
            tipoMercaderia: 'Caja de herramientas',
            valorDeclarado: data.mercaderia.valorDeclarado,
            volumenMetrosCubico: data.mercaderia.volumenMetrosCubico,
            pesoMercaderia: data.mercaderia.pesoMercaderia,
            cantidadBobinas: data.mercaderia.cantidadBobinas,
            preparada: false
          });
        }
        
        if (data.mercaderia.cantidadRacks && data.mercaderia.cantidadRacks > 0) {
          mercaderiaItems.push({
            id: 2,
            tipoMercaderia: 'Repuestos de motor',
            valorDeclarado: data.mercaderia.valorDeclarado,
            volumenMetrosCubico: data.mercaderia.volumenMetrosCubico,
            pesoMercaderia: data.mercaderia.pesoMercaderia,
            cantidadRacks: data.mercaderia.cantidadRacks,
            preparada: false
          });
        }
        
        if (data.mercaderia.cantidadBultos && data.mercaderia.cantidadBultos > 0) {
          mercaderiaItems.push({
            id: 3,
            tipoMercaderia: 'Materiales de construcción',
            valorDeclarado: data.mercaderia.valorDeclarado,
            volumenMetrosCubico: data.mercaderia.volumenMetrosCubico,
            pesoMercaderia: data.mercaderia.pesoMercaderia,
            cantidadBultos: data.mercaderia.cantidadBultos,
            preparada: false
          });
        }
        
        if (data.mercaderia.cantidadPallets && data.mercaderia.cantidadPallets > 0) {
          mercaderiaItems.push({
            id: 4,
            tipoMercaderia: 'Equipos electrónicos',
            valorDeclarado: data.mercaderia.valorDeclarado,
            volumenMetrosCubico: data.mercaderia.volumenMetrosCubico,
            pesoMercaderia: data.mercaderia.pesoMercaderia,
            cantidadPallets: data.mercaderia.cantidadPallets,
            preparada: false
          });
        }
        
        // Si no hay mercadería específica, crear elementos de ejemplo
        if (mercaderiaItems.length === 0) {
          mercaderiaItems.push(
            {
              id: 1,
              tipoMercaderia: 'Caja de herramientas',
              valorDeclarado: data.mercaderia.valorDeclarado,
              volumenMetrosCubico: data.mercaderia.volumenMetrosCubico,
              pesoMercaderia: data.mercaderia.pesoMercaderia,
              cantidadBobinas: 5,
              preparada: false
            },
            {
              id: 2,
              tipoMercaderia: 'Repuestos de motor',
              valorDeclarado: data.mercaderia.valorDeclarado,
              volumenMetrosCubico: data.mercaderia.volumenMetrosCubico,
              pesoMercaderia: data.mercaderia.pesoMercaderia,
              cantidadRacks: 10,
              preparada: false
            },
            {
              id: 3,
              tipoMercaderia: 'Materiales de construcción',
              valorDeclarado: data.mercaderia.valorDeclarado,
              volumenMetrosCubico: data.mercaderia.volumenMetrosCubico,
              pesoMercaderia: data.mercaderia.pesoMercaderia,
              cantidadBultos: 20,
              preparada: false
            },
            {
              id: 4,
              tipoMercaderia: 'Equipos electrónicos',
              valorDeclarado: data.mercaderia.valorDeclarado,
              volumenMetrosCubico: data.mercaderia.volumenMetrosCubico,
              pesoMercaderia: data.mercaderia.pesoMercaderia,
              cantidadPallets: 8,
              preparada: false
            },
            {
              id: 5,
              tipoMercaderia: 'Muebles de oficina',
              valorDeclarado: data.mercaderia.valorDeclarado,
              volumenMetrosCubico: data.mercaderia.volumenMetrosCubico,
              pesoMercaderia: data.mercaderia.pesoMercaderia,
              cantidadBultos: 3,
              preparada: false
            }
          );
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

  const handleMercaderiaCheck = (id: number) => {
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
      case 'En camino':
        // Este caso se maneja con los botones "Entregado" y "No entregado"
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
    // Guardar el estado anterior
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
          <button className={styles.crearBtn} onClick={handleCambiarEstado}>
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
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className={styles.crearBtn} onClick={handleEntregado}>
              ENTREGADO
            </button>
            <button 
              className={styles.crearBtn} 
              style={{ background: '#dc2626' }}
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
    if (item.cantidadBobinas) return `Cantidad: ${item.cantidadBobinas}`;
    if (item.cantidadRacks) return `Cantidad: ${item.cantidadRacks}`;
    if (item.cantidadBultos) return `Cantidad: ${item.cantidadBultos}`;
    if (item.cantidadPallets) return `Cantidad: ${item.cantidadPallets}`;
    return 'Cantidad: 1';
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
          style={{ 
            background: getEstadoColor(estadoActual),
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            fontWeight: 'bold',
            fontSize: '0.9rem'
          }}
        >
          {estadoActual}
        </div>
      </div>

      <div className={styles.wrapper}>
        {/* Información del remito */}
        <div className={styles.tablaContenedor} style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1rem' }}>
            <div style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.25rem', display: 'block' }}>
                Cliente:
              </label>
              <span style={{ fontWeight: 'bold' }}>
                {remito.cliente?.razonSocial || 'Sin cliente'}
              </span>
            </div>

            <div style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.25rem', display: 'block' }}>
                Volumen:
              </label>
              <span style={{ fontWeight: 'bold' }}>
                {remito.mercaderia?.volumenMetrosCubico || 0} m³
              </span>
            </div>

            <div style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.25rem', display: 'block' }}>
                Destino:
              </label>
              <span style={{ fontWeight: 'bold' }}>
                {remito.destino ? `${remito.destino.nombre}, ${remito.destino.provincia}` : 'Sin destino'}
              </span>
            </div>

            <div style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.25rem', display: 'block' }}>
                Valor:
              </label>
              <span style={{ fontWeight: 'bold' }}>
                ${remito.mercaderia?.valorDeclarado?.toLocaleString() || 0}
              </span>
            </div>

            <div style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.25rem', display: 'block' }}>
                Fecha:
              </label>
              <span style={{ fontWeight: 'bold' }}>
                {formatDate(remito.fechaEmision)}
              </span>
            </div>

            <div style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.25rem', display: 'block' }}>
                Observaciones:
              </label>
              <span style={{ fontWeight: 'bold' }}>
                {remito.observaciones || 'Sin observaciones'}
              </span>
            </div>

            <div style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.25rem', display: 'block' }}>
                Peso:
              </label>
              <span style={{ fontWeight: 'bold' }}>
                {remito.mercaderia?.pesoMercaderia || 0} kg
              </span>
            </div>
          </div>
        </div>

        {/* Lista de mercadería */}
        <div className={styles.tablaContenedor}>
          <div style={{ padding: '1rem' }}>
            {mercaderiaConEstado.map((item) => (
              <div
                key={item.id}
                style={{
                  background: '#f9fafb',
                  margin: '1rem 0',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #e5e7eb',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                    {item.tipoMercaderia}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                    {getCantidadText(item)}
                  </div>
                </div>
                
                {estadoActual === 'En preparación' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: item.preparada ? '#16a34a' : '#6b7280' }}>
                      {item.preparada ? 'Preparada' : 'Preparadas'}
                    </span>
                    <input
                      type="checkbox"
                      checked={item.preparada}
                      onChange={() => handleMercaderiaCheck(item.id)}
                      style={{ 
                        width: '1.2rem', 
                        height: '1.2rem',
                        accentColor: '#16a34a',
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                )}
                
                {estadoActual !== 'En preparación' && estadoActual !== 'Autorizado' && (
                  <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                    {item.preparada ? '✓ Preparada' : 'Preparada'}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Botones de acción */}
          <div style={{ 
            padding: '1rem', 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '1rem',
            borderTop: '1px solid #e5e7eb'
          }}>
            {getBotonPrincipal()}
            
            {estadoActual !== 'Retenido' && estadoActual !== 'Entregado' && estadoActual !== 'No entregado' && (
              <button 
                className={styles.crearBtn}
                style={{ background: '#dc2626' }}
                onClick={handleRetener}
              >
                RETENER
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal para razón de no entrega */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '0.5rem',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>
              Razón de no entrega
            </h3>
            <textarea
              value={razonNoEntrega}
              onChange={(e) => setRazonNoEntrega(e.target.value)}
              placeholder="Ingrese la razón por la que no se pudo entregar el remito"
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '0.5rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.25rem',
                marginBottom: '1rem',
                resize: 'vertical'
              }}
            />
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                onClick={() => setShowModal(false)}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.25rem',
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirmarNoEntrega}
                className={styles.crearBtn}
                disabled={!razonNoEntrega.trim()}
                style={{
                  opacity: !razonNoEntrega.trim() ? 0.5 : 1,
                  cursor: !razonNoEntrega.trim() ? 'not-allowed' : 'pointer'
                }}
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