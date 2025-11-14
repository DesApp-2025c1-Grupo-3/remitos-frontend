import React, { useRef } from "react";
import OptionMenu from "./OptionMenu";
import { Tooltip } from "@mui/material";
import { useLocation } from "react-router-dom";

interface DropdownMenuProps {
  isCollapsed: boolean;
  IconComponent: React.FC<{color?: string, className?: string}>;
  title: string;
  items: { src: React.FC<{color?: string, className?: string}>, title: string, link?: string }[];
  onClick: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function DropdownMenu({ 
  IconComponent, 
  title, 
  items, 
  isCollapsed, 
  onClick, 
  isOpen, 
  onToggle 
}: DropdownMenuProps) {
  const textRef = useRef<HTMLParagraphElement>(null);
  const location = useLocation();

  // Verificar si algún item del menú coincide con la ubicación actual
  // Solo para links internos (sin http)
  const isLocationSection = items.some(item => {
    if (!item.link) return false;
    const isExternal = item.link.startsWith("http");
    if (isExternal) return false;
    return location.pathname.includes(item.link);
  }) || (title === "Inicio" && location.pathname === "/");

  // Si es "Inicio", renderizar como item simple sin dropdown
  if (title === "Inicio") {
    return (
      <div className="sidebar-dropdown">
        <Tooltip title={isCollapsed ? title : ""} placement="right" arrow>
          <a 
            href="https://gestion-de-viajes.vercel.app/"
            className={`sidebar-main-item ${isLocationSection ? 'active' : ''}`}
            onClick={onClick}
          >
            <IconComponent 
              color={isLocationSection ? "#E65F2B" : undefined} 
              className="sidebar-icon"
            />
            {!isCollapsed && (
              <span className="sidebar-text">{title}</span>
            )}
          </a>
        </Tooltip>
      </div>
    );
  }

  // Para otros menús, renderizar con dropdown
  return (
    <div className="sidebar-dropdown">
      <Tooltip title={isCollapsed ? title : ""} placement="right" arrow>
        <div 
          className={`sidebar-main-item ${isLocationSection && !isOpen ? 'active' : ''}`}
          onClick={onToggle}
        >
          <IconComponent 
            color={isLocationSection && !isOpen ? "#E65F2B" : undefined} 
            className="sidebar-icon"
          />
          {!isCollapsed && (
            <span className="sidebar-text">{title}</span>
          )}
        </div>
      </Tooltip>

      {/* Lista de subitems con animación */}
      <div className={`sidebar-dropdown-content ${isOpen ? 'expanded' : 'collapsed'}`}>
        {items.map((item, index) => (
          <OptionMenu 
            key={index} 
            IconComponent={item.src}
            title={item.title}
            isCollapsed={isCollapsed}
            link={item.link}
            onClick={onClick}
            isSubmenu={true}
          />
        ))}
      </div>
    </div>
  );
}

