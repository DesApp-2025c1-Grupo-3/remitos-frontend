"use client"

import React, { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import styles from "./clientes.module.css"
import { clientesService } from "../../services/clientesService"
import { ArrowLeft } from "lucide-react"
import { ClienteForm, ClienteFormData } from "../../components/ClienteForm/ClienteForm"
import { Contacto } from "../../types/contacto"
import { useNotification } from "../../contexts/NotificationContext"
import { UpdateClienteData } from "../../services/clientesService"

export default function EditarCliente() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { showNotification } = useNotification()
  const [formData, setFormData] = useState<UpdateClienteData>({
    razonSocial: null,
    cuit_rut: null,
    tipoEmpresa: "",
    direccion: "",
    contactos: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargarCliente = async () => {
      try {
        if (id) {
          const cliente = await clientesService.getClienteById(Number(id))
          setFormData({
            razonSocial: cliente.razonSocial,
            cuit_rut: cliente.cuit_rut,
            tipoEmpresa: cliente.tipoEmpresa,
            direccion: cliente.direccion,
            contactos: cliente.contactos || []
          })
        }
      } catch (err) {
        console.error(err)
        showNotification('Error al cargar el cliente. Por favor, intente nuevamente.', 'error')
      } finally {
        setLoading(false)
      }
    }

    cargarCliente()
  }, [id, showNotification])

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
      if (id) {
        // Actualizar el cliente con todos los datos incluyendo contactos
        await clientesService.updateCliente(Number(id), formData)
        
        showNotification('Cliente actualizado exitosamente', 'success')
        navigate("/clientes")
      }
    } catch (err) {
      console.error(err)
      showNotification('Error al actualizar el cliente. Por favor, intente nuevamente.', 'error')
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
      <h1 className={styles.titulo}>EDITAR CLIENTE</h1>
      
      <ClienteForm
        formData={formData}
        onSubmit={handleSubmit}
        onChange={handleChange}
        onContactosChange={handleContactosChange}
        submitButtonText="Guardar Cambios"
        error={null}
      />
    </div>
  )
} 