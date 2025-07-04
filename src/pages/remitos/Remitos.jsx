import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { remitosService } from "../../services/remitosService";
import styles from "./remitos.module.css";
import { useNotification } from "../../contexts/NotificationContext";
import { ConfirmModal } from '../../components/ConfirmModal/ConfirmModal';
import { Pencil, Trash2, ArrowLeft } from "lucide-react";
import { formatDate, getPrioridadClass } from "../../utils/remitosUtils";
import { Pagination } from "../../components/Pagination/Pagination";

export default function Remitos() {
  const [remitos, setRemitos] = useState({ data: [], totalItems: 0, totalPages: 1, currentPage: 1 });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [remitoToDelete, setRemitoToDelete] = useState(null);

  const fetchRemitos = async (page = 1) => {
    try {
      setLoading(true);
      const response = await remitosService.getRemitos(page, 20);
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
  }, [currentPage]);

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
      <div className={styles.header}>
        <button className={styles.volverBtn} onClick={() => navigate(-1)}>
          <ArrowLeft />
          Volver
        </button>
        <h1 className={styles.titulo}>Remitos</h1>
        <div className={styles.headerSpacer}></div> {/* Spacer para centrar el título */}
      </div>
      
      <div className={styles.wrapper}>
        <div className={styles.crearBtnContainer}>
          <Link to="/remitos/nuevo" className={styles.crearBtn}>
            Crear Remito
          </Link>
        </div>
        
        <div className={styles.tablaContenedor}>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>Número</th>
                <th>Cliente</th>
                <th>Destino</th>
                <th>Estado</th>
                <th>Prioridad</th>
                <th>Fecha</th>
                <th className={styles.actionsCenterAlign}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {remitos.data.length === 0 ? (
                <tr>
                  <td colSpan="7" className={styles.emptyTableMessage}>
                    Aún no hay remitos registrados
                  </td>
                </tr>
              ) : (
                remitos.data.map(remito => (
                  <tr 
                    key={remito.id} 
                    className={styles.clickableRow}
                    onClick={() => navigate(`/remitos/detalle/${remito.id}`)}
                  >
                    <td>{remito.numeroAsignado}</td>
                    <td>{remito.cliente?.razonSocial || 'Sin cliente'}</td>
                    <td>
                      {remito.destino 
                        ? `${remito.destino.nombre}, ${remito.destino.provincia}` 
                        : 'Sin destino'
                      }
                    </td>
                    <td>{remito.estado?.nombre || 'Sin estado'}</td>
                    <td>
                      <span className={getPrioridadClass(remito.prioridad, styles)}>
                        {remito.prioridad}
                      </span>
                    </td>
                    <td>{formatDate(remito.fechaEmision)}</td>
                    <td>
                      <div className={styles.acciones}>
                        <Link 
                          to={`/remitos/editar/${remito.id}`}
                          className={styles.accionesBtn}
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
          onCancel={handleDeleteCancel}
        />
      )}
    </div>
  );
}