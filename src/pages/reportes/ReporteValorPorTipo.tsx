import React, { useState, useEffect, useRef } from 'react';
import { getValorPorTipoMercaderia } from '../../services/reportesService';
import { clientesService } from '../../services/clientesService';
import styles from '../../components/RemitosFilters/RemitosFilters.module.css';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TIPOS_MERCADERIA = [
  'Automotriz',
  'Amoblamientos',
  'Alimentos',
  'Textil',
  'Materiales Construcción',
  'Electrónica',
  'Químicos',
  'Otros',
];

const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#b6e880', '#00bcd4', '#ffb6b6', '#a4de6c',
];

const ReporteValorPorTipo: React.FC = () => {
  const [filtros, setFiltros] = useState({ clienteId: '', fechaDesde: '', fechaHasta: '', tipos: [] as string[] });
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState<{ id: number; razonSocial: string | null }[]>([]);
  const [clienteSearchTerm, setClienteSearchTerm] = useState('');
  const [showClienteDropdown, setShowClienteDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadClientes = async () => {
      const res = await clientesService.getClientes();
      setClientes(res.data);
    };
    loadClientes();
  }, []);

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

  const handleTipoChange = (tipo: string) => {
    setFiltros(f => ({ ...f, tipos: f.tipos.includes(tipo) ? f.tipos.filter(t => t !== tipo) : [...f.tipos, tipo] }));
  };

  const handleBuscar = async () => {
    setLoading(true);
    try {
      const params = { ...filtros };
      if (filtros.tipos.length > 0) params['tipos'] = filtros.tipos;
      const res = await getValorPorTipoMercaderia(params);
      setData(res.data);
    } catch (err) {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLimpiar = () => {
    setFiltros({ clienteId: '', fechaDesde: '', fechaHasta: '', tipos: [] });
    setData([]);
    setClienteSearchTerm('');
  };

  const filteredClientes = clientes.filter(cliente =>
    cliente.razonSocial?.toLowerCase().includes(clienteSearchTerm.toLowerCase()) || false
  );

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div style={{ background: 'white', border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
          <div style={{ fontWeight: 600, color: payload[0].color }}>{d.tipo}</div>
          <div>Cantidad: {d.cantidad || '-'}</div>
          <div>Valor Total: ${d.valorTotal?.toLocaleString('es-AR') || '-'}</div>
          <div>Valor Promedio: ${d.valorPromedio?.toLocaleString('es-AR') || '-'}</div>
          <div>Volumen Total: {d.volumenTotal ? `${d.volumenTotal} m³` : '-'}</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <h3 style={{ fontWeight: 600, fontSize: '1.3rem', marginBottom: 16 }}>Valor declarado por tipo de mercadería</h3>
      <div className={styles.filtersContainer} style={{ maxWidth: 900, margin: '0 auto', marginBottom: 24 }}>
        <div className={styles.filtersHeader}>
          <span className={styles.filtersTitle}>Filtros de búsqueda</span>
          <button className={styles.clearFiltersBtn} onClick={handleLimpiar}>Limpiar</button>
        </div>
        <div className={styles.filtersGrid}>
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
                        onClick={() => {
                          setFiltros({ ...filtros, clienteId: cliente.id.toString() });
                          setClienteSearchTerm(cliente.razonSocial || '');
                          setShowClienteDropdown(false);
                        }}
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
          <label className={styles.label} style={{ marginBottom: 8, display: 'block' }}>Tipos de Mercadería:</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, background: '#fafafa', borderRadius: 8, padding: 12, border: '1px solid #e5e7eb' }}>
            {TIPOS_MERCADERIA.map((tipo, i) => (
              <label key={tipo} style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
                <input
                  type="checkbox"
                  checked={filtros.tipos.includes(tipo)}
                  onChange={() => handleTipoChange(tipo)}
                  style={{ accentColor: COLORS[i % COLORS.length] }}
                />
                {tipo}
              </label>
            ))}
          </div>
        </div>
        <button onClick={handleBuscar} disabled={loading} style={{ marginTop: 16, width: 120, background: '#256029', color: 'white', border: 'none', borderRadius: 6, padding: '8px 0', fontWeight: 600 }}>Buscar</button>
      </div>
      <div style={{ width: '100%', height: 350, marginTop: 24 }}>
        {data.length > 0 && (
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={data}
                dataKey="valorTotal"
                nameKey="tipo"
                cx="50%"
                cy="50%"
                outerRadius={120}
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