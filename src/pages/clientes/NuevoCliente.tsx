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
      // Extraer solo los campos básicos del cliente
      const { razonSocial, cuit_rut, tipoEmpresa, direccion } = formData
      const clienteData = { razonSocial, cuit_rut, tipoEmpresa, direccion }
      // Usar SIEMPRE createCliente, nunca createClienteWithContacto
      await clientesService.createCliente(clienteData)
      showNotification('Cliente creado exitosamente', 'success')
      navigate("/clientes")
    } catch (err) {
      console.error(err)
      showNotification('Error al crear el cliente. Por favor, intente nuevamente.', 'error')
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