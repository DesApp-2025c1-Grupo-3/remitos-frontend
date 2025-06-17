import React, { useState } from 'react';
import { Plus, X, Pencil } from 'lucide-react';
import styles from './ContactosForm.module.css';
import { Contacto } from '../../types/contacto';

interface ContactosFormProps {
  contactos: Contacto[];
  onContactosChange: (contactos: Contacto[]) => void;
}

export const ContactosForm: React.FC<ContactosFormProps> = ({
  contactos,
  onContactosChange,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [nuevoContacto, setNuevoContacto] = useState<Contacto>({
    personaAutorizada: '',
    correoElectronico: '',
    telefono: 0,
  });
  const [emailError, setEmailError] = useState<string | null>(null);
  const [telefonoError, setTelefonoError] = useState<string | null>(null);

  const handleContactoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'telefono') {
      // Solo permitir hasta 10 dígitos numéricos
      const soloNumeros = value.replace(/\D/g, '').slice(0, 10);
      setNuevoContacto((prev) => ({
        ...prev,
        telefono: soloNumeros ? parseInt(soloNumeros) : 0
      }));
    } else {
      setNuevoContacto((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const abrirModalEdicion = (index: number) => {
    setEditingIndex(index);
    setNuevoContacto(contactos[index]);
    setShowModal(true);
  };

  const validateEmail = (email: string) => {
    // Validación básica de email
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  const validateTelefono = (telefono: number) => {
    // Debe tener exactamente 10 dígitos
    return telefono && telefono.toString().length === 10;
  };

  const agregarContacto = () => {
    let valid = true;
    setEmailError(null);
    setTelefonoError(null);
    if (!validateEmail(nuevoContacto.correoElectronico)) {
      setEmailError('Ingrese un email válido');
      valid = false;
    }
    if (!validateTelefono(nuevoContacto.telefono)) {
      setTelefonoError('El teléfono debe tener exactamente 10 dígitos');
      valid = false;
    }
    if (!nuevoContacto.personaAutorizada) {
      valid = false;
    }
    if (!valid) return;
    if (editingIndex !== null) {
      // Editar contacto existente
      const nuevosContactos = [...contactos];
      nuevosContactos[editingIndex] = nuevoContacto;
      onContactosChange(nuevosContactos);
    } else {
      // Agregar nuevo contacto
      onContactosChange([...contactos, nuevoContacto]);
    }
    setNuevoContacto({
      personaAutorizada: '',
      correoElectronico: '',
      telefono: 0,
    });
    setEditingIndex(null);
    setShowModal(false);
  };

  const eliminarContacto = (index: number) => {
    onContactosChange(contactos.filter((_, i) => i !== index));
  };

  const cerrarModal = () => {
    setShowModal(false);
    setEditingIndex(null);
    setNuevoContacto({
      personaAutorizada: '',
      correoElectronico: '',
      telefono: 0,
    });
  };

  return (
    <div className={styles.seccionContactos}>
      <div className={styles.header}>
        <h3>Agregar contacto</h3>
        <button 
          type="button" 
          className={styles.btnNuevoContacto}
          onClick={() => setShowModal(true)}
        >
          + Nuevo contacto
        </button>
      </div>

      {contactos.length > 0 && (
        <div className={styles.listaContactos}>
          {contactos.map((contacto, index) => (
            <div key={index} className={styles.contactoItem}>
              <div className={styles.contactoInfo}>
                <span className={styles.nombreContacto}>{contacto.personaAutorizada}</span>
                <span className={styles.detallesContacto}>
                  {contacto.correoElectronico} | {contacto.telefono}
                </span>
              </div>
              <div className={styles.acciones}>
                <button
                  type="button"
                  onClick={() => abrirModalEdicion(index)}
                  className={styles.btnEditar}
                >
                  <Pencil size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => eliminarContacto(index)}
                  className={styles.btnEliminar}
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>{editingIndex !== null ? 'Editar contacto' : 'Agregar contacto'}</h3>
            <div className={styles.modalContent}>
              <div className={styles.formGroup}>
                <label>Persona autorizada</label>
                <input
                  name="personaAutorizada"
                  value={nuevoContacto.personaAutorizada}
                  onChange={handleContactoChange}
                  placeholder="Nombre de la persona autorizada"
                  className={styles.input}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Correo electrónico</label>
                <input
                  name="correoElectronico"
                  type="email"
                  value={nuevoContacto.correoElectronico}
                  onChange={handleContactoChange}
                  placeholder="Email del contacto"
                  className={emailError ? `${styles.input} ${styles.inputError}` : styles.input}
                  required
                />
                {emailError && <div className={styles.inputErrorMsg}>{emailError}</div>}
              </div>
              <div className={styles.formGroup}>
                <label>Teléfono</label>
                <input
                  name="telefono"
                  type="text"
                  value={nuevoContacto.telefono ? nuevoContacto.telefono.toString() : ''}
                  onChange={handleContactoChange}
                  placeholder="Teléfono del contacto"
                  className={telefonoError ? `${styles.input} ${styles.inputError}` : styles.input}
                  required
                  maxLength={10}
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
                {telefonoError && <div className={styles.inputErrorMsg}>{telefonoError}</div>}
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button 
                type="button" 
                className={styles.btnCancelar}
                onClick={cerrarModal}
              >
                Cancelar
              </button>
              <button 
                type="button" 
                className={styles.btnAgregar}
                onClick={agregarContacto}
              >
                {editingIndex !== null ? 'Guardar' : 'Agregar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};