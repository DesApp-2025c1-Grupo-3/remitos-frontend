"use client"

import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import styles from "./destinos.module.css"
import { destinosService } from "../../services/destinosService"
import { ArrowLeft } from "lucide-react"
import { DestinoForm, DestinoFormData } from "../../components/DestinoForm/DestinoForm"
import { Contacto } from "../../types/contacto"
import { useNotification } from "../../contexts/NotificationContext"

export default function NuevoDestino() {
  const navigate = useNavigate()
  const { showNotification } = useNotification()
  const [formData, setFormData] = useState<DestinoFormData>({
    nombre: "", // Opcional si no hay contactos según backend
    pais: "",
    provincia: "",
    localidad: "",
    direccion: "",
    contactos: []
  })
  const [errors, setErrors] = useState({
    contactos: false,
    nombre: false,
    pais: false,
    provincia: false,
    localidad: false,
    direccion: false
  })

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
      await destinosService.createDestino(formData)
      showNotification("Destino creado exitosamente", "success")
      navigate("/destinos")
    } catch (err) {
      console.error("Error al crear destino:", err)
      const errorMessage = err instanceof Error ? err.message : 'Error al crear el destino. Por favor, intente nuevamente.'
      showNotification(errorMessage, "error")
    }
  }

  return (
    <div className={styles.container}>
      <button className={styles.volverBtn} onClick={() => navigate(-1)}>
        <ArrowLeft />
        Volver
      </button>
      <h1 className={styles.titulo}>NUEVO DESTINO</h1>
      
      <DestinoForm
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
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
