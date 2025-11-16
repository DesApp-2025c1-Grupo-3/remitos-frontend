import { Building2, CalendarDays, ChartColumn, DollarSign, FileText, Fuel, Layers, Map, MapPin, Navigation, Package, Truck, User, Users, Warehouse,  } from "lucide-react";

// Configuración de menús para la sidebar unificada
// Cada sistema (Viajes, Remitos, Costos) tiene sus propios items

export const sidebarMenus = {
  // Gestión de Viajes - Links externos al sistema de viajes
  viajes: [
    { src: User, title: "Choferes", link: "https://gestion-de-viajes.vercel.app/drivers" },
    { src: Warehouse, title: "Depósitos", link: "https://gestion-de-viajes.vercel.app/depots" },
    { src: Building2, title: "Empresas", link: "https://gestion-de-viajes.vercel.app/companies" },
    { src: Truck, title: "Vehículos", link: "https://gestion-de-viajes.vercel.app/vehicles" },
    { src: Truck, title: "Tipo de Vehículos", link: "https://gestion-de-viajes.vercel.app/vehicles" },
    { src: Navigation, title: "Viajes", link: "https://gestion-de-viajes.vercel.app/trips/distribution" },
  ],
  
  // Gestión de Remitos - Links INTERNOS (sin https, navegación dentro de la app)
  remitos: [
    { src: CalendarDays, title: "Agenda", link: "agenda" },
    { src: Users, title: "Clientes", link: "clientes" },
    { src: MapPin, title: "Destinos", link: "destinos" },
    { src: FileText, title: "Remitos", link: "remitos" },
    { src: ChartColumn, title: "Reportes", link: "reportes" },
  ],
  
  // Gestión de Costos - Links externos al sistema de costos
  costos: [
    { src: Layers, title: "Adicionales", link: "https://tarifas-de-costo.netlify.app/adicionales" },
    { src: Package, title: "Cargas", link: "https://tarifas-de-costo.netlify.app/tipos-de-carga" },
    { src: Fuel, title: "Combustible", link: "https://tarifas-de-costo.netlify.app/combustible" },
    { src: DollarSign, title: "Tarifas", link: "https://tarifas-de-costo.netlify.app/tarifas" },
    { src: Map, title: "Zonas", link: "https://tarifas-de-costo.netlify.app/zonas" },
  ],
  
  // Inicio - sin subitems (se maneja diferente en el componente)
  inicio: []
};

