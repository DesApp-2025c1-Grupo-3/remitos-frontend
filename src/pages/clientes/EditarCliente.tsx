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
    tipoEmpresaId: null,
    direccion: "",
    contactos: []
  })
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState({
    contactos: false,
    razonSocial: false,
    tipoEmpresa: false,
    direccion: false
  })

  useEffect(() => {
    const cargarCliente = async () => {
      try {
        if (id) {
          const cliente = await clientesService.getClienteById(Number(id))
          setFormData({
            razonSocial: cliente.razonSocial,
            cuit_rut: cliente.cuit_rut,
            tipoEmpresaId: cliente.tipoEmpresaId,
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