import React from 'react';
import styles from '../Form.module.css';
import { ContactosForm, Contacto } from '../ContactosForm/ContactosForm';

export interface ClienteFormData {
  razonSocial: string;
  cuit_rut: string;
  tipoEmpresa: string;
  direccion: string;
  contactos: Contacto[];
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
  return (
    <div className={styles.wrapper}>
      {error && <div className={styles.error}>{error}</div>}
      <form onSubmit={onSubmit} className={styles.formulario}>
        <div className={styles.campo}>
          <label className={styles.label}>Razón Social</label>
          <input
            name="razonSocial"
            value={formData.razonSocial}
            onChange={onChange}
            placeholder="Ingresar razón social"
            className={styles.input}
            required
          />
        </div>
        <div className={styles.campo}>
          <label className={styles.label}>CUIT/RUT</label>
          <input
            name="cuit_rut"
            value={formData.cuit_rut}
            onChange={onChange}
            placeholder="Ingresar CUIT/RUT"
            className={styles.input}
            required
          />
        </div>
        <div className={styles.campo}>
          <label className={styles.label}>Tipo de cliente</label>
          <select
            name="tipoEmpresa"
            value={formData.tipoEmpresa}
            onChange={onChange}
            className={styles.input}
            required
            style={{ width: '100%', maxWidth: 400, minWidth: 0, padding: '0.5rem 1rem', boxSizing: 'border-box', height: 44 }}
          >
            <option value="">Seleccionar tipo de cliente</option>
            <option value="empresa privada">Empresa privada</option>
            <option value="organismo estatal">Organismo estatal</option>
            <option value="particular">Particular</option>
          </select>
        </div>
        <div className={styles.campo}>
          <label className={styles.label}>Dirección</label>
          <input
            name="direccion"
            value={formData.direccion}
            onChange={onChange}
            placeholder="Ingresar dirección"
            className={styles.input}
            required
          />
        </div>

        <ContactosForm 
          contactos={formData.contactos}
          onContactosChange={onContactosChange}
        />

        <div className={styles.botonera}>
          <button type="submit" className={styles.formBtn}>
            {submitButtonText}
          </button>
        </div>
      </form>
    </div>
  );
}; 