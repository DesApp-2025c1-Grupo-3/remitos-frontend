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

  const [pais, setPais] = useState(formData.pais || '');
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

  const [provinciaHoveredIndex, setProvinciaHoveredIndex] = useState(-1);
  const [localidadHoveredIndex, setLocalidadHoveredIndex] = useState(-1);

  const paises = [
    { id: 'Argentina', nombre: 'Argentina' },
    { id: 'Brasil', nombre: 'Brasil' }
  ];
  const [paisInput, setPaisInput] = useState(formData.pais || '');
  const [showPaisDropdown, setShowPaisDropdown] = useState(false);
  const [paisHoveredIndex, setPaisHoveredIndex] = useState(-1);
  const paisFiltrados = paisInput ? paises.filter(p => p.nombre.toLowerCase().includes(paisInput.toLowerCase())) : paises;

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
      onSubmit(e);
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
          <div className={styles.dropdownContainer}>
            <input
              type="text"
              className={styles.input}
              placeholder="Seleccione un país"
              value={paisInput}
              onChange={e => {
                setPaisInput(e.target.value);
                setShowPaisDropdown(true);
              }}
              onFocus={() => setShowPaisDropdown(true)}
              required
              autoComplete="off"
              name="pais"
            />
            {showPaisDropdown && paisFiltrados.length > 0 && (
              <ul className={styles.dropdown}>
                {paisFiltrados.map((p, index) => (
                  <li
                    key={p.id}
                    className={styles.dropdownItem + (pais === p.id ? ' ' + styles.dropdownItemActive : '') + (index === paisHoveredIndex ? ' ' + styles.dropdownItemHover : '')}
                    onMouseEnter={() => setPaisHoveredIndex(index)}
                    onMouseLeave={() => setPaisHoveredIndex(-1)}
                    onMouseDown={() => {
                      setPais(p.id);
                      setPaisInput(p.nombre);
                      setShowPaisDropdown(false);
                      onChange({ target: { name: 'pais', value: p.id } } as any);
                      // Limpiar campos dependientes
                      setProvinciaInput('');
                      setProvinciaId('');
                      setProvinciaNombre('');
                      setLocalidadInput('');
                      setLocalidadId('');
                      setLocalidadNombre('');
                      setShowProvinciaDropdown(false);
                      setShowLocalidadDropdown(false);
                      setBrEstadoId('');
                      setBrMunicipioId('');
                    }}
                  >
                    {p.nombre}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        {/* Provincia y localidad progresivos para Argentina */}
        {pais === 'Argentina' && (
          <>
            {provincias.length > 0 && (
              <div className={styles.campo}>
                <label className={styles.label}>Provincia destino</label>
                <div className={styles.dropdownContainer}>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder={loadingProvincias ? "Cargando..." : "Seleccione una provincia"}
                    value={provinciaInput}
                    onChange={e => {
                      setProvinciaInput(e.target.value);
                      setShowProvinciaDropdown(true);
                    }}
                    onFocus={() => setShowProvinciaDropdown(true)}
                    ref={provinciaInputRef}
                    disabled={loadingProvincias}
                    required
                    autoComplete="off"
                    name="provincia"
                  />
                  {showProvinciaDropdown && provinciasFiltradas.length > 0 && (
                    <ul className={styles.dropdown}>
                      {provinciasFiltradas.map((prov, index) => (
                        <li
                          key={prov.id}
                          className={styles.dropdownItem + (provinciaId === prov.id ? ' ' + styles.dropdownItemActive : '') + (index === provinciaHoveredIndex ? ' ' + styles.dropdownItemHover : '')}
                          onMouseEnter={() => setProvinciaHoveredIndex(index)}
                          onMouseLeave={() => setProvinciaHoveredIndex(-1)}
                          onMouseDown={() => handleProvinciaSelect(prov)}
                        >
                          {prov.nombre}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
            {provinciaId && localidades.length > 0 && (
              <div className={styles.campo}>
                <label className={styles.label}>Localidad destino</label>
                <div className={styles.dropdownContainer}>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder={loadingLocalidades ? "Cargando..." : "Seleccione una localidad"}
                    value={localidadInput}
                    onChange={e => {
                      setLocalidadInput(e.target.value);
                      setShowLocalidadDropdown(true);
                    }}
                    onFocus={() => setShowLocalidadDropdown(true)}
                    ref={localidadInputRef}
                    disabled={loadingLocalidades || !provinciaId}
                    required
                    autoComplete="off"
                    name="localidad"
                  />
                  {showLocalidadDropdown && localidadesFiltradas.length > 0 && (
                    <ul className={styles.dropdown}>
                      {localidadesFiltradas.map((loc, index) => (
                        <li
                          key={loc.id}
                          className={styles.dropdownItem + (localidadId === loc.id ? ' ' + styles.dropdownItemActive : '') + (index === localidadHoveredIndex ? ' ' + styles.dropdownItemHover : '')}
                          onMouseEnter={() => setLocalidadHoveredIndex(index)}
                          onMouseLeave={() => setLocalidadHoveredIndex(-1)}
                          onMouseDown={() => handleLocalidadSelect(loc)}
                        >
                          {loc.nombre}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </>
        )}
        {/* Estado y municipio progresivos para Brasil */}
        {pais === 'Brasil' && (
          <>
            {brEstados.length > 0 && (
              <div className={styles.campo}>
                <label className={styles.label}>Estado</label>
                <div className={styles.dropdownContainer}>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder={loadingBrEstados ? "Cargando..." : "Seleccione un estado"}
                    value={provinciaInput}
                    onChange={e => {
                      setProvinciaInput(e.target.value);
                      setShowProvinciaDropdown(true);
                    }}
                    onFocus={() => setShowProvinciaDropdown(true)}
                    ref={provinciaInputRef}
                    disabled={loadingBrEstados}
                    required
                    autoComplete="off"
                    name="provincia"
                  />
                  {showProvinciaDropdown && brEstados.filter(est => est.nombre.toLowerCase().includes(provinciaInput.toLowerCase())).length > 0 && (
                    <ul className={styles.dropdown}>
                      {brEstados.filter(est => est.nombre.toLowerCase().includes(provinciaInput.toLowerCase())).map((est, index) => (
                        <li
                          key={est.id}
                          className={styles.dropdownItem + (brEstadoId === est.id ? ' ' + styles.dropdownItemActive : '') + (index === provinciaHoveredIndex ? ' ' + styles.dropdownItemHover : '')}
                          onMouseEnter={() => setProvinciaHoveredIndex(index)}
                          onMouseLeave={() => setProvinciaHoveredIndex(-1)}
                          onMouseDown={() => {
                            setBrEstadoId(est.id);
                            setProvinciaInput(est.nombre);
                            setShowProvinciaDropdown(false);
                            setBrMunicipioId('');
                            onChange({ target: { name: 'provincia', value: est.nombre } } as any);
                            onChange({ target: { name: 'localidad', value: '' } } as any);
                          }}
                        >
                          {est.nombre} ({est.sigla})
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
            {brEstadoId && brMunicipios.length > 0 && (
              <div className={styles.campo}>
                <label className={styles.label}>Municipio</label>
                <div className={styles.dropdownContainer}>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder={loadingBrMunicipios ? "Cargando..." : "Seleccione un municipio"}
                    value={localidadInput}
                    onChange={e => {
                      setLocalidadInput(e.target.value);
                      setShowLocalidadDropdown(true);
                    }}
                    onFocus={() => setShowLocalidadDropdown(true)}
                    ref={localidadInputRef}
                    disabled={loadingBrMunicipios || !brEstadoId}
                    required
                    autoComplete="off"
                    name="localidad"
                  />
                  {showLocalidadDropdown && brMunicipios.filter(mun => mun.nombre.toLowerCase().includes(localidadInput.toLowerCase())).length > 0 && (
                    <ul className={styles.dropdown}>
                      {brMunicipios.filter(mun => mun.nombre.toLowerCase().includes(localidadInput.toLowerCase())).map((mun, index) => (
                        <li
                          key={mun.id}
                          className={styles.dropdownItem + (brMunicipioId === mun.id ? ' ' + styles.dropdownItemActive : '') + (index === localidadHoveredIndex ? ' ' + styles.dropdownItemHover : '')}
                          onMouseEnter={() => setLocalidadHoveredIndex(index)}
                          onMouseLeave={() => setLocalidadHoveredIndex(-1)}
                          onMouseDown={() => {
                            setBrMunicipioId(mun.id);
                            setLocalidadInput(mun.nombre);
                            setShowLocalidadDropdown(false);
                            onChange({ target: { name: 'localidad', value: mun.nombre } } as any);
                          }}
                        >
                          {mun.nombre}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </>
        )}
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