import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { remitosService } from "../../services/remitosService";
import { clientesService } from "../../services/clientesService";
import { destinosService } from "../../services/destinosService";
import { RemitoForm } from "../../components/RemitoForm/RemitoForm";
import { useNotification } from "../../contexts/NotificationContext";
import { ArrowLeft } from "lucide-react";
import styles from "./remitos.module.css";

export default function EditarRemito() {
  const navigate = useNavigate();
  const { id } = useParams();
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
  const [loading, setLoading] = useState(true);
  const [clientes, setClientes] = useState([]);
  const [destinos, setDestinos] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [remitoData, clientesResponse, destinosResponse] = await Promise.all([
          remitosService.getRemitoById(Number(id)),
          clientesService.getClientes(),
          destinosService.getDestinos()
        ]);
        
        setFormData(remitoData);
        // Asegurar que sean arrays
        setClientes(Array.isArray(clientesResponse.data) ? clientesResponse.data : []);
        setDestinos(Array.isArray(destinosResponse.data) ? destinosResponse.data : []);
      } catch (err) {
        console.error('Error en fetchData:', err);
        console.error('Error details:', err.response?.data || err.message);
        showNotification('Error al cargar los datos del remito', 'error');
        // En caso de error, establecer arrays vacíos
        setClientes([]);
        setDestinos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, showNotification]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await remitosService.updateRemito(Number(id), formData);
      showNotification('Remito actualizado exitosamente', 'success');
      navigate("/remitos");
    } catch (err) {
      console.error(err);
      showNotification('Error al actualizar el remito. Por favor, intente nuevamente.', 'error');
    }
  };

  if (loading) return <div className={styles.container}>Cargando...</div>;

  return (
    <div className={styles.container}>
      <button className={styles.volverBtn} onClick={() => navigate(-1)}>
        <ArrowLeft />
        Volver
      </button>
      <h1 className={styles.titulo}>EDITAR REMITO</h1>
      <RemitoForm
        formData={formData}
        onSubmit={handleSubmit}
        onChange={handleChange}
        submitButtonText="Actualizar Remito"
        clientes={clientes}
        destinos={destinos}
        onNuevoCliente={() => navigate("/clientes/nuevo")}
        onNuevoDestino={() => navigate("/destinos/nuevo")}
      />
    </div>
  );
} 