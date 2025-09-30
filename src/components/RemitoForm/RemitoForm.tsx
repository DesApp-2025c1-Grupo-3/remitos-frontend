import React, { useState, useCallback, useMemo, useEffect } from 'react';
import styles from '../Form.module.css';
import { Upload, ArrowLeft, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Pagination } from '../Pagination/Pagination';
import { ClienteSelectModal } from '../ClienteSelectModal';
import { DestinoSelectModal } from '../DestinoSelectModal';
import { MercaderiasForm } from '../MercaderiasForm/MercaderiasForm';
import { getApiUrl } from '../../config/api';
import { Mercaderia } from '../../types/mercaderia';


export interface RemitoFormData {
  numeroAsignado: string;
  observaciones: string;
  prioridad: 'normal' | 'alta' | 'urgente';
  clienteId: number | string;
  destinoId: number | string;
  // Mercaderías como array
  mercaderias: Mercaderia[];
  // Archivo adjunto
  archivoAdjunto?: File;
}

interface Cliente {
  id: number;
  razonSocial: string;
  cuit_rut: string;
  direccion: string;
}

interface Destino {
  id: number;
  nombre: string;
  provincia: string;
  localidad: string;
  direccion: string;
}

interface RemitoFormProps {
  formData: RemitoFormData;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onMercaderiasChange: (mercaderias: Mercaderia[]) => void;
  onFileChange?: (file: File | null) => void;
  submitButtonText: string;
  error: string | null;
  clientes?: Cliente[];
  destinos?: Destino[];
  onNuevoCliente?: () => void;
  onNuevoDestino?: () => void;
  onVolver?: () => void;
  existingFile?: {
    name: string;
    path: string;
    url: string;
  } | null;
  onCancel?: () => void;
  showMercaderiasError?: boolean;
}

