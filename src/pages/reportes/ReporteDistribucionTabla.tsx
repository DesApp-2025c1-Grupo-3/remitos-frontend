import React, { useState, useEffect } from 'react';
// Si usas notificaciones, puedes descomentar:
// import { useNotification } from '../../contexts/NotificationContext';
import styles from '../../components/RemitosFilters/RemitosFilters.module.css'; // Estilos para filtros (los mantenemos)

// Datos ficticios para simular la respuesta de la API
const DUMMY_DISTRIBUTION_DATA = [
  { id: 1, pais: 'Argentina', provincia: 'Buenos Aires', localidad: 'Ituzaingó', cantidadEnvios: 150, clienteId: 'CL001' },
  { id: 2, pais: 'Argentina', provincia: 'Buenos Aires', localidad: 'Morón', cantidadEnvios: 120, clienteId: 'CL002' },
  { id: 3, pais: 'Argentina', provincia: 'Buenos Aires', localidad: 'Castelar', cantidadEnvios: 80, clienteId: 'CL001' },
  { id: 4, pais: 'Argentina', provincia: 'Córdoba', localidad: 'Córdoba Capital', cantidadEnvios: 90, clienteId: 'CL003' },
  { id: 5, pais: 'Argentina', provincia: 'Santa Fe', localidad: 'Rosario', cantidadEnvios: 70, clienteId: 'CL002' },
  { id: 6, pais: 'Chile', provincia: 'Región Metropolitana', localidad: 'Santiago', cantidadEnvios: 60, clienteId: 'CL004' },
  { id: 7, pais: 'Brasil', provincia: 'São Paulo', localidad: 'São Paulo', cantidadEnvios: 110, clienteId: 'CL001' },
  { id: 8, pais: 'Uruguay', provincia: 'Montevideo', localidad: 'Montevideo', cantidadEnvios: 45, clienteId: 'CL005' },
  { id: 9, pais: 'Argentina', provincia: 'Buenos Aires', localidad: 'Haedo', cantidadEnvios: 50, clienteId: 'CL003' },
  { id: 10, pais: 'Argentina', provincia: 'Córdoba', localidad: 'Villa Carlos Paz', cantidadEnvios: 30, clienteId: 'CL004' },
];

