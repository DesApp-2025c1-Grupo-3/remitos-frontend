import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "./clientes.module.css";
import { clientesService } from "../../services/clientesService";
import { tipoEmpresaService } from "../../services/tipoEmpresaService";
import { Building2 } from "lucide-react";
import { useNotification } from "../../contexts/NotificationContext";
import { ConfirmDialog } from '../../components/ConfirmDialog/ConfirmDialog';
import { SectionHeader } from "../../components/SectionHeader/SectionHeader";
import EntityCard from "../../components/EntityCard/EntityCard";
import PaginationEntity from "../../components/PaginationEntity/PaginationEntity";
import MenuItem from "../../components/MenuItem/MenuItem";
import LoadingState from "../../components/LoadingState/LoadingState";
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, useMediaQuery, useTheme } from "@mui/material";

export default function Clientes() {
  const [clientes, setClientes] = useState({ data: [], totalItems: 0, totalPages: 1, currentPage: 1 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [clienteToDelete, setClienteToDelete] = useState(null);
  const [tiposEmpresa, setTiposEmpresa] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const defaultRows = 10;
  const [rowsPerPage, setRowsPerPage] = useState(defaultRows);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));

  const getNombreTipoEmpresa = (tipoEmpresaId) => {
    const tipo = tiposEmpresa.find(t => t.id === tipoEmpresaId);
    return tipo ? tipo.nombre : 'N/A';
  };

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
        const data = await clientesService.getClientes({ page: currentPage, limit: rowsPerPage });
        setClientes(data);
      } catch (err) {
        console.error(err);
        showNotification('Error al cargar los clientes', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchClientes();
  }, [currentPage, rowsPerPage, showNotification]);

  const handleDeleteClick = (cliente) => {
    setClienteToDelete(cliente);
  };

  const handleDeleteConfirm = async () => {
    try {
      await clientesService.deleteCliente(clienteToDelete.id);
      showNotification('Cliente eliminado exitosamente', 'success');
      const data = await clientesService.getClientes({ page: currentPage, limit: rowsPerPage });
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

  const handleChangePage = (event, value) => {
    setCurrentPage(value);
  };

  if (loading) return (
    <div className={styles.container}>
      <LoadingState title="clientes" />
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <SectionHeader
          title="Clientes"
          buttonText="Nuevo Cliente"
          onAdd={() => navigate("/clientes/nuevo")}
        />
        
        {/* Vista Mobile/Tablet - Cards */}
        {(isMobile || isTablet) ? (
          <Box sx={{ 
            display: 'grid', 
            gap: 2, 
            gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' },
            mx: 2,
            mb: 2
          }}>
            {clientes.data.length > 0 ? clientes.data.map(cliente => (
              <EntityCard
                key={cliente.id}
                title={cliente.razonSocial}
                subtitle={cliente.cuit_rut}
                icon={<Building2 size={24}/>}
                fields={[
                  { label: "Tipo", value: getNombreTipoEmpresa(cliente.tipoEmpresaId) },
                  { label: "Dirección", value: cliente.direccion }
                ]}
                onDelete={() => handleDeleteClick(cliente)}
                onEdit={() => navigate(`/clientes/editar/${cliente.id}`)}
              />
            )) : (
              <Box sx={{ 
                textAlign: 'center', 
                color: '#6B7280', 
                py: 10, 
                gridColumn: '1 / -1' 
              }}>
                Aún no hay clientes registrados
              </Box>
            )}
          </Box>
        ) : (
          /* Vista Desktop - Tabla MUI */
          <Box sx={{ mx: 2 }}>
            <TableContainer component={Paper}>
              <Table aria-label="tabla de clientes">
                <TableHead>
                  <TableRow>
                    <TableCell>Razón Social</TableCell>
                    <TableCell>CUIT/RUT</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Dirección</TableCell>
                    <TableCell sx={{ width: 72 }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clientes.data.length === 0 ? (
                    <TableRow>
                      <TableCell 
                        colSpan={5} 
                        sx={{textAlign: "center", paddingY: "26px"}}
                      >
                        Aún no hay clientes registrados
                      </TableCell>
                    </TableRow>
                  ) : (
                    clientes.data.map((cliente) => (
                      <TableRow key={cliente.id} hover>
                        <TableCell sx={{fontWeight: "bold"}}>{cliente.razonSocial}</TableCell>
                        <TableCell>{cliente.cuit_rut}</TableCell>
                        <TableCell>{getNombreTipoEmpresa(cliente.tipoEmpresaId)}</TableCell>
                        <TableCell>{cliente.direccion}</TableCell>
                        <TableCell sx={{ verticalAlign: "middle" }}>
                          <MenuItem
                            handleOpenDialog={() => handleDeleteClick(cliente)}
                            id={cliente.id}
                            module="clientes"
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
        
        {/* Paginación */}
        {clientes.totalPages > 1 && (
          <PaginationEntity
            entity="clientes"
            page={currentPage}
            totalPages={clientes.totalPages}
            rowsPerPage={rowsPerPage}
            filtered={clientes.data}
            handleChangePage={handleChangePage}
            setRowsPerPage={setRowsPerPage}
            setPage={setCurrentPage}
            totalItems={clientes.totalItems}
          />
        )}
      </div>

      {clienteToDelete && (
        <ConfirmDialog
          open={!!clienteToDelete}
          title="Confirmar eliminación"
          message={
            <div>
              <div>¿Estás seguro que deseas eliminar el cliente "{clienteToDelete.razonSocial}"?</div>
              <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#6b7280' }}>
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
