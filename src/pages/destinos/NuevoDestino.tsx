"use client"

import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import styles from "./destinos.module.css"
import { destinosService } from "../../services/destinosService"
import { ArrowLeft } from "lucide-react"
import { ContactosForm, Contacto } from "../../components/ContactosForm/ContactosForm"

export default function NuevoDestino() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    nombre: "",
    pais: "",
    provincia: "",
    localidad: "",
    direccion: "",
    contactos: [] as Contacto[]
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
      <div className={styles.wrapper}>
        {error && <div className={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit} className={styles.formulario}>
          <div className={styles.campo}>
            <label className={styles.label}>Nombre del destino</label>
            <input
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ingresar nombre del destino"
              className={styles.input}
              required
            />
          </div>
          <div className={styles.campo}>
            <label className={styles.label}>País destino</label>
            <input
              name="pais"
              value={formData.pais}
              onChange={handleChange}
              placeholder="Ingresar país de destino de mercadería"
              className={styles.input}
              required
            />
          </div>
          <div className={styles.campo}>
            <label className={styles.label}>Provincia destino</label>
            <input
              name="provincia"
              value={formData.provincia}
              onChange={handleChange}
              placeholder="Ingresar provincia de destino de mercadería"
              className={styles.input}
              required
            />
          </div>
          <div className={styles.campo}>
            <label className={styles.label}>Localidad destino</label>
            <input
              name="localidad"
              value={formData.localidad}
              onChange={handleChange}
              placeholder="Ingresar localidad de destino de mercadería"
              className={styles.input}
              required
            />
          </div>
          <div className={styles.campo}>
            <label className={styles.label}>Dirección destino</label>
            <input
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              placeholder="Ingresar dirección de destino de mercadería"
              className={styles.input}
              required
            />
          </div>

          <ContactosForm 
            contactos={formData.contactos}
            onContactosChange={handleContactosChange}
          />

          <div className={styles.botonera}>
            <button type="submit" className={styles.formBtn}>
              Cargar Destino
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
