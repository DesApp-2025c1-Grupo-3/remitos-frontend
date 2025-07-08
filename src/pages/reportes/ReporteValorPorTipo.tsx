import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
// import { useNotification } from '../../contexts/NotificationContext'; // Si usas notificaciones
import styles from '../../components/RemitosFilters/RemitosFilters.module.css'; // Estilos para filtros

// Datos ficticios para simular la respuesta de la API
const DUMMY_MERCADERIA_DATA = [
  { tipoMercaderia: 'Electrónica', cantidad: 250, valorDeclaradoTotal: 750000, volumenTotal: 1200, color: '#8884d8' },
  { tipoMercaderia: 'Textiles', cantidad: 400, valorDeclaradoTotal: 120000, volumenTotal: 800, color: '#82ca9d' },
  { tipoMercaderia: 'Alimentos Perecederos', cantidad: 180, valorDeclaradoTotal: 90000, volumenTotal: 600, color: '#ffc658' },
  { tipoMercaderia: 'Muebles', cantidad: 50, valorDeclaradoTotal: 300000, volumenTotal: 1500, color: '#ff7300' },
  { tipoMercaderia: 'Materiales de Construcción', cantidad: 100, valorDeclaradoTotal: 200000, volumenTotal: 2500, color: '#a4de6c' },
  { tipoMercaderia: 'Farmacéuticos', cantidad: 70, valorDeclaradoTotal: 400000, volumenTotal: 300, color: '#d0ed57' },
  { tipoMercaderia: 'Automotriz', cantidad: 30, valorDeclaradoTotal: 500000, volumenTotal: 900, color: '#57d0ed' },
  { tipoMercaderia: 'Químicos', cantidad: 40, valorDeclaradoTotal: 150000, volumenTotal: 400, color: '#ed57d0' },
];

