import React from 'react';
import styles from '../Form.module.css';
import { ContactosForm, Contacto } from '../ContactosForm/ContactosForm';

export interface DestinoFormData {
  nombre: string;
  pais: string;
  provincia: string;
  localidad: string;
  direccion: string;
  contactos: Contacto[];
}

interface DestinoFormProps {
  formData: DestinoFormData;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onContactosChange: (contactos: Contacto[]) => void;
  submitButtonText: string;
  error: string | null;
}

export const DestinoForm: React.FC<DestinoFormProps> = ({
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
          <label className={styles.label}>Nombre del destino</label>
          <input
            name="nombre"
            value={formData.nombre}
            onChange={onChange}
            placeholder="Ingresar nombre del destino"
            className={styles.input}
            required
          />
        </div>
        <div className={styles.campo}>
          <label className={styles.label}>País destino</label>
          <input
            name="pais"
            value={formData.pais}
            onChange={onChange}
            placeholder="Ingresar país de destino de mercadería"
            className={styles.input}
            required
          />
        </div>
        <div className={styles.campo}>
          <label className={styles.label}>Provincia destino</label>
          <input
            name="provincia"
            value={formData.provincia}
            onChange={onChange}
            placeholder="Ingresar provincia de destino de mercadería"
            className={styles.input}
            required
          />
        </div>
        <div className={styles.campo}>
          <label className={styles.label}>Localidad destino</label>
          <input
            name="localidad"
            value={formData.localidad}
            onChange={onChange}
            placeholder="Ingresar localidad de destino de mercadería"
            className={styles.input}
            required
          />
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