import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import NuevoDestino from './pages/destinos/NuevoDestino';
import EditarDestino from './pages/destinos/EditarDestino';
import Destinos from './pages/destinos/Destinos';
// ... otros imports de rutas ...

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="destinos" element={<Destinos />} />
          <Route path="destinos/nuevo" element={<NuevoDestino />} />
          <Route path="destinos/editar/:id" element={<EditarDestino />} />
          {/* ... otras rutas ... */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App; 