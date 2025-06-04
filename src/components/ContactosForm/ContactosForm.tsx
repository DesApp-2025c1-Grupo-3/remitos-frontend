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

  const handleContactoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNuevoContacto((prev) => ({
      ...prev,
      [name]: name === 'telefono' ? parseInt(value) || 0 : value
    }));
  };

  const abrirModalEdicion = (index: number) => {
    setEditingIndex(index);
    setNuevoContacto(contactos[index]);
    setShowModal(true);
  };

  const agregarContacto = () => {
    if (nuevoContacto.personaAutorizada && nuevoContacto.correoElectronico && nuevoContacto.telefono) {
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
    }
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
                  className={styles.input}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Teléfono</label>
                <input
                  name="telefono"
                  type="number"
                  value={nuevoContacto.telefono || ''}
                  onChange={handleContactoChange}
                  placeholder="Teléfono del contacto"
                  className={styles.input}
                  required
                />
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