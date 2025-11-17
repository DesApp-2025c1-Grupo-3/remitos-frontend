import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { remitosService } from "../../services/remitosService";
import { clientesService } from "../../services/clientesService";
import { destinosService } from "../../services/destinosService";
import { RemitoForm } from "../../components/RemitoForm/RemitoForm";
import { useNotification } from "../../contexts/NotificationContext";
import styles from "./remitos.module.css";
import formStyles from "../../components/Form.module.css";
import { getApiUrl } from "../../config/api";

export default function EditarRemito() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState({
    numeroAsignado: "",
    observaciones: "",
    prioridad: "normal",
    clienteId: "",
    destinoId: "",
    // Mercaderías como array
    mercaderias: [],
    // Archivo adjunto
    archivoAdjunto: null,
  });
  const [existingFile, setExistingFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [destinos, setDestinos] = useState([]);
  const [showMercaderiasError, setShowMercaderiasError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [remitoData, clientesResponse, destinosResponse] = await Promise.all([
          remitosService.getRemitoById(Number(id)),
          clientesService.getClientes(),
          destinosService.getDestinos()
        ]);
        
        // Mapear los datos del remito al formato del formulario
        const mappedData = {
          numeroAsignado: remitoData.numeroAsignado || "",
          observaciones: remitoData.observaciones || "",
          prioridad: remitoData.prioridad || "normal",
          clienteId: remitoData.clienteId?.toString() || "",
          destinoId: remitoData.destinoId?.toString() || "",
          // Todas las mercaderías del array
          mercaderias: remitoData.mercaderias || [],
          // Archivo adjunto existente
          archivoAdjunto: null,
        };
        
        setFormData(mappedData);
        
        // Guardar información del archivo existente
        if (remitoData.archivoAdjunto) {
          setExistingFile({
            name: remitoData.archivoAdjunto.split('/').pop() || 'Archivo adjunto',
            path: remitoData.archivoAdjunto,
            url: `${getApiUrl()}/${remitoData.archivoAdjunto.startsWith('/') ? remitoData.archivoAdjunto.slice(1) : remitoData.archivoAdjunto}`.replace(/([^:]\/)\/+/, '$1')
          });
        }
        
        // Asegurar que el cliente del remito esté en la lista de clientes
        let clientesList = Array.isArray(clientesResponse.data) ? clientesResponse.data : [];
        if (remitoData.clienteId && !clientesList.find(c => c.id === remitoData.clienteId)) {
          try {
            const clienteExtra = await clientesService.getClienteById(remitoData.clienteId);
            if (clienteExtra) {
              clientesList = [...clientesList, clienteExtra];
            }
          } catch (e) {
            // Si no se encuentra, no hacer nada
          }
        }
        setClientes(clientesList);
        
        // Asegurar que el destino del remito esté en la lista de destinos
        let destinosList = Array.isArray(destinosResponse.data) ? destinosResponse.data : [];
        if (remitoData.destinoId && !destinosList.find(d => d.id === remitoData.destinoId)) {
          try {
            const destinoExtra = await destinosService.getDestinoById(remitoData.destinoId);
            if (destinoExtra) {
              destinosList = [...destinosList, destinoExtra];
            }
          } catch (e) {
            // Si no se encuentra, no hacer nada
          }
        }
        setDestinos(destinosList);
      } catch (err) {
        console.error('Error en fetchData:', err);
        console.error('Error details:', err.response?.data || err.message);
        setError('Error al cargar los datos del remito');
        showNotification('Error al cargar los datos del remito', 'error');
        // En caso de error, establecer arrays vacíos
        setClientes([]);
        setDestinos([]);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, showNotification]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpiar errores cuando el usuario comience a escribir
    if (error) setError(null);
  };

  const handleFileChange = (file) => {
    setFormData(prev => ({ ...prev, archivoAdjunto: file }));
  };

  const handleMercaderiasChange = (mercaderias) => {
    setFormData(prev => ({ ...prev, mercaderias }));
    // Ocultar error si se agrega al menos una mercadería
    if (mercaderias.length > 0) {
      setShowMercaderiasError(false);
    }
  };

  const validateForm = () => {
    if (!formData.numeroAsignado.trim()) {
      setError('El número de remito es requerido');
      return false;
    }
    if (!formData.prioridad) {
      setError('Debe seleccionar una prioridad');
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
    if (!formData.mercaderias || formData.mercaderias.length === 0) {
      setShowMercaderiasError(true);
      setError('Debe agregar al menos una mercadería');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Convertir los valores del formulario a los tipos correctos
    const updateData = {
      ...formData,
      clienteId: parseInt(formData.clienteId, 10),
      destinoId: parseInt(formData.destinoId, 10),
      mercaderias: formData.mercaderias,
    };

    try {
      setError(null);
      
      // Llamada única al servicio de actualización
      await remitosService.updateRemito(Number(id), updateData);

      showNotification('Remito actualizado exitosamente', 'success');
      navigate("/remitos", { state: { preserveFilters: true } });
    } catch (err) {
      console.error('Error al actualizar remito:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Error al actualizar el remito. Por favor, intente nuevamente.';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    }
  };

  if (loading) return <div className={styles.container}>Cargando...</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.titulo}>EDITAR REMITO</h1>
      <RemitoForm
        formData={formData}
        onSubmit={handleSubmit}
        onChange={handleChange}
        onMercaderiasChange={handleMercaderiasChange}
        onFileChange={handleFileChange}
        submitButtonText="Actualizar Remito"
        error={error}
        clientes={clientes}
        destinos={destinos}
        onNuevoCliente={() => navigate("/clientes/nuevo")}
        onNuevoDestino={() => navigate("/destinos/nuevo")}
        existingFile={existingFile}
        onCancel={() => navigate("/remitos")}
        showMercaderiasError={showMercaderiasError}
      />
    </div>
  );
} 