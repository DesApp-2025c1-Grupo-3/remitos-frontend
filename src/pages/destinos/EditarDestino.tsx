"use client"

import React, { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import styles from "./destinos.module.css"
import { destinosService } from "../../services/destinosService"
import { ArrowLeft } from "lucide-react"
import { DestinoForm, DestinoFormData } from "../../components/DestinoForm/DestinoForm"
import { Contacto } from "../../components/ContactosForm/ContactosForm"

export default function EditarDestino() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [formData, setFormData] = useState<DestinoFormData>({
    nombre: "",
    pais: "",
    provincia: "",
    localidad: "",
    direccion: "",
    contactos: []
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargarDestino = async () => {
      try {
        if (id) {
          const destino = await destinosService.getDestinoById(Number(id))
          setFormData({
            ...destino,
            contactos: destino.contactos || []
          })
        }
      } catch (err) {
        setError("Error al cargar el destino. Por favor, intente nuevamente.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    cargarDestino()
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleContactosChange = (contactos: Contacto[]) => {
    setFormData(prev => ({ ...prev, contactos }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    try {
      if (id) {
        await destinosService.updateDestino(Number(id), formData)
        navigate("/destinos")
      }
    } catch (err) {
      setError("Error al actualizar el destino. Por favor, intente nuevamente.")
      console.error(err)
    }
  }

  if (loading) {
    return <div className={styles.loading}>Cargando...</div>
  }

  return (
    <div className={styles.container}>
      <button className={styles.volverBtn} onClick={() => navigate(-1)}>
        <ArrowLeft />
        Volver
      </button>
      <h1 className={styles.titulo}>EDITAR DESTINO</h1>
      
      <DestinoForm
        formData={formData}
        onSubmit={handleSubmit}
        onChange={handleChange}
        onContactosChange={handleContactosChange}
        submitButtonText="Guardar Cambios"
        error={error}
      />
    </div>
  )
}
