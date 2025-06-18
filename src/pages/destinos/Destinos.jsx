import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "./destinos.module.css";
import { destinosService } from "../../services/destinosService";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { useNotification } from "../../contexts/NotificationContext";
import { ConfirmModal } from '../../components/ConfirmModal/ConfirmModal';

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
    <div className={styles.pagination} style={{ marginTop: "1rem", display: "flex", gap: "1rem", justifyContent: "center" }}>
      <button
        className={styles.crearBtn}
        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
        disabled={currentPage === 1}
        style={{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
      >
        Anterior
      </button>
      <span style={{ alignSelf: 'center' }}>Página {destinos.currentPage} de {destinos.totalPages}</span>
      <button
        className={styles.crearBtn}
        onClick={() => setCurrentPage(p => Math.min(destinos.totalPages, p + 1))}
        disabled={currentPage === destinos.totalPages}
        style={{ opacity: currentPage === destinos.totalPages ? 0.5 : 1, cursor: currentPage === destinos.totalPages ? 'not-allowed' : 'pointer' }}
      >
        Siguiente
      </button>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.volverBtn} onClick={() => navigate(-1)}>
          <ArrowLeft />
          Volver
        </button>
        <h1 className={styles.titulo}>Destinos</h1>
        <div style={{ width: '120px' }}></div> {/* Spacer para centrar el título */}
      </div>
      <div className={styles.wrapper}>
        <div className={styles.crearBtnContainer}>
          <Link to="/destinos/nuevo" className={styles.crearBtn}>
            Crear Destino
          </Link>
        </div>
        <div className={styles.tablaContenedor}>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>País</th>
                <th>Provincia</th>
                <th>Localidad</th>
                <th>Dirección</th>
                <th style={{ textAlign: "center" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {destinos.data.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                    Aún no hay destinos registrados
                  </td>
                </tr>
              ) : (
                destinos.data.map((destino) => (
                  <tr key={destino.id}>
                    <td>{destino.nombre}</td>
                    <td>{destino.pais}</td>
                    <td>{destino.provincia}</td>
                    <td>{destino.localidad}</td>
                    <td>{destino.direccion}</td>
                    <td>
                      <div className={styles.acciones}>
                        <button 
                          className={styles.accionesBtn} 
                          onClick={() => navigate(`/destinos/editar/${destino.id}`)}
                          title="Editar"
                        >
                          <Pencil />
                        </button>
                        <button 
                          className={`${styles.accionesBtn} ${styles.delete}`} 
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
          onCancel={handleDeleteCancel}
        />
      )}
    </div>
  );
}