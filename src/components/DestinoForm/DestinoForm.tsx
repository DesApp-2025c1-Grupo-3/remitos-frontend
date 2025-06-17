import React, { useState, useEffect, useRef } from 'react';
import { AsyncSelect } from './AsyncSelect';
import styles from '../Form.module.css';
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

  useEffect(() => {
    setLoadingProvincias(true);
    georefService.getProvincias()
      .then(provs => setProvincias(provs))
      .finally(() => setLoadingProvincias(false));
  }, []);

  const provinciasFiltradas = provinciaInput
    ? provincias.filter(p => p.nombre.toLowerCase().includes(provinciaInput.toLowerCase()))
    : provincias;

  useEffect(() => {
    if (!provinciaId) {
      setLocalidades([]);
      return;
    }
    setLoadingLocalidades(true);
    georefService.getLocalidadesByProvincia(provinciaId)
      .then(locs => setLocalidades(locs))
      .finally(() => setLoadingLocalidades(false));
  }, [provinciaId]);

  const localidadesFiltradas = localidadInput
    ? localidades.filter(l => l.nombre.toLowerCase().includes(localidadInput.toLowerCase()))
    : localidades;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (provinciaInputRef.current && !provinciaInputRef.current.contains(e.target as Node)) {
        setShowProvinciaDropdown(false);
      }
      if (localidadInputRef.current && !localidadInputRef.current.contains(e.target as Node)) {
        setShowLocalidadDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

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
            />
            {showProvinciaDropdown && (
              <div className={styles.dropdownMenu}>
                {loadingProvincias ? (
                  <div className={styles.dropdownItem}>Cargando...</div>
                ) : provinciasFiltradas.length === 0 ? (
                  <div className={styles.dropdownItemEmpty}>No se encontraron provincias</div>
                ) : (
                  provinciasFiltradas.map(prov => (
                    <div
                      key={prov.id}
                      className={styles.dropdownItem}
                      onClick={() => handleProvinciaSelect(prov)}
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
            />
            {showLocalidadDropdown && (
              <div className={styles.dropdownMenu}>
                {loadingLocalidades ? (
                  <div className={styles.dropdownItem}>Cargando...</div>
                ) : localidadesFiltradas.length === 0 ? (
                  <div className={styles.dropdownItemEmpty}>No se encontraron localidades</div>
                ) : (
                  localidadesFiltradas.map(loc => (
                    <div
                      key={loc.id}
                      className={styles.dropdownItem}
                      onClick={() => handleLocalidadSelect(loc)}
                    >
                      {loc.nombre}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
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