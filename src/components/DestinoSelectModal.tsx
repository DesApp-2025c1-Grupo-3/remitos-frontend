import React, { useState, useCallback, useMemo } from 'react';
import { Pagination } from './Pagination/Pagination';
import { X } from 'lucide-react';
import { destinosService, Destino } from '../services/destinosService';

interface DestinoSelectModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (destino: Destino) => void;
  destinoSeleccionado?: Destino | null;
}

export const DestinoSelectModal: React.FC<DestinoSelectModalProps> = ({ open, onClose, onSelect, destinoSeleccionado }) => {
  const [busquedaDestino, setBusquedaDestino] = useState('');
  const [campoDestino, setCampoDestino] = useState<'provincia' | 'localidad' | 'direccion'>('provincia');
  const [currentPageDestino, setCurrentPageDestino] = useState(1);
  const [destinosPaginados, setDestinosPaginados] = useState<{ data: Destino[], totalItems: number, totalPages: number, currentPage: number }>({ data: [], totalItems: 0, totalPages: 1, currentPage: 1 });
  const [loadingDestinos, setLoadingDestinos] = useState(false);
  const [debouncedBusqueda, setDebouncedBusqueda] = useState('');
  const itemsPerPage = 5;

  // Debounce para la búsqueda
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedBusqueda(busquedaDestino);
    }, 300);

    return () => clearTimeout(timer);
  }, [busquedaDestino]);

  // Cargar destinos paginados del servidor
  const cargarDestinos = React.useCallback(async () => {
    if (!open) return;
    setLoadingDestinos(true);
    try {
      const params: any = {
        page: currentPageDestino,
        limit: itemsPerPage
      };
      if (debouncedBusqueda.trim()) {
        params[campoDestino] = debouncedBusqueda.trim();
      }
      
      const data = await destinosService.getDestinos(params);
      
      setDestinosPaginados(data);
    } catch (error) {
      console.error('Error al cargar destinos:', error);
      // En caso de error, establecer datos vacíos
      setDestinosPaginados({ data: [], totalItems: 0, totalPages: 1, currentPage: 1 });
    } finally {
      setLoadingDestinos(false);
    }
  }, [open, currentPageDestino, debouncedBusqueda, campoDestino]);

  // Cargar destinos cuando cambien los parámetros
  React.useEffect(() => {
    if (open) {
      cargarDestinos();
    }
  }, [open, currentPageDestino, debouncedBusqueda, campoDestino]);

  // Resetear página cuando cambie la búsqueda
  React.useEffect(() => {
    if (open && (debouncedBusqueda || campoDestino !== 'provincia')) {
      setCurrentPageDestino(1);
    }
  }, [debouncedBusqueda, campoDestino, open]);

  if (!open) return null;

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      background: 'rgba(0,0,0,0.5)', 
      zIndex: 1000, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{ 
        background: 'white', 
        borderRadius: '12px', 
        width: '100%', 
        maxWidth: '500px',
        height: '550px',
        maxHeight: '90vh',
        boxShadow: '0 8px 32px #0002',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header con botón de cerrar */}
        <div style={{ 
          padding: '0.7rem 1rem 0.5rem 1rem',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative'
        }}>
          <h3 style={{ 
            fontSize: '1.05rem', 
            fontWeight: 600, 
            margin: 0,
            color: '#374151'
          }}>
            Seleccionar Destino
          </h3>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            style={{
              background: 'none',
              border: 'none',
              color: '#6b7280',
              fontSize: 18,
              cursor: 'pointer',
              padding: 2,
              borderRadius: '50%',
              transition: 'background 0.2s',
              position: 'absolute',
              right: 8,
              top: 8
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <X size={16} />
          </button>
        </div>

        {/* Search Controls en una sola línea */}
        <div style={{ 
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #f3f4f6',
          display: 'flex',
          flexDirection: 'row',
          gap: '0.5rem',
          alignItems: 'center'
        }}>
          <select
            value={campoDestino}
            onChange={(e) => setCampoDestino(e.target.value as 'provincia' | 'localidad' | 'direccion')}
            style={{ 
              padding: '0.25rem 0.6rem', 
              borderRadius: 6, 
              border: '1px solid #d1d5db', 
              fontSize: '0.85rem',
              backgroundColor: '#f9fafb',
              color: '#374151',
              height: '1.7rem',
              minWidth: 120,
              flex: '0 0 auto',
              boxSizing: 'border-box'
            }}
          >
            <option value="provincia">Provincia</option>
            <option value="localidad">Localidad</option>
            <option value="direccion">Dirección</option>
          </select>
          <input
            type="text"
            placeholder={(() => {
              switch (campoDestino) {
                case 'provincia': return 'Buscar por provincia...';
                case 'localidad': return 'Buscar por localidad...';
                case 'direccion': return 'Buscar por dirección...';
                default: return 'Buscar...';
              }
            })()}
            value={busquedaDestino}
            onChange={(e) => setBusquedaDestino(e.target.value)}
            style={{ 
              padding: '0.25rem 0.6rem', 
              borderRadius: 6, 
              border: '1px solid #d1d5db', 
              fontSize: '0.85rem',
              backgroundColor: '#f9fafb',
              color: '#374151',
              height: '1.7rem',
              marginBottom: 0,
              flex: 1,
              boxSizing: 'border-box'
            }}
            className="modal-search-input"
          />
        </div>

        {/* Content */}
        <div style={{ 
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {loadingDestinos ? (
            <div style={{ 
              padding: '2rem', 
              textAlign: 'center', 
              color: '#6b7280',
              fontSize: '0.875rem'
            }}>
              Cargando destinos...
            </div>
          ) : destinosPaginados.data && destinosPaginados.data.length > 0 ? (
            <>
              {/* Results List */}
              <div style={{ 
                flex: 1,
                overflow: 'auto',
                padding: '0.5rem'
              }}>
                {destinosPaginados.data.map(destino => (
                  <div
                    key={destino.id}
                    onClick={() => { onSelect(destino); onClose(); }}
                    style={{ 
                      padding: '0.5rem 0.75rem', 
                      border: '1px solid #e5e7eb', 
                      marginBottom: '0.25rem', 
                      cursor: 'pointer', 
                      borderRadius: '6px', 
                      background: destinoSeleccionado && destinoSeleccionado.id === destino.id ? '#bbf7d0' : '#fff',
                      transition: 'all 0.2s ease',
                      fontSize: '0.92em',
                      minHeight: 'unset',
                      lineHeight: 1.2
                    }}
                    onMouseEnter={(e) => {
                      if (!(destinoSeleccionado && destinoSeleccionado.id === destino.id)) {
                        e.currentTarget.style.background = '#f9fafb';
                        e.currentTarget.style.borderColor = '#1F7A3D';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!(destinoSeleccionado && destinoSeleccionado.id === destino.id)) {
                        e.currentTarget.style.background = '#fff';
                        e.currentTarget.style.borderColor = '#e5e7eb';
                      }
                    }}
                  >
                    <div style={{ 
                      fontWeight: 600, 
                      fontSize: '0.98em',
                      color: '#374151',
                      marginBottom: '0.1rem',
                      lineHeight: 1.1
                    }}>
                      {destino.nombre}
                    </div>
                    <div style={{ 
                      fontSize: '0.85em',
                      color: '#6b7280',
                      lineHeight: '1.2',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {destino.provincia}, {destino.localidad} - {destino.direccion}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination solo, centrado */}
              <div style={{ 
                padding: '0.8rem 1rem 0.8rem 1rem',
                borderTop: '1px solid #f3f4f6',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minHeight: 0,
                marginTop: 0,
                background: '#fff'
              }}>
                <Pagination
                  currentPage={currentPageDestino}
                  totalPages={destinosPaginados.totalPages}
                  onPageChange={setCurrentPageDestino}
                  totalItems={destinosPaginados.totalItems}
                  itemsPerPage={itemsPerPage}
                />
              </div>
            </>
          ) : (
            <div style={{ 
              padding: '2rem', 
              textAlign: 'center', 
              color: '#6b7280',
              fontSize: '0.875rem'
            }}>
              No se encontraron destinos
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 