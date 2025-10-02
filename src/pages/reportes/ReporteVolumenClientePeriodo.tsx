import React, { useState, useEffect } from 'react';
import { getVolumenPorClientePeriodo } from '../../services/reportesService';
import { useNotification } from '../../contexts/NotificationContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import styles from '../../components/RemitosFilters/RemitosFilters.module.css';
import { clientesService } from '../../services/clientesService';
import { ClienteSelectModal } from '../../components/ClienteSelectModal';

const ReporteVolumenClientePeriodo: React.FC = () => {
  const [filtros, setFiltros] = useState({ clienteId: '', fechaDesde: '', fechaHasta: '' });
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState<{ id: number; razonSocial: string | null }[]>([]);
  const [clienteSearchTerm, setClienteSearchTerm] = useState('');
  const [showClienteDropdown, setShowClienteDropdown] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const { showNotification } = useNotification();
  const [modalCliente, setModalCliente] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<any>(null);

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

  // Sincronizar clienteSeleccionado con filtros
  useEffect(() => {
    if (filtros.clienteId) {
      const cliente = clientes.find(c => c.id.toString() === filtros.clienteId);
      if (cliente && (!clienteSeleccionado || clienteSeleccionado.id !== cliente.id)) {
        setClienteSeleccionado(cliente);
      }
    } else {
      setClienteSeleccionado(null);
    }
  }, [filtros.clienteId, clientes, clienteSeleccionado]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const handleClienteSelect = (cliente: any) => {
    setFiltros({ ...filtros, clienteId: cliente.id.toString() });
    setClienteSeleccionado(cliente);
    setModalCliente(false);
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
    setClienteSeleccionado(null);
    setData([]);
    setModalCliente(false);
  };

  const filteredClientes = clientes.filter(cliente =>
    cliente.razonSocial?.toLowerCase().includes(clienteSearchTerm.toLowerCase()) || false
  );

  return (
    <div style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <h3 style={{ fontWeight: 600, fontSize: '1.3rem', marginBottom: '1rem', color: '#5a5a65', padding: '0 2rem' }}>Volumen total de mercadería por cliente/período</h3>
      <div className={styles.filtersContainer} style={{ margin: '0 2rem' }}>
        <div className={styles.filtersHeader}>
          <div className={styles.filtersTitle}>Filtros de búsqueda</div>
          <button className={styles.clearFiltersBtn} onClick={handleLimpiar} title="Limpiar filtros">Limpiar</button>
        </div>
        <div className={styles.filtersGrid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
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
            <div>
              <input
                type="text"
                value={clienteSeleccionado ? clienteSeleccionado.razonSocial : ''}
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
                clienteSeleccionado={clienteSeleccionado}
              />
            </div>
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <button onClick={handleBuscar} disabled={loading} className={styles.clearFiltersBtn} style={{ background: '#FF6B35', color: '#fff', borderColor: '#FF6B35' }}>
            Buscar
          </button>
        </div>
      </div>
      <div style={{ width: '100%', maxWidth: '100%', height: 400, marginTop: '1.5rem', padding: '0 2rem', boxSizing: 'border-box' }}>
        {data.length > 0 && (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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