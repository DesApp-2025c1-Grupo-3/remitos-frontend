import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "./destinos.module.css";
import { destinosService } from "../../services/destinosService";
import { MapPin } from "lucide-react";
import { useNotification } from "../../contexts/NotificationContext";
import { ConfirmDialog } from '../../components/ConfirmDialog/ConfirmDialog';
import { SectionHeader } from "../../components/SectionHeader/SectionHeader";
import EntityCard from "../../components/EntityCard/EntityCard";
import PaginationEntity from "../../components/PaginationEntity/PaginationEntity";
import MenuItem from "../../components/MenuItem/MenuItem";
import LoadingState from "../../components/LoadingState/LoadingState";
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, useMediaQuery, useTheme } from "@mui/material";

export default function Destinos() {
  const [destinos, setDestinos] = useState({ data: [], totalItems: 0, totalPages: 1, currentPage: 1 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [destinoToDelete, setDestinoToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const defaultRows = 10;
  const [rowsPerPage, setRowsPerPage] = useState(defaultRows);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));

  useEffect(() => {
    const fetchDestinos = async () => {
      setLoading(true);
      try {
        const data = await destinosService.getDestinos({ page: currentPage, limit: rowsPerPage });
        setDestinos(data);
      } catch (err) {
        console.error(err);
        showNotification('Error al cargar los destinos', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchDestinos();
  }, [currentPage, rowsPerPage, showNotification]);

  const handleDeleteClick = (destino) => {
    setDestinoToDelete(destino);
  };

  const handleDeleteConfirm = async () => {
    try {
      await destinosService.deleteDestino(destinoToDelete.id);
      showNotification('Destino eliminado exitosamente', 'success');
      const data = await destinosService.getDestinos({ page: currentPage, limit: rowsPerPage });
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

  const handleChangePage = (event, value) => {
    setCurrentPage(value);
  };

  if (loading) return (
    <div className={styles.container}>
      <LoadingState title="destinos" />
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <SectionHeader
          title="Destinos"
          buttonText="Nuevo Destino"
          onAdd={() => navigate("/destinos/nuevo")}
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
            {destinos.data.length > 0 ? destinos.data.map(destino => (
              <EntityCard
                key={destino.id}
                title={destino.nombre}
                subtitle={`${destino.pais} - ${destino.provincia}`}
                icon={<MapPin size={24}/>}
                fields={[
                  { label: "Localidad", value: destino.localidad },
                  { label: "Dirección", value: destino.direccion }
                ]}
                onDelete={() => handleDeleteClick(destino)}
                onEdit={() => navigate(`/destinos/editar/${destino.id}`)}
              />
            )) : (
              <Box sx={{ 
                textAlign: 'center', 
                color: '#6B7280', 
                py: 10, 
                gridColumn: '1 / -1' 
              }}>
                Aún no hay destinos registrados
              </Box>
            )}
          </Box>
        ) : (
          /* Vista Desktop - Tabla MUI */
          <Box sx={{ mx: 2 }}>
            <TableContainer component={Paper}>
              <Table aria-label="tabla de destinos">
                <TableHead>
                  <TableRow>
                    <TableCell>Nombre</TableCell>
                    <TableCell>País</TableCell>
                    <TableCell>Provincia</TableCell>
                    <TableCell>Localidad</TableCell>
                    <TableCell>Dirección</TableCell>
                    <TableCell sx={{ width: 72 }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {destinos.data.length === 0 ? (
                    <TableRow>
                      <TableCell 
                        colSpan={6} 
                        sx={{textAlign: "center", paddingY: "26px"}}
                      >
                        Aún no hay destinos registrados
                      </TableCell>
                    </TableRow>
                  ) : (
                    destinos.data.map((destino) => (
                      <TableRow key={destino.id} hover>
                        <TableCell sx={{fontWeight: "bold"}}>{destino.nombre}</TableCell>
                        <TableCell>{destino.pais}</TableCell>
                        <TableCell>{destino.provincia}</TableCell>
                        <TableCell>{destino.localidad}</TableCell>
                        <TableCell>{destino.direccion}</TableCell>
                        <TableCell sx={{ verticalAlign: "middle" }}>
                          <MenuItem
                            handleOpenDialog={() => handleDeleteClick(destino)}
                            id={destino.id}
                            module="destinos"
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
        {destinos.totalPages > 1 && (
          <PaginationEntity
            entity="destinos"
            page={currentPage}
            totalPages={destinos.totalPages}
            rowsPerPage={rowsPerPage}
            filtered={destinos.data}
            handleChangePage={handleChangePage}
            setRowsPerPage={setRowsPerPage}
            setPage={setCurrentPage}
            totalItems={destinos.totalItems}
          />
        )}
      </div>

      {destinoToDelete && (
        <ConfirmDialog
          open={!!destinoToDelete}
          title="Confirmar eliminación"
          message={
            <div>
              <div>¿Estás seguro que deseas eliminar el destino "{destinoToDelete.nombre}"?</div>
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
