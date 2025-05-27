import React from 'react';
import { Construction } from 'lucide-react';

const Reportes: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', textAlign: 'center' }}>
      <Construction size={64} color="#facc15" /> {/* Icono de construcción en amarillo */}
      <h2 style={{ marginTop: '1rem', fontSize: '1.5rem', color: '#333' }}>Página en Construcción</h2>
      <p style={{ marginTop: '0.5rem', color: '#555' }}>Estamos trabajando para traerle los reportes pronto.</p>
    </div>
  );
};

export default Reportes; 