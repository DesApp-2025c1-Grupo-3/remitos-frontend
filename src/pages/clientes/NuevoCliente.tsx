"use client"

import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import styles from "./clientes.module.css"
import { clientesService } from "../../services/clientesService"
import { ClienteForm, ClienteFormData } from "../../components/ClienteForm/ClienteForm"
import { Contacto } from "../../types/contacto"
import { useNotification } from "../../contexts/NotificationContext"

export default function NuevoCliente() {
  const navigate = useNavigate()
  const { showNotification } = useNotification()
  const [formData, setFormData] = useState<ClienteFormData>({
    razonSocial: null,
    cuit_rut: null,
    tipoEmpresaId: null,
    direccion: "",
    contactos: []
  })
  const [errors, setErrors] = useState({
    contactos: false,
    razonSocial: false,
    tipoEmpresa: false,
    direccion: false
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleContactosChange = (contactos: Contacto[]) => {
    setFormData(prev => ({ ...prev, contactos }))
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
      razonSocial: !formData.razonSocial || formData.razonSocial.trim() === '',
      tipoEmpresa: !formData.tipoEmpresaId,
      direccion: !formData.direccion || formData.direccion.trim() === ''
    }
    
    setErrors(newErrors)
    
    // Si hay errores, no enviar el formulario
    const hasErrors = Object.values(newErrors).some(error => error)
    if (hasErrors) {
      return
    }
    
    try {
      // Usar createCliente para enviar todos los contactos
      await clientesService.createCliente({
        razonSocial: formData.razonSocial,
        cuit_rut: formData.cuit_rut,
        tipoEmpresaId: formData.tipoEmpresaId,
        direccion: formData.direccion,
        contactos: formData.contactos
      });
      showNotification('Cliente creado exitosamente', 'success')
      navigate("/clientes")
    } catch (err) {
      console.error(err)
      const errorMessage = err instanceof Error ? err.message : 'Error al crear el cliente. Por favor, intente nuevamente.'
      showNotification(errorMessage, 'error')
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.titulo}>NUEVO CLIENTE</h1>
      
      <ClienteForm
        formData={formData}
        onSubmit={handleSubmit}
        onChange={handleChange}
        onContactosChange={handleContactosChange}
        submitButtonText="Cargar Cliente"
        error={null}
        showContactError={errors.contactos}
        fieldErrors={{
          razonSocial: errors.razonSocial,
          tipoEmpresa: errors.tipoEmpresa,
          direccion: errors.direccion
        }}
      />
    </div>
  )
}