import React, { useState, useEffect } from 'react';
import { Plus, X, Pencil, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './ContactosForm.module.css';
import { Contacto } from '../../types/contacto';

interface ContactosFormProps {
  contactos: Contacto[];
  onContactosChange: (contactos: Contacto[]) => void;
  showError?: boolean;
}

export const ContactosForm: React.FC<ContactosFormProps> = ({
  contactos,
  onContactosChange,
  showError = false,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [nuevoContacto, setNuevoContacto] = useState<Contacto>({
    personaAutorizada: '',
    correoElectronico: '',
    telefono: '', // Cambiado a string según backend
  });
  const [emailError, setEmailError] = useState<string | null>(null);
  const [telefonoError, setTelefonoError] = useState<string | null>(null);
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3; // Mostrar 3 contactos por página

  const handleContactoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'telefono') {
      // Solo permitir hasta 15 dígitos numéricos (según patrón backend /^\+?\d{10,15}$/)
      const soloNumeros = value.replace(/\D/g, '').slice(0, 15);
      
      // Validar longitud según backend (10-15 dígitos)
      if (soloNumeros.length > 0 && soloNumeros.length < 10) {
        setTelefonoError('El teléfono debe tener entre 10 y 15 dígitos');
      } else {
        setTelefonoError(null);
      }
      
      setNuevoContacto((prev) => ({
        ...prev,
        telefono: soloNumeros
      }));
    } else {
      setNuevoContacto((prev) => ({
        ...prev,
        [name]: value
      }));
      // Limpiar error de email tan pronto el usuario modifique el campo
      if (name === 'correoElectronico') {
        setEmailError(null);
      }
    }
  };


  const validateEmail = (email: string) => {
    // Validación básica de email
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  const validateTelefono = (telefono: string) => {
    // Validar según patrón del backend: /^\+?\d{10,15}$/
    const telefonoRegex = /^\+?\d{10,15}$/;
    return telefonoRegex.test(telefono);
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
      setTelefonoError('El teléfono debe tener entre 10 y 15 dígitos');
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
      telefono: '',
    });
    setEditingIndex(null);
    setShowModal(false);
  };

  const eliminarContacto = (index: number) => {
    // Calcular el índice real en el array completo basado en la paginación
    const realIndex = (currentPage - 1) * itemsPerPage + index;
    onContactosChange(contactos.filter((_, i) => i !== realIndex));
    
    // Ajustar la página actual si es necesario
    const newTotalPages = Math.ceil((contactos.length - 1) / itemsPerPage);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    }
  };

  const cerrarModal = () => {
    setShowModal(false);
    setEditingIndex(null);
    setNuevoContacto({
      personaAutorizada: '',
      correoElectronico: '',
      telefono: '',
    });
    // Limpiar errores al cerrar el modal
    setEmailError(null);
    setTelefonoError(null);
  };

  // Lógica de paginación
  const totalPages = Math.ceil(contactos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentContactos = contactos.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const abrirModalEdicion = (index: number) => {
    // Calcular el índice real en el array completo basado en la paginación
    const realIndex = (currentPage - 1) * itemsPerPage + index;
    const contacto = contactos[realIndex];
    setNuevoContacto(contacto);
    setEditingIndex(realIndex);
    // Limpiar errores previos al abrir la edición
    setEmailError(null);
    setTelefonoError(null);
    setShowModal(true);
  };

  // Ajustar página actual cuando cambia el número de contactos
  useEffect(() => {
    const newTotalPages = Math.ceil(contactos.length / itemsPerPage);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    }
  }, [contactos.length, currentPage]);

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
      
      {showError && (
        <div className={styles.errorMessage}>
          Se requiere agregar al menos un contacto
        </div>
      )}

      {contactos.length > 0 && (
        <div className={styles.listaContactos}>
          {currentContactos.map((contacto, index) => (
            <div key={index} className={styles.contactoItem}>
              <div className={styles.contactoInfo}>
                <span className={styles.nombreContacto}>{contacto.personaAutorizada}</span>
                <div className={styles.detallesContacto}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Email:</span>
                    <span className={styles.detailValue}>{contacto.correoElectronico}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Teléfono:</span>
                    <span className={styles.detailValue}>{contacto.telefono}</span>
                  </div>
                </div>
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

      {/* Controles de paginación */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <div className={styles.paginationInfo}>
            Mostrando {startIndex + 1} - {Math.min(endIndex, contactos.length)} de {contactos.length} contactos
          </div>
          <div className={styles.paginationButtons}>
            <button
              type="button"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={styles.paginationButton}
            >
              <ChevronLeft size={16} />
            </button>
            
            {/* Números de página */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => handlePageChange(page)}
                className={`${styles.paginationButton} ${currentPage === page ? styles.active : ''}`}
              >
                {page}
              </button>
            ))}
            
            <button
              type="button"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={styles.paginationButton}
            >
              <ChevronRight size={16} />
            </button>
          </div>
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
                  value={nuevoContacto.telefono}
                  onChange={handleContactoChange}
                  placeholder="Teléfono del contacto (10-15 dígitos)"
                  className={telefonoError ? `${styles.input} ${styles.inputError}` : styles.input}
                  required
                  maxLength={15}
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