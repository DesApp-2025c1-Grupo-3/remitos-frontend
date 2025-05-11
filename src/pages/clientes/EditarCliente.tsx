"use client"

import React, { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import styles from "./clientes.module.css"
import { clientesService } from "../../services/clientesService"
import { ArrowLeft } from "lucide-react"
import { ClienteForm, ClienteFormData } from "../../components/ClienteForm/ClienteForm"
import { Contacto } from "../../components/ContactosForm/ContactosForm"

export default function EditarCliente() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [formData, setFormData] = useState<ClienteFormData>({
    razonSocial: "",
    cuit_rut: "",
    tipoEmpresa: "",
    direccion: "",
    contactos: []
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargarCliente = async () => {
      try {
        if (id) {
          const cliente = await clientesService.getClienteById(Number(id))
          setFormData({
            ...cliente,
            contactos: cliente.contactos || []
          })
        }
      } catch (err) {
        setError("Error al cargar el cliente. Por favor, intente nuevamente.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    cargarCliente()
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
        await clientesService.updateCliente(Number(id), formData)
        navigate("/clientes")
      }
    } catch (err) {
      setError("Error al actualizar el cliente. Por favor, intente nuevamente.")
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
      <h1 className={styles.titulo}>EDITAR CLIENTE</h1>
      
      <ClienteForm
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