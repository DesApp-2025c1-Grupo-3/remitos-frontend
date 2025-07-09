import React, { useState, useEffect } from 'react';
import { getVolumenPorClientePeriodo } from '../../services/reportesService';
import { useNotification } from '../../contexts/NotificationContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import styles from '../../components/RemitosFilters/RemitosFilters.module.css';
import { clientesService } from '../../services/clientesService';

const ReporteVolumenClientePeriodo: React.FC = () => {
  const [filtros, setFiltros] = useState({ clienteId: '', fechaDesde: '', fechaHasta: '' });
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState<{ id: number; razonSocial: string | null }[]>([]);
  const [clienteSearchTerm, setClienteSearchTerm] = useState('');
  const [showClienteDropdown, setShowClienteDropdown] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    const loadClientes = async () => {
      try {
        const res = await clientesService.getClientes();
        setClientes(res.data);
      } catch (e) {
        showNotification('Error al cargar clientes', 'error');
      }
    };
    loadClientes();
  }, [showNotification]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowClienteDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const handleClienteSelect = (cliente: { id: number; razonSocial: string | null }) => {
    setFiltros({ ...filtros, clienteId: cliente.id.toString() });
    setClienteSearchTerm(cliente.razonSocial || '');
    setShowClienteDropdown(false);
  };

  const handleBuscar = async () => {
    setLoading(true);
    try {
      const res = await getVolumenPorClientePeriodo(filtros);
      setData(res.data);
      if (Array.isArray(res.data) && res.data.length === 0) {
        showNotification('No hay datos para los filtros seleccionados.', 'info');
      }
    } catch (err) {
      showNotification('Error al obtener el reporte de volumen.', 'error');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLimpiar = () => {
    setFiltros({ clienteId: '', fechaDesde: '', fechaHasta: '' });
    setClienteSearchTerm('');
    setData([]);
  };

  const filteredClientes = clientes.filter(cliente =>
    cliente.razonSocial?.toLowerCase().includes(clienteSearchTerm.toLowerCase()) || false
  );

  return (
    <div>
      <h3 style={{ fontWeight: 600, fontSize: '1.3rem', marginBottom: 16 }}>Volumen total de mercadería por cliente/período</h3>
      <div className={styles.filtersContainer}>
        <div className={styles.filtersHeader}>
          <div className={styles.filtersTitle}>Filtros de búsqueda</div>
          <button className={styles.clearFiltersBtn} onClick={handleLimpiar} title="Limpiar filtros">Limpiar</button>
        </div>
        <div className={styles.filtersGrid}>
          {/* Filtro por fecha desde */}
          <div className={styles.filterField}>
            <label className={styles.label}>Fecha desde</label>
            <input
              name="fechaDesde"
              type="date"
              value={filtros.fechaDesde}
              onChange={handleChange}
              className={styles.input}
            />
          </div>
          {/* Filtro por fecha hasta */}
          <div className={styles.filterField}>
            <label className={styles.label}>Fecha hasta</label>
            <input
              name="fechaHasta"
              type="date"
              value={filtros.fechaHasta}
              onChange={handleChange}
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
                onChange={e => {
                  setClienteSearchTerm(e.target.value);
                  setShowClienteDropdown(true);
                  if (!e.target.value) setFiltros({ ...filtros, clienteId: '' });
                }}
                onFocus={() => setShowClienteDropdown(true)}
                placeholder="Buscar cliente..."
                className={styles.input}
              />
              {showClienteDropdown && (
                <div className={styles.dropdown}>
                  {filteredClientes.length > 0 ? (
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
        </div>
        <div style={{ marginTop: 16 }}>
          <button onClick={handleBuscar} disabled={loading} className={styles.clearFiltersBtn} style={{ background: '#1F7A3D', color: '#fff', borderColor: '#1F7A3D' }}>
            Buscar
          </button>
        </div>
      </div>
      <div style={{ width: '100%', height: 300, marginTop: 24 }}>
        {data.length > 0 && (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="cliente" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="volumenTotal" fill="#8884d8" name="Volumen Total" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default ReporteVolumenClientePeriodo; 