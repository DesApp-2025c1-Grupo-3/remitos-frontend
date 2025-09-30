import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "./clientes.module.css";
import tableStyles from "../../styles/table.module.css";
import { clientesService } from "../../services/clientesService";
import { tipoEmpresaService } from "../../services/tipoEmpresaService";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { useNotification } from "../../contexts/NotificationContext";
import { ConfirmModal } from '../../components/ConfirmModal/ConfirmModal';
import { Pagination } from '../../components/Pagination/Pagination';

export default function Clientes() {
  // Cambiar el estado inicial a objeto de paginación
  const [clientes, setClientes] = useState({ data: [], totalItems: 0, totalPages: 1, currentPage: 1 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [clienteToDelete, setClienteToDelete] = useState(null);
  const [tiposEmpresa, setTiposEmpresa] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);

  // Función helper para obtener el nombre del tipo de empresa
  const getNombreTipoEmpresa = (tipoEmpresaId) => {
    const tipo = tiposEmpresa.find(t => t.id === tipoEmpresaId);
    return tipo ? tipo.nombre : 'N/A';
  };

  // Cargar tipos de empresa al montar el componente
  useEffect(() => {
    const fetchTiposEmpresa = async () => {
      try {
        const tipos = await tipoEmpresaService.getTiposEmpresa();
        setTiposEmpresa(tipos);
      } catch (err) {
        console.error('Error al cargar tipos de empresa:', err);
      }
    };
    fetchTiposEmpresa();
  }, []);

  useEffect(() => {
    const fetchClientes = async () => {
      setLoading(true);
      try {
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
    <Pagination
      currentPage={clientes.currentPage}
      totalPages={clientes.totalPages}
      onPageChange={setCurrentPage}
      totalItems={clientes.totalItems}
      itemsPerPage={10}
    />
  );

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.pageHeader}>
          <div className={styles.headerContent}>
            <h1 className={styles.pageTitle}>Clientes</h1>
          </div>
          <div className={styles.headerActions}>
            <Link to="/clientes/nuevo" className={styles.crearBtn}>
              + Nuevo Cliente
            </Link>
          </div>
        </div>
        
        <div className={tableStyles.tableContainer}>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>Razón Social</th>
                <th>CUIT/RUT</th>
                <th>Tipo</th>
                <th>Dirección</th>
                <th className={tableStyles.actionsCenterAlign}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.data.length === 0 ? (
                <tr>
                  <td colSpan="5" className={tableStyles.emptyTableMessage}>
                    Aún no hay clientes registrados
                  </td>
                </tr>
              ) : (
                clientes.data.map((cliente) => (
                  <tr key={cliente.id}>
                    <td data-label="Razón Social">{cliente.razonSocial}</td>
                    <td data-label="CUIT/RUT">{cliente.cuit_rut}</td>
                    <td data-label="Tipo">{getNombreTipoEmpresa(cliente.tipoEmpresaId)}</td>
                    <td data-label="Dirección">{cliente.direccion}</td>
                    <td>
                      <div className={tableStyles.actions}>
                        <Link 
                          to={`/clientes/editar/${cliente.id}`}
                          className={tableStyles.actionBtn}
                          title="Editar"
                        >
                          <Pencil />
                        </Link>
                        <button 
                          className={`${tableStyles.actionBtn} ${styles.delete}`} 
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
          onClose={handleDeleteCancel}
        />
      )}
    </div>
  );
}
