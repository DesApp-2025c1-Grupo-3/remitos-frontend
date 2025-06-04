import React from 'react';
import styles from '../Form.module.css';
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'cuit_rut') {
      // Solo permitir números en el input
      const numericValue = value.replace(/\D/g, '');
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

  return (
    <div className={styles.wrapper}>
      {error && <div className={styles.error}>{error}</div>}
      <form onSubmit={onSubmit} className={styles.formulario}>
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
            placeholder="Ingresar CUIT/RUT (solo números)"
            className={styles.input}
            type="text"
            pattern="[0-9]*"
            inputMode="numeric"
          />
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