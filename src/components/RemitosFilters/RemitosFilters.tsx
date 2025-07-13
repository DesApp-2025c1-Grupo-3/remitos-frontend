import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, ChevronDown, ChevronUp } from 'lucide-react';
import styles from './RemitosFilters.module.css';
import { clientesService } from '../../services/clientesService';
import { destinosService } from '../../services/destinosService';
import { estadosService } from '../../services/estadosService';
import { RemitosFilters as RemitosFiltersType } from '../../services/remitosService';
import { ClienteSelectModal } from '../ClienteSelectModal';
import { DestinoSelectModal } from '../DestinoSelectModal';

interface Cliente {
  id: number;
  razonSocial: string;
  cuit_rut: string;
  direccion: string;
}

interface Destino {
  id: number;
  nombre: string;
  provincia: string;
  localidad: string;
  direccion: string;
}

interface Estado {
  id: number;
  nombre: string;
}

interface RemitosFiltersProps {
  filters: RemitosFiltersType;
  onFiltersChange: (filters: RemitosFiltersType) => void;
  onClearFilters: () => void;
}

export const RemitosFilters: React.FC<RemitosFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters
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
  const [isCollapsed, setIsCollapsed] = useState(true);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

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
          direccion: cliente.direccion || ''
        }));
        setClientes(clientesAdaptados);
        
        // Si hay un clienteId en los filtros, buscar y establecer el cliente seleccionado
        if (filters.clienteId) {
          const cliente = clientesAdaptados.find(c => c.id === filters.clienteId);
          if (cliente) {
            setSelectedCliente(cliente);
          }
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
          provincia: destino.provincia || '',
          localidad: destino.localidad || '',
          direccion: destino.direccion || ''
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

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

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
    setSelectedCliente(cliente);
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
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Eliminar la lógica de selectedCliente basada en clientes.find
  const selectedEstado = estados.find(e => e.id === filters.estadoId);

  return (
    <div className={isCollapsed ? `${styles.filtersContainer} ${styles.collapsed}` : styles.filtersContainer}>
      <div className={styles.filtersHeader}>
        <div className={styles.filtersTitle}>
          <Search size={20} />
          {isCollapsed ? <span style={{marginLeft: 6, fontWeight: 500, fontSize: '1rem'}}>Filtros</span> : <span>Filtros de búsqueda</span>}
          <button 
            className={styles.toggleBtn}
            onClick={toggleCollapse}
            title={isCollapsed ? "Expandir filtros" : "Colapsar filtros"}
            style={{marginLeft: 8}}
          >
            {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </div>
        {!isCollapsed && (
          <div className={styles.headerActions}>
            <button 
              className={styles.clearFiltersBtn}
              onClick={handleClearFilters}
              title="Limpiar filtros"
            >
              <X size={16} />
              Limpiar
            </button>
          </div>
        )}
      </div>

      <div className={`${styles.filtersGrid} ${isCollapsed ? styles.collapsed : ''}`}>
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
              value={selectedCliente ? selectedCliente.razonSocial : ''}
              readOnly
              onClick={() => setModalCliente(true)}
              placeholder="Seleccionar cliente..."
              className={styles.input}
              style={{ cursor: 'pointer', background: '#e5e7eb' }}
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
              style={{ cursor: 'pointer', background: '#e5e7eb' }}
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

        {/* Filtro por fecha */}
        <div className={styles.filterField}>
          <label className={styles.label}>Fecha</label>
          <input
            type="date"
            value={filters.fechaEmision || ''}
            onChange={(e) => handleInputChange('fechaEmision', e.target.value || undefined)}
            className={styles.input}
          />
        </div>
      </div>
    </div>
  );
}; 