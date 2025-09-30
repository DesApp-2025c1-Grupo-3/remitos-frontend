"use client"

import React, { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import styles from "./destinos.module.css"
import { destinosService } from "../../services/destinosService"
import { DestinoForm, DestinoFormData } from "../../components/DestinoForm/DestinoForm"
import { Contacto } from "../../types/contacto"
import { useNotification } from "../../contexts/NotificationContext"

export default function EditarDestino() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { showNotification } = useNotification()
  const [formData, setFormData] = useState<DestinoFormData>({
    nombre: "",
    pais: "",
    provincia: "",
    localidad: "",
    direccion: "",
    contactos: []
  })
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState({
    contactos: false,
    nombre: false,
    pais: false,
    provincia: false,
    localidad: false,
    direccion: false
  })

  useEffect(() => {
    const fetchDestino = async () => {
      if (!id) return
      
      try {
        const destino = await destinosService.getDestinoById(parseInt(id))
        setFormData({
          nombre: destino.nombre,
          pais: destino.pais || "",
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
    // Ocultar error si se agrega al menos un contacto
    if (contactos.length > 0) {
      setErrors(prev => ({ ...prev, contactos: false }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    
    // Validar todos los campos y recoger errores
    const newErrors = {
      contactos: !formData.contactos || formData.contactos.length === 0,
      nombre: !formData.nombre || formData.nombre.trim() === '',
      pais: !formData.pais || formData.pais.trim() === '',
      provincia: !formData.provincia || formData.provincia.trim() === '',
      localidad: !formData.localidad || formData.localidad.trim() === '',
      direccion: !formData.direccion || formData.direccion.trim() === ''
    }
    
    setErrors(newErrors)
    
    // Si hay errores, no enviar el formulario
    const hasErrors = Object.values(newErrors).some(error => error)
    if (hasErrors) {
      return
    }
    
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
      <h1 className={styles.titulo}>EDITAR DESTINO</h1>
      
      <DestinoForm
        formData={formData}
        onSubmit={handleSubmit}
        onChange={handleChange}
        onContactoChange={handleContactoChange}
        contactos={formData.contactos}
        showContactError={errors.contactos}
        fieldErrors={{
          nombre: errors.nombre,
          pais: errors.pais,
          provincia: errors.provincia,
          localidad: errors.localidad,
          direccion: errors.direccion
        }}
      />
    </div>
  )
}
