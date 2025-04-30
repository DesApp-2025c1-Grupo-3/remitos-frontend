"use client"

import React, { useState } from "react"
import { Link } from "react-router-dom"
import { ChevronLeft, ChevronRight, Menu } from "lucide-react"

import styles from "./components.module.css";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ""}`}
    >
      <Link to="/" className={styles.logoLink}>
        <div
          className={`${styles.logoContainer} ${collapsed ? styles.logoCollapsed : ""}`}
        >
          <div className={styles.logoWrapper}>
            <img src="/logo.png" alt="Logística ACME" className={styles.logoImage} />
          </div>
        </div>
      </Link>

      <div className={styles.navLinks}>
        <Link to="/remitos">
          <button
            className={`${styles.navButton} ${styles.navButtonLink} ${collapsed ? styles.navButtonCollapsed : ""}`}
          >
            {collapsed ? <Menu className={styles.navIcon} size={18} /> : "Remitos"}
          </button>
        </Link>

        <Link to="/clientes">
          <button
            className={`${styles.navButton} ${styles.navButtonLink} ${collapsed ? styles.navButtonCollapsed : ""}`}
          >
            {collapsed ? <Menu className={styles.navIcon} size={18} /> : "Clientes"}
          </button>
        </Link>

        <Link to="/destinos">
          <button
            className={`${styles.navButton} ${styles.navButtonLink} ${collapsed ? styles.navButtonCollapsed : ""}`}
          >
            {collapsed ? <Menu className={styles.navIcon} size={18} /> : "Destinos"}
          </button>
        </Link>

        <Link to="/reportes">
          <button
            className={`${styles.navButton} ${styles.navButtonLink} ${collapsed ? styles.navButtonCollapsed : ""}`}
          >
            {collapsed ? <Menu className={styles.navIcon} size={18} /> : "Reportes"}
          </button>
        </Link>
      </div>

      <button
        className={styles.collapseButton}
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </div>
  );
}