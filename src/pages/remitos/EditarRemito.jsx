import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { remitosService } from "../../services/remitosService";
import { clientesService } from "../../services/clientesService";
import { destinosService } from "../../services/destinosService";
import { RemitoForm } from "../../components/RemitoForm/RemitoForm";
import { useNotification } from "../../contexts/NotificationContext";

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
        const [remitoData, clientesData, destinosData] = await Promise.all([
          remitosService.getRemitoById(Number(id)),
          clientesService.getClientes(),
          destinosService.getDestinos()
        ]);
        setFormData(remitoData);
        setClientes(clientesData);
        setDestinos(destinosData);
      } catch (err) {
        console.error(err);
        showNotification('Error al cargar los datos del remito', 'error');
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

  if (loading) return <div className="max-w-4xl mx-auto">Cargando...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">Editar Remito</h1>
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