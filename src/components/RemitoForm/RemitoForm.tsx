import React, { useState, useCallback, useMemo } from 'react';
import styles from '../Form.module.css';
import { Upload, ArrowLeft, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Pagination } from '../Pagination/Pagination';
import { ClienteSelectModal } from '../ClienteSelectModal';
import { DestinoSelectModal } from '../DestinoSelectModal';

// Funciones de formato para campos numéricos
const formatCurrency = (value: string | number): string => {
  if (!value || value === '') return '';
  const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
  if (numValue === 0) return '';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numValue);
};

const formatNumber = (value: string | number): string => {
  if (!value || value === '') return '';
  const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
  if (numValue === 0) return '';
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numValue);
};

const formatInteger = (value: string | number): string => {
  if (!value || value === '') return '';
  const numValue = typeof value === 'string' ? parseInt(value) || 0 : Math.floor(Number(value)) || 0;
  if (numValue === 0) return '';
  return new Intl.NumberFormat('es-AR').format(numValue);
};

const parseFormattedValue = (formattedValue: string): string => {
  // Si está vacío, retornar cadena vacía
  if (!formattedValue || formattedValue.trim() === '') return '';
  
  // Remover símbolos de moneda, puntos y espacios, mantener solo números y coma decimal
  const cleaned = formattedValue.replace(/[^\d,]/g, '').replace(',', '.');
  
  // Si después de limpiar está vacío, retornar cadena vacía
  if (!cleaned || cleaned === '') return '';
  
  // Validar que sea un número válido
  const numValue = parseFloat(cleaned);
  if (isNaN(numValue)) return '';
  
  // Convertir a entero para BIGINT
  return Math.floor(numValue).toString();
};

// Función para validar límites según el tipo de campo
const validateFieldLimit = (fieldName: string, value: string): string => {
  const numValue = parseInt(value);
  if (isNaN(numValue)) return value;
  
  switch (fieldName) {
    case 'valorDeclarado':
      // Máximo 999.999.999.999 (12 dígitos enteros)
      if (numValue > 999999999999) return '999999999999';
      break;
    case 'pesoMercaderia':
      // Máximo 999.999.999 kg (9 dígitos enteros)
      if (numValue > 999999999) return '999999999';
      break;
    case 'volumenMetrosCubico':
      // Máximo 999.999 m³ (6 dígitos enteros)
      if (numValue > 999999) return '999999';
      break;
    case 'cantidadPallets':
    case 'cantidadBultos':
    case 'cantidadRacks':
    case 'cantidadBobinas':
      // Máximo 999.999.999 (9 dígitos enteros)
      if (numValue > 999999999) return '999999999';
      break;
  }
  
  return value;
};

export interface RemitoFormData {
  numeroAsignado: string;
  observaciones: string;
  prioridad: 'normal' | 'alta' | 'urgente';
  clienteId: number | string;
  destinoId: number | string;
  // Campos de mercadería
  tipoMercaderia: string;
  valorDeclarado: number | string;
  volumenMetrosCubico: number | string;
  pesoMercaderia: number | string;
  cantidadBobinas: number | string;
  cantidadRacks: number | string;
  cantidadBultos: number | string;
  cantidadPallets: number | string;
  requisitosEspeciales: string;
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
  onFileChange?: (file: File | null) => void;
  submitButtonText: string;
  error: string | null;
  clientes?: Cliente[];
  destinos?: Destino[];
  onNuevoCliente?: () => void;
  onNuevoDestino?: () => void;
  onVolver?: () => void;
}

