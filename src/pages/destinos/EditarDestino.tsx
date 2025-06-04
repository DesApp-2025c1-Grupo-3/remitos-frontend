"use client"

import React, { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import styles from "./destinos.module.css"
import { destinosService } from "../../services/destinosService"
import { ArrowLeft } from "lucide-react"
import { DestinoForm, DestinoFormData } from "../../components/DestinoForm/DestinoForm"
import { Contacto } from "../../types/contacto"
import { useNotification } from "../../contexts/NotificationContext"

export default function EditarDestino() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { showNotification } = useNotification()
  const [formData, setFormData] = useState<DestinoFormData>({
    name: "",
    pais: "",
    provincia: "",
    localidad: "",
    direccion: "",
    contactos: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDestino = async () => {
      if (!id) return
      
      try {
        const destino = await destinosService.getDestinoById(parseInt(id))
        setFormData({
          name: destino.name,
          pais: destino.pais,
          provincia: destino.provincia,
          localidad: destino.localidad,
          direccion: destino.direccion,
          contactos: destino.contactos || []
        })
      } catch (err) {
        console.error("Error al cargar destino:", err)
        showNotification(
          "Error al cargar el destino. Por favor, intente nuevamente.",
          "error"
        )
      } finally {
        setLoading(false)
      }
    }

    fetchDestino()
  }, [id, showNotification])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleContactoChange = (contactos: Contacto[]) => {
    setFormData(prev => ({
      ...prev,
      contactos
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    
    try {
      await destinosService.updateDestino(parseInt(id), formData)
      showNotification("Destino actualizado exitosamente", "success")
      navigate("/destinos")
    } catch (err) {
      console.error("Error al actualizar destino:", err)
      showNotification(
        "Error al actualizar el destino. Por favor, intente nuevamente.",
        "error"
      )
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
        onContactoChange={handleContactoChange}
        contactos={formData.contactos}
      />
    </div>
  )
}
