import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { remitosService } from "../../services/remitosService";
import styles from "./remitos.module.css";
import { useNotification } from "../../contexts/NotificationContext";
import { ConfirmModal } from '../../components/ConfirmModal/ConfirmModal';
import { Pencil, Trash2, ArrowLeft } from "lucide-react";

export default function Remitos() {
  const [remitos, setRemitos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [remitoToDelete, setRemitoToDelete] = useState(null);

  useEffect(() => {
    const fetchRemitos = async () => {
      try {
        const data = await remitosService.getRemitos();
        setRemitos(data);
      } catch (err) {
        console.error(err);
        showNotification('Error al cargar los remitos', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchRemitos();
  }, [showNotification]);

  const handleDeleteClick = (remito) => {
    setRemitoToDelete(remito);
  };

  const handleDeleteConfirm = async () => {
    try {
      await remitosService.deleteRemito(remitoToDelete.id);
      showNotification('Remito eliminado exitosamente', 'success');
      const fetchRemitos = async () => {
        const data = await remitosService.getRemitos();
        setRemitos(data);
      };
      fetchRemitos();
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
                <th>Fecha</th>
                <th style={{ textAlign: "center" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {remitos.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                    Aún no hay remitos registrados
                  </td>
                </tr>
              ) : (
                remitos.map(remito => (
                  <tr key={remito.id}>
                    <td>{remito.numero}</td>
                    <td>{remito.cliente}</td>
                    <td>{remito.destino}</td>
                    <td>{remito.fecha}</td>
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
      </div>

      {remitoToDelete && (
        <ConfirmModal
          isOpen={!!remitoToDelete}
          title="Confirmar eliminación"
          message={
            <div style={{ textAlign: 'center' }}>
              <div>¿Estás seguro que deseas eliminar el remito número "{remitoToDelete.numero}"?</div>
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