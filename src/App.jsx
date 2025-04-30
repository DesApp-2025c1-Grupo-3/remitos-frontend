import React from "react"
import Layout from "./components/Layout"
import Home from "./pages/Home"
import Destinos from "./pages/destinos/Destinos"
import NuevoDestino from "./pages/destinos/NuevoDestino"
import EditarDestino from "./pages/destinos/EditarDestino"
import { Routes, Route } from "react-router-dom"

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="destinos" element={<Destinos />} />
        <Route path="destinos/nuevo" element={<NuevoDestino />} />
        <Route path="destinos/editar/:id" element={<EditarDestino />} />
      </Route>
    </Routes>
  )
}
export default App
