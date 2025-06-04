import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { remitosService } from "../../services/remitosService";
import { clientesService } from "../../services/clientesService";
import { destinosService } from "../../services/destinosService";
import { RemitoForm } from "../../components/RemitoForm/RemitoForm";
import { useNotification } from "../../contexts/NotificationContext";
import { ArrowLeft } from "lucide-react";
import styles from "./remitos.module.css";

export default function NuevoRemito() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState({
    numero: "",
    cliente: "",
    destino: "",
    peso: "",
    volumen: "",
    valor: "",
    tipo: "",
    requisitos: "",
    observaciones: "",
    cantidadPallets: "",
    cantidadBultos: "",
    cantidadRacks: "",
    cantidadBobinas: "",
    cantidadTambores: "",
  });
  const [clientes, setClientes] = useState([]);
  const [destinos, setDestinos] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientesData, destinosData] = await Promise.all([
          clientesService.getClientes(),
          destinosService.getDestinos()
        ]);
        setClientes(clientesData);
        setDestinos(destinosData);
      } catch (err) {
        console.error(err);
        showNotification('Error al cargar los datos iniciales', 'error');
      }
    };
    fetchData();
  }, [showNotification]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await remitosService.createRemito(formData);
      showNotification('Remito creado exitosamente', 'success');
      navigate("/remitos");
    } catch (err) {
      console.error(err);
      showNotification('Error al crear el remito. Por favor, intente nuevamente.', 'error');
    }
  };

  return (
    <div className={styles.container}>
      <button className={styles.volverBtn} onClick={() => navigate(-1)}>
        <ArrowLeft />
        Volver
      </button>
      <h1 className={styles.titulo}>NUEVO REMITO</h1>
      <RemitoForm
        formData={formData}
        onSubmit={handleSubmit}
        onChange={handleChange}
        submitButtonText="Cargar Remito"
        clientes={clientes}
        destinos={destinos}
        onNuevoCliente={() => navigate("/clientes/nuevo")}
        onNuevoDestino={() => navigate("/destinos/nuevo")}
      />
    </div>
  );
} 