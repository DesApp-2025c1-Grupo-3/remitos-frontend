import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./clientes.module.css";
import { clientesService } from "../../services/clientesService";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const data = await clientesService.getClientes();
        setClientes(data);
        setError(null);
      } catch (err) {
        setError("Error al cargar los clientes");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchClientes();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este cliente?")) {
      try {
        await clientesService.deleteCliente(id);
        setClientes(clientes.filter(cliente => cliente.id !== id));
      } catch (err) {
        setError("Error al eliminar el cliente");
        console.error(err);
      }
    }
  };

  if (loading) return <div className={styles.container}>Cargando...</div>;
  if (error) return <div className={styles.container}>{error}</div>;

  return (
    <div className={styles.container}>
      <button className={styles.volverBtn} onClick={() => navigate(-1)}>
        <ArrowLeft />
        Volver
      </button>
      <h1 className={styles.titulo}>Clientes</h1>
      <div className={styles.wrapper}>
        <div className={styles.crearBtnContainer}>
          <button className={styles.crearBtn} onClick={() => navigate("/clientes/nuevo")}>
            Crear Cliente
          </button>
        </div>
        <div className={styles.tablaContenedor}>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>Razón Social</th>
                <th>CUIT/RUT</th>
                <th>Tipo</th>
                <th>Dirección</th>
                <th style={{ textAlign: "center" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente) => (
                <tr key={cliente.id}>
                  <td>{cliente.razonSocial}</td>
                  <td>{cliente.cuit_rut}</td>
                  <td>{cliente.tipoEmpresa}</td>
                  <td>{cliente.direccion}</td>
                  <td>
                    <div className={styles.acciones}>
                      <button 
                        className={styles.accionesBtn} 
                        onClick={() => navigate(`/clientes/editar/${cliente.id}`)}
                        title="Editar"
                      >
                        <Pencil />
                      </button>
                      <button 
                        className={`${styles.accionesBtn} ${styles.delete}`} 
                        onClick={() => handleDelete(cliente.id)}
                        title="Eliminar"
                      >
                        <Trash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
