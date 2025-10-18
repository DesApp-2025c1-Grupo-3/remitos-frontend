"use client"

import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Home, Route, ClipboardList, Coins, ChevronLeft, ChevronRight, Menu } from "lucide-react"
import styles from "./components.module.css"
import DropdownMenu from "./DropdownMenu"
import { sidebarMenus } from "../lib/sidebarMenus"

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false); // Cambiado a false para que esté expandido por defecto
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null); // null = todos colapsados por defecto
  
  // Detectar si estamos en móvil
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1000;
      setIsMobile(mobile);
      
      // Si pasamos a móvil, expandir el sidebar
      if (mobile) {
        setIsCollapsed(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const closeMobile = () => {
    setIsMobileOpen(false);
  };

  // Definición de items del menú principal
  const menuItems = [
    { key: "inicio", src: Home, title: "Inicio" },
    { key: "remitos", src: ClipboardList, title: "Gestión de Remitos" },
    { key: "viajes", src: Route, title: "Gestión de Viajes" },
    { key: "costos", src: Coins, title: "Gestión de Costos" },
  ];

  type SidebarMenuKey = keyof typeof sidebarMenus;

  const getItems = (key: SidebarMenuKey) => {
    return sidebarMenus[key] || [];
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
      <aside className={`
        ${styles.sidebar} 
        ${isCollapsed ? styles.collapsed : ''} 
        ${isMobile ? styles.mobile : ''} 
        ${isMobile && isMobileOpen ? styles.mobileOpen : ''}
      `}>
        {/* Header con logo */}
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

        {/* Menú de navegación con dropdowns */}
        <nav className={styles.navLinks}>
          <div className="flex flex-col gap-1 p-2">
            {menuItems.map((item, index) => (
              <DropdownMenu
                key={index}
                IconComponent={item.src}
                isCollapsed={isCollapsed}
                title={item.title}
                items={getItems(item.key as SidebarMenuKey)}
                onClick={isMobile ? closeMobile : () => {}}
                isOpen={openSection === item.title}
                onToggle={() => setOpenSection(prev => prev === item.title ? null : item.title)}
              />
            ))}
          </div>
        </nav>
      </aside>
    </>
  );
}