export const RemitoForm: React.FC<RemitoFormProps> = ({
  formData,
  onSubmit,
  onChange,
  onMercaderiasChange,
  onFileChange,
  submitButtonText,
  error,
  clientes,
  destinos,
  onNuevoCliente,
  onNuevoDestino,
  existingFile,
  onCancel,
  showMercaderiasError = false
}) => {
  const navigate = useNavigate();
  // Estados para modales
  const [modalCliente, setModalCliente] = useState(false);
  const [modalDestino, setModalDestino] = useState(false);
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [busquedaDestino, setBusquedaDestino] = useState('');
  const [campoCliente, setCampoCliente] = useState<'razonSocial' | 'cuit_rut' | 'direccion'>('razonSocial');
  const [campoDestino, setCampoDestino] = useState<'provincia' | 'localidad' | 'direccion'>('provincia');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showExistingFile, setShowExistingFile] = useState(true);
  
  // Estados para paginación del servidor
  const [currentPageCliente, setCurrentPageCliente] = useState(1);
  const [currentPageDestino, setCurrentPageDestino] = useState(1);
  const [clientesPaginados, setClientesPaginados] = useState<{ data: Cliente[], totalItems: number, totalPages: number, currentPage: number }>({ data: [], totalItems: 0, totalPages: 1, currentPage: 1 });
  const [destinosPaginados, setDestinosPaginados] = useState<{ data: Destino[], totalItems: number, totalPages: number, currentPage: number }>({ data: [], totalItems: 0, totalPages: 1, currentPage: 1 });
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [loadingDestinos, setLoadingDestinos] = useState(false);
  const itemsPerPage = 5;

  // Función para cargar clientes paginados del servidor
  const cargarClientes = useCallback(async () => {
    if (!modalCliente) return;
    
    setLoadingClientes(true);
    try {
      const params: any = {
        page: currentPageCliente,
        limit: itemsPerPage
      };
      
      // Agregar filtro según el campo seleccionado
      if (busquedaCliente.trim()) {
        params[campoCliente] = busquedaCliente.trim();
      }
      
      const response = await fetch(`${getApiUrl()}/cliente?${new URLSearchParams(params)}`);
      const data = await response.json();
      setClientesPaginados(data);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    } finally {
      setLoadingClientes(false);
    }
  }, [modalCliente, currentPageCliente, busquedaCliente, campoCliente, itemsPerPage]);

  // Función para cargar destinos paginados del servidor
  const cargarDestinos = useCallback(async () => {
    if (!modalDestino) return;
    
    setLoadingDestinos(true);
    try {
      const params: any = {
        page: currentPageDestino,
        limit: itemsPerPage
      };
      
      // Agregar filtro según el campo seleccionado
      if (busquedaDestino.trim()) {
        params[campoDestino] = busquedaDestino.trim();
      }
      
      const response = await fetch(`${getApiUrl()}/destino?${new URLSearchParams(params)}`);
      const data = await response.json();
      setDestinosPaginados(data);
    } catch (error) {
      console.error('Error al cargar destinos:', error);
    } finally {
      setLoadingDestinos(false);
    }
  }, [modalDestino, currentPageDestino, busquedaDestino, campoDestino, itemsPerPage]);

  // Cargar datos cuando se abre el modal o cambia la búsqueda
  useMemo(() => {
    if (modalCliente) {
      cargarClientes();
    }
  }, [modalCliente, currentPageCliente, busquedaCliente, campoCliente, cargarClientes]);

  useMemo(() => {
    if (modalDestino) {
      cargarDestinos();
    }
  }, [modalDestino, currentPageDestino, busquedaDestino, campoDestino, cargarDestinos]);

  // Resetear página cuando cambia la búsqueda
  useMemo(() => {
    if (modalCliente) {
      setCurrentPageCliente(1);
    }
  }, [busquedaCliente, campoCliente]);

  useMemo(() => {
    if (modalDestino) {
      setCurrentPageDestino(1);
    }
  }, [busquedaDestino, campoDestino]);

  const clienteSeleccionado = clientes?.find(c => c.id.toString() === formData.clienteId.toString());
  const destinoSeleccionado = destinos?.find(d => d.id.toString() === formData.destinoId.toString());

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      const file = droppedFiles[0];
      setSelectedFile(file);
      onFileChange?.(file);
    }
  }, [onFileChange]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      onFileChange?.(file);
    }
  }, [onFileChange]);

  const removeFile = useCallback(() => {
    setSelectedFile(null);
    onFileChange?.(null);
  }, [onFileChange]);

  const handleClienteSelect = (cliente: Cliente) => {
    const event = {
      target: {
        name: 'clienteId',
        value: cliente.id.toString()
      }
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(event);
    setModalCliente(false);
    setBusquedaCliente('');
    setCurrentPageCliente(1);
  };

  const handleDestinoSelect = (destino: Destino) => {
    const event = {
      target: {
        name: 'destinoId',
        value: destino.id.toString()
      }
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(event);
    setModalDestino(false);
    setBusquedaDestino('');
    setCurrentPageDestino(1);
  };

  return (
    <div className={styles.wrapper}>
      {error && <div className={styles.error}>{error}</div>}
      <form onSubmit={onSubmit} className={styles.formulario}>
        <div className={styles.formContent}>
          {/* Columna izquierda */}
          <div className={styles.formColumn}>
            <div className={styles.campo} style={{ width: '100%' }}>
              <label className={styles.label} style={{ textAlign: 'left' }}>Número de remito *</label>
              <input
                name="numeroAsignado"
                value={formData.numeroAsignado}
                onChange={onChange}
                placeholder="Ingresar número de remito"
                className={styles.input}
                required
                style={{ textAlign: 'left', width: '100%', fontSize: 18, padding: '0.7rem 1.2rem' }}
              />
            </div>
            
            <div className={styles.campo} style={{ width: '100%' }}>
              <label className={styles.label} style={{ textAlign: 'left' }}>Cliente *</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', width: '100%' }}>
                <input
                  value={clienteSeleccionado ? clienteSeleccionado.razonSocial : ''}
                  placeholder="Seleccionar cliente"
                  className={styles.input}
                  style={{ flex: 1, cursor: 'pointer', background: '#e5e7eb', textAlign: 'left', width: '100%', fontSize: 18, padding: '0.7rem 1.2rem' }}
                  readOnly
                  onClick={() => setModalCliente(true)}
                />
                <button type="button" onClick={onNuevoCliente} style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, padding: '0.5rem 1.2rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', height: 40 }}>
                  Crear
                </button>
              </div>
            </div>
            
            <div className={styles.campo} style={{ width: '100%' }}>
              <label className={styles.label} style={{ textAlign: 'left' }}>Destino *</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', width: '100%' }}>
                <input
                  value={destinoSeleccionado ? `${destinoSeleccionado.nombre}, ${destinoSeleccionado.provincia}` : ''}
                  placeholder="Seleccionar destino"
                  className={styles.input}
                  style={{ flex: 1, cursor: 'pointer', background: '#e5e7eb', textAlign: 'left', width: '100%', fontSize: 18, padding: '0.7rem 1.2rem' }}
                  readOnly
                  onClick={() => setModalDestino(true)}
                />
                <button type="button" onClick={onNuevoDestino} style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, padding: '0.5rem 1.2rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', height: 40 }}>
                  Crear
                </button>
              </div>
            </div>

            <div className={styles.campo}>
              <label className={styles.label}>Prioridad *</label>
              <select
                name="prioridad"
                value={formData.prioridad}
                onChange={onChange}
                className={styles.input}
                required
              >
                <option value="">Seleccionar prioridad</option>
                <option value="normal">Normal</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
          </div>
          
          {/* Columna derecha */}
          <div className={styles.formColumn}>
            <div className={styles.campo}>
              <label className={styles.label}>Observaciones</label>
              <textarea
                name="observaciones"
                value={formData.observaciones}
                onChange={onChange}
                placeholder="Ingresar observaciones"
                className={styles.input}
                rows={3}
              />
            </div>
            
            {/* Área de carga de archivos */}
            <div className={styles.campo}>
              <label className={styles.label}>Archivo adjunto</label>
              
              {/* Mostrar archivo existente si existe y no se ha seleccionado uno nuevo */}
              {existingFile && showExistingFile && !selectedFile && (
                <div style={{
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '1rem',
                  backgroundColor: '#f9fafb',
                  marginBottom: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.2rem' }}>📄</span>
                      <span>{existingFile.name}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <a 
                        href={existingFile.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ 
                          color: '#FF6B35', 
                          textDecoration: 'underline',
                          fontSize: '0.9rem'
                        }}
                      >
                        Ver archivo
                      </a>
                      <button 
                        type="button" 
                        onClick={() => setShowExistingFile(false)}
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          cursor: 'pointer',
                          color: '#dc2626',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Área de carga de archivos */}
              {(!existingFile || !showExistingFile || selectedFile) && (
                <div
                  className={`${styles.dropZone} ${isDragging ? styles.dragging : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  style={{
                    border: '2px dashed #ccc',
                    borderRadius: '8px',
                    padding: '1rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: isDragging ? '#f0f8ff' : '#fafafa'
                  }}
                >
                  {selectedFile ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>{selectedFile.name}</span>
                      <button type="button" onClick={removeFile} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <X size={20} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload size={24} style={{ marginBottom: '0.5rem' }} />
                      <p>Arrastra un archivo aquí o haz clic para seleccionar</p>
                      <input
                        type="file"
                        onChange={handleFileInput}
                        style={{ display: 'none' }}
                        id="fileInput"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      />
                      <label htmlFor="fileInput" style={{ cursor: 'pointer', color: '#FF6B35', textDecoration: 'underline' }}>
                        Seleccionar archivo
                      </label>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sección de mercaderías */}
        <MercaderiasForm 
          mercaderias={formData.mercaderias || []}
          onMercaderiasChange={onMercaderiasChange}
          showError={showMercaderiasError}
        />
        
        <div className={styles.buttonContainer}>
          {onCancel && (
            <button type="button" onClick={onCancel} className={styles.cancelBtn}>
              Cancelar
            </button>
          )}
          <button type="submit" className={styles.submitBtn}>
            {submitButtonText}
          </button>
        </div>
      </form>

      {/* Modal Cliente */}
      {modalCliente && (
        <ClienteSelectModal
          open={modalCliente}
          onClose={() => setModalCliente(false)}
          onSelect={handleClienteSelect}
          clienteSeleccionado={clienteSeleccionado}
        />
      )}

      {/* Modal Destino */}
      {modalDestino && (
        <DestinoSelectModal
          open={modalDestino}
          onClose={() => setModalDestino(false)}
          onSelect={handleDestinoSelect}
          destinoSeleccionado={destinoSeleccionado}
        />
      )}
    </div>
  );
}; 