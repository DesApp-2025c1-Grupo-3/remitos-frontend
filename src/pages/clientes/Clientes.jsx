import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "./clientes.module.css";
import { clientesService } from "../../services/clientesService";
import { Pencil, Trash2 } from "lucide-react";  // Importa los íconos

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
    try {
      await clientesService.deleteCliente(id);
      setClientes((prev) => prev.filter((cliente) => cliente.id !== id));
    } catch (err) {
      console.error("Error al eliminar cliente", err);
    }
  };

  if (loading) return <p>Cargando clientes...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className={styles.contenedor}>
      <div className={styles.encabezado}>
        <h1 className={styles.titulo}>Clientes</h1>
        <Link to="/clientes/nuevo">
          <button className={styles.botonCrear}>Crear Cliente</button>
        </Link>
      </div>

      <div className={styles.listaClientes}>
        {clientes.map((cliente) => (
          <div key={cliente.id} className={styles.clienteCard}>
            <div className={styles.clienteContenido}>
              <div>
                <p className={styles.clienteTexto}>{cliente.razonSocial}</p>
                <p className={styles.clienteSecundario}>
                  CUIT/RUIT: {cliente.cuit_rut} | Tipo: {cliente.tipoEmpresa}
                </p>
                <p className={styles.clienteSecundario}>Dirección: {cliente.direccion}</p>
                <div className={styles.contactos}>
                  <p className="text-sm font-medium">
                    Contactos ({cliente.contactos?.length ?? 0}):
                  </p>
                  {cliente.contactos?.map((contacto, index) => (
                    <p key={index} className={styles.contactoItem}>
                      {contacto.nombre} - {contacto.email} - {contacto.telefono}
                    </p>
                  ))}
                </div>
              </div>
              <div className={styles.botonGrupo}>
                <button
                  className={`${styles.botonAccion} ${styles.botonBorrar}`}
                  onClick={() => handleDelete(cliente.id)}
                  title="Borrar"
                >
                  <Trash2 /> {/* Ícono de Borrar */}
                </button>
                <Link to={`/clientes/editar/${cliente.id}`}>
                  <button className={`${styles.botonAccion} ${styles.botonEditar}`} title="Editar">
                    <Pencil /> {/* Ícono de Editar */}
                  </button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
