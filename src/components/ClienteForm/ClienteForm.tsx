import React from 'react';
import styles from './ClienteForm.module.css';
import { ContactosForm } from '../ContactosForm/ContactosForm';
import { Contacto } from '../../types/contacto';
import { isFeatureEnabled } from '../../config/features';

export interface ClienteFormData {
  razonSocial: string | null;
  cuit_rut: string | null;
  tipoEmpresa: string;
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
}

export const ClienteForm: React.FC<ClienteFormProps> = ({
  formData,
  onSubmit,
  onChange,
  onContactosChange,
  submitButtonText,
  error
}) => {
  const showContactos = isFeatureEnabled('ENABLE_CONTACTOS');
  const [cuitError, setCuitError] = React.useState<string | null>(null);

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
        <div className={styles.campo}>
          <label className={styles.label}>Razón Social</label>
          <input
            name="razonSocial"
            value={formData.razonSocial || ''}
            onChange={handleChange}
            placeholder="Ingresar razón social"
            className={styles.input}
          />
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
        <div className={styles.campo}>
          <label className={styles.label}>Tipo de cliente</label>
          <select
            name="tipoEmpresa"
            value={formData.tipoEmpresa}
            onChange={handleChange}
            className={styles.input}
            required
            style={{ width: '100%', maxWidth: 400, minWidth: 0, padding: '0.5rem 1rem', boxSizing: 'border-box', height: 44 }}
          >
            <option value="">Seleccionar tipo de cliente</option>
            <option value="empresa">Empresa privada</option>
            <option value="organismo estatal">Organismo estatal</option>
            <option value="particular">Particular</option>
          </select>
        </div>
        <div className={styles.campo}>
          <label className={styles.label}>Dirección</label>
          <input
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            placeholder="Ingresar dirección"
            className={styles.input}
            required
          />
        </div>

        {showContactos && (
          <ContactosForm 
            contactos={formData.contactos || []}
            onContactosChange={onContactosChange}
          />
        )}

        <div className={styles.botonera}>
          <button type="submit" className={styles.formBtn}>
            {submitButtonText}
          </button>
        </div>
      </form>
    </div>
  );
};