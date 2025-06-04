import React, { useState, useCallback } from 'react';
import styles from '../Form.module.css';
import { Upload, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface RemitoFormData {
  numero: string;
  cliente: string;
  destino: string;
  peso: string;
  volumen: string;
  valor: string;
  tipo: string;
  requisitos: string;
  observaciones: string;
  cantidadPallets: string;
  cantidadBultos: string;
  cantidadRacks: string;
  cantidadBobinas: string;
  cantidadTambores: string;
}

interface RemitoFormProps {
  formData: RemitoFormData;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  submitButtonText: string;
  error: string | null;
  clientes?: { id: number, razonSocial: string, cuit_rut: string, direccion: string }[];
  destinos?: { id: number, name: string, provincia: string, direccion: string }[];
  onNuevoCliente?: () => void;
  onNuevoDestino?: () => void;
  onVolver?: () => void;
}

export const RemitoForm: React.FC<RemitoFormProps> = ({
  formData,
  onSubmit,
  onChange,
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
  const [campoDestino, setCampoDestino] = useState<'nombre' | 'provincia' | 'direccion'>('nombre');
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const clientesFiltrados = clientes?.filter(c => (c[campoCliente] || '').toLowerCase().includes(busquedaCliente.toLowerCase()));
  const destinosFiltrados = destinos?.filter(d => (d[campoDestino] || '').toLowerCase().includes(busquedaDestino.toLowerCase()));

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
    setFiles(prev => [...prev, ...droppedFiles]);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  return (
    <div className={styles.wrapper}>
      {error && <div className={styles.error}>{error}</div>}
      <form onSubmit={onSubmit} className={styles.formulario} style={{maxWidth: 1100, width: '100%'}}>
        <div style={{ display: 'flex', gap: '2rem', width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
          {/* Columna izquierda */}
          <div style={{ flex: 1, minWidth: 320 }}>
            <div className={styles.campo} style={{ width: '100%' }}>
              <label className={styles.label} style={{ textAlign: 'left' }}>Número de remito</label>
              <input
                name="numero"
                value={formData.numero}
                onChange={onChange}
                placeholder="Ingresar número de remito"
                className={styles.input}
                required
                style={{ textAlign: 'left', width: '100%', fontSize: 18, padding: '0.7rem 1.2rem' }}
              />
            </div>
            <div className={styles.campo} style={{ width: '100%' }}>
              <label className={styles.label} style={{ textAlign: 'left' }}>Cliente</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', width: '100%' }}>
                <input
                  name="cliente"
                  value={formData.cliente}
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
              <label className={styles.label} style={{ textAlign: 'left' }}>Destino</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', width: '100%' }}>
                <input
                  name="destino"
                  value={formData.destino}
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
              <label className={styles.label}>Peso total (kg)</label>
              <input
                name="peso"
                value={formData.peso}
                onChange={onChange}
                placeholder="Ingresar peso total"
                className={styles.input}
              />
            </div>
            <div className={styles.campo}>
              <label className={styles.label}>Volumen (m³)</label>
              <input
                name="volumen"
                value={formData.volumen}
                onChange={onChange}
                placeholder="Ingresar volumen"
                className={styles.input}
              />
            </div>
            <div className={styles.campo}>
              <label className={styles.label}>Valor declarado</label>
              <input
                name="valor"
                value={formData.valor}
                onChange={onChange}
                placeholder="Ingresar valor declarado"
                className={styles.input}
              />
            </div>
            <div className={styles.campo}>
              <label className={styles.label}>Tipo de mercadería</label>
              <input
                name="tipo"
                value={formData.tipo}
                onChange={onChange}
                placeholder="Ingresar tipo de mercadería"
                className={styles.input}
              />
            </div>
            <div className={styles.campo}>
              <label className={styles.label}>Requisitos de manipulación</label>
              <input
                name="requisitos"
                value={formData.requisitos}
                onChange={onChange}
                placeholder="Ingresar requisitos"
                className={styles.input}
              />
            </div>
          </div>
          {/* Columna derecha */}
          <div style={{ flex: 1, minWidth: 320 }}>
            <div className={styles.campo}>
              <label className={styles.label}>Cantidad pallets</label>
              <input
                name="cantidadPallets"
                value={formData.cantidadPallets}
                onChange={onChange}
                placeholder="Ingresar cantidad de pallets"
                className={styles.input}
              />
            </div>
            <div className={styles.campo}>
              <label className={styles.label}>Cantidad bultos</label>
              <input
                name="cantidadBultos"
                value={formData.cantidadBultos}
                onChange={onChange}
                placeholder="Ingresar cantidad de bultos"
                className={styles.input}
              />
            </div>
            <div className={styles.campo}>
              <label className={styles.label}>Cantidad racks</label>
              <input
                name="cantidadRacks"
                value={formData.cantidadRacks}
                onChange={onChange}
                placeholder="Ingresar cantidad de racks"
                className={styles.input}
              />
            </div>
            <div className={styles.campo}>
              <label className={styles.label}>Cantidad bobinas</label>
              <input
                name="cantidadBobinas"
                value={formData.cantidadBobinas}
                onChange={onChange}
                placeholder="Ingresar cantidad de bobinas"
                className={styles.input}
              />
            </div>
            <div className={styles.campo}>
              <label className={styles.label}>Cantidad tambores</label>
              <input
                name="cantidadTambores"
                value={formData.cantidadTambores}
                onChange={onChange}
                placeholder="Ingresar cantidad de tambores"
                className={styles.input}
              />
            </div>
            {/* Adjuntos (opcional, solo visual) */}
            <div className={styles.campo} style={{ marginTop: 32 }}>
              <label className={styles.label}>Adjuntos</label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{
                  border: `2px dashed ${isDragging ? '#1F7A3D' : '#e5e7eb'}`,
                  borderRadius: 8,
                  padding: '1.2rem',
                  textAlign: 'center',
                  background: isDragging ? '#f0fdf4' : '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  marginTop: 8
                }}
                onClick={() => document.getElementById('fileInput')?.click()}
              >
                <input
                  type="file"
                  id="fileInput"
                  multiple
                  onChange={handleFileInput}
                  style={{ display: 'none' }}
                />
                <Upload size={20} style={{ color: '#1F7A3D', marginBottom: 6 }} />
                <div style={{ color: '#1F7A3D', fontWeight: 500, fontSize: 14 }}>
                  Arrastra archivos aquí o haz clic para seleccionar
                </div>
              </div>
              {files.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  {files.map((file, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        background: '#f3f4f6',
                        borderRadius: 6,
                        marginBottom: 8
                      }}
                    >
                      <div style={{ fontSize: 14 }}>{file.name}</div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#dc2626',
                          cursor: 'pointer',
                          padding: 4
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className={styles.campo}>
              <label className={styles.label}>Observaciones</label>
              <textarea
                name="observaciones"
                value={formData.observaciones}
                onChange={onChange}
                placeholder="Ingresar observaciones"
                className={styles.input}
                style={{ fontSize: 18, padding: '0.7rem 1.2rem' }}
              />
            </div>
          </div>
        </div>
        <div className={styles.botonera} style={{ marginTop: 40 }}>
          <button 
            type="submit" 
            className={styles.formBtn} 
            style={{ 
              fontSize: 18, 
              padding: '0.8rem 2rem', 
              borderRadius: 20, 
              fontWeight: 600, 
              boxShadow: '0 4px 12px 0 #0002' 
            }}
          >
            {submitButtonText}
          </button>
        </div>
        {/* Modales de búsqueda ... */}
        {modalCliente && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0008', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 500, maxWidth: 600, boxShadow: '0 4px 24px #0003' }}>
              <h3 style={{ marginBottom: 16 }}>Buscar cliente</h3>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <select value={campoCliente} onChange={e => setCampoCliente(e.target.value as any)} style={{ padding: 6, borderRadius: 6, border: '1px solid #ccc' }}>
                  <option value="razonSocial">Razón social</option>
                  <option value="cuit_rut">CUIT/RUT</option>
                  <option value="direccion">Dirección</option>
                </select>
                <input
                  autoFocus
                  type="text"
                  value={busquedaCliente}
                  onChange={e => setBusquedaCliente(e.target.value)}
                  placeholder={`Buscar por ${campoCliente === 'razonSocial' ? 'razón social' : campoCliente === 'cuit_rut' ? 'CUIT/RUT' : 'dirección'}...`}
                  style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
                />
              </div>
              <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                {clientesFiltrados && clientesFiltrados.length > 0 ? clientesFiltrados.map(c => (
                  <div key={c.id} style={{ padding: 12, cursor: 'pointer', borderRadius: 6, background: formData.cliente === c.razonSocial ? '#e5e7eb' : 'transparent', marginBottom: 6, border: '1px solid #e5e7eb' }}
                    onClick={() => {
                      onChange({ target: { name: 'cliente', value: c.razonSocial } } as any);
                      setModalCliente(false);
                      setBusquedaCliente('');
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>{c.razonSocial}</div>
                    <div style={{ fontSize: 13, color: '#444' }}>CUIT/RUT: {c.cuit_rut}</div>
                    <div style={{ fontSize: 13, color: '#666' }}>{c.direccion}</div>
                  </div>
                )) : <div style={{ color: '#888', padding: 8 }}>Sin resultados</div>}
              </div>
              <button type="button" onClick={() => setModalCliente(false)} style={{ marginTop: 18, background: '#1F7A3D', color: '#fff', border: 'none', borderRadius: 8, padding: '0.5rem 1.2rem', fontWeight: 600, cursor: 'pointer' }}>Cerrar</button>
            </div>
          </div>
        )}
        {modalDestino && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0008', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 500, maxWidth: 600, boxShadow: '0 4px 24px #0003' }}>
              <h3 style={{ marginBottom: 16 }}>Buscar destino</h3>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <select value={campoDestino} onChange={e => setCampoDestino(e.target.value as any)} style={{ padding: 6, borderRadius: 6, border: '1px solid #ccc' }}>
                  <option value="nombre">Nombre</option>
                  <option value="provincia">Provincia</option>
                  <option value="direccion">Dirección</option>
                </select>
                <input
                  autoFocus
                  type="text"
                  value={busquedaDestino}
                  onChange={e => setBusquedaDestino(e.target.value)}
                  placeholder={`Buscar por ${campoDestino === 'nombre' ? 'nombre' : campoDestino === 'provincia' ? 'provincia' : 'dirección'}...`}
                  style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
                />
              </div>
              <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                {destinosFiltrados && destinosFiltrados.length > 0 ? destinosFiltrados.map(d => (
                  <div key={d.id} style={{ padding: 12, cursor: 'pointer', borderRadius: 6, background: formData.destino === d.name ? '#e5e7eb' : 'transparent', marginBottom: 6, border: '1px solid #e5e7eb' }}
                    onClick={() => {
                      onChange({ target: { name: 'destino', value: d.name } } as any);
                      setModalDestino(false);
                      setBusquedaDestino('');
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>{d.name}</div>
                    <div style={{ fontSize: 13, color: '#444' }}>Provincia: {d.provincia}</div>
                    <div style={{ fontSize: 13, color: '#666' }}>{d.direccion}</div>
                  </div>
                )) : <div style={{ color: '#888', padding: 8 }}>Sin resultados</div>}
              </div>
              <button type="button" onClick={() => setModalDestino(false)} style={{ marginTop: 18, background: '#1F7A3D', color: '#fff', border: 'none', borderRadius: 8, padding: '0.5rem 1.2rem', fontWeight: 600, cursor: 'pointer' }}>Cerrar</button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}; 