const ReporteValorPorTipo: React.FC = () => {
  // Ahora, el filtro principal es un array de tipos de mercadería seleccionados
  const [filtros, setFiltros] = useState<string[]>([]); // Array de strings para los tipos seleccionados
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  // const { showNotification } = useNotification(); // Si usas notificaciones

  // Obtener todos los tipos de mercadería únicos disponibles para las opciones de filtro
  const todosLosTiposMercaderia = Array.from(new Set(DUMMY_MERCADERIA_DATA.map(item => item.tipoMercaderia)));

  useEffect(() => {
    // Al cargar el componente por primera vez, o si no hay filtros aplicados,
    // puedes optar por mostrar todos los datos o esperar la acción de "Buscar".
    // Para que el gráfico se muestre por defecto con todos los datos, podrías llamar a handleBuscar aquí.
    // handleBuscar(); // Descomentar si quieres que cargue al inicio
  }, []);

  // Maneja la selección/deselección de checkboxes de tipo de mercadería
  const handleTipoMercaderiaChange = (tipo: string) => {
    setFiltros(prevFiltros => {
      if (prevFiltros.includes(tipo)) {
        return prevFiltros.filter(t => t !== tipo); // Deseleccionar
      } else {
        return [...prevFiltros, tipo]; // Seleccionar
      }
    });
  };

  const handleBuscar = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simula un retardo de la API

    let filteredData = [...DUMMY_MERCADERIA_DATA];

    // **LÓGICA DE BACKEND: FILTRADO POR TIPOS DE MERCADERÍA**
    // Cuando conectes a tu backend real, la función `getValorPorTipoMercaderia`
    // debería aceptar un array o una cadena de tipos de mercadería (ej. 'Electronica,Textiles')
    // como parámetro de consulta.
    // Ejemplo de llamada a la API con los filtros:
    // const res = await getValorPorTipoMercaderia({ tiposMercaderia: filtros.join(',') });
    // setData(res.data);
    //
    // El backend recibirá esta lista de tipos, y en tu consulta SQL/ORM:
    // SELECT 
    //   tm.nombre AS tipoMercaderia,
    //   COUNT(i.id) AS cantidad,
    //   SUM(i.valorDeclarado) AS valorDeclaradoTotal,
    //   SUM(i.volumen) AS volumenTotal
    // FROM items i
    // JOIN tipos_mercaderia tm ON i.tipoMercaderiaId = tm.id
    // WHERE tm.nombre IN (?) -- Aquí usarías el array de tipos seleccionados
    // GROUP BY tm.nombre;
    //
    // Si el array de filtros está vacío, el backend debería entender que se piden todos los tipos.

    if (filtros.length > 0) {
      // Si hay tipos seleccionados, filtramos los datos ficticios por esos tipos
      filteredData = filteredData.filter(item => filtros.includes(item.tipoMercaderia));
    }
    // Si `filtros` está vacío, `filteredData` ya contiene todos los `DUMMY_MERCADERIA_DATA`

    // Calcular el valor declarado promedio
    const dataWithAverages = filteredData.map(item => ({
      ...item,
      valorDeclaradoPromedio: item.cantidad > 0 ? item.valorDeclaradoTotal / item.cantidad : 0
    }));
    
    setData(dataWithAverages);
    setLoading(false);
    
    // if (dataWithAverages.length === 0) {
    //   showNotification('No hay datos para los filtros seleccionados.', 'info');
    // }
  };

  const handleLimpiar = () => {
    setFiltros([]); // Limpiar todos los tipos seleccionados
    setData([]); // Limpiar el gráfico
  };

  // Función para renderizar el tooltip del gráfico de torta
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: 0, fontWeight: 'bold', color: data.color }}>{data.tipoMercaderia}</p>
          <p style={{ margin: '5px 0 0 0' }}>Cantidad: {data.cantidad}</p>
          <p style={{ margin: '0' }}>Valor Total: ${data.valorDeclaradoTotal.toLocaleString()}</p>
          <p style={{ margin: '0' }}>Valor Promedio: ${data.valorDeclaradoPromedio ? data.valorDeclaradoPromedio.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</p>
          <p style={{ margin: '0' }}>Volumen Total: {data.volumenTotal} m³</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <h3>Valor declarado por tipo de mercadería</h3>
      <div className={styles.filtersContainer}>
        <div className={styles.filtersHeader}>
          <div className={styles.filtersTitle}>Filtros de búsqueda</div>
          <button className={styles.clearFiltersBtn} onClick={handleLimpiar} title="Limpiar filtros">Limpiar</button>
        </div>
        <div className={styles.filtersGrid} style={{ gridTemplateColumns: '1fr', gap: '10px' }}> {/* Ajustamos el grid para un solo item grande */}
          {/* Nuevo filtro: Selección de Tipos de Mercadería */}
          <div className={styles.filterField}>
            <label className={styles.label}>Tipos de Mercadería:</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '5px', border: '1px solid #ccc', borderRadius: '6px' }}>
              {todosLosTiposMercaderia.map(tipo => (
                <label key={tipo} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <input
                    type="checkbox"
                    value={tipo}
                    checked={filtros.includes(tipo)}
                    onChange={() => handleTipoMercaderiaChange(tipo)}
                  />
                  {tipo}
                </label>
              ))}
            </div>
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <button onClick={handleBuscar} disabled={loading} className={styles.clearFiltersBtn} style={{ background: '#1F7A3D', color: '#fff', borderColor: '#1F7A3D' }}>
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      </div>

      <div style={{ width: '100%', height: 400, marginTop: 24, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="valorDeclaradoTotal" 
                nameKey="tipoMercaderia" 
                cx="50%" 
                cy="50%" 
                outerRadius={120} 
                fill="#8884d8" 
                
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p>No hay datos de valor por tipo de mercadería para mostrar. Selecciona tipos y busca.</p>
        )}
        {loading && <p>Cargando datos...</p>}
      </div>
    </div>
  );
};

export default ReporteValorPorTipo;