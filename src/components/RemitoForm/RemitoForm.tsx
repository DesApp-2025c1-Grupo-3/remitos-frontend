import React, { useState, useCallback } from 'react';
import styles from '../Form.module.css';
import { Upload, ArrowLeft, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

  // Validar que clientes y destinos sean arrays antes de usar filter
  const clientesFiltrados = Array.isArray(clientes) 
    ? clientes.filter(c => (c[campoCliente] || '').toLowerCase().includes(busquedaCliente.toLowerCase()))
    : [];
  const destinosFiltrados = Array.isArray(destinos)
    ? destinos.filter(d => (d[campoDestino] || '').toLowerCase().includes(busquedaDestino.toLowerCase()))
    : [];

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
                type="number"
                min="0"
                max="999999999999999.99"
                step="0.01"
                value={formData.valorDeclarado}
                onChange={onChange}
                placeholder="Ingresar valor declarado"
                className={styles.input}
                required
              />
            </div>
            
            <div className={styles.campo}>
              <label className={styles.label}>Peso total (kg) *</label>
              <input
                name="pesoMercaderia"
                type="number"
                min="0"
                max="999999999999.999"
                step="0.001"
                value={formData.pesoMercaderia}
                onChange={onChange}
                placeholder="Ingresar peso total"
                className={styles.input}
                required
              />
            </div>
            
            <div className={styles.campo}>
              <label className={styles.label}>Volumen (m³) *</label>
              <input
                name="volumenMetrosCubico"
                type="number"
                min="0"
                max="999999999.999"
                step="0.001"
                value={formData.volumenMetrosCubico}
                onChange={onChange}
                placeholder="Ingresar volumen"
                className={styles.input}
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
                type="number"
                min="0"
                max="9223372036854775807"
                value={formData.cantidadPallets}
                onChange={onChange}
                placeholder="0"
                className={styles.input}
              />
            </div>
            
            <div className={styles.campo}>
              <label className={styles.label}>Cantidad de Bultos</label>
              <input
                name="cantidadBultos"
                type="number"
                min="0"
                max="9223372036854775807"
                value={formData.cantidadBultos}
                onChange={onChange}
                placeholder="0"
                className={styles.input}
              />
            </div>
            
            <div className={styles.campo}>
              <label className={styles.label}>Cantidad de Racks</label>
              <input
                name="cantidadRacks"
                type="number"
                min="0"
                max="9223372036854775807"
                value={formData.cantidadRacks}
                onChange={onChange}
                placeholder="0"
                className={styles.input}
              />
            </div>
            
            <div className={styles.campo}>
              <label className={styles.label}>Cantidad de Bobinas</label>
              <input
                name="cantidadBobinas"
                type="number"
                min="0"
                max="9223372036854775807"
                value={formData.cantidadBobinas}
                onChange={onChange}
                placeholder="0"
                className={styles.input}
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
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', width: '90%', maxWidth: '600px', maxHeight: '80vh', overflow: 'auto' }}>
            <h3>Seleccionar Cliente</h3>
            <div style={{ marginBottom: '1rem' }}>
              <select
                value={campoCliente}
                onChange={(e) => setCampoCliente(e.target.value as 'razonSocial' | 'cuit_rut' | 'direccion')}
                style={{ marginRight: '1rem', padding: '0.5rem' }}
              >
                <option value="razonSocial">Razón Social</option>
                <option value="cuit_rut">CUIT/RUT</option>
                <option value="direccion">Dirección</option>
              </select>
              <input
                type="text"
                placeholder={`Buscar por ${campoCliente}...`}
                value={busquedaCliente}
                onChange={(e) => setBusquedaCliente(e.target.value)}
                style={{ padding: '0.5rem', flex: 1 }}
              />
            </div>
            <div style={{ maxHeight: '300px', overflow: 'auto' }}>
              {clientesFiltrados.map(cliente => (
                <div
                  key={cliente.id}
                  onClick={() => handleClienteSelect(cliente)}
                  style={{ padding: '0.75rem', border: '1px solid #ddd', marginBottom: '0.5rem', cursor: 'pointer', borderRadius: '4px' }}
                >
                  <strong>{cliente.razonSocial}</strong><br />
                  <small>{cliente.cuit_rut} - {cliente.direccion}</small>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
              <button onClick={() => setModalCliente(false)} style={{ padding: '0.5rem 1rem', background: '#ccc', border: 'none', borderRadius: '4px' }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Destino */}
      {modalDestino && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', width: '90%', maxWidth: '600px', maxHeight: '80vh', overflow: 'auto' }}>
            <h3>Seleccionar Destino</h3>
            <div style={{ marginBottom: '1rem' }}>
              <select
                value={campoDestino}
                onChange={(e) => setCampoDestino(e.target.value as 'provincia' | 'localidad' | 'direccion')}
                style={{ marginRight: '1rem', padding: '0.5rem' }}
              >
                <option value="provincia">Provincia</option>
                <option value="localidad">Localidad</option>
                <option value="direccion">Dirección</option>
              </select>
              <input
                type="text"
                placeholder={`Buscar por ${campoDestino}...`}
                value={busquedaDestino}
                onChange={(e) => setBusquedaDestino(e.target.value)}
                style={{ padding: '0.5rem', flex: 1 }}
              />
            </div>
            <div style={{ maxHeight: '300px', overflow: 'auto' }}>
              {destinosFiltrados.map(destino => (
                <div
                  key={destino.id}
                  onClick={() => handleDestinoSelect(destino)}
                  style={{ padding: '0.75rem', border: '1px solid #ddd', marginBottom: '0.5rem', cursor: 'pointer', borderRadius: '4px' }}
                >
                  <strong>{destino.nombre}</strong><br />
                  <small>{destino.provincia}, {destino.localidad} - {destino.direccion}</small>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
              <button onClick={() => setModalDestino(false)} style={{ padding: '0.5rem 1rem', background: '#ccc', border: 'none', borderRadius: '4px' }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 