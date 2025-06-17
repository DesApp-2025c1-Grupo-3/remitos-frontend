import React, { useState, useEffect, useRef } from 'react';
import { AsyncSelect } from './AsyncSelect';
import styles from './DestinoForm.module.css';
import { ContactosForm } from '../ContactosForm/ContactosForm';
import { Contacto } from '../../types/contacto';
import { isFeatureEnabled } from '../../config/features';
import { georefService } from '../../services/destinosService';

export interface DestinoFormData {
  name: string;
  pais: string;
  provincia: string;
  localidad: string;
  direccion: string;
  contactos?: Contacto[];
}

interface DestinoFormProps {
  formData: DestinoFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onContactoChange?: (contactos: Contacto[]) => void;
  contactos?: Contacto[];
}

export const DestinoForm: React.FC<DestinoFormProps> = ({
  formData,
  onChange,
  onSubmit,
  onContactoChange,
  contactos = []
}) => {
  const showContactos = isFeatureEnabled('ENABLE_CONTACTOS');

  // Setear país Argentina al montar si está vacío
  React.useEffect(() => {
    if (!formData.pais || formData.pais !== 'Argentina') {
      onChange({ target: { name: 'pais', value: 'Argentina' } } as any);
    }
  }, []);

  // Sincronizar provinciaInput y localidadInput con los valores iniciales de formData (para edición)
  React.useEffect(() => {
    if (formData.provincia && !provinciaInput) {
      setProvinciaInput(formData.provincia);
      setProvinciaNombre(formData.provincia);
      setProvinciaId(formData.provincia);
    }
    if (formData.localidad && !localidadInput) {
      setLocalidadInput(formData.localidad);
      setLocalidadNombre(formData.localidad);
      setLocalidadId(formData.localidad);
    }
  }, [formData.provincia, formData.localidad]);

  const [pais, setPais] = useState(formData.pais || 'Argentina');
  const [provinciaId, setProvinciaId] = useState(formData.provincia || '');
  const [provinciaNombre, setProvinciaNombre] = useState('');
  const [localidadId, setLocalidadId] = useState(formData.localidad || '');
  const [localidadNombre, setLocalidadNombre] = useState('');

  const [provinciaInput, setProvinciaInput] = useState('');
  const [provincias, setProvincias] = useState<{ id: string, nombre: string }[]>([]);
  const [loadingProvincias, setLoadingProvincias] = useState(false);
  const [showProvinciaDropdown, setShowProvinciaDropdown] = useState(false);
  const provinciaInputRef = useRef<HTMLInputElement>(null);

  const [localidadInput, setLocalidadInput] = useState('');
  const [localidades, setLocalidades] = useState<{ id: string, nombre: string }[]>([]);
  const [loadingLocalidades, setLoadingLocalidades] = useState(false);
  const [showLocalidadDropdown, setShowLocalidadDropdown] = useState(false);
  const localidadInputRef = useRef<HTMLInputElement>(null);

  const [brEstados, setBrEstados] = useState<{ id: string, nombre: string, sigla: string }[]>([]);
  const [brMunicipios, setBrMunicipios] = useState<{ id: string, nombre: string }[]>([]);
  const [brEstadoId, setBrEstadoId] = useState('');
  const [brMunicipioId, setBrMunicipioId] = useState('');
  const [loadingBrEstados, setLoadingBrEstados] = useState(false);
  const [loadingBrMunicipios, setLoadingBrMunicipios] = useState(false);

  useEffect(() => {
    setPais(formData.pais || 'Argentina');
  }, [formData.pais]);

  useEffect(() => {
    if (pais === 'Brasil') {
      setLoadingBrEstados(true);
      georefService.getBrEstados().then(estados => setBrEstados(estados)).finally(() => setLoadingBrEstados(false));
    }
  }, [pais]);

  useEffect(() => {
    if (pais === 'Brasil' && brEstadoId) {
      setLoadingBrMunicipios(true);
      georefService.getBrMunicipios(brEstadoId).then(muns => setBrMunicipios(muns)).finally(() => setLoadingBrMunicipios(false));
    } else {
      setBrMunicipios([]);
    }
  }, [pais, brEstadoId]);

  // Cargar provincias de Argentina cuando el país es Argentina
  useEffect(() => {
    if (pais === 'Argentina') {
      setLoadingProvincias(true);
      georefService.getProvincias()
        .then(provs => setProvincias(provs))
        .finally(() => setLoadingProvincias(false));
    } else {
      setProvincias([]);
    }
  }, [pais]);

  // Cargar localidades de Argentina cuando cambia la provincia seleccionada
  useEffect(() => {
    if (pais === 'Argentina' && provinciaId) {
      setLoadingLocalidades(true);
      georefService.getLocalidadesByProvincia(provinciaId)
        .then(locs => setLocalidades(locs))
        .finally(() => setLoadingLocalidades(false));
    } else {
      setLocalidades([]);
    }
  }, [pais, provinciaId]);

  const provinciasFiltradas = provinciaInput
    ? provincias.filter(p => p.nombre.toLowerCase().includes(provinciaInput.toLowerCase()))
    : provincias;

  const localidadesFiltradas = localidadInput
    ? localidades.filter(l => l.nombre.toLowerCase().includes(localidadInput.toLowerCase()))
    : localidades;

  // Cierre de dropdowns al hacer click fuera (Argentina y Brasil)
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Provincia/Estado
      if (provinciaInputRef.current && !provinciaInputRef.current.contains(e.target as Node)) {
        setShowProvinciaDropdown(false);
      }
      // Localidad/Municipio
      if (localidadInputRef.current && !localidadInputRef.current.contains(e.target as Node)) {
        setShowLocalidadDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [provinciaInputRef, localidadInputRef]);

  const handleProvinciaChange = (id: string, option?: { id: string, nombre: string }) => {
    setProvinciaId(id);
    setProvinciaNombre(option?.nombre || '');
    setLocalidadId('');
    setLocalidadNombre('');
    onChange({ target: { name: 'provincia', value: option?.nombre || '' } } as any);
    onChange({ target: { name: 'localidad', value: '' } } as any);
  };
  const handleLocalidadChange = (id: string, option?: { id: string, nombre: string }) => {
    setLocalidadId(id);
    setLocalidadNombre(option?.nombre || '');
    onChange({ target: { name: 'localidad', value: option?.nombre || '' } } as any);
  };

  const handleProvinciaSelect = (prov: { id: string, nombre: string }) => {
    setProvinciaInput(prov.nombre);
    setProvinciaId(prov.id);
    setProvinciaNombre(prov.nombre);
    setShowProvinciaDropdown(false);
    setLocalidadInput('');
    setLocalidadId('');
    setLocalidadNombre('');
    onChange({ target: { name: 'provincia', value: prov.nombre } } as any);
    onChange({ target: { name: 'localidad', value: '' } } as any);
  };

  const handleLocalidadSelect = (loc: { id: string, nombre: string }) => {
    setLocalidadInput(loc.nombre);
    setShowLocalidadDropdown(false);
    setLocalidadId(loc.id);
    setLocalidadNombre(loc.nombre);
    onChange({ target: { name: 'localidad', value: loc.nombre } } as any);
  };

  // Forzar el valor de país en el submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Forzar el valor de país en el formData antes de submit
    if (formData.pais !== 'Argentina') {
      onChange({ target: { name: 'pais', value: 'Argentina' } } as any);
      // Esperar a que el estado se actualice y luego enviar el submit
      setTimeout(() => onSubmit(e), 10);
    } else {
      onSubmit(e);
    }
  };

  return (
    <div className={styles.wrapper}>
      <form onSubmit={handleSubmit} className={styles.formulario}>
        <div className={styles.campo}>
          <label className={styles.label}>Nombre del destino</label>
          <input
            name="name"
            value={formData.name}
            onChange={onChange}
            placeholder="Ingresar nombre del destino"
            className={styles.input}
            required
          />
        </div>
        <div className={styles.campo}>
          <label className={styles.label}>País</label>
          <select
            name="pais"
            value={pais}
            onChange={e => {
              setPais(e.target.value);
              onChange({ target: { name: 'pais', value: e.target.value } } as any);
              // Limpiar campos dependientes
              if (e.target.value === 'Argentina') {
                setProvinciaInput(''); setProvinciaId(''); setLocalidadInput(''); setLocalidadId('');
              } else {
                setBrEstadoId(''); setBrMunicipioId('');
              }
            }}
            className={styles.input}
            required
          >
            <option value="Argentina">Argentina</option>
            <option value="Brasil">Brasil</option>
          </select>
        </div>
        {pais === 'Argentina' ? (
          <>
            <div className={styles.campo}>
              <label className={styles.label}>Provincia destino</label>
              <div className={styles.dropdownWrapper} ref={provinciaInputRef}>
                <input
                  name="provincia"
                  value={provinciaInput}
                  onChange={e => {
                    setProvinciaInput(e.target.value);
                    setShowProvinciaDropdown(true);
                  }}
                  placeholder="Escriba para buscar provincia..."
                  className={styles.input}
                  autoComplete="off"
                  required
                  onFocus={() => setShowProvinciaDropdown(true)}
                  style={{ cursor: 'pointer' }}
                />
                {showProvinciaDropdown && (
                  <div className={styles.dropdownMenu} style={{ maxHeight: 220, overflowY: 'auto', background: '#fff', border: '1px solid #ccc', borderRadius: 6, zIndex: 10 }}>
                    {loadingProvincias ? (
                      <div className={styles.dropdownItem}>Cargando...</div>
                    ) : provinciasFiltradas.length === 0 ? (
                      <div className={styles.dropdownItemEmpty}>No se encontraron provincias</div>
                    ) : (
                      provinciasFiltradas.map(prov => (
                        <div
                          key={prov.id}
                          className={styles.dropdownItem}
                          style={{ cursor: 'pointer', padding: '0.5rem 1rem' }}
                          onClick={() => {
                            setProvinciaInput(prov.nombre);
                            setProvinciaId(prov.id);
                            setProvinciaNombre(prov.nombre);
                            setShowProvinciaDropdown(false);
                            setLocalidadInput('');
                            setLocalidadId('');
                            setLocalidadNombre('');
                            onChange({ target: { name: 'provincia', value: prov.nombre } } as any);
                            onChange({ target: { name: 'localidad', value: '' } } as any);
                          }}
                        >
                          {prov.nombre}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className={styles.campo}>
              <label className={styles.label}>Localidad destino</label>
              <div className={styles.dropdownWrapper} ref={localidadInputRef}>
                <input
                  name="localidad"
                  value={localidadInput}
                  onChange={e => {
                    setLocalidadInput(e.target.value);
                    setShowLocalidadDropdown(true);
                  }}
                  placeholder="Escriba para buscar localidad..."
                  className={styles.input}
                  autoComplete="off"
                  required
                  onFocus={() => setShowLocalidadDropdown(true)}
                  disabled={!provinciaId}
                  style={{ cursor: 'pointer' }}
                />
                {showLocalidadDropdown && (
                  <div className={styles.dropdownMenu} style={{ maxHeight: 220, overflowY: 'auto', background: '#fff', border: '1px solid #ccc', borderRadius: 6, zIndex: 10 }}>
                    {loadingLocalidades ? (
                      <div className={styles.dropdownItem}>Cargando...</div>
                    ) : localidadesFiltradas.length === 0 ? (
                      <div className={styles.dropdownItemEmpty}>No se encontraron localidades</div>
                    ) : (
                      localidadesFiltradas.map(loc => (
                        <div
                          key={loc.id}
                          className={styles.dropdownItem}
                          style={{ cursor: 'pointer', padding: '0.5rem 1rem' }}
                          onClick={() => {
                            setLocalidadInput(loc.nombre);
                            setLocalidadId(loc.id);
                            setLocalidadNombre(loc.nombre);
                            setShowLocalidadDropdown(false);
                            onChange({ target: { name: 'localidad', value: loc.nombre } } as any);
                          }}
                        >
                          {loc.nombre}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : pais === 'Brasil' ? (
          <>
            <div className={styles.campo}>
              <label className={styles.label}>Estado</label>
              <div className={styles.dropdownWrapper} ref={provinciaInputRef}>
                <input
                  name="provincia"
                  value={provinciaInput}
                  onChange={e => {
                    setProvinciaInput(e.target.value);
                    setShowProvinciaDropdown(true);
                  }}
                  placeholder="Escriba para buscar estado..."
                  className={styles.input}
                  autoComplete="off"
                  required
                  onFocus={() => setShowProvinciaDropdown(true)}
                  style={{ cursor: 'pointer' }}
                  disabled={loadingBrEstados}
                />
                {showProvinciaDropdown && (
                  <div className={styles.dropdownMenu} style={{ maxHeight: 220, overflowY: 'auto', background: '#fff', border: '1px solid #ccc', borderRadius: 6, zIndex: 10 }}>
                    {loadingBrEstados ? (
                      <div className={styles.dropdownItem}>Cargando...</div>
                    ) : (
                      brEstados
                        .filter(est => est.nombre.toLowerCase().includes(provinciaInput.toLowerCase()))
                        .map(est => (
                          <div
                            key={est.id}
                            className={styles.dropdownItem}
                            style={{ cursor: 'pointer', padding: '0.5rem 1rem' }}
                            onClick={() => {
                              setProvinciaInput(est.nombre);
                              setBrEstadoId(est.id);
                              setProvinciaNombre(est.nombre);
                              setShowProvinciaDropdown(false);
                              setBrMunicipioId('');
                              setLocalidadInput('');
                              setLocalidadNombre('');
                              onChange({ target: { name: 'provincia', value: est.nombre } } as any);
                              onChange({ target: { name: 'localidad', value: '' } } as any);
                            }}
                          >
                            {est.nombre} ({est.sigla})
                          </div>
                        ))
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className={styles.campo}>
              <label className={styles.label}>Municipio</label>
              <div className={styles.dropdownWrapper} ref={localidadInputRef}>
                <input
                  name="localidad"
                  value={localidadInput}
                  onChange={e => {
                    setLocalidadInput(e.target.value);
                    setShowLocalidadDropdown(true);
                  }}
                  placeholder="Escriba para buscar municipio..."
                  className={styles.input}
                  autoComplete="off"
                  required
                  onFocus={() => setShowLocalidadDropdown(true)}
                  style={{ cursor: 'pointer' }}
                  disabled={!brEstadoId || loadingBrMunicipios}
                />
                {showLocalidadDropdown && (
                  <div className={styles.dropdownMenu} style={{ maxHeight: 220, overflowY: 'auto', background: '#fff', border: '1px solid #ccc', borderRadius: 6, zIndex: 10 }}>
                    {loadingBrMunicipios ? (
                      <div className={styles.dropdownItem}>Cargando...</div>
                    ) : (
                      brMunicipios
                        .filter(mun => mun.nombre.toLowerCase().includes(localidadInput.toLowerCase()))
                        .map(mun => (
                          <div
                            key={mun.id}
                            className={styles.dropdownItem}
                            style={{ cursor: 'pointer', padding: '0.5rem 1rem' }}
                            onClick={() => {
                              setLocalidadInput(mun.nombre);
                              setBrMunicipioId(mun.id);
                              setLocalidadNombre(mun.nombre);
                              setShowLocalidadDropdown(false);
                              onChange({ target: { name: 'localidad', value: mun.nombre } } as any);
                            }}
                          >
                            {mun.nombre}
                          </div>
                        ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : null}
        <div className={styles.campo}>
          <label className={styles.label}>Dirección destino</label>
          <input
            name="direccion"
            value={formData.direccion}
            onChange={onChange}
            placeholder="Ingresar dirección de destino de mercadería"
            className={styles.input}
            required
          />
        </div>
        {showContactos && onContactoChange && (
          <ContactosForm 
            contactos={contactos}
            onContactosChange={onContactoChange}
          />
        )}
        <div className={styles.botonera}>
          <button type="submit" className={styles.formBtn}>
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
};