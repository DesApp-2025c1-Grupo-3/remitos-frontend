import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { remitosService } from "../../services/remitosService";
import styles from "./remitos.module.css";
import tableStyles from "../../styles/table.module.css";
import { useNotification } from "../../contexts/NotificationContext";
import { ConfirmModal } from '../../components/ConfirmModal/ConfirmModal';
import { Pencil, Trash2, ArrowLeft } from "lucide-react";
import { formatDate, getPrioridadClass } from "../../utils/remitosUtils";
import { Pagination } from "../../components/Pagination/Pagination";
import { RemitosFilters } from "../../components/RemitosFilters/RemitosFilters";

export default function Remitos() {
  const [remitos, setRemitos] = useState({ data: [], totalItems: 0, totalPages: 1, currentPage: 1 });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({});
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [remitoToDelete, setRemitoToDelete] = useState(null);
  const itemsPerPage = 10;

  const fetchRemitos = async (page = 1) => {
    try {
      setLoading(true);
      const response = await remitosService.getRemitos(page, itemsPerPage, filters);
      if (response && response.data) {
        setRemitos(response);
        setCurrentPage(response.currentPage);
      } else {
        // Si no hay respuesta o no tiene `data`, reseteamos al estado inicial.
        setRemitos({ data: [], totalItems: 0, totalPages: 1, currentPage: 1 });
        setCurrentPage(1);
      }
    } catch (err) {
      console.error(err);
      showNotification('Error al cargar los remitos', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRemitos(currentPage);
  }, [currentPage, filters]);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Resetear a la primera página cuando cambian los filtros
  };

  const handleClearFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  const handleDeleteClick = (remito) => {
    setRemitoToDelete(remito);
  };

  const handleDeleteConfirm = async () => {
    try {
      await remitosService.deleteRemito(remitoToDelete.id);
      showNotification('Remito eliminado exitosamente', 'success');
      // Recargar la página actual
      await fetchRemitos(currentPage);
    } catch (err) {
      console.error(err);
      showNotification('Error al eliminar el remito', 'error');
    } finally {
      setRemitoToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setRemitoToDelete(null);
  };





  if (loading) return <div className={styles.container}>Cargando...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.pageHeader}>
          <div className={styles.headerContent}>
            <h1 className={styles.pageTitle}>Remitos</h1>
          </div>
          <div className={styles.headerActions}>
            <Link to="/remitos/nuevo" className={styles.crearBtn}>
              + Nuevo Remito
            </Link>
          </div>
        </div>
        
        <RemitosFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
        />
        
        <div className={tableStyles.tableContainer}>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>Número</th>
                <th>Cliente</th>
                <th>Destino</th>
                <th>Estado</th>
                <th>Prioridad</th>
                <th className={tableStyles.actionsCenterAlign}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {remitos.data.length === 0 ? (
                <tr>
                  <td colSpan="6" className={tableStyles.emptyTableMessage}>
                    Aún no hay remitos registrados
                  </td>
                </tr>
              ) : (
                remitos.data.map(remito => (
                  <tr 
                    key={remito.id}
                  >
                    <td data-label="Número">{remito.numeroAsignado}</td>
                    <td data-label="Cliente">{remito.cliente?.razonSocial || 'Sin cliente'}</td>
                    <td data-label="Destino">
                      {remito.destino 
                        ? `${remito.destino.nombre}, ${remito.destino.provincia}` 
                        : 'Sin destino'
                      }
                    </td>
                    <td data-label="Estado">{remito.estado?.nombre || 'Sin estado'}</td>
                    <td data-label="Prioridad">
                      <span className={getPrioridadClass(remito.prioridad, styles)}>
                        {remito.prioridad}
                      </span>
                    </td>
                    <td>
                      <div className={tableStyles.actions}>
                        <Link 
                          to={`/remitos/editar/${remito.id}`}
                          className={tableStyles.actionBtn}
                          title="Editar"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Pencil />
                        </Link>
                        <button 
                          className={`${styles.accionesBtn} ${styles.delete}`} 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(remito);
                          }}
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
        
        <Pagination 
          currentPage={remitos.currentPage}
          totalPages={remitos.totalPages}
          onPageChange={setCurrentPage}
          totalItems={remitos.totalItems}
          itemsPerPage={itemsPerPage}
        />
      </div>

      {remitoToDelete && (
        <ConfirmModal
          isOpen={!!remitoToDelete}
          title="Confirmar eliminación"
          message={
            <div className={styles.modalMessage}>
              <div>¿Estás seguro que deseas eliminar el remito número "{remitoToDelete.numeroAsignado}"?</div>
              <div className={styles.modalSubMessage}>
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