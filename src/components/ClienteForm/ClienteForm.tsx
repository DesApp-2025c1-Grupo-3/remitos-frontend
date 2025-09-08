import React, { useEffect, useState } from 'react';
import styles from './ClienteForm.module.css';
import { ContactosForm } from '../ContactosForm/ContactosForm';
import { Contacto } from '../../types/contacto';
import { isFeatureEnabled } from '../../config/features';
import { tipoEmpresaService, TipoEmpresa } from '../../services/tipoEmpresaService';

export interface ClienteFormData {
  razonSocial: string | null;
  cuit_rut: string | null;
  tipoEmpresaId: number | null;
  direccion: string;
  contactos?: Contacto[];
}

interface ClienteFormProps {
  formData: ClienteFormData;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onContactosChange: (contactos: Contacto[]) => void;
  submitButtonText: string;
  error: string | null;
  showContactError?: boolean;
  fieldErrors?: {
    razonSocial?: boolean;
    tipoEmpresa?: boolean;
    direccion?: boolean;
  };
}

export const ClienteForm: React.FC<ClienteFormProps> = ({
  formData,
  onSubmit,
  onChange,
  onContactosChange,
  submitButtonText,
  error,
  showContactError = false,
  fieldErrors = {}
}) => {
  const showContactos = isFeatureEnabled('ENABLE_CONTACTOS');
  const [cuitError, setCuitError] = React.useState<string | null>(null);
  const [tiposEmpresa, setTiposEmpresa] = useState<TipoEmpresa[]>([]);
  const [loadingTipos, setLoadingTipos] = useState(true);

  // Cargar tipos de empresa al montar el componente
  useEffect(() => {
    const cargarTiposEmpresa = async () => {
      try {
        setLoadingTipos(true);
        const tipos = await tipoEmpresaService.getTiposEmpresa();
        setTiposEmpresa(tipos);
      } catch (error) {
        console.error('Error al cargar tipos de empresa:', error);
      } finally {
        setLoadingTipos(false);
      }
    };

    cargarTiposEmpresa();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'cuit_rut') {
      // Solo permitir números
      const numericValue = value.replace(/\D/g, '');
      // Validar longitud en tiempo real
      if (numericValue.length > 11) return;
      setCuitError(null);
      onChange({
        target: {
          name,
          value: numericValue || null
        }
      } as any);
    } else if (name === 'tipoEmpresaId') {
      // Convertir tipoEmpresaId a número
      const numericValue = value === '' ? null : parseInt(value, 10);
      onChange({
        target: {
          name,
          value: numericValue
        }
      } as any);
    } else {
      onChange(e);
    }
  };

  // Valida formato de CUIT argentino (11 dígitos, dígito verificador)
  function validarCuit(cuit: string): boolean {
    if (!/^\d{11}$/.test(cuit)) return false;
    const mult = [5,4,3,2,7,6,5,4,3,2];
    let suma = 0;
    for (let i = 0; i < 10; i++) {
      suma += parseInt(cuit[i]) * mult[i];
    }
    let resto = suma % 11;
    let digito = resto === 0 ? 0 : resto === 1 ? 9 : 11 - resto;
    return digito === parseInt(cuit[10]);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación de CUIT: debe tener exactamente 11 dígitos
    if (formData.cuit_rut && formData.cuit_rut.length !== 11) {
      setCuitError('El CUIT debe tener exactamente 11 dígitos');
      return;
    }
    // Solo validar formato si hay CUIT ingresado
    if (formData.cuit_rut && !validarCuit(formData.cuit_rut)) {
      setCuitError('Formato de CUIT incorrecto');
      return;
    }
    setCuitError(null);
    await onSubmit(e);
  };

  return (
    <div className={styles.wrapper}>
      {/* Eliminado el error global */}
      <form onSubmit={handleSubmit} className={styles.formulario}>
        <div className={styles.formContent}>
          {/* Columna izquierda */}
          <div className={styles.formColumn}>
            <div className={styles.campo}>
              <label className={styles.label}>Razón Social</label>
              <input
                name="razonSocial"
                value={formData.razonSocial || ''}
                onChange={handleChange}
                placeholder="Ingresar razón social"
                className={fieldErrors.razonSocial ? `${styles.input} ${styles.inputError}` : styles.input}
                required
              />
              {fieldErrors.razonSocial && <div className={styles.inputErrorMsg}>La razón social es requerida</div>}
            </div>
            <div className={styles.campo}>
              <label className={styles.label}>CUIT/RUT</label>
              <input
                name="cuit_rut"
                value={formData.cuit_rut || ''}
                onChange={handleChange}
                placeholder="Ingresar CUIT/RUT"
                className={cuitError ? `${styles.input} ${styles.inputError}` : styles.input}
                type="text"
                pattern="[0-9]*"
                inputMode="numeric"
                maxLength={11}
              />
              {cuitError && <div className={styles.inputErrorMsg}>{cuitError}</div>}
            </div>
          </div>
          
          {/* Columna derecha */}
          <div className={styles.formColumn}>
            <div className={styles.campo}>
              <label className={styles.label}>Tipo de cliente</label>
              <select
                name="tipoEmpresaId"
                value={formData.tipoEmpresaId || ''}
                onChange={handleChange}
                className={fieldErrors.tipoEmpresa ? `${styles.input} ${styles.inputError}` : styles.input}
                required
                disabled={loadingTipos}
              >
                <option value="">{loadingTipos ? 'Cargando...' : 'Seleccionar tipo de cliente'}</option>
                {tiposEmpresa.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nombre}
                  </option>
                ))}
              </select>
              {fieldErrors.tipoEmpresa && <div className={styles.inputErrorMsg}>El tipo de cliente es requerido</div>}
            </div>
            <div className={styles.campo}>
              <label className={styles.label}>Dirección</label>
              <input
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                placeholder="Ingresar dirección"
                className={fieldErrors.direccion ? `${styles.input} ${styles.inputError}` : styles.input}
                required
              />
              {fieldErrors.direccion && <div className={styles.inputErrorMsg}>La dirección es requerida</div>}
            </div>
          </div>
        </div>

        {showContactos && (
          <ContactosForm 
            contactos={formData.contactos || []}
            onContactosChange={onContactosChange}
            showError={showContactError}
          />
        )}

        <div className={styles.botonera}>
          <button type="button" onClick={() => window.history.back()} className={styles.cancelBtn}>
            Cancelar
          </button>
          <button type="submit" className={styles.formBtn}>
            {submitButtonText}
          </button>
        </div>
      </form>
    </div>
  );
};