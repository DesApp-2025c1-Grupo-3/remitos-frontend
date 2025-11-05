import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, X, ChevronDown, ChevronUp, ListFilter, Filter } from 'lucide-react';
import { Button, Collapse, Box, Paper } from '@mui/material';
import styles from './RemitosFilters.module.css';
import { clientesService } from '../../services/clientesService';
import { destinosService } from '../../services/destinosService';
import { estadosService } from '../../services/estadosService';
import { RemitosFilters as RemitosFiltersType } from '../../services/remitosService';
import { ClienteSelectModal } from '../ClienteSelectModal';
import { DestinoSelectModal } from '../DestinoSelectModal';
import type { Cliente as ClienteService } from '../../services/clientesService';
import type { Destino as DestinoService } from '../../services/destinosService';

type Cliente = ClienteService;
type Destino = DestinoService;

interface Estado {
  id: number;
  nombre: string;
}

interface RemitosFiltersProps {
  filters: RemitosFiltersType;
  onFiltersChange: (filters: RemitosFiltersType) => void;
  onClearFilters: () => void;
  onSearch?: () => void;
}

export const RemitosFilters: React.FC<RemitosFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters
  , onSearch
}) => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [destinos, setDestinos] = useState<Destino[]>([]);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [loadingEstados, setLoadingEstados] = useState(false);
  const [modalCliente, setModalCliente] = useState(false);
  const [modalDestino, setModalDestino] = useState(false);
  const [numeroAsignadoInput, setNumeroAsignadoInput] = useState(filters.numeroAsignado || '');
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [selectedDestino, setSelectedDestino] = useState<Destino | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Leer de localStorage si existe, si no, true
    const stored = localStorage.getItem('remitosFiltersCollapsed');
    return stored ? JSON.parse(stored) : true;
  });
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [clienteExtra, setClienteExtra] = useState<Cliente | null>(null);

  // Cargar clientes y estados al montar el componente
  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar clientes
        const clientesResponse = await clientesService.getClientes();
        // Adaptar los clientes del servicio al tipo local
        const clientesAdaptados = clientesResponse.data.map(cliente => ({
          id: cliente.id,
          razonSocial: cliente.razonSocial || '',
          cuit_rut: cliente.cuit_rut || '',
          direccion: cliente.direccion || '',
          tipoEmpresa: typeof cliente.tipoEmpresa === 'string' 
            ? { id: cliente.tipoEmpresaId || 0, nombre: cliente.tipoEmpresa }
            : cliente.tipoEmpresa,
          tipoEmpresaId: cliente.tipoEmpresaId || 0,
          activo: cliente.activo ?? true
        }));
        setClientes(clientesAdaptados);
        
        // Si hay un clienteId en los filtros y no coincide con el seleccionado, actualizar
        if (filters.clienteId) {
          if (!selectedCliente || selectedCliente.id !== filters.clienteId) {
            const cliente = clientesAdaptados.find(c => c.id === filters.clienteId);
            setSelectedCliente(cliente || null);
          }
        } else {
          setSelectedCliente(null);
        }
      } catch (error) {
        console.error('Error al cargar clientes:', error);
      }

      try {
        // Cargar destinos
        const destinosResponse = await destinosService.getDestinos();
        // Adaptar los destinos del servicio al tipo local
        const destinosAdaptados = destinosResponse.data.map(destino => ({
          id: destino.id,
          nombre: destino.nombre || '',
          pais: destino.pais || '',
          provincia: destino.provincia || '',
          localidad: destino.localidad || '',
          direccion: destino.direccion || '',
          activo: destino.activo ?? true,
          contactos: destino.contactos || [],
          createdAt: destino.createdAt,
          updatedAt: destino.updatedAt
        }));
        setDestinos(destinosAdaptados);
        
        // Si hay un destinoId en los filtros, buscar y establecer el destino seleccionado
        if (filters.destinoId) {
          const destino = destinosAdaptados.find(d => d.id === filters.destinoId);
          if (destino) {
            setSelectedDestino(destino);
          }
        }
      } catch (error) {
        console.error('Error al cargar destinos:', error);
      }

      try {
        setLoadingEstados(true);
        const estadosData = await estadosService.getEstados();
        setEstados(estadosData);
      } catch (error) {
        console.error('Error al cargar estados:', error);
      } finally {
        setLoadingEstados(false);
      }
    };

    loadData();
  }, [filters.clienteId]);

  // Si no está en la lista y hay clienteId, buscarlo por ID
  useEffect(() => {
    if (filters.clienteId && !clientes.find(c => c.id === filters.clienteId)) {
      clientesService.getClienteById(filters.clienteId)
        .then(cliente => setClienteExtra(cliente))
        .catch(() => setClienteExtra(null));
    } else {
      setClienteExtra(null);
    }
  }, [filters.clienteId, clientes]);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Calcular el cliente seleccionado a partir de filters.clienteId y clientes
  const clienteSeleccionado = useMemo(() => {
    if (!filters.clienteId) return null;
    return clientes.find(c => c.id === filters.clienteId) || clienteExtra;
  }, [filters.clienteId, clientes, clienteExtra]);

  // Guardar el estado de colapsado en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('remitosFiltersCollapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const handleInputChange = (field: keyof RemitosFiltersType, value: string | number | undefined) => {
    onFiltersChange({
      ...filters,
      [field]: value
    });
  };

  const handleNumeroAsignadoChange = (value: string) => {
    setNumeroAsignadoInput(value);
    
    // Limpiar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Crear nuevo timeout
    timeoutRef.current = setTimeout(() => {
      onFiltersChange({
        ...filters,
        numeroAsignado: value || undefined
      });
    }, 500); // 500ms de delay
  };

  const handleClienteSelect = (cliente: Cliente) => {
    handleInputChange('clienteId', cliente.id);
    setModalCliente(false);
  };

  const handleDestinoSelect = (destino: Destino) => {
    handleInputChange('destinoId', destino.id);
    setSelectedDestino(destino);
    setModalDestino(false);
  };

  const handleClearFilters = () => {
    onClearFilters();
    setModalCliente(false);
    setModalDestino(false);
    setNumeroAsignadoInput('');
    setSelectedCliente(null);
    setSelectedDestino(null);
    setClienteExtra(null);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Eliminar la lógica de selectedCliente basada en clientes.find
  const selectedEstado = estados.find(e => e.id === filters.estadoId);

  return (
    <Box sx={{ mb: 2, mx: 2 }}>
      {/* Botón de Filtros */}
      <Button
        variant="contained"
        onClick={toggleCollapse}
        sx={{
          display: "flex",
          alignItems: "center",
          backgroundColor: "white",
          color: "#5A5A65",
          boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.1)",
          borderRadius: "8px",
          border: "0.5px solid #C7C7C7",
          "&:hover": {
            backgroundColor: "#f5f5f5",
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)"
          },
          padding: "8px 20px",
          mb: 0
        }}
        startIcon={<ListFilter className={`size-5 ${isCollapsed ? "" : "rotate-180"} transition-all duration-200 ease-in`} />}
      >
        Filtros
      </Button>

      {/* Panel de Filtros Expandible */}
      <Collapse in={!isCollapsed} timeout="auto" unmountOnExit>
        <Box sx={{ mt: 2 }}>
          <Paper elevation={3} sx={{ p: 2.5, backgroundColor: "white", borderRadius: 2, boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.1)", border: "1px solid #c7c7c7" }}>
            <div className={styles.filtersGrid}>
        {/* Filtro por número de remito */}
        <div className={styles.filterField}>
          <label className={styles.label}>Número de remito</label>
          <input
            type="text"
            value={numeroAsignadoInput}
            onChange={(e) => handleNumeroAsignadoChange(e.target.value)}
            placeholder="Buscar por número..."
            className={styles.input}
          />
        </div>

        {/* Filtro por cliente */}
        <div className={styles.filterField}>
          <label className={styles.label}>Cliente</label>
          <div>
            <input
              type="text"
              value={clienteSeleccionado ? String(clienteSeleccionado.razonSocial ?? '') : ''}
              readOnly
              onClick={() => setModalCliente(true)}
              placeholder="Seleccionar cliente..."
              className={styles.input}
              style={{ cursor: 'pointer' }}
            />
            <ClienteSelectModal
              open={modalCliente}
              onClose={() => setModalCliente(false)}
              onSelect={handleClienteSelect}
              clienteSeleccionado={selectedCliente}
            />
          </div>
        </div>

        {/* Filtro por destino */}
        <div className={styles.filterField}>
          <label className={styles.label}>Destino</label>
          <div>
            <input
              type="text"
              value={selectedDestino ? `${selectedDestino.nombre}, ${selectedDestino.provincia}` : ''}
              readOnly
              onClick={() => setModalDestino(true)}
              placeholder="Seleccionar destino..."
              className={styles.input}
              style={{ cursor: 'pointer' }}
            />
            <DestinoSelectModal
              open={modalDestino}
              onClose={() => setModalDestino(false)}
              onSelect={handleDestinoSelect}
              destinoSeleccionado={selectedDestino}
            />
          </div>
        </div>

        {/* Filtro por estado */}
        <div className={styles.filterField}>
          <label className={styles.label}>Estado</label>
          <select
            value={filters.estadoId || ''}
            onChange={(e) => handleInputChange('estadoId', e.target.value ? parseInt(e.target.value) : undefined)}
            className={styles.input}
          >
            <option value="">Todos los estados</option>
            {loadingEstados ? (
              <option value="" disabled>Cargando...</option>
            ) : (
              estados.map(estado => (
                <option key={estado.id} value={estado.id}>
                  {estado.nombre}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Filtro por prioridad */}
        <div className={styles.filterField}>
          <label className={styles.label}>Prioridad</label>
          <select
            value={filters.prioridad || ''}
            onChange={(e) => handleInputChange('prioridad', e.target.value || undefined)}
            className={styles.input}
          >
            <option value="">Todas las prioridades</option>
            <option value="normal">Normal</option>
            <option value="alta">Alta</option>
            <option value="urgente">Urgente</option>
          </select>
        </div>

        {/* Filtro por fecha: Desde / Hasta */}
        <div className={styles.filterField}>
          <label className={styles.label}>Fecha desde</label>
          <input
            type="date"
            value={String(filters.fechaDesde ?? '')}
            onChange={(e) => handleInputChange('fechaDesde', e.target.value || undefined)}
            className={styles.input}
          />
        </div>

        <div className={styles.filterField}>
          <label className={styles.label}>Fecha hasta</label>
          <input
            type="date"
            value={String(filters.fechaHasta ?? '')}
            onChange={(e) => handleInputChange('fechaHasta', e.target.value || undefined)}
            className={styles.input}
          />
        </div>
            </div>

            {/* Botones de acción */}
            <Box 
              display="flex" 
              mt={2} 
              sx={{ 
                flexDirection: { xs: "column", sm: "row" }, 
                justifyContent: { xs: "flex-start", md: "flex-end" }, 
                gap: 1, 
                borderTop: "1px solid #EAEAEA", 
                pt: 2 
              }}
            >
              <Button 
                variant="outlined" 
                color="primary" 
                startIcon={<X size={16} />}
                sx={{ 
                  borderRadius: "8px",
                  padding: "10px 20px",
                  textTransform: "none",
                  borderColor: "#D0D0D5",
                  color: "#5A5A65",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  "&:hover": {
                    backgroundColor: "#F6F6F8",
                    borderColor: "#B0B0B0",
                  },
                  width: { xs: "100%", md: "auto"}
                }}
                onClick={handleClearFilters}
              >
                Limpiar filtros
              </Button>
              <Button 
                variant="text" 
                color="primary" 
                startIcon={<Filter size={16} />}
                sx={{
                  borderRadius: "8px",
                  padding: "10px 20px",
                  textTransform: "none",
                  backgroundColor: "#E65F2B",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  boxShadow: "none",
                  "&:hover": {
                    backgroundColor: "#C94715",
                    boxShadow: "none",
                  },
                  width: { xs: "100%", md: "auto"}
                }}
                onClick={() => onSearch && onSearch()}
              >
                Aplicar filtros
              </Button>
            </Box>
          </Paper>
        </Box>
      </Collapse>
    </Box>
  );
};