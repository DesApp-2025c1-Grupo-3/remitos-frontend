import React, { useState } from 'react';
import ReporteVolumenClientePeriodo from './ReporteVolumenClientePeriodo';
import ReporteDistribucionTabla from './ReporteDistribucionTabla';
import ReporteValorPorTipo from './ReporteValorPorTipo';
import styles from '../remitos/remitos.module.css';

const tabs = [
  { label: 'Volumen por Cliente/Período', component: <ReporteVolumenClientePeriodo /> },
  { label: 'Distribución Orígenes/Destinos', component: <ReporteDistribucionTabla /> },
  { label: 'Valor por Tipo de Mercadería', component: <ReporteValorPorTipo /> },
];

const Reportes: React.FC = () => {
  const [tab, setTab] = useState(0);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.titulo}>Reportes</h1>
        <div className={styles.headerSpacer}></div>
      </div>
      <div className={styles.wrapper}>
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <label htmlFor="reporte-select" style={{ fontWeight: 600, fontSize: '1rem' }}>Tipo de reporte:</label>
          <select
            id="reporte-select"
            value={tab}
            onChange={e => setTab(Number(e.target.value))}
            style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb', fontSize: '1rem' }}
          >
            {tabs.map((t, i) => (
              <option key={i} value={i}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>{tabs[tab].component}</div>
      </div>
    </div>
  );
};

export default Reportes; 