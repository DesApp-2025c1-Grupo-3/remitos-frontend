"use client"

import React, { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { FileText, Users, MapPin, BarChart3, CalendarDays, Truck, DollarSign, ChevronLeft, ChevronRight, Menu } from "lucide-react"
import styles from "./components.module.css";

export default function Sidebar() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // Detectar si estamos en móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1000);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const closeMobile = () => {
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Botón hamburguesa para móvil */}
      {isMobile && !isMobileOpen && (
        <button 
          className={styles.hamburgerButton}
          onClick={toggleMobile}
          aria-label="Abrir menú"
        >
          <Menu size={18} />
        </button>
      )}

      {/* Overlay para móvil */}
      {isMobile && isMobileOpen && (
        <div 
          className={styles.overlay}
          onClick={closeMobile}
        />
      )}

      {/* Sidebar */}
      <div className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''} ${isMobile ? styles.mobile : ''} ${isMobile && isMobileOpen ? styles.mobileOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <Link to="/" className={styles.logoLink} onClick={isMobile ? closeMobile : undefined}>
            <div className={styles.logoWrapper}>
              <img 
                src="/logo.png" 
                alt="Logística ACME" 
                className={styles.logoImage}
              />
            </div>
          </Link>
          
          {/* Botón de colapso solo en desktop */}
          {!isMobile && (
            <button 
              className={styles.collapseButton}
              onClick={toggleCollapse}
              aria-label={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
            >
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          )}

        </div>

        <div className={styles.navLinks}>
          <Link to="/remitos" onClick={isMobile ? closeMobile : undefined}>
            <button 
              className={`${styles.navButton} ${isActive('/remitos') ? styles.active : ''}`}
              data-tooltip="Remitos"
            >
              <FileText size={24} />
              {(isMobile || !isCollapsed) ? <span>Remitos</span> : null}
            </button>
          </Link>

          <Link to="/clientes" onClick={isMobile ? closeMobile : undefined}>
            <button 
              className={`${styles.navButton} ${isActive('/clientes') ? styles.active : ''}`}
              data-tooltip="Clientes"
            >
              <Users size={24} />
              {(isMobile || !isCollapsed) ? <span>Clientes</span> : null}
            </button>
          </Link>

          <Link to="/destinos" onClick={isMobile ? closeMobile : undefined}>
            <button 
              className={`${styles.navButton} ${isActive('/destinos') ? styles.active : ''}`}
              data-tooltip="Destinos"
            >
              <MapPin size={24} />
              {(isMobile || !isCollapsed) ? <span>Destinos</span> : null}
            </button>
          </Link>

          <Link to="/reportes" onClick={isMobile ? closeMobile : undefined}>
            <button 
              className={`${styles.navButton} ${isActive('/reportes') ? styles.active : ''}`}
              data-tooltip="Reportes"
            >
              <BarChart3 size={24} />
              {(isMobile || !isCollapsed) ? <span>Reportes</span> : null}
            </button>
          </Link>

          <Link to="/agenda" onClick={isMobile ? closeMobile : undefined}>
            <button 
              className={`${styles.navButton} ${isActive('/agenda') ? styles.active : ''}`}
              data-tooltip="Agenda"
            >
              <CalendarDays size={24} />
              {(isMobile || !isCollapsed) ? <span>Agenda</span> : null}
            </button>
          </Link>

          <a href="https://gestion-de-viajes.vercel.app/" target="_blank" rel="noopener noreferrer" onClick={isMobile ? closeMobile : undefined}>
            <button 
              className={styles.navButton}
              data-tooltip="Viajes"
            >
              <Truck size={24} />
              {(isMobile || !isCollapsed) ? <span>Viajes</span> : null}
            </button>
          </a>

          <a href="#" target="_blank" rel="noopener noreferrer" onClick={isMobile ? closeMobile : undefined}>
            <button 
              className={styles.navButton}
              data-tooltip="Costos"
            >
              <DollarSign size={24} />
              {(isMobile || !isCollapsed) ? <span>Costos</span> : null}
            </button>
          </a>
        </div>
      </div>
    </>
  );
}