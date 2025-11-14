import { ChevronLeft, ChevronRight, ClipboardList, Coins, Home, Route } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DropdownMenu from "./DropdownMenu";
import { sidebarMenus } from "../lib/sidebarMenus";
import { Box, Button, Stack, Tooltip} from "@mui/material";


interface SidebarProps {
  isVisible: boolean;
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Sidebar({isVisible, setIsVisible}: SidebarProps) {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSidebar = () => {
    setIsCollapsed(prev => !prev);
  };

  const menuItems = [
    { key: "inicio", src: Home, title: "Inicio" },
    { key: "viajes", src: Route , title: "Gestión de Viajes" },
    { key: "remitos", src: ClipboardList, title: "Gestión de Remitos" },
    { key: "costos", src: Coins, title: "Gestión de Costos" },
  ];

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1200);
  
  useEffect(() => {
    const handleResize = () => {
      const mobileWidth = window.innerWidth < 1200;
      setIsMobile(mobileWidth);

      // Si pasás a mobile, expandí el sidebar
      if (mobileWidth) {
        setIsCollapsed(false);
      }
    };
  
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const selectOption =() => {
    setIsVisible(false);
  }

  type SidebarMenuKey = keyof typeof sidebarMenus;

  const getItems = (key: SidebarMenuKey) => {
    return sidebarMenus[key] || [];
  };

  const isMainApp = window.location.host.includes("gestion-de-viajes.vercel.app") || window.location.host.includes("localhost");

  const handleLogoClick = () => {
    if (isMainApp) {
      navigate("/");
    } else {
      window.location.href = "https://gestion-de-viajes.vercel.app/";
    }
    selectOption()
  };

  console.log("Sidebar render - isVisible:", isVisible, "isCollapsed:", isCollapsed, "isMobile:", isMobile);

  return (
    
      <Box
      component="aside"
      sx={{
        position: { xs: "fixed", lg: "relative" },
        top: 0,
        left: 0,
        height: "100%",
        backgroundColor: "white",
        borderRight: "1px solid #e5e7eb",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        zIndex: 40,
        display: "flex",
        flexDirection: "column",
        width: isCollapsed ? 72 : 240,
        transform: isVisible ? "translateX(0)" : (isMobile ? "translateX(-100%)" : "translateX(0)"),
        transition: "transform 0.3s ease-in-out, width 0.3s ease-in-out",
      }}>
        {/* Encabezado */}
        <Box 
          onClick={handleLogoClick}
          sx={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            px: "8px",
            borderBottom: "1px solid #f3f4f6",
            position: "relative",
          }}  
          aria-label="Ir a la página de inicio"
        >
          <Tooltip title={isCollapsed ? "Ir a la página de inicio" : ""} placement="right" arrow>
            <img 
              src={isCollapsed ? "/logo_chico.png" : "/logo.jpg"}
              alt="Gestión de viajes logo con camión naranja sobre fondo blanco, transmite profesionalismo y confianza"
              style={{
                minHeight: "48px",
                margin: "12px auto",
                width: "100%",
                transition: "all 0.3s ease-in-out",
              }}
            />
          </Tooltip>
        </Box>

        {/* Menú */}
        <Box
          component="nav"
          sx={{
            flex: 1,
            overflowY: "auto",
            py: 3,
            px: 0,
            minHeight: 0,
          }}
        >
          <Stack
            direction="column"
            gap={1}
            p={1}
            alignItems="center"
          >
              {menuItems.map((item, index) => (
                <DropdownMenu
                  key={index}
                  IconComponent={item.src}
                  isCollapsed={isCollapsed}
                  title={item.title}
                  items={getItems(item.key as SidebarMenuKey)}
                  onClick={selectOption}
                  isOpen={openSection === item.title}
                  onToggle={() => setOpenSection(prev => prev === item.title ? null : item.title)}
                />
              ))}
            </Stack>
        </Box>

        {/* Botón de cerrar */}
        {!isMobile && (
          <Button
            onClick={toggleSidebar}
            aria-label={isCollapsed ? "Expandir menú" : "Contraer menú"}
            sx={{
              position: "absolute",
              top: "28px",
              right: "-12px",
              zIndex: 10,
              backgroundColor: "white",
              padding: "4px",
              borderRadius: "50%",
              width: "max-content",
              border: "1px solid #d1d5db",
              minWidth: "1px",
              color: "#6b7280",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              "&:hover": {
                backgroundColor: "#f3f4f6",
              },
              transition: "background-color 0.2s ease-in-out, outline 0.2s ease-in-out",
              display: isVisible ? 'none' : {xs: "none", lg: "flex"},
              alignItems: "center",
              justifyContent: "center",
              "&.MuiTouchRipple-root": {
                backgroundColor: "#f3f4f6",
                borderRadius: "50%",
              }
            }}
          >
            {isCollapsed ? (
                <ChevronRight style={{width: "16px", height: "16px", color: "#4a5565"}} />
            ) : (
                <ChevronLeft style={{width: "16px", height: "16px", color: "#4a5565"}} />
            )}
          </Button>
        )}
    </Box>
  );
}