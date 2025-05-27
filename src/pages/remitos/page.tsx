"use client"

import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { remitosService, Remito } from "@/services/remitosService"

export default function Remitos() {
  const navigate = useNavigate()
  const [remitos, setRemitos] = useState<Remito[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRemitos = async () => {
      try {
        const data = await remitosService.getRemitos()
        setRemitos(data)
        setError(null)
      } catch (err) {
        setError("Error al cargar los remitos")
      } finally {
        setLoading(false)
      }
    }
    fetchRemitos()
  }, [])

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este remito?")) {
      try {
        await remitosService.deleteRemito(id)
        setRemitos(remitos.filter(remito => remito.id !== id))
      } catch (err) {
        setError("Error al eliminar el remito")
      }
    }
  }

  if (loading) return <div className="max-w-4xl mx-auto">Cargando...</div>
  if (error) return <div className="max-w-4xl mx-auto">{error}</div>

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Remitos</h1>
        <Link to="/remitos/nuevo">
          <Button className="bg-green-700 hover:bg-green-800">Crear Remito</Button>
        </Link>
      </div>

      <div className="bg-gray-200 rounded-lg p-6">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left">Número</th>
              <th className="text-left">Cliente</th>
              <th className="text-left">Destino</th>
              <th className="text-left">Fecha</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {remitos.map((remito) => (
              <tr key={remito.id} className="bg-white rounded-md hover:bg-gray-50">
                <td>{remito.numero}</td>
                <td>{remito.cliente}</td>
                <td>{remito.destino}</td>
                <td>{remito.fecha}</td>
                <td className="text-center">
                  <div className="flex gap-2 justify-center">
                    <Link to={`/remitos/editar/${remito.id}`}>
                      <Button variant="outline" size="sm" className="bg-green-700 hover:bg-green-800 text-white">Editar</Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="bg-green-700 hover:bg-green-800 text-white"
                      onClick={() => handleDelete(remito.id)}
                    >
                      Borrar
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
