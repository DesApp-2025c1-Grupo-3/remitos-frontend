import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { remitosService } from "../../services/remitosService";
import styles from "./remitos.module.css";

export default function Remitos() {
  const [remitos, setRemitos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    remitosService.getRemitos()
      .then(data => {
        setRemitos(data);
        setError(null);
      })
      .catch(() => setError("Error al cargar los remitos"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este remito?")) {
      try {
        await remitosService.deleteRemito(id);
        setRemitos(remitos.filter(remito => remito.id !== id));
      } catch {
        setError("Error al eliminar el remito");
      }
    }
  };

  if (loading) return <div className={styles.container}>Cargando...</div>;
  if (error) return <div className={styles.container}>{error}</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.titulo}>Remitos</h1>
      <div className={styles.wrapper}>
        <div className={styles.crearBtnContainer}>
          <Link to="/remitos/nuevo">
            <button className={styles.crearBtn}>Crear Remito</button>
          </Link>
        </div>
        <div className={styles.tablaContenedor}>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>Número</th>
                <th>Cliente</th>
                <th>Destino</th>
                <th>Fecha</th>
                <th style={{ textAlign: "center" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {remitos.map(remito => (
                <tr key={remito.id}>
                  <td>{remito.numero}</td>
                  <td>{remito.cliente}</td>
                  <td>{remito.destino}</td>
                  <td>{remito.fecha}</td>
                  <td>
                    <div className={styles.acciones}>
                      <Link to={`/remitos/editar/${remito.id}`}>
                        <button className={styles.accionesBtn}>Editar</button>
                      </Link>
                      <button
                        className={`${styles.accionesBtn} ${styles.delete}`}
                        onClick={() => handleDelete(remito.id)}
                      >
                        Borrar
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