export const RemitoForm: React.FC<RemitoFormProps> = ({
  formData,
  onSubmit,
  onChange,
  onFileChange,
  submitButtonText,
  error,
  clientes,
  destinos,
  onNuevoCliente,
  onNuevoDestino
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
  
  // Estados para paginación del servidor
  const [currentPageCliente, setCurrentPageCliente] = useState(1);
  const [currentPageDestino, setCurrentPageDestino] = useState(1);
  const [clientesPaginados, setClientesPaginados] = useState<{ data: Cliente[], totalItems: number, totalPages: number, currentPage: number }>({ data: [], totalItems: 0, totalPages: 1, currentPage: 1 });
  const [destinosPaginados, setDestinosPaginados] = useState<{ data: Destino[], totalItems: number, totalPages: number, currentPage: number }>({ data: [], totalItems: 0, totalPages: 1, currentPage: 1 });
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [loadingDestinos, setLoadingDestinos] = useState(false);
  const itemsPerPage = 5;

  // Función helper para manejar cambios de campos con formato
  const handleFormattedChange = (fieldName: string, formattedValue: string, originalEvent: React.ChangeEvent<HTMLInputElement>) => {
    // Si el usuario está borrando y el campo queda vacío, permitir que se borre completamente
    if (formattedValue === '') {
      const event = {
        target: {
          name: fieldName,
          value: ''
        }
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(event);
      return;
    }
    
    const parsedValue = parseFormattedValue(formattedValue);
    const validatedValue = validateFieldLimit(fieldName, parsedValue);
    const event = {
      target: {
        name: fieldName,
        value: validatedValue
      }
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(event);
  };

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
      
      const response = await fetch(`${(import.meta as any).env?.VITE_API_URL || 'http://localhost:3001'}/cliente?${new URLSearchParams(params)}`);
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
      
      const response = await fetch(`${(import.meta as any).env?.VITE_API_URL || 'http://localhost:3001'}/destino?${new URLSearchParams(params)}`);
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
      <form onSubmit={onSubmit} className={styles.formulario} style={{maxWidth: 1100, width: '100%'}}>
        <div style={{ display: 'flex', gap: '2rem', width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
          {/* Columna izquierda */}
          <div style={{ flex: 1, minWidth: 320 }}>
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
                <button type="button" onClick={onNuevoCliente} style={{ background: '#1F7A3D', color: '#fff', border: 'none', borderRadius: 8, padding: '0.5rem 1.2rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', height: 40 }}>
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
                <button type="button" onClick={onNuevoDestino} style={{ background: '#1F7A3D', color: '#fff', border: 'none', borderRadius: 8, padding: '0.5rem 1.2rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', height: 40 }}>
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
            
            <div className={styles.campo}>
              <label className={styles.label}>Tipo de mercadería *</label>
              <select
                name="tipoMercaderia"
                value={formData.tipoMercaderia}
                onChange={onChange}
                className={styles.input}
                required
              >
                <option value="">Seleccionar tipo</option>
                <option value="Automotriz">Automotriz</option>
                <option value="Amoblamientos">Amoblamientos</option>
                <option value="Alimentos">Alimentos</option>
                <option value="Textil">Textil</option>
                <option value="Materiales Construcción">Materiales Construcción</option>
                <option value="Electrónica">Electrónica</option>
                <option value="Químicos">Químicos</option>
                <option value="Otros">Otros</option>
              </select>
            </div>
            
            <div className={styles.campo}>
              <label className={styles.label}>Valor declarado ($) *</label>
              <input
                name="valorDeclarado"
                type="text"
                value={formatNumber(formData.valorDeclarado)}
                onChange={(e) => handleFormattedChange('valorDeclarado', e.target.value, e)}
                placeholder="Ingresar valor declarado (solo números enteros)"
                className={styles.input}
                maxLength={20}
                required
              />
            </div>
            
            <div className={styles.campo}>
              <label className={styles.label}>Peso total (kg) *</label>
              <input
                name="pesoMercaderia"
                type="text"
                value={formatNumber(formData.pesoMercaderia)}
                onChange={(e) => handleFormattedChange('pesoMercaderia', e.target.value, e)}
                placeholder="Ingresar peso total (solo números enteros)"
                className={styles.input}
                maxLength={15}
                required
              />
            </div>
            
            <div className={styles.campo}>
              <label className={styles.label}>Volumen (m³) *</label>
              <input
                name="volumenMetrosCubico"
                type="text"
                value={formatNumber(formData.volumenMetrosCubico)}
                onChange={(e) => handleFormattedChange('volumenMetrosCubico', e.target.value, e)}
                placeholder="Ingresar volumen (solo números enteros)"
                className={styles.input}
                maxLength={12}
                required
              />
            </div>
          </div>
          
          {/* Columna derecha */}
          <div style={{ flex: 1, minWidth: 320 }}>
            <div className={styles.campo}>
              <label className={styles.label}>Cantidad de Pallets</label>
              <input
                name="cantidadPallets"
                type="text"
                value={formatInteger(formData.cantidadPallets)}
                onChange={(e) => handleFormattedChange('cantidadPallets', e.target.value, e)}
                placeholder="0"
                className={styles.input}
                maxLength={12}
              />
            </div>
            
            <div className={styles.campo}>
              <label className={styles.label}>Cantidad de Bultos</label>
              <input
                name="cantidadBultos"
                type="text"
                value={formatInteger(formData.cantidadBultos)}
                onChange={(e) => handleFormattedChange('cantidadBultos', e.target.value, e)}
                placeholder="0"
                className={styles.input}
                maxLength={12}
              />
            </div>
            
            <div className={styles.campo}>
              <label className={styles.label}>Cantidad de Racks</label>
              <input
                name="cantidadRacks"
                type="text"
                value={formatInteger(formData.cantidadRacks)}
                onChange={(e) => handleFormattedChange('cantidadRacks', e.target.value, e)}
                placeholder="0"
                className={styles.input}
                maxLength={12}
              />
            </div>
            
            <div className={styles.campo}>
              <label className={styles.label}>Cantidad de Bobinas</label>
              <input
                name="cantidadBobinas"
                type="text"
                value={formatInteger(formData.cantidadBobinas)}
                onChange={(e) => handleFormattedChange('cantidadBobinas', e.target.value, e)}
                placeholder="0"
                className={styles.input}
                maxLength={12}
              />
            </div>
            
            <div className={styles.campo}>
              <label className={styles.label}>Requisitos especiales de manipulación</label>
              <textarea
                name="requisitosEspeciales"
                value={formData.requisitosEspeciales}
                onChange={onChange}
                placeholder="Ingresar requisitos especiales"
                className={styles.input}
                rows={3}
              />
            </div>
            
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
                    <label htmlFor="fileInput" style={{ cursor: 'pointer', color: '#1F7A3D', textDecoration: 'underline' }}>
                      Seleccionar archivo
                    </label>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
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