const ReporteDistribucionTabla: React.FC = () => {
  const [filtros, setFiltros] = useState({ 
    clienteId: '', 
    pais: '', 
    provincia: '' 
  });
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  // const { showNotification } = useNotification(); // Si usas notificaciones

  const [paisesDisponibles, setPaisesDisponibles] = useState<string[]>([]);
  const [provinciasDisponibles, setProvinciasDisponibles] = useState<string[]>([]);

  useEffect(() => {
    const uniquePaises = Array.from(new Set(DUMMY_DISTRIBUTION_DATA.map(item => item.pais)));
    setPaisesDisponibles(uniquePaises);
    
    if (filtros.pais) {
      const uniqueProvincias = Array.from(new Set(
        DUMMY_DISTRIBUTION_DATA
          .filter(item => item.pais === filtros.pais)
          .map(item => item.provincia)
      ));
      setProvinciasDisponibles(uniqueProvincias);
    } else {
      const allUniqueProvincias = Array.from(new Set(DUMMY_DISTRIBUTION_DATA.map(item => item.provincia)));
      setProvinciasDisponibles(allUniqueProvincias);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros.pais]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFiltros(prevFiltros => ({ ...prevFiltros, [name]: value }));
  };

  const handleBuscar = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simula un retardo de la API

    let filteredData = [...DUMMY_DISTRIBUTION_DATA];

    // **LÓGICA DE BACKEND: FILTRADO POR PAÍS, PROVINCIA Y CLIENTE**
    // Cuando conectes a tu backend real, la función `getDistribucionGeografica`
    // debería enviar los `filtros` como parámetros de consulta a tu API.
    // Ejemplo de llamada a la API con los filtros:
    // const res = await getDistribucionGeografica(filtros);
    // setData(res.data);
    //
    // El backend recibirá estos filtros (pais, provincia, clienteId)
    // y aplicará la lógica de consulta a la base de datos para devolver
    // solo los envíos que coincidan con los criterios.

    if (filtros.pais) {
      filteredData = filteredData.filter(item => item.pais === filtros.pais);
    }
    if (filtros.provincia) {
      filteredData = filteredData.filter(item => item.provincia === filtros.provincia);
    }
    if (filtros.clienteId) {
      filteredData = filteredData.filter(item => item.clienteId === filtros.clienteId);
    }
    
    setData(filteredData);
    setLoading(false);
    
    // if (filteredData.length === 0) {
    //   showNotification('No hay datos para los filtros seleccionados.', 'info');
    // }
  };

  const handleLimpiar = () => {
    setFiltros({ clienteId: '', pais: '', provincia: '' });
    setData([]);
    const allUniqueProvincias = Array.from(new Set(DUMMY_DISTRIBUTION_DATA.map(item => item.provincia)));
    setProvinciasDisponibles(allUniqueProvincias);
  };

  return (
    <div>
      <h3>Distribución geográfica de orígenes y destinos</h3>
      <div className={styles.filtersContainer}>
        <div className={styles.filtersHeader}>
          <div className={styles.filtersTitle}>Filtros de búsqueda</div>
          <button className={styles.clearFiltersBtn} onClick={handleLimpiar} title="Limpiar filtros">Limpiar</button>
        </div>
        <div className={styles.filtersGrid}>
          {/* Filtro por País */}
          <div className={styles.filterField}>
            <label className={styles.label} htmlFor="pais-select">País</label>
            <select
              id="pais-select"
              name="pais"
              value={filtros.pais}
              onChange={handleChange}
              className={styles.input}
            >
              <option value="">Seleccione un país</option>
              {paisesDisponibles.map(pais => (
                <option key={pais} value={pais}>{pais}</option>
              ))}
            </select>
          </div>
          
          {/* Filtro por Provincia */}
          <div className={styles.filterField}>
            <label className={styles.label} htmlFor="provincia-select">Provincia</label>
            <select
              id="provincia-select"
              name="provincia"
              value={filtros.provincia}
              onChange={handleChange}
              className={styles.input}
              disabled={!filtros.pais && paisesDisponibles.length > 0}
            >
              <option value="">Seleccione una provincia</option>
              {provinciasDisponibles.map(provincia => (
                <option key={provincia} value={provincia}>{provincia}</option>
              ))}
            </select>
          </div>

          {/* Filtro por Cliente ID 
          <div className={styles.filterField}>
            <label className={styles.label} htmlFor="cliente-id-input">Cliente ID</label>
            <input 
              id="cliente-id-input"
              name="clienteId" 
              placeholder="Cliente ID"  Posible filtro para cliente en caso de agregarlo en la tabla.
              value={filtros.clienteId} 
              onChange={handleChange} 
              className={styles.input}
            />
          </div>*/} 
        </div>
        <div style={{ marginTop: 16 }}>
          <button onClick={handleBuscar} disabled={loading} className={styles.clearFiltersBtn} style={{ background: '#1F7A3D', color: '#fff', borderColor: '#1F7A3D' }}>
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      </div>

      {/* La tabla ahora sin clases de CSS externas para la tabla misma */}
      <div style={{ marginTop: 24, padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}> {/* Un contenedor básico para darle un poco de "aire" */}
        {data.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ padding: '8px', borderBottom: '1px solid #eee', textAlign: 'left' }}>País</th>
                <th style={{ padding: '8px', borderBottom: '1px solid #eee', textAlign: 'left' }}>Provincia</th>
                <th style={{ padding: '8px', borderBottom: '1px solid #eee', textAlign: 'left' }}>Localidad</th>
                <th style={{ padding: '8px', borderBottom: '1px solid #eee', textAlign: 'left' }}>Cantidad de Envíos</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id}>
                  <td style={{ padding: '8px', borderBottom: '1px solid #f5f5f5' }}>{item.pais}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #f5f5f5' }}>{item.provincia}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #f5f5f5' }}>{item.localidad}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #f5f5f5' }}>{item.cantidadEnvios}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No hay datos de distribución para mostrar. Aplica los filtros y busca.</p>
        )}
        {loading && <p>Cargando datos...</p>}
      </div>
    </div>
  );
};

export default ReporteDistribucionTabla;