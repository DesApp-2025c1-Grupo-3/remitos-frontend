import React, { useState, useEffect } from 'react';
import { X, Edit, Trash2, Plus } from 'lucide-react';
import { Mercaderia, MercaderiaFormData } from '../../types/mercaderia';
import { tipoMercaderiaService, TipoMercaderia } from '../../services/tipoMercaderiaService';
import styles from './MercaderiasForm.module.css';

interface MercaderiasFormProps {
  mercaderias: Mercaderia[];
  onMercaderiasChange: (mercaderias: Mercaderia[]) => void;
  showError?: boolean;
}

export const MercaderiasForm: React.FC<MercaderiasFormProps> = ({
  mercaderias,
  onMercaderiasChange,
  showError = false,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [nuevaMercaderia, setNuevaMercaderia] = useState<MercaderiaFormData>({
    tipoMercaderiaId: null,
    valorDeclarado: '',
    volumenMetrosCubico: '',
    pesoMercaderia: '',
    cantidadBobinas: '',
    cantidadRacks: '',
    cantidadBultos: '',
    cantidadPallets: '',
    requisitosEspeciales: '',
  });
  const [tiposMercaderia, setTiposMercaderia] = useState<TipoMercaderia[]>([]);
  const [loadingTipos, setLoadingTipos] = useState(true);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // Cargar tipos de mercadería al montar el componente
  useEffect(() => {
    const cargarTiposMercaderia = async () => {
      try {
        setLoadingTipos(true);
        const tipos = await tipoMercaderiaService.getTiposMercaderia();
        setTiposMercaderia(tipos);
      } catch (error) {
        console.error('Error al cargar tipos de mercadería:', error);
      } finally {
        setLoadingTipos(false);
      }
    };

    cargarTiposMercaderia();
  }, []);

  const handleMercaderiaChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Limpiar errores cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Para campos numéricos, solo permitir números
    if (['valorDeclarado', 'volumenMetrosCubico', 'pesoMercaderia', 'cantidadBobinas', 'cantidadRacks', 'cantidadBultos', 'cantidadPallets'].includes(name)) {
      const numericValue = value.replace(/[^\d]/g, '');
      setNuevaMercaderia((prev) => ({
        ...prev,
        [name]: numericValue
      }));
    } else {
      setNuevaMercaderia((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const abrirModalEdicion = (pageIndex: number) => {
    // Convertir índice de la página al índice real del array
    const realIndex = startIndex + pageIndex;
    setEditingIndex(realIndex);
    const mercaderia = mercaderias[realIndex];
    setNuevaMercaderia({
      tipoMercaderiaId: mercaderia.tipoMercaderiaId,
      valorDeclarado: mercaderia.valorDeclarado.toString(),
      volumenMetrosCubico: mercaderia.volumenMetrosCubico.toString(),
      pesoMercaderia: mercaderia.pesoMercaderia.toString(),
      cantidadBobinas: mercaderia.cantidadBobinas?.toString() || '',
      cantidadRacks: mercaderia.cantidadRacks?.toString() || '',
      cantidadBultos: mercaderia.cantidadBultos?.toString() || '',
      cantidadPallets: mercaderia.cantidadPallets?.toString() || '',
      requisitosEspeciales: mercaderia.requisitosEspeciales || '',
    });
    setShowModal(true);
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!nuevaMercaderia.tipoMercaderiaId) {
      newErrors.tipoMercaderiaId = 'El tipo de mercadería es requerido';
    }
    if (!nuevaMercaderia.valorDeclarado || parseInt(nuevaMercaderia.valorDeclarado.toString()) <= 0) {
      newErrors.valorDeclarado = 'El valor declarado debe ser mayor a 0';
    }
    if (!nuevaMercaderia.volumenMetrosCubico || parseInt(nuevaMercaderia.volumenMetrosCubico.toString()) <= 0) {
      newErrors.volumenMetrosCubico = 'El volumen debe ser mayor a 0';
    }
    if (!nuevaMercaderia.pesoMercaderia || parseInt(nuevaMercaderia.pesoMercaderia.toString()) <= 0) {
      newErrors.pesoMercaderia = 'El peso debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const agregarMercaderia = () => {
    if (!validateForm()) return;

    const mercaderiaToAdd: Mercaderia = {
      tipoMercaderiaId: nuevaMercaderia.tipoMercaderiaId!,
      valorDeclarado: parseInt(nuevaMercaderia.valorDeclarado.toString()),
      volumenMetrosCubico: parseInt(nuevaMercaderia.volumenMetrosCubico.toString()),
      pesoMercaderia: parseInt(nuevaMercaderia.pesoMercaderia.toString()),
      cantidadBobinas: nuevaMercaderia.cantidadBobinas ? parseInt(nuevaMercaderia.cantidadBobinas.toString()) : null,
      cantidadRacks: nuevaMercaderia.cantidadRacks ? parseInt(nuevaMercaderia.cantidadRacks.toString()) : null,
      cantidadBultos: nuevaMercaderia.cantidadBultos ? parseInt(nuevaMercaderia.cantidadBultos.toString()) : null,
      cantidadPallets: nuevaMercaderia.cantidadPallets ? parseInt(nuevaMercaderia.cantidadPallets.toString()) : null,
      requisitosEspeciales: nuevaMercaderia.requisitosEspeciales || null,
    };

    if (editingIndex !== null) {
      // Editar mercadería existente
      const nuevasMercaderias = [...mercaderias];
      nuevasMercaderias[editingIndex] = mercaderiaToAdd;
      onMercaderiasChange(nuevasMercaderias);
    } else {
      // Agregar nueva mercadería
      onMercaderiasChange([...mercaderias, mercaderiaToAdd]);
    }

    // Limpiar formulario y cerrar modal
    setNuevaMercaderia({
      tipoMercaderiaId: null,
      valorDeclarado: '',
      volumenMetrosCubico: '',
      pesoMercaderia: '',
      cantidadBobinas: '',
      cantidadRacks: '',
      cantidadBultos: '',
      cantidadPallets: '',
      requisitosEspeciales: '',
    });
    setEditingIndex(null);
    setShowModal(false);
    setErrors({});
  };

  const eliminarMercaderia = (pageIndex: number) => {
    // Convertir índice de la página al índice real del array
    const realIndex = startIndex + pageIndex;
    onMercaderiasChange(mercaderias.filter((_, i) => i !== realIndex));
  };

  const cerrarModal = () => {
    setShowModal(false);
    setEditingIndex(null);
    setNuevaMercaderia({
      tipoMercaderiaId: null,
      valorDeclarado: '',
      volumenMetrosCubico: '',
      pesoMercaderia: '',
      cantidadBobinas: '',
      cantidadRacks: '',
      cantidadBultos: '',
      cantidadPallets: '',
      requisitosEspeciales: '',
    });
    setErrors({});
  };

  const getTipoMercaderiaNombre = (tipoId: number) => {
    const tipo = tiposMercaderia.find(t => t.id === tipoId);
    return tipo ? tipo.nombre : 'Tipo no encontrado';
  };

  // Funciones de paginación
  const totalPages = Math.ceil(mercaderias.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMercaderias = mercaderias.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Resetear página cuando cambie el número de mercaderías
  useEffect(() => {
    const newTotalPages = Math.ceil(mercaderias.length / itemsPerPage);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    }
  }, [mercaderias.length, currentPage]);

  return (
    <div className={styles.mercaderiasContainer}>
      <div className={styles.header}>
        <h3 className={styles.title}>Mercaderías</h3>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className={styles.addButton}
        >
          <Plus size={16} />
          Agregar mercadería
        </button>
      </div>

      {showError && mercaderias.length === 0 && (
        <div className={styles.errorMessage}>
          Debe agregar al menos una mercadería
        </div>
      )}

      {mercaderias.length > 0 && (
        <>
          <div className={styles.mercaderiasList}>
            {currentMercaderias.map((mercaderia, index) => (
              <div key={startIndex + index} className={styles.mercaderiaItem}>
                <div className={styles.mercaderiaInfo}>
                  <div className={styles.mercaderiaHeader}>
                    <span className={styles.tipoMercaderia}>
                      {getTipoMercaderiaNombre(mercaderia.tipoMercaderiaId)}
                    </span>
                    <div className={styles.actions}>
                      <button
                        type="button"
                        onClick={() => abrirModalEdicion(index)}
                        className={styles.editButton}
                        title="Editar mercadería"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => eliminarMercaderia(index)}
                        className={styles.deleteButton}
                        title="Eliminar mercadería"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                <div className={styles.mercaderiaDetails}>
                  <div className={styles.detailItem}>
                    <span className={styles.label}>Valor:</span>
                    <span className={styles.value}>
                      ${mercaderia.valorDeclarado.toLocaleString('es-AR')}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.label}>Peso:</span>
                    <span className={styles.value}>
                      {mercaderia.pesoMercaderia.toLocaleString('es-AR')} kg
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.label}>Volumen:</span>
                    <span className={styles.value}>
                      {mercaderia.volumenMetrosCubico.toLocaleString('es-AR')} m³
                    </span>
                  </div>
                  {(mercaderia.cantidadPallets || mercaderia.cantidadBultos || mercaderia.cantidadRacks || mercaderia.cantidadBobinas) && (
                    <>
                      {mercaderia.cantidadPallets && (
                        <div className={styles.detailItem}>
                          <span className={styles.label}>Pallets:</span>
                          <span className={styles.value}>
                            {mercaderia.cantidadPallets.toLocaleString('es-AR')}
                          </span>
                        </div>
                      )}
                      {mercaderia.cantidadBultos && (
                        <div className={styles.detailItem}>
                          <span className={styles.label}>Bultos:</span>
                          <span className={styles.value}>
                            {mercaderia.cantidadBultos.toLocaleString('es-AR')}
                          </span>
                        </div>
                      )}
                      {mercaderia.cantidadRacks && (
                        <div className={styles.detailItem}>
                          <span className={styles.label}>Racks:</span>
                          <span className={styles.value}>
                            {mercaderia.cantidadRacks.toLocaleString('es-AR')}
                          </span>
                        </div>
                      )}
                      {mercaderia.cantidadBobinas && (
                        <div className={styles.detailItem}>
                          <span className={styles.label}>Bobinas:</span>
                          <span className={styles.value}>
                            {mercaderia.cantidadBobinas.toLocaleString('es-AR')}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                  {mercaderia.requisitosEspeciales && (
                    <div className={styles.detailItem}>
                      <span className={styles.label}>Requisitos:</span>
                      <span className={styles.value}>{mercaderia.requisitosEspeciales}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          </div>

          {/* Paginación - solo mostrar si hay más de 3 mercaderías */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <div className={styles.paginationInfo}>
                Mostrando {startIndex + 1}-{Math.min(endIndex, mercaderias.length)} de {mercaderias.length} mercaderías
              </div>
              <div className={styles.paginationButtons}>
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={styles.paginationButton}
                >
                  Anterior
                </button>
                
                {/* Números de página */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => handlePageChange(page)}
                    className={`${styles.paginationButton} ${page === currentPage ? styles.active : ''}`}
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
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal para agregar/editar mercadería */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {editingIndex !== null ? 'Editar mercadería' : 'Agregar mercadería'}
              </h3>
              <button
                type="button"
                onClick={cerrarModal}
                className={styles.closeButton}
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Tipo de mercadería *</label>
                  <select
                    name="tipoMercaderiaId"
                    value={nuevaMercaderia.tipoMercaderiaId || ''}
                    onChange={handleMercaderiaChange}
                    className={`${styles.formInput} ${errors.tipoMercaderiaId ? styles.inputError : ''}`}
                    required
                    disabled={loadingTipos}
                  >
                    <option value="">{loadingTipos ? 'Cargando...' : 'Seleccionar tipo'}</option>
                    {tiposMercaderia.map((tipo) => (
                      <option key={tipo.id} value={tipo.id}>
                        {tipo.nombre}
                      </option>
                    ))}
                  </select>
                  {errors.tipoMercaderiaId && (
                    <span className={styles.errorText}>{errors.tipoMercaderiaId}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Valor declarado ($) *</label>
                  <input
                    name="valorDeclarado"
                    type="text"
                    value={nuevaMercaderia.valorDeclarado}
                    onChange={handleMercaderiaChange}
                    placeholder="Ingresar valor declarado"
                    className={`${styles.formInput} ${errors.valorDeclarado ? styles.inputError : ''}`}
                    required
                  />
                  {errors.valorDeclarado && (
                    <span className={styles.errorText}>{errors.valorDeclarado}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Peso total (kg) *</label>
                  <input
                    name="pesoMercaderia"
                    type="text"
                    value={nuevaMercaderia.pesoMercaderia}
                    onChange={handleMercaderiaChange}
                    placeholder="Ingresar peso total"
                    className={`${styles.formInput} ${errors.pesoMercaderia ? styles.inputError : ''}`}
                    required
                  />
                  {errors.pesoMercaderia && (
                    <span className={styles.errorText}>{errors.pesoMercaderia}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Volumen (m³) *</label>
                  <input
                    name="volumenMetrosCubico"
                    type="text"
                    value={nuevaMercaderia.volumenMetrosCubico}
                    onChange={handleMercaderiaChange}
                    placeholder="Ingresar volumen"
                    className={`${styles.formInput} ${errors.volumenMetrosCubico ? styles.inputError : ''}`}
                    required
                  />
                  {errors.volumenMetrosCubico && (
                    <span className={styles.errorText}>{errors.volumenMetrosCubico}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Cantidad de Pallets</label>
                  <input
                    name="cantidadPallets"
                    type="text"
                    value={nuevaMercaderia.cantidadPallets}
                    onChange={handleMercaderiaChange}
                    placeholder="0"
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Cantidad de Bultos</label>
                  <input
                    name="cantidadBultos"
                    type="text"
                    value={nuevaMercaderia.cantidadBultos}
                    onChange={handleMercaderiaChange}
                    placeholder="0"
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Cantidad de Racks</label>
                  <input
                    name="cantidadRacks"
                    type="text"
                    value={nuevaMercaderia.cantidadRacks}
                    onChange={handleMercaderiaChange}
                    placeholder="0"
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Cantidad de Bobinas</label>
                  <input
                    name="cantidadBobinas"
                    type="text"
                    value={nuevaMercaderia.cantidadBobinas}
                    onChange={handleMercaderiaChange}
                    placeholder="0"
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                  <label className={styles.formLabel}>Requisitos especiales</label>
                  <textarea
                    name="requisitosEspeciales"
                    value={nuevaMercaderia.requisitosEspeciales}
                    onChange={handleMercaderiaChange}
                    placeholder="Ingresar requisitos especiales"
                    className={styles.formInput}
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                onClick={cerrarModal}
                className={styles.cancelButton}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={agregarMercaderia}
                className={styles.saveButton}
              >
                {editingIndex !== null ? 'Actualizar' : 'Agregar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
