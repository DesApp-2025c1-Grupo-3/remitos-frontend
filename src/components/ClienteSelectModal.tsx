import React, { useState, useCallback, useMemo } from 'react';
import { Pagination } from './Pagination/Pagination';
import { X } from 'lucide-react';

interface Cliente {
  id: number;
  razonSocial: string;
  cuit_rut: string;
  direccion: string;
}

interface ClienteSelectModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (cliente: Cliente) => void;
  clienteSeleccionado?: Cliente | null;
}

export const ClienteSelectModal: React.FC<ClienteSelectModalProps> = ({ open, onClose, onSelect, clienteSeleccionado }) => {
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [campoCliente, setCampoCliente] = useState<'razonSocial' | 'cuit_rut' | 'direccion'>('razonSocial');
  const [currentPageCliente, setCurrentPageCliente] = useState(1);
  const [clientesPaginados, setClientesPaginados] = useState<{ data: Cliente[], totalItems: number, totalPages: number, currentPage: number }>({ data: [], totalItems: 0, totalPages: 1, currentPage: 1 });
  const [loadingClientes, setLoadingClientes] = useState(false);
  const itemsPerPage = 5;

  // Cargar clientes paginados del servidor
  const cargarClientes = useCallback(async () => {
    if (!open) return;
    setLoadingClientes(true);
    try {
      const params: any = {
        page: currentPageCliente,
        limit: itemsPerPage
      };
      if (busquedaCliente.trim()) {
        params[campoCliente] = busquedaCliente.trim();
      }
      const response = await fetch(`${(import.meta as any).env?.VITE_API_URL || 'http://localhost:3001'}/cliente?${new URLSearchParams(params)}`);
      const data = await response.json();
      setClientesPaginados(data);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    } finally {
      setLoadingClientes(false);
    }
  }, [open, currentPageCliente, busquedaCliente, campoCliente, itemsPerPage]);

  useMemo(() => {
    if (open) cargarClientes();
  }, [open, currentPageCliente, busquedaCliente, campoCliente, cargarClientes]);

  useMemo(() => {
    if (open) setCurrentPageCliente(1);
  }, [busquedaCliente, campoCliente, open]);

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
        height: '530px',
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
            Seleccionar Cliente
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
            value={campoCliente}
            onChange={(e) => setCampoCliente(e.target.value as 'razonSocial' | 'cuit_rut' | 'direccion')}
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
            <option value="razonSocial">Razón Social</option>
            <option value="cuit_rut">CUIT/RUT</option>
            <option value="direccion">Dirección</option>
          </select>
          <input
            type="text"
            placeholder={(() => {
              switch (campoCliente) {
                case 'razonSocial': return 'Buscar por Razón Social...';
                case 'cuit_rut': return 'Buscar por CUIT/RUT...';
                case 'direccion': return 'Buscar por Dirección...';
                default: return 'Buscar...';
              }
            })()}
            value={busquedaCliente}
            onChange={(e) => setBusquedaCliente(e.target.value)}
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
          {loadingClientes ? (
            <div style={{ 
              padding: '2rem', 
              textAlign: 'center', 
              color: '#6b7280',
              fontSize: '0.875rem'
            }}>
              Cargando clientes...
            </div>
          ) : clientesPaginados.data && clientesPaginados.data.length > 0 ? (
            <>
              {/* Results List */}
              <div style={{ 
                flex: 1,
                overflow: 'auto',
                padding: '0.5rem'
              }}>
                {clientesPaginados.data.map(cliente => (
                  <div
                    key={cliente.id}
                    onClick={() => { onSelect(cliente); onClose(); }}
                    style={{ 
                      padding: '0.5rem 0.75rem', 
                      border: '1px solid #e5e7eb', 
                      marginBottom: '0.25rem', 
                      cursor: 'pointer', 
                      borderRadius: '6px', 
                      background: clienteSeleccionado && clienteSeleccionado.id === cliente.id ? '#bbf7d0' : '#fff',
                      transition: 'all 0.2s ease',
                      fontSize: '0.92em',
                      minHeight: 'unset',
                      lineHeight: 1.2
                    }}
                    onMouseEnter={(e) => {
                      if (!(clienteSeleccionado && clienteSeleccionado.id === cliente.id)) {
                        e.currentTarget.style.background = '#f9fafb';
                        e.currentTarget.style.borderColor = '#1F7A3D';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!(clienteSeleccionado && clienteSeleccionado.id === cliente.id)) {
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
                      {cliente.razonSocial}
                    </div>
                    <div style={{ 
                      fontSize: '0.85em',
                      color: '#6b7280',
                      lineHeight: '1.2',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {cliente.cuit_rut} - {cliente.direccion}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination solo, centrado */}
              <div style={{ 
                padding: '0.3rem 1rem 0.3rem 1rem',
                borderTop: '1px solid #f3f4f6',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minHeight: 0,
                marginTop: 0,
                background: '#fff'
              }}>
                <Pagination
                  currentPage={currentPageCliente}
                  totalPages={clientesPaginados.totalPages}
                  onPageChange={setCurrentPageCliente}
                  totalItems={clientesPaginados.totalItems}
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
              No se encontraron clientes
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 