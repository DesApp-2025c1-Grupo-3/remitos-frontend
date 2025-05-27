import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { remitosService } from "../../services/remitosService";
import { clientesService } from "../../services/clientesService";
import { destinosService } from "../../services/destinosService";
import { RemitoForm } from "../../components/RemitoForm/RemitoForm";

export default function NuevoRemito() {
  const navigate = useNavigate();
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
  const [clientes, setClientes] = useState([]);
  const [destinos, setDestinos] = useState([]);

  useEffect(() => {
    clientesService.getClientes().then(setClientes);
    destinosService.getDestinos().then(setDestinos);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await remitosService.createRemito(formData);
      navigate("/remitos");
    } catch {
      setError("Error al crear el remito. Por favor, intente nuevamente.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">Nuevo Remito</h1>
      <RemitoForm
        formData={formData}
        onSubmit={handleSubmit}
        onChange={handleChange}
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