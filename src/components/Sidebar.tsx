"use client"

import React from "react"
import { Link, useLocation } from "react-router-dom"
import { FileText, Users, MapPin, BarChart3, CalendarDays, Truck, DollarSign } from "lucide-react"
import styles from "./components.module.css";

export default function Sidebar() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className={styles.sidebar}>
      <Link to="/" className={styles.logoLink}>
        <div className={styles.logoWrapper}>
          <img 
            src="/logo.png" 
            alt="Logística ACME" 
            className={styles.logoImage}
          />
        </div>
      </Link>

      <div className={styles.navLinks}>
        <Link to="/remitos">
          <button className={`${styles.navButton} ${isActive('/remitos') ? styles.active : ''}`}>
            <FileText size={20} />
            <span>Remitos</span>
          </button>
        </Link>

        <Link to="/clientes">
          <button className={`${styles.navButton} ${isActive('/clientes') ? styles.active : ''}`}>
            <Users size={20} />
            <span>Clientes</span>
          </button>
        </Link>

        <Link to="/destinos">
          <button className={`${styles.navButton} ${isActive('/destinos') ? styles.active : ''}`}>
            <MapPin size={20} />
            <span>Destinos</span>
          </button>
        </Link>

        <Link to="/reportes">
          <button className={`${styles.navButton} ${isActive('/reportes') ? styles.active : ''}`}>
            <BarChart3 size={20} />
            <span>Reportes</span>
          </button>
        </Link>

        <Link to="/agenda">
          <button className={`${styles.navButton} ${isActive('/agenda') ? styles.active : ''}`}>
            <CalendarDays size={20} />
            <span>Agenda</span>
          </button>
        </Link>

        <a href="https://gestion-de-viajes.vercel.app/" target="_blank" rel="noopener noreferrer">
          <button className={styles.navButton}>
            <Truck size={20} />
            <span>Viajes</span>
          </button>
        </a>

        <a href="#" target="_blank" rel="noopener noreferrer">
          <button className={styles.navButton}>
            <DollarSign size={20} />
            <span>Costos</span>
          </button>
        </a>
      </div>
    </div>
  );
}