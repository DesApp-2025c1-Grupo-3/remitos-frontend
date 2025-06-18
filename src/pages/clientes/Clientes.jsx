import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "./clientes.module.css";
import { clientesService } from "../../services/clientesService";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { useNotification } from "../../contexts/NotificationContext";
import { ConfirmModal } from '../../components/ConfirmModal/ConfirmModal';

export default function Clientes() {
  // Cambiar el estado inicial a objeto de paginación
  const [clientes, setClientes] = useState({ data: [], totalItems: 0, totalPages: 1, currentPage: 1 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [clienteToDelete, setClienteToDelete] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchClientes = async () => {
      setLoading(true);
      try {
        // Suponiendo que el servicio acepta un parámetro de página
        const data = await clientesService.getClientes({ page: currentPage, limit: 10 });
        setClientes(data);
      } catch (err) {
        console.error(err);
        showNotification('Error al cargar los clientes', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchClientes();
  }, [currentPage, showNotification]);

  const handleDeleteClick = (cliente) => {
    setClienteToDelete(cliente);
  };

  const handleDeleteConfirm = async () => {
    try {
      await clientesService.deleteCliente(clienteToDelete.id);
      showNotification('Cliente eliminado exitosamente', 'success');
      // Recargar la página actual
      const data = await clientesService.getClientes({ page: currentPage, limit: 10 });
      setClientes(data);
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
      <span style={{ alignSelf: 'center' }}>Página {clientes.currentPage} de {clientes.totalPages}</span>
      <button
        className={styles.crearBtn}
        onClick={() => setCurrentPage(p => Math.min(clientes.totalPages, p + 1))}
        disabled={currentPage === clientes.totalPages}
        style={{ opacity: currentPage === clientes.totalPages ? 0.5 : 1, cursor: currentPage === clientes.totalPages ? 'not-allowed' : 'pointer' }}
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
        <h1 className={styles.titulo}>Clientes</h1>
        <div style={{ width: '120px' }}></div> {/* Spacer para centrar el título */}
      </div>
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
              {clientes.data.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                    Aún no hay clientes registrados
                  </td>
                </tr>
              ) : (
                clientes.data.map((cliente) => (
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
        {clientes.totalPages > 1 && renderPagination()}
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
