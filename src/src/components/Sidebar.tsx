"use client"

import React from "react"
import { Link } from "react-router-dom"
import styles from "./components.module.css";

export default function Sidebar() {
  return (
    <div className={styles.sidebar}>
      <Link to="/" className={styles.logoLink}>
          <div className={styles.logoWrapper}>
            <img 
              src="/logo.png" 
              alt="Logística ACME" 
              className={styles.logoImage}
              style={{ background: 'transparent' }}
            />
          </div>
      </Link>

      <div className={styles.navLinks}>
        <Link to="/remitos">
          <button className={styles.navButton}>
            Remitos
          </button>
        </Link>

        <Link to="/clientes">
          <button className={styles.navButton}>
            Clientes
          </button>
        </Link>

        <Link to="/destinos">
          <button className={styles.navButton}>
            Destinos
          </button>
        </Link>

        <Link to="/reportes">
          <button className={styles.navButton}>
            Reportes
          </button>
        </Link>
      </div>
    </div>
  );
}