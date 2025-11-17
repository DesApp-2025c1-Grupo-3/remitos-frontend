import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { remitosService } from "../../services/remitosService";
import styles from "./remitos.module.css";
import { useNotification } from "../../contexts/NotificationContext";
import { ConfirmDialog } from '../../components/ConfirmDialog/ConfirmDialog';
import { FileText } from "lucide-react";
import { formatDate, getPrioridadClass } from "../../utils/remitosUtils";
import { RemitosFilters } from "../../components/RemitosFilters/RemitosFilters";
import { SectionHeader } from "../../components/SectionHeader/SectionHeader";
import EntityCard from "../../components/EntityCard/EntityCard";
import PaginationEntity from "../../components/PaginationEntity/PaginationEntity";
import MenuItem from "../../components/MenuItem/MenuItem";
import LoadingState from "../../components/LoadingState/LoadingState";
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, useMediaQuery, useTheme } from "@mui/material";

export default function Remitos() {
  const [remitos, setRemitos] = useState({ data: [], totalItems: 0, totalPages: 1, currentPage: 1 });
  const [loading, setLoading] = useState(false);
  const [filtrosAplicadosManualmente, setFiltrosAplicadosManualmente] = useState(false);
  const pad2 = (n) => `${n}`.padStart(2, '0');
  const hoy = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  })();
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const location = useLocation();

  // Restaurar filtros solo si se viene del formulario
  const getInitialFilters = () => {
    // Si viene del formulario, restaurar filtros guardados
    if (location.state?.preserveFilters) {
      try {
        const savedFilters = sessionStorage.getItem('remitosFilters');
        if (savedFilters) return JSON.parse(savedFilters);
      } catch {}
    } else {
      // Si no viene del formulario, limpiar filtros guardados
      sessionStorage.removeItem('remitosFilters');
      sessionStorage.removeItem('remitosCurrentPage');
    }
    return { fechaDesde: hoy, fechaHasta: hoy };
  };

  const getInitialPage = () => {
    // Si viene del formulario, restaurar página guardada
    if (location.state?.preserveFilters) {
      try {
        const savedPage = sessionStorage.getItem('remitosCurrentPage');
        if (savedPage) return parseInt(savedPage, 10);
      } catch {}
    }
    return 1;
  };

  const [currentPage, setCurrentPage] = useState(getInitialPage);
  const [filters, setFilters] = useState(getInitialFilters);
  const [filtrosAplicados, setFiltrosAplicados] = useState(getInitialFilters);
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [remitoToDelete, setRemitoToDelete] = useState(null);
  const itemsPerPage = 10;
  const defaultRows = 10;
  const [rowsPerPage, setRowsPerPage] = useState(defaultRows);
  const isUpdatingPageRef = useRef(false);

  // ====================================================================
  // 🔍 CONFIGURAR ESTADO INICIAL DE FILTROS
  // ====================================================================
  useEffect(() => {
    // Si viene del formulario, marcar que los filtros fueron aplicados para que se ejecute la búsqueda
    if (location.state?.preserveFilters) {
      setFiltrosAplicadosManualmente(true);
    } else if (!location.search) {
      // Si no viene del formulario y no hay parámetros en la URL, limpiar filtros
      const defaultFilters = { fechaDesde: hoy, fechaHasta: hoy };
      setFilters(defaultFilters);
      setFiltrosAplicados(defaultFilters);
      setCurrentPage(1);
      setFiltrosAplicadosManualmente(false);
      sessionStorage.removeItem('remitosFilters');
      sessionStorage.removeItem('remitosCurrentPage');
    }
  }, [location.pathname, location.state, location.search]);
  // ====================================================================

  // ====================================================================
  // 🔍 APLICAR FILTROS DESDE LA URL (CLIENTE → REMITOS?clienteId=2...)
  // ====================================================================
  useEffect(() => {
    const params = new URLSearchParams(location.search);

    if ([...params.keys()].length > 0) {
      const urlFilters = {
        numeroAsignado: params.get("numeroAsignado") || "",
        clienteId: params.get("clienteId") || "",
        destinoId: params.get("destinoId") || "",
        estadoId: params.get("estadoId") || "",
        prioridad: params.get("prioridad") || "",
        fechaDesde: params.get("fechaDesde") || hoy,
        fechaHasta: params.get("fechaHasta") || hoy,
      };

      setFilters(urlFilters);
      setFiltrosAplicados(urlFilters);
      setCurrentPage(1);
      setFiltrosAplicadosManualmente(true);

      // se hace la búsqueda inicial automáticamente
      fetchRemitos(1, urlFilters);
    }
  }, [location.search]);
  // ====================================================================


  const fetchRemitos = async (page = 1, filtrosForzados = null) => {
    try {
      setLoading(true);

      const appliedFilters = filtrosForzados || filtrosAplicados;

      const useClientSideDateFilter = !!(appliedFilters && (appliedFilters.fechaDesde || appliedFilters.fechaHasta));
      
      // Guardar la página solicitada para comparar después
      const requestedPage = page;
      
      let response;
      if (useClientSideDateFilter) {
        // Cuando hay filtros de fecha, SIEMPRE pedir página 1 con limit 1000 al backend
        // La paginación se hace en el cliente después de filtrar por fecha
        // Esto es necesario porque el filtro de fecha se aplica en el cliente, no en el backend
        response = await remitosService.getRemitos(1, 1000, appliedFilters);
      } else {
        // Cuando no hay filtros de fecha, usar la paginación del backend normalmente
        response = await remitosService.getRemitos(page, rowsPerPage, appliedFilters);
      }

      if (response && response.data) {
        if (useClientSideDateFilter) {
          const asIsoDay = (d) => {
            if (!d) return null;
            try {
              const dt = new Date(d);
              return `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`;
            } catch {
              return null;
            }
          };

          const desde = appliedFilters.fechaDesde || null;
          const hasta = appliedFilters.fechaHasta || null;

          const filteredData = response.data.filter(r => {
            const day = asIsoDay(r.fechaEmision);
            if (!day) return false;
            if (desde && hasta) return day >= desde && day <= hasta;
            if (desde) return day >= desde;
            if (hasta) return day <= hasta;
            return true;
          });

          const totalItems = filteredData.length;
          const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
          // Si la página solicitada es mayor que el total de páginas, usar la última página disponible
          // Si la página solicitada es menor a 1, usar 1
          const currentPageSafe = page > totalPages ? totalPages : (page < 1 ? 1 : page);
          const start = (currentPageSafe - 1) * rowsPerPage;
          const pageData = filteredData.slice(start, start + rowsPerPage);

          setRemitos({ data: pageData, totalItems, totalPages, currentPage: currentPageSafe });
          // Solo actualizar currentPage si la página calculada es diferente de la solicitada
          // Esto solo ocurre si la página solicitada está fuera de rango (mayor que totalPages o menor que 1)
          // No actualizar si la página solicitada es válida para evitar loops infinitos
          if (currentPageSafe !== requestedPage) {
            isUpdatingPageRef.current = true;
            setCurrentPage(currentPageSafe);
            // Resetear el flag después de que React procese la actualización
            setTimeout(() => {
              isUpdatingPageRef.current = false;
            }, 100);
          }
        } else {
          // Cuando no hay filtros de fecha del lado del cliente, usar directamente la respuesta del backend
          // El backend ya maneja la paginación correctamente
          setRemitos(response);
          // Solo actualizar currentPage si el backend devuelve una página diferente de la solicitada
          // Esto solo ocurre si la página solicitada está fuera de rango
          if (response.currentPage !== requestedPage) {
            isUpdatingPageRef.current = true;
            setCurrentPage(response.currentPage);
            // Resetear el flag después de que React procese la actualización
            setTimeout(() => {
              isUpdatingPageRef.current = false;
            }, 100);
          }
        }
      } else {
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
    sessionStorage.setItem('remitosFilters', JSON.stringify(filtrosAplicados));
  }, [filtrosAplicados]);

  useEffect(() => {
    sessionStorage.setItem('remitosCurrentPage', currentPage.toString());
  }, [currentPage]);

  // Solo buscar remitos si los filtros han sido aplicados manualmente o si se viene del formulario
  useEffect(() => {
    // Solo ejecutar si:
    // 1. Los filtros fueron aplicados manualmente, O
    // 2. Se viene del formulario (preserveFilters), O
    // 3. Hay parámetros en la URL (ya manejado en otro useEffect)
    // Y no estamos actualizando la página desde fetchRemitos (para evitar loops)
    if (filtrosAplicadosManualmente || location.state?.preserveFilters) {
      // Si estamos actualizando la página desde fetchRemitos, no ejecutar
      if (isUpdatingPageRef.current) {
        return;
      }
      fetchRemitos(currentPage);
    }
  }, [currentPage, filtrosAplicados, rowsPerPage, filtrosAplicadosManualmente, location.state?.preserveFilters]);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    const defaultFilters = { fechaDesde: hoy, fechaHasta: hoy };
    setFilters(defaultFilters);
    setFiltrosAplicados(defaultFilters);
    setFiltrosAplicadosManualmente(false);
    setCurrentPage(1);
    setRemitos({ data: [], totalItems: 0, totalPages: 1, currentPage: 1 });
    sessionStorage.setItem('remitosFilters', JSON.stringify(defaultFilters));
    sessionStorage.setItem('remitosCurrentPage', '1');
  };

  const hayAlgunFiltro = (f) => {
    if (!f) return false;
    const keys = ['numeroAsignado','clienteId','destinoId','estadoId','prioridad','fechaDesde','fechaHasta'];
    return keys.some(k => {
      const v = f[k];
      return v !== undefined && v !== null && v !== '';
    });
  };

  const handleSearch = async () => {
    if (!hayAlgunFiltro(filters)) {
      showNotification('Debe seleccionar al menos un filtro', 'info');
      return;
    }
    setFiltrosAplicados(filters);
    setFiltrosAplicadosManualmente(true);
    setCurrentPage(1);
  };

  const handleDeleteClick = (remito) => {
    setRemitoToDelete(remito);
  };

  const handleDeleteConfirm = async () => {
    try {
      await remitosService.deleteRemito(remitoToDelete.id);
      showNotification('Remito eliminado exitosamente', 'success');
      // Solo refrescar si hay filtros aplicados
      if (filtrosAplicadosManualmente || location.state?.preserveFilters) {
        await fetchRemitos(currentPage);
      }
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

  const handleChangePage = (event, value) => {
    setCurrentPage(value);
  };

  if (loading) return (
    <div className={styles.container}>
      <LoadingState title="remitos" />
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <SectionHeader
          title="Remitos"
          buttonText="Nuevo Remito"
          onAdd={() => navigate("/remitos/nuevo")}
        />
        
        <RemitosFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          onSearch={handleSearch}
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
            {remitos.data.length > 0 ? remitos.data.map(remito => (
              <EntityCard
                key={remito.id}
                title={`Remito ${remito.numeroAsignado}`}
                subtitle={remito.cliente?.razonSocial || 'Sin cliente'}
                icon={<FileText size={24}/>}
                fields={[
                  { 
                    label: "Destino", 
                    value: remito.destino 
                      ? `${remito.destino.nombre}, ${remito.destino.provincia}` 
                      : 'Sin destino'
                  },
                  { label: "Estado", value: remito.estado?.nombre || 'Sin estado' },
                  { label: "Prioridad", value: remito.prioridad },
                ]}
                onDelete={() => handleDeleteClick(remito)}
                onEdit={() => navigate(`/remitos/editar/${remito.id}`)}
                onView={() => navigate(`/remitos/detalle/${remito.id}`)}
              />
            )) : (
              <Box sx={{ 
                textAlign: 'center', 
                color: '#6B7280', 
                py: 10, 
                gridColumn: '1 / -1' 
              }}>
                {filtrosAplicadosManualmente || location.state?.preserveFilters 
                  ? 'No hay resultados' 
                  : 'Aplica al menos un filtro para buscar remitos'}
              </Box>
            )}
          </Box>
        ) : (/* Vista Desktop - Tabla MUI */
          <Box sx={{ mx: 2 }}>
            <TableContainer component={Paper}>
              <Table aria-label="tabla de remitos">
                <TableHead>
                  <TableRow>
                    <TableCell>Número</TableCell>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Destino</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Prioridad</TableCell>
                    <TableCell sx={{ width: 72 }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {remitos.data.length === 0 ? (
                    <TableRow>
                      <TableCell 
                        colSpan={6} 
                        sx={{textAlign: "center", paddingY: "26px"}}
                      >
                        {filtrosAplicadosManualmente || location.state?.preserveFilters 
                          ? 'No hay resultados' 
                          : 'Aplica al menos un filtro para buscar remitos'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    remitos.data.map((remito) => (
                      <TableRow 
                        key={remito.id} 
                        hover 
                        onClick={() => navigate(`/remitos/detalle/${remito.id}`)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell sx={{fontWeight: "bold"}}>{remito.numeroAsignado}</TableCell>
                        <TableCell>{remito.cliente?.razonSocial || 'Sin cliente'}</TableCell>
                        <TableCell>
                          {remito.destino 
                            ? `${remito.destino.nombre}, ${remito.destino.provincia}` 
                            : 'Sin destino'
                          }
                        </TableCell>
                        <TableCell>{remito.estado?.nombre || 'Sin estado'}</TableCell>
                        <TableCell>
                          <span className={getPrioridadClass(remito.prioridad, styles)}>
                            {remito.prioridad}
                          </span>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: "middle" }} onClick={(e) => e.stopPropagation()}>
                          <MenuItem
                            handleOpenDialog={() => handleDeleteClick(remito)}
                            handleOpenDetails={() => navigate(`/remitos/detalle/${remito.id}`)}
                            id={remito.id}
                            module="remitos"
                          >
                            <FileText className="text-gray-500 hover:text-gray-700 size-4" />
                          </MenuItem>
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
        <PaginationEntity
          entity="remitos"
          page={currentPage}
          totalPages={remitos.totalPages}
          rowsPerPage={rowsPerPage}
          filtered={remitos.data}
          handleChangePage={handleChangePage}
          setRowsPerPage={setRowsPerPage}
          setPage={setCurrentPage}
          totalItems={remitos.totalItems}
        />
      </div>

      {remitoToDelete && (
        <ConfirmDialog
          open={!!remitoToDelete}
          title="Confirmar eliminación"
          message={
            <div>
              <div>¿Estás seguro que deseas eliminar el remito número "{remitoToDelete.numeroAsignado}"?</div>
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
