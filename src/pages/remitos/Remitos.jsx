import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { remitosService } from "../../services/remitosService";
import styles from "./remitos.module.css";
import { useNotification } from "../../contexts/NotificationContext";
import { ConfirmModal } from '../../components/ConfirmModal/ConfirmModal';
import { Pencil, Trash2, ArrowLeft } from "lucide-react";

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
      setRemitos(response);
      setCurrentPage(response.currentPage);
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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  const getPrioridadColor = (prioridad) => {
    switch (prioridad) {
      case 'urgente':
        return '#dc2626';
      case 'alta':
        return '#f59e0b';
      case 'normal':
      default:
        return '#059669';
    }
  };

  // Renderiza los controles de paginación
  const renderPagination = () => (
    <div className={styles.pagination} style={{ marginTop: "1rem", display: "flex", gap: "1rem", justifyContent: "center" }}>
      <button
        className={styles.crearBtn}
        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
        disabled={currentPage === 1}
        style={{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
      >
        Anterior
      </button>
      <span style={{ alignSelf: 'center' }}>Página {remitos.currentPage} de {remitos.totalPages}</span>
      <button
        className={styles.crearBtn}
        onClick={() => setCurrentPage(p => Math.min(remitos.totalPages, p + 1))}
        disabled={currentPage === remitos.totalPages}
        style={{ opacity: currentPage === remitos.totalPages ? 0.5 : 1, cursor: currentPage === remitos.totalPages ? 'not-allowed' : 'pointer' }}
      >
        Siguiente
      </button>
    </div>
  );

  if (loading) return <div className={styles.container}>Cargando...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.volverBtn} onClick={() => navigate(-1)}>
          <ArrowLeft />
          Volver
        </button>
        <h1 className={styles.titulo}>Remitos</h1>
        <div style={{ width: '120px' }}></div> {/* Spacer para centrar el título */}
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
                <th style={{ textAlign: "center" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {remitos.data.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                    Aún no hay remitos registrados
                  </td>
                </tr>
              ) : (
                remitos.data.map(remito => (
                  <tr key={remito.id}>
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
                      <span style={{ 
                        color: getPrioridadColor(remito.prioridad),
                        fontWeight: 'bold',
                        textTransform: 'capitalize'
                      }}>
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
                        >
                          <Pencil />
                        </Link>
                        <button 
                          className={`${styles.accionesBtn} ${styles.delete}`} 
                          onClick={() => handleDeleteClick(remito)}
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
        
        {remitos.totalPages > 1 && renderPagination()}
      </div>

      {remitoToDelete && (
        <ConfirmModal
          isOpen={!!remitoToDelete}
          title="Confirmar eliminación"
          message={
            <div style={{ textAlign: 'center' }}>
              <div>¿Estás seguro que deseas eliminar el remito número "{remitoToDelete.numeroAsignado}"?</div>
              <div style={{ marginTop: '0.5rem' }}>
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