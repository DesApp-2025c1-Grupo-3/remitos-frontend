import React, { useState, useEffect } from 'react';
import { getDistribucionGeografica } from '../../services/reportesService';
import { georefService } from '../../services/destinosService';
import styles from '../../components/RemitosFilters/RemitosFilters.module.css';
import tableStyles from '../../styles/table.module.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ReporteDistribucionTabla: React.FC = () => {
  const [filtros, setFiltros] = useState({ pais: '', provincia: '', localidad: '' });
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Mostrar 10 items por página
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
    setCurrentPage(1); // Resetear a la primera página
  };

  // Lógica de paginación
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Resetear a la primera página cuando cambien los datos
  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  return (
    <div style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <h3 style={{ fontWeight: 600, fontSize: '1.3rem', marginBottom: '1rem', color: '#5a5a65', padding: '0 2rem' }}>Distribución geográfica de orígenes y destinos</h3>
      <div className={styles.filtersContainer} style={{ marginBottom: '1.5rem', margin: '0 2rem 1.5rem 2rem' }}>
        <div className={styles.filtersHeader}>
          <span className={styles.filtersTitle}>Filtros de búsqueda</span>
          <button className={styles.clearFiltersBtn} onClick={handleLimpiar}>Limpiar</button>
        </div>
        <div className={styles.filtersGrid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
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
        <button onClick={handleBuscar} disabled={loading} style={{ marginTop: 16, width: 120, background: '#FF6B35', color: 'white', border: 'none', borderRadius: 6, padding: '8px 0', fontWeight: 600 }}>Buscar</button>
      </div>
      <div className={tableStyles.tableContainer} style={{ width: '100%', maxWidth: '100%', padding: '0 2rem', boxSizing: 'border-box' }}>
        <table className={tableStyles.table}>
          <thead>
            <tr>
              <th>País</th>
              <th>Provincia</th>
              <th>Localidad</th>
              <th>Destino</th>
              <th>Cantidad de Envíos</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr><td colSpan={5} className={tableStyles.emptyTableMessage}>Sin datos</td></tr>
            )}
            {currentData.map((row, i) => (
              <tr key={startIndex + i}>
                <td data-label="País">{row.destino || '-'}</td>
                <td data-label="Provincia">{row.provincia || '-'}</td>
                <td data-label="Localidad">{row.localidad || '-'}</td>
                <td data-label="Destino">{row.pais || '-'}</td>
                <td data-label="Cantidad de Envíos">{row.cantidad || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Controles de paginación */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            marginTop: '1rem',
            padding: '1rem',
            background: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{
              textAlign: 'center',
              fontSize: '0.875rem',
              color: '#6b7280',
              fontWeight: '500'
            }}>
              Mostrando {startIndex + 1} - {Math.min(endIndex, data.length)} de {data.length} registros
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.5rem',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  background: currentPage === 1 ? '#f3f4f6' : 'white',
                  border: '1px solid #d1d5db',
                  color: currentPage === 1 ? '#9ca3af' : '#374151',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '40px',
                  height: '40px',
                  opacity: currentPage === 1 ? 0.5 : 1
                }}
              >
                <ChevronLeft size={16} />
              </button>
              
              {/* Números de página */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  style={{
                    background: currentPage === page ? '#FF6B35' : 'white',
                    border: `1px solid ${currentPage === page ? '#FF6B35' : '#d1d5db'}`,
                    color: currentPage === page ? 'white' : '#374151',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '40px',
                    height: '40px'
                  }}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                  background: currentPage === totalPages ? '#f3f4f6' : 'white',
                  border: '1px solid #d1d5db',
                  color: currentPage === totalPages ? '#9ca3af' : '#374151',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '40px',
                  height: '40px',
                  opacity: currentPage === totalPages ? 0.5 : 1
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReporteDistribucionTabla; 