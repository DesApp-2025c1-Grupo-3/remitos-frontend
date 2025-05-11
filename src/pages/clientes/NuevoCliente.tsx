"use client"

import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import styles from "./clientes.module.css"
import { clientesService } from "../../services/clientesService"
import { ArrowLeft } from "lucide-react"
import { ClienteForm, ClienteFormData } from "../../components/ClienteForm/ClienteForm"
import { Contacto } from "../../components/ContactosForm/ContactosForm"

export default function NuevoCliente() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<ClienteFormData>({
    razonSocial: "",
    cuit_rut: "",
    tipoEmpresa: "",
    direccion: "",
    contactos: []
  })
  const [error, setError] = useState<string | null>(null)

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
      await clientesService.createCliente(formData)
      navigate("/clientes")
    } catch (err) {
      setError("Error al crear el cliente. Por favor, intente nuevamente.")
      console.error(err)
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
        error={error}
      />
    </div>
  )
} 