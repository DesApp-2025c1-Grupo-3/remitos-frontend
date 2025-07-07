import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { remitosService } from "../../services/remitosService";
import { clientesService } from "../../services/clientesService";
import { destinosService } from "../../services/destinosService";
import { RemitoForm } from "../../components/RemitoForm/RemitoForm";

export default function EditarRemito() {
  const navigate = useNavigate();
  const { id } = useParams();
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
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clientes, setClientes] = useState([]);
  const [destinos, setDestinos] = useState([]);

  useEffect(() => {
    remitosService.getRemitoById(Number(id))
      .then(data => {
        setFormData(data);
        setError(null);
      })
      .catch(() => setError("Error al cargar el remito"))
      .finally(() => setLoading(false));
    clientesService.getClientes().then(setClientes);
    destinosService.getDestinos().then(setDestinos);
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await remitosService.updateRemito(Number(id), formData);
      navigate("/remitos");
    } catch {
      setError("Error al actualizar el remito. Por favor, intente nuevamente.");
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
        error={error}
        clientes={clientes}
        destinos={destinos}
        onNuevoCliente={() => navigate("/clientes/nuevo")}
        onNuevoDestino={() => navigate("/destinos/nuevo")}
      />
    </div>
  );
} 