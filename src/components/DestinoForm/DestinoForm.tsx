import React from 'react';
import styles from '../Form.module.css';
import { ContactosForm } from '../ContactosForm/ContactosForm';
import { Contacto } from '../../types/contacto';
import { isFeatureEnabled } from '../../config/features';

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

  return (
    <div className={styles.wrapper}>
      <form onSubmit={onSubmit} className={styles.formulario}>
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