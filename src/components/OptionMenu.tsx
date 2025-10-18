import { Link, useLocation } from "react-router-dom";
import React, { useEffect, useRef, useState } from "react";
import { Tooltip } from "@mui/material";

interface OptionMenuProps {
  isCollapsed: boolean;
  onClick: () => void;
  title: string;
  link?: string;
  IconComponent: React.FC<{color?: string, className?: string}>;
  isSubmenu?: boolean;
}

export default function OptionMenu({ 
  isCollapsed, 
  onClick, 
  IconComponent, 
  title, 
  link, 
  isSubmenu = false 
}: OptionMenuProps) {
  const location = useLocation();
  const textRef = useRef<HTMLParagraphElement>(null);
  const [isActive, setIsActive] = useState(false);

  // Verificar si el link es externo (comienza con http)
  const isExternal = link && link.startsWith("http");

  // Verificar si la ruta actual coincide con el link
  useEffect(() => {
    const currentPath = location.pathname;

    // Si es la home exacta
    if (link === "" && currentPath === "/") {
      setIsActive(true);
    } else if (link && !isExternal && currentPath.includes(link)) {
      // Solo para links internos, verificar si la ruta actual incluye el link
      setIsActive(true);
    } else {
      setIsActive(false);
    }
  }, [location, link, isExternal]);

  const content = (
    <>
      <IconComponent 
        color={isActive ? "#E65F2B" : undefined} 
        className={isSubmenu ? "sidebar-sub-icon" : "sidebar-icon"}
      />
      {!isCollapsed && (
        <span className="sidebar-text">{title}</span>
      )}
    </>
  );

  // Si es un link externo, usar etiqueta <a>
  if (isExternal) {
    return (
      <Tooltip title={isCollapsed ? title : ""} placement="right" arrow>
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => { onClick(); }}
          className={`sidebar-sub-item ${isActive ? 'active' : ''}`}
        >
          {content}
        </a>
      </Tooltip>
    );
  }

  // Si es un link interno, usar Link de react-router-dom
  return (
    <Tooltip title={isCollapsed ? title : ""} placement="right" arrow>
      <Link 
        to={`/${link || ""}`} 
        onClick={onClick} 
        className={`sidebar-sub-item ${isActive ? 'active' : ''}`}
      >
        {content}
      </Link>
    </Tooltip>
  );
}

