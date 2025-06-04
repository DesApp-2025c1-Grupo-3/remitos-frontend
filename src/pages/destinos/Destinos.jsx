import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./destinos.module.css";
import { destinosService } from "../../services/destinosService";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { useNotification } from "../../contexts/NotificationContext";
import { ConfirmModal } from '../../components/ConfirmModal/ConfirmModal';

export default function Destinos() {
  const [destinos, setDestinos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [destinoToDelete, setDestinoToDelete] = useState(null);

  useEffect(() => {
    const fetchDestinos = async () => {
      try {
        const data = await destinosService.getDestinos();
        setDestinos(data);
      } catch (err) {
        console.error(err);
        showNotification('Error al cargar los destinos', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchDestinos();
  }, [showNotification]);

  const handleDeleteClick = (destino) => {
    setDestinoToDelete(destino);
  };

  const handleDeleteConfirm = async () => {
    try {
      await destinosService.deleteDestino(destinoToDelete.id);
      showNotification('Destino eliminado exitosamente', 'success');
      const fetchDestinos = async () => {
        const data = await destinosService.getDestinos();
        setDestinos(data);
      };
      fetchDestinos();
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

  return (
    <div className={styles.container}>
      <button className={styles.volverBtn} onClick={() => navigate(-1)}>
        <ArrowLeft />
        Volver
      </button>
      <h1 className={styles.titulo}>Destinos</h1>
      <div className={styles.wrapper}>
        <div className={styles.crearBtnContainer}>
          <button className={styles.crearBtn} onClick={() => navigate("/destinos/nuevo")}>
            Crear Destino
          </button>
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
              {destinos.map((destino) => (
                <tr key={destino.id}>
                  <td>{destino.name}</td>
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {destinoToDelete && (
        <ConfirmModal
          isOpen={!!destinoToDelete}
          title="Confirmar eliminación"
          message={
            <div style={{ textAlign: 'center' }}>
              <div>¿Estás seguro que deseas eliminar el destino "{destinoToDelete.name}"?</div>
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