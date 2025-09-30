import React, { useState, useEffect, useRef } from 'react';
import { getValorPorTipoMercaderia } from '../../services/reportesService';
import { clientesService } from '../../services/clientesService';
import { tipoMercaderiaService, TipoMercaderia } from '../../services/tipoMercaderiaService';
import styles from '../../components/RemitosFilters/RemitosFilters.module.css';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ClienteSelectModal } from '../../components/ClienteSelectModal';

const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#b6e880', '#00bcd4', '#ffb6b6', '#a4de6c',
];

const ReporteValorPorTipo: React.FC = () => {
  const [filtros, setFiltros] = useState({ clienteId: '', fechaDesde: '', fechaHasta: '', tipos: [] as number[] });
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState<{ id: number; razonSocial: string | null }[]>([]);
  const [tiposMercaderia, setTiposMercaderia] = useState<TipoMercaderia[]>([]);
  const [modalCliente, setModalCliente] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [clientesRes, tiposRes] = await Promise.all([
          clientesService.getClientes(),
          tipoMercaderiaService.getTiposMercaderia()
        ]);
        setClientes(clientesRes.data);
        setTiposMercaderia(tiposRes);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      }
    };
    loadData();
  }, []);

  // Eliminado: lógica de dropdown de cliente, ya no es necesaria

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const handleTipoChange = (tipoId: number) => {
    setFiltros(f => ({ ...f, tipos: f.tipos.includes(tipoId) ? f.tipos.filter(t => t !== tipoId) : [...f.tipos, tipoId] }));
  };

  const handleBuscar = async () => {
    setLoading(true);
    try {
      const { tipos, ...otherParams } = filtros;
      const params = { ...otherParams };
      
      // Agregar cada tipo como un parámetro separado para que Express los procese correctamente
      if (tipos.length > 0) {
        tipos.forEach((tipoId, index) => {
          params[`tipos[${index}]`] = tipoId;
        });
      }
      
      const res = await getValorPorTipoMercaderia(params);
      setData(res.data);
    } catch (err) {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClienteSelect = (cliente: any) => {
    setFiltros({ ...filtros, clienteId: cliente.id.toString() });
    setClienteSeleccionado(cliente);
    setModalCliente(false);
  };

  const handleLimpiar = () => {
    setFiltros({ clienteId: '', fechaDesde: '', fechaHasta: '', tipos: [] });
    setData([]);
    setClienteSeleccionado(null);
  };

  // Eliminado: lógica de filtrado de clientes para el dropdown

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div style={{ background: 'white', border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
          <div style={{ fontWeight: 600, color: payload[0].color }}>{d.tipo}</div>
          <div>Valor Total: ${d.valorTotal?.toLocaleString('es-AR') || '-'}</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <h3 style={{ fontWeight: 600, fontSize: '1.3rem', marginBottom: '1rem', color: '#5a5a65', padding: '0 2rem' }}>Valor declarado por tipo de mercadería</h3>
      <div className={styles.filtersContainer} style={{ marginBottom: '1.5rem', margin: '0 2rem 1.5rem 2rem' }}>
        <div className={styles.filtersHeader}>
          <span className={styles.filtersTitle}>Filtros de búsqueda</span>
          <button className={styles.clearFiltersBtn} onClick={handleLimpiar}>Limpiar</button>
        </div>
        <div className={styles.filtersGrid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
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
          <label className={styles.label} style={{ marginBottom: 8, display: 'block' }}>Tipos de Mercadería:</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, background: '#fafafa', borderRadius: 8, padding: 12, border: '1px solid #e5e7eb' }}>
            {tiposMercaderia.map((tipo, i) => (
              <label key={tipo.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
                <input
                  type="checkbox"
                  checked={filtros.tipos.includes(tipo.id)}
                  onChange={() => handleTipoChange(tipo.id)}
                  style={{ accentColor: COLORS[i % COLORS.length] }}
                />
                {tipo.nombre}
              </label>
            ))}
          </div>
        </div>
        <button onClick={handleBuscar} disabled={loading} style={{ marginTop: 16, width: 120, background: '#FF6B35', color: 'white', border: 'none', borderRadius: 6, padding: '8px 0', fontWeight: 600 }}>Buscar</button>
      </div>
      <div style={{ width: '100%', maxWidth: '100%', height: 400, marginTop: '1.5rem', padding: '0 2rem', boxSizing: 'border-box' }}>
        {data.length > 0 && (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={data}
                dataKey="valorTotal"
                nameKey="tipo"
                cx="50%"
                cy="50%"
                outerRadius={140}
                label={({ name }) => name}
              >
                {data.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default ReporteValorPorTipo; 