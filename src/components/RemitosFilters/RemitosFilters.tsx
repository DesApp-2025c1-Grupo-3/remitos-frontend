import React, { useState, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import styles from './RemitosFilters.module.css';
import { clientesService } from '../../services/clientesService';
import { estadosService } from '../../services/estadosService';
import { RemitosFilters as RemitosFiltersType } from '../../services/remitosService';

interface Cliente {
  id: number;
  razonSocial: string | null;
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
  const [estados, setEstados] = useState<Estado[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [loadingEstados, setLoadingEstados] = useState(false);
  const [showClienteDropdown, setShowClienteDropdown] = useState(false);
  const [clienteSearchTerm, setClienteSearchTerm] = useState('');
  const [numeroAsignadoInput, setNumeroAsignadoInput] = useState(filters.numeroAsignado || '');
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Cargar clientes y estados al montar el componente
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingClientes(true);
        const clientesResponse = await clientesService.getClientes();
        setClientes(clientesResponse.data);
      } catch (error) {
        console.error('Error al cargar clientes:', error);
      } finally {
        setLoadingClientes(false);
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
  }, []);

  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowClienteDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Sincronizar el input de número de remito con los filtros
  useEffect(() => {
    setNumeroAsignadoInput(filters.numeroAsignado || '');
  }, [filters.numeroAsignado]);

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

  const handleClearFilters = () => {
    onClearFilters();
    setClienteSearchTerm('');
    setNumeroAsignadoInput('');
  };

  const handleClienteSelect = (cliente: Cliente) => {
    handleInputChange('clienteId', cliente.id);
    setClienteSearchTerm(cliente.razonSocial || '');
    setShowClienteDropdown(false);
  };

  const filteredClientes = clientes.filter(cliente =>
    cliente.razonSocial?.toLowerCase().includes(clienteSearchTerm.toLowerCase()) || false
  );

  const selectedCliente = clientes.find(c => c.id === filters.clienteId);
  const selectedEstado = estados.find(e => e.id === filters.estadoId);

  return (
    <div className={styles.filtersContainer}>
      <div className={styles.filtersHeader}>
        <div className={styles.filtersTitle}>
          <Search size={20} />
          <span>Filtros de búsqueda</span>
        </div>
        <button 
          className={styles.clearFiltersBtn}
          onClick={handleClearFilters}
          title="Limpiar filtros"
        >
          <X size={16} />
          Limpiar
        </button>
      </div>

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
          <div className={styles.dropdownContainer} ref={dropdownRef}>
            <input
              type="text"
              value={clienteSearchTerm}
              onChange={(e) => {
                setClienteSearchTerm(e.target.value);
                if (!e.target.value) {
                  handleInputChange('clienteId', undefined);
                }
                setShowClienteDropdown(true);
              }}
              onFocus={() => setShowClienteDropdown(true)}
              placeholder="Buscar cliente..."
              className={styles.input}
            />
            {showClienteDropdown && (
              <div className={styles.dropdown}>
                {loadingClientes ? (
                  <div className={styles.dropdownItem}>Cargando...</div>
                ) : filteredClientes.length > 0 ? (
                  filteredClientes.map(cliente => (
                    <div
                      key={cliente.id}
                      className={styles.dropdownItem}
                      onClick={() => handleClienteSelect(cliente)}
                    >
                      {cliente.razonSocial || 'Sin razón social'}
                    </div>
                  ))
                ) : (
                  <div className={styles.dropdownItem}>No se encontraron clientes</div>
                )}
              </div>
            )}
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