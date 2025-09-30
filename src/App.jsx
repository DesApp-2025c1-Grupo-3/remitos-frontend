import React from "react"
import Layout from "./components/Layout"
import Home from "./pages/Home"
import Clientes from "./pages/clientes/Clientes"
import NuevoCliente from "./pages/clientes/NuevoCliente"
import EditarCliente from "./pages/clientes/EditarCliente"
import Destinos from "./pages/destinos/Destinos"
import NuevoDestino from "./pages/destinos/NuevoDestino"
import EditarDestino from "./pages/destinos/EditarDestino"
import Remitos from "./pages/remitos/Remitos"
import NuevoRemito from "./pages/remitos/NuevoRemito"
import EditarRemito from "./pages/remitos/EditarRemito"
import { Routes, Route } from "react-router-dom"
import Reportes from "./pages/reportes/Reportes"
import Agenda from "./pages/agenda/Agenda"
import { KeepAliveProvider } from "./components/KeepAliveProvider/KeepAliveProvider"


export function App() {
  return (
    <KeepAliveProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="clientes/nuevo" element={<NuevoCliente />} />
          <Route path="clientes/editar/:id" element={<EditarCliente />} />
          <Route path="destinos" element={<Destinos />} />
          <Route path="destinos/nuevo" element={<NuevoDestino />} />
          <Route path="destinos/editar/:id" element={<EditarDestino />} />
          <Route path="remitos" element={<Remitos />} />
          <Route path="remitos/nuevo" element={<NuevoRemito />} />
          <Route path="remitos/editar/:id" element={<EditarRemito />} />
          <Route path="reportes" element={<Reportes />} />
          <Route path="agenda" element={<Agenda />} />
        </Route>
      </Routes>
    </KeepAliveProvider>
  )
}
export default App
