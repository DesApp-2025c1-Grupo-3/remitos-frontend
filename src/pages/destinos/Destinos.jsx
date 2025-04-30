import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./destinos.module.css";
import { destinosService } from "../../services/destinosService";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";

export default function Destinos() {
  const [destinos, setDestinos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDestinos = async () => {
      try {
        const data = await destinosService.getDestinos();
        setDestinos(data);
        setError(null);
      } catch (err) {
        setError("Error al cargar los destinos");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDestinos();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este destino?")) {
      try {
        await destinosService.deleteDestino(id);
        setDestinos(destinos.filter(destino => destino.id !== id));
      } catch (err) {
        setError("Error al eliminar el destino");
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
      <h1 className={styles.titulo}>Destinos</h1>
      <div className={styles.wrapper}>
        <div className={styles.crearBtnContainer}>
          <button className={styles.crearBtn} onClick={() => navigate("/destinos/nuevo")}>
            Crear Destino
          </button>
        </div>
        <div className={styles.tablaContenedor}>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>País</th>
                <th>Provincia</th>
                <th>Localidad</th>
                <th>Dirección</th>
                <th style={{ textAlign: "center" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {destinos.map((destino) => (
                <tr key={destino.id}>
                  <td>{destino.nombre}</td>
                  <td>{destino.pais}</td>
                  <td>{destino.provincia}</td>
                  <td>{destino.localidad}</td>
                  <td>{destino.direccion}</td>
                  <td>
                    <div className={styles.acciones}>
                      <button 
                        className={styles.accionesBtn} 
                        onClick={() => navigate(`/destinos/editar/${destino.id}`)}
                        title="Editar"
                      >
                        <Pencil />
                      </button>
                      <button 
                        className={`${styles.accionesBtn} ${styles.delete}`} 
                        onClick={() => handleDelete(destino.id)}
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