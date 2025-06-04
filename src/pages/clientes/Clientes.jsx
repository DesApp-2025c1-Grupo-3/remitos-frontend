import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "./clientes.module.css";
import { clientesService } from "../../services/clientesService";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { useNotification } from "../../contexts/NotificationContext";
import { ConfirmModal } from '../../components/ConfirmModal/ConfirmModal';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [clienteToDelete, setClienteToDelete] = useState(null);

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const data = await clientesService.getClientes();
        setClientes(data);
      } catch (err) {
        console.error(err);
        showNotification('Error al cargar los clientes', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchClientes();
  }, [showNotification]);

  const handleDeleteClick = (cliente) => {
    setClienteToDelete(cliente);
  };

  const handleDeleteConfirm = async () => {
    try {
      await clientesService.deleteCliente(clienteToDelete.id);
      showNotification('Cliente eliminado exitosamente', 'success');
      const fetchClientes = async () => {
        const data = await clientesService.getClientes();
        setClientes(data);
      };
      fetchClientes();
    } catch (err) {
      console.error(err);
      showNotification('Error al eliminar el cliente', 'error');
    } finally {
      setClienteToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setClienteToDelete(null);
  };

  if (loading) return <div className={styles.container}>Cargando...</div>;

  return (
    <div className={styles.container}>
      <button className={styles.volverBtn} onClick={() => navigate(-1)}>
        <ArrowLeft />
        Volver
      </button>
      <h1 className={styles.titulo}>Clientes</h1>
      <div className={styles.wrapper}>
        <div className={styles.crearBtnContainer}>
          <Link to="/clientes/nuevo" className={styles.crearBtn}>
            Crear Cliente
          </Link>
        </div>
        <div className={styles.tablaContenedor}>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>Razón Social</th>
                <th>CUIT/RUT</th>
                <th>Tipo</th>
                <th>Dirección</th>
                <th style={{ textAlign: "center" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                    Aún no hay clientes registrados
                  </td>
                </tr>
              ) : (
                clientes.map((cliente) => (
                  <tr key={cliente.id}>
                    <td>{cliente.razonSocial}</td>
                    <td>{cliente.cuit_rut}</td>
                    <td>{cliente.tipoEmpresa}</td>
                    <td>{cliente.direccion}</td>
                    <td>
                      <div className={styles.acciones}>
                        <Link 
                          to={`/clientes/editar/${cliente.id}`}
                          className={styles.accionesBtn}
                          title="Editar"
                        >
                          <Pencil />
                        </Link>
                        <button 
                          className={`${styles.accionesBtn} ${styles.delete}`} 
                          onClick={() => handleDeleteClick(cliente)}
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

      {clienteToDelete && (
        <ConfirmModal
          isOpen={!!clienteToDelete}
          title="Confirmar eliminación"
          message={
            <div style={{ textAlign: 'center' }}>
              <div>¿Estás seguro que deseas eliminar el cliente "{clienteToDelete.razonSocial}"?</div>
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
