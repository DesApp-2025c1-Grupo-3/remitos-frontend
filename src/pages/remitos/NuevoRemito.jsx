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
    numeroAsignado: "",
    observaciones: "",
    prioridad: "normal",
    clienteId: "",
    destinoId: "",
    // Campos de mercadería
    tipoMercaderia: "",
    valorDeclarado: "",
    volumenMetrosCubico: "",
    pesoMercaderia: "",
    cantidadBobinas: "",
    cantidadRacks: "",
    cantidadBultos: "",
    cantidadPallets: "",
    requisitosEspeciales: "",
    // Archivo adjunto
    archivoAdjunto: null,
  });
  const [clientes, setClientes] = useState([]);
  const [destinos, setDestinos] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientesResponse, destinosResponse] = await Promise.all([
          clientesService.getClientes(),
          destinosService.getDestinos()
        ]);
        
        // Asegurar que sean arrays
        setClientes(Array.isArray(clientesResponse.data) ? clientesResponse.data : []);
        setDestinos(Array.isArray(destinosResponse.data) ? destinosResponse.data : []);
      } catch (err) {
        console.error('Error en fetchData:', err);
        console.error('Error details:', err.response?.data || err.message);
        showNotification('Error al cargar los datos iniciales', 'error');
        // En caso de error, establecer arrays vacíos
        setClientes([]);
        setDestinos([]);
      }
    };
    fetchData();
  }, [showNotification]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpiar errores cuando el usuario comience a escribir
    if (error) setError(null);
  };

  const handleFileChange = (file) => {
    setFormData(prev => ({ ...prev, archivoAdjunto: file }));
  };

  const validateForm = () => {
    if (!formData.numeroAsignado.trim()) {
      setError('El número de remito es requerido');
      return false;
    }
    if (!formData.clienteId) {
      setError('Debe seleccionar un cliente');
      return false;
    }
    if (!formData.destinoId) {
      setError('Debe seleccionar un destino');
      return false;
    }
    if (!formData.prioridad) {
      setError('Debe seleccionar una prioridad');
      return false;
    }
    if (!formData.tipoMercaderia.trim()) {
      setError('El tipo de mercadería es requerido');
      return false;
    }
    if (!formData.valorDeclarado || parseFloat(formData.valorDeclarado) < 0) {
      setError('El valor declarado debe ser un número válido mayor o igual a 0');
      return false;
    }
    if (!formData.volumenMetrosCubico || parseFloat(formData.volumenMetrosCubico) < 0) {
      setError('El volumen debe ser un número válido mayor o igual a 0');
      return false;
    }
    if (!formData.pesoMercaderia || parseFloat(formData.pesoMercaderia) < 0) {
      setError('El peso debe ser un número válido mayor o igual a 0');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setError(null);
      
      // Convertir los datos al formato esperado por el backend
      const remitoData = {
        numeroAsignado: formData.numeroAsignado.trim(),
        observaciones: formData.observaciones.trim(),
        prioridad: formData.prioridad,
        clienteId: parseInt(formData.clienteId),
        destinoId: parseInt(formData.destinoId),
        // Campos de mercadería
        tipoMercaderia: formData.tipoMercaderia.trim(),
        valorDeclarado: parseFloat(formData.valorDeclarado),
        volumenMetrosCubico: parseFloat(formData.volumenMetrosCubico),
        pesoMercaderia: parseFloat(formData.pesoMercaderia),
        cantidadBobinas: formData.cantidadBobinas ? parseInt(formData.cantidadBobinas) : undefined,
        cantidadRacks: formData.cantidadRacks ? parseInt(formData.cantidadRacks) : undefined,
        cantidadBultos: formData.cantidadBultos ? parseInt(formData.cantidadBultos) : undefined,
        cantidadPallets: formData.cantidadPallets ? parseInt(formData.cantidadPallets) : undefined,
        requisitosEspeciales: formData.requisitosEspeciales.trim(),
        // Archivo adjunto
        archivoAdjunto: formData.archivoAdjunto,
      };

      await remitosService.createRemito(remitoData);
      showNotification('Remito creado exitosamente', 'success');
      navigate("/remitos");
    } catch (err) {
      console.error('Error al crear remito:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Error al crear el remito. Por favor, intente nuevamente.';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
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
        onFileChange={handleFileChange}
        submitButtonText="Cargar Remito"
        error={error}
        clientes={clientes}
        destinos={destinos}
        onNuevoCliente={() => navigate("/clientes/nuevo")}
        onNuevoDestino={() => navigate("/destinos/nuevo")}
      />
    </div>
  );
} 