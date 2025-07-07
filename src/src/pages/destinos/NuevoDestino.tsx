"use client"

import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import styles from "./destinos.module.css"
import { destinosService } from "../../services/destinosService"
import { ArrowLeft } from "lucide-react"
import { DestinoForm, DestinoFormData } from "../../components/DestinoForm/DestinoForm"
import { Contacto } from "../../components/ContactosForm/ContactosForm"

export default function NuevoDestino() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<DestinoFormData>({
    nombre: "",
    pais: "",
    provincia: "",
    localidad: "",
    direccion: "",
    contactos: []
  })
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      await destinosService.createDestino(formData)
      navigate("/destinos")
    } catch (err) {
      setError("Error al crear el destino. Por favor, intente nuevamente.")
      console.error(err)
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
        onSubmit={handleSubmit}
        onChange={handleChange}
        onContactosChange={handleContactosChange}
        submitButtonText="Cargar Destino"
        error={error}
      />
    </div>
  )
}
