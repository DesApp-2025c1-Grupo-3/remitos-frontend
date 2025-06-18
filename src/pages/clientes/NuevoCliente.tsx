"use client"

import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import styles from "./clientes.module.css"
import { clientesService } from "../../services/clientesService"
import { ArrowLeft } from "lucide-react"
import { ClienteForm, ClienteFormData } from "../../components/ClienteForm/ClienteForm"
import { Contacto } from "../../types/contacto"
import { useNotification } from "../../contexts/NotificationContext"

export default function NuevoCliente() {
  const navigate = useNavigate()
  const { showNotification } = useNotification()
  const [formData, setFormData] = useState<ClienteFormData>({
    razonSocial: null,
    cuit_rut: null,
    tipoEmpresa: "",
    direccion: "",
    contactos: []
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleContactosChange = (contactos: Contacto[]) => {
    setFormData(prev => ({ ...prev, contactos }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Validar que haya al menos un contacto válido
      if (!formData.contactos || formData.contactos.length === 0) {
        showNotification('Se requiere al menos un contacto para crear el cliente. Agregue un contacto antes de guardar.', 'error')
        return
      }

      const primerContacto = formData.contactos[0];
      if (!primerContacto.personaAutorizada || !primerContacto.correoElectronico || primerContacto.telefono <= 0) {
        showNotification('El contacto debe tener todos los campos completos: persona autorizada, correo electrónico y teléfono.', 'error')
        return
      }

      // Usar createClienteWithContacto con los datos del formulario
      await clientesService.createClienteWithContacto({
        razonSocial: formData.razonSocial,
        cuit_rut: formData.cuit_rut,
        tipoEmpresa: formData.tipoEmpresa,
        direccion: formData.direccion,
        personaAutorizada: primerContacto.personaAutorizada,
        correoElectronico: primerContacto.correoElectronico,
        telefono: primerContacto.telefono.toString()
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
      <button className={styles.volverBtn} onClick={() => navigate(-1)}>
        <ArrowLeft />
        Volver
      </button>
      <h1 className={styles.titulo}>NUEVO CLIENTE</h1>
      
      <ClienteForm
        formData={formData}
        onSubmit={handleSubmit}
        onChange={handleChange}
        onContactosChange={handleContactosChange}
        submitButtonText="Cargar Cliente"
        error={null}
      />
    </div>
  )
}