import React, { useState, useEffect } from 'react';
import { getDistribucionGeografica } from '../../services/reportesService';
import { georefService } from '../../services/destinosService';
import styles from '../../components/RemitosFilters/RemitosFilters.module.css';

const ReporteDistribucionTabla: React.FC = () => {
  const [filtros, setFiltros] = useState({ pais: '', provincia: '', localidad: '' });
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [paises] = useState([
    { id: 'Argentina', nombre: 'Argentina' },
    { id: 'Brasil', nombre: 'Brasil' },
  ]);
  const [provincias, setProvincias] = useState<any[]>([]);
  const [localidades, setLocalidades] = useState<any[]>([]);

  useEffect(() => {
    setFiltros(f => ({ ...f, provincia: '', localidad: '' }));
    setProvincias([]);
    setLocalidades([]);
    if (filtros.pais === 'Argentina') {
      georefService.getProvincias().then(setProvincias);
    } else if (filtros.pais === 'Brasil') {
      georefService.getBrEstados().then(setProvincias);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros.pais]);

  useEffect(() => {
    setFiltros(f => ({ ...f, localidad: '' }));
    setLocalidades([]);
    if (filtros.pais === 'Argentina' && filtros.provincia) {
      georefService.getLocalidadesByProvincia(filtros.provincia).then(setLocalidades);
    } else if (filtros.pais === 'Brasil' && filtros.provincia) {
      georefService.getBrMunicipios(provincias.find((p: any) => p.nombre === filtros.provincia)?.id || '').then(setLocalidades);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros.provincia]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const handleBuscar = async () => {
    setLoading(true);
    try {
      const res = await getDistribucionGeografica(filtros);
      setData(res.data);
    } catch (err) {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLimpiar = () => {
    setFiltros({ pais: '', provincia: '', localidad: '' });
    setData([]);
    setProvincias([]);
    setLocalidades([]);
  };

  return (
    <div>
      <h3 style={{ fontWeight: 600, fontSize: '1.3rem', marginBottom: 16 }}>Distribución geográfica de orígenes y destinos</h3>
      <div className={styles.filtersContainer} style={{ maxWidth: 700, margin: '0 auto', marginBottom: 24 }}>
        <div className={styles.filtersHeader}>
          <span className={styles.filtersTitle}>Filtros de búsqueda</span>
          <button className={styles.clearFiltersBtn} onClick={handleLimpiar}>Limpiar</button>
        </div>
        <div className={styles.filtersGrid}>
          <div className={styles.filterField}>
            <label className={styles.label}>País</label>
            <select
              name="pais"
              value={filtros.pais}
              onChange={handleChange}
              className={styles.input}
            >
              <option value="">Seleccione un país</option>
              {paises.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>
          <div className={styles.filterField}>
            <label className={styles.label}>Provincia</label>
            <select
              name="provincia"
              value={filtros.provincia}
              onChange={handleChange}
              className={styles.input}
              disabled={!filtros.pais}
            >
              <option value="">Seleccione una provincia</option>
              {provincias.map((prov: any) => (
                <option key={prov.id} value={prov.nombre}>{prov.nombre}</option>
              ))}
            </select>
          </div>
          <div className={styles.filterField}>
            <label className={styles.label}>Localidad</label>
            <select
              name="localidad"
              value={filtros.localidad}
              onChange={handleChange}
              className={styles.input}
              disabled={!filtros.provincia}
            >
              <option value="">Seleccione una localidad</option>
              {localidades.map((loc: any) => (
                <option key={loc.id} value={loc.nombre}>{loc.nombre}</option>
              ))}
            </select>
          </div>
        </div>
        <button onClick={handleBuscar} disabled={loading} style={{ marginTop: 16, width: 120, background: '#256029', color: 'white', border: 'none', borderRadius: 6, padding: '8px 0', fontWeight: 600 }}>Buscar</button>
      </div>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: 8, overflow: 'hidden' }}>
          <thead style={{ background: '#f3f4f6' }}>
            <tr>
              <th style={{ padding: 10, textAlign: 'left' }}>País</th>
              <th style={{ padding: 10, textAlign: 'left' }}>Provincia</th>
              <th style={{ padding: 10, textAlign: 'left' }}>Localidad</th>
              <th style={{ padding: 10, textAlign: 'left' }}>Destino</th>
              <th style={{ padding: 10, textAlign: 'left' }}>Cantidad de Envíos</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 20, color: '#888' }}>Sin datos</td></tr>
            )}
            {data.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: 10 }}>{row.pais || '-'}</td>
                <td style={{ padding: 10 }}>{row.provincia || '-'}</td>
                <td style={{ padding: 10 }}>{row.localidad || '-'}</td>
                <td style={{ padding: 10 }}>{row.destino || '-'}</td>
                <td style={{ padding: 10 }}>{row.cantidad || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReporteDistribucionTabla; 