import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "./destinos.module.css";
import tableStyles from "../../styles/table.module.css";
import { destinosService } from "../../services/destinosService";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { useNotification } from "../../contexts/NotificationContext";
import { ConfirmModal } from '../../components/ConfirmModal/ConfirmModal';
import { Pagination } from '../../components/Pagination/Pagination';

export default function Destinos() {
  // Cambiar el estado inicial a objeto de paginación
  const [destinos, setDestinos] = useState({ data: [], totalItems: 0, totalPages: 1, currentPage: 1 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [destinoToDelete, setDestinoToDelete] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchDestinos = async () => {
      setLoading(true);
      try {
        // Suponiendo que el servicio acepta un parámetro de página
        const data = await destinosService.getDestinos({ page: currentPage, limit: 10 });
        setDestinos(data);
      } catch (err) {
        console.error(err);
        showNotification('Error al cargar los destinos', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchDestinos();
  }, [currentPage, showNotification]);

  const handleDeleteClick = (destino) => {
    setDestinoToDelete(destino);
  };

  const handleDeleteConfirm = async () => {
    try {
      await destinosService.deleteDestino(destinoToDelete.id);
      showNotification('Destino eliminado exitosamente', 'success');
      // Recargar la página actual
      const data = await destinosService.getDestinos({ page: currentPage, limit: 10 });
      setDestinos(data);
    } catch (err) {
      console.error(err);
      showNotification('Error al eliminar el destino', 'error');
    } finally {
      setDestinoToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDestinoToDelete(null);
  };

  if (loading) return <div className={styles.container}>Cargando...</div>;

  // Renderiza los controles de paginación
  const renderPagination = () => (
    <Pagination
      currentPage={destinos.currentPage}
      totalPages={destinos.totalPages}
      onPageChange={setCurrentPage}
      totalItems={destinos.totalItems}
      itemsPerPage={10}
    />
  );

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.pageHeader}>
          <div className={styles.headerContent}>
            <h1 className={styles.pageTitle}>Destinos</h1>
          </div>
          <div className={styles.headerActions}>
            <Link to="/destinos/nuevo" className={styles.crearBtn}>
              + Nuevo Destino
            </Link>
          </div>
        </div>
        
        <div className={tableStyles.tableContainer}>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>País</th>
                <th>Provincia</th>
                <th>Localidad</th>
                <th>Dirección</th>
                <th className={tableStyles.actionsCenterAlign}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {destinos.data.length === 0 ? (
                <tr>
                  <td colSpan="6" className={tableStyles.emptyTableMessage}>
                    Aún no hay destinos registrados
                  </td>
                </tr>
              ) : (
                destinos.data.map((destino) => (
                  <tr key={destino.id}>
                    <td data-label="Nombre">{destino.nombre}</td>
                    <td data-label="País">{destino.pais}</td>
                    <td data-label="Provincia">{destino.provincia}</td>
                    <td data-label="Localidad">{destino.localidad}</td>
                    <td data-label="Dirección">{destino.direccion}</td>
                    <td>
                      <div className={tableStyles.actions}>
                        <button 
                          className={tableStyles.actionBtn} 
                          onClick={() => navigate(`/destinos/editar/${destino.id}`)}
                          title="Editar"
                        >
                          <Pencil />
                        </button>
                        <button 
                          className={`${tableStyles.actionBtn} ${styles.delete}`} 
                          onClick={() => handleDeleteClick(destino)}
                          title="Eliminar"
                        >
                          <Trash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {destinos.totalPages > 1 && renderPagination()}
      </div>

      {destinoToDelete && (
        <ConfirmModal
          isOpen={!!destinoToDelete}
          title="Confirmar eliminación"
          message={
            <div style={{ textAlign: 'center' }}>
              <div>¿Estás seguro que deseas eliminar el destino "{destinoToDelete.nombre}"?</div>
              <div style={{ marginTop: '0.5rem' }}>
                Esta acción no se puede deshacer
              </div>
            </div>
          }
          onConfirm={handleDeleteConfirm}
          onClose={handleDeleteCancel}
        />
      )}
    </div>
  );
}