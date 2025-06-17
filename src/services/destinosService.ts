import axios from 'axios';
import { Contacto } from '../types/contacto';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DESTINOS === 'true';

// Configuración de axios para incluir la API key en todas las peticiones
axios.defaults.headers.common['X-API-Key'] = import.meta.env.VITE_API_KEY;

export interface Destino {
  id: number;
  name: string;
  pais: string;
  provincia: string;
  localidad: string;
  direccion: string;
  activo: boolean;
  contactos?: Contacto[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateDestinoData {
  name: string;
  pais: string;
  provincia: string;
  localidad: string;
  direccion: string;
  contactos?: Contacto[];
}

// Interfaz para enviar al backend (sin contactos)
interface CreateDestinoBackendData {
  name: string;
  pais: string;
  provincia: string;
  localidad: string;
  direccion: string;
}

// Datos mock para desarrollo
const mockDestinos: Destino[] = [
  {
    id: 1,
    name: "Depósito Central",
    pais: "Argentina",
    provincia: "Buenos Aires",
    localidad: "La Plata",
    direccion: "Calle 7 1234",
    activo: true,
    contactos: [
      {
        id: 1,
        personaAutorizada: "Juan Pérez",
        correoElectronico: "juan@depocentral.com",
        telefono: 2211234567,
        destinoId: 1
      }
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 2,
    name: "Sucursal Montevideo",
    pais: "Uruguay",
    provincia: "Montevideo",
    localidad: "Centro",
    direccion: "Av. 18 de Julio 456",
    activo: true,
    contactos: [
      {
        id: 2,
        personaAutorizada: "María García",
        correoElectronico: "maria@sucursalmontevideo.com",
        telefono: 59812345678,
        destinoId: 2
      }
    ],
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02')
  },
  {
    id: 3,
    name: "Sucursal Santiago",
    pais: "Chile",
    provincia: "Santiago",
    localidad: "Las Condes",
    direccion: "Av. Apoquindo 789",
    activo: true,
    contactos: [
      {
        id: 3,
        personaAutorizada: "Carlos Rodríguez",
        correoElectronico: "carlos@sucursalsantiago.com",
        telefono: 56212345678,
        destinoId: 3
      }
    ],
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03')
  },
  {
    id: 4,
    name: "Depósito Norte",
    pais: "Argentina",
    provincia: "Córdoba",
    localidad: "Córdoba Capital",
    direccion: "Av. Colón 1234",
    activo: true,
    contactos: [
      {
        id: 4,
        personaAutorizada: "Ana Martínez",
        correoElectronico: "ana@deponorte.com",
        telefono: 3511234567,
        destinoId: 4
      }
    ],
    createdAt: new Date('2024-01-04'),
    updatedAt: new Date('2024-01-04')
  },
  {
    id: 5,
    name: "Sucursal Rosario",
    pais: "Argentina",
    provincia: "Santa Fe",
    localidad: "Rosario",
    direccion: "Av. Pellegrini 456",
    activo: true,
    contactos: [
      {
        id: 5,
        personaAutorizada: "Luis Fernández",
        correoElectronico: "luis@sucursalrosario.com",
        telefono: 3411234567,
        destinoId: 5
      }
    ],
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05')
  }
];

// Simular delay de red
const mockDelay = () => new Promise(resolve => setTimeout(resolve, 500));

// Función auxiliar para obtener el siguiente ID
const getNextId = (items: { id: number }[]): number => {
  return items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;
};

// Función auxiliar para obtener el siguiente ID de contacto
const getNextContactoId = (destinos: Destino[]): number => {
  const allContactos = destinos.flatMap(d => d.contactos || []);
  if (allContactos.length === 0) return 1;
  const maxId = Math.max(...allContactos.map(c => c.id || 0));
  return maxId + 1;
};

export const destinosService = {
  // Obtener todos los destinos
  async getDestinos(): Promise<Destino[]> {
    try {
      if (USE_MOCK_DATA) {
        await mockDelay();
        return mockDestinos;
      }
      const response = await axios.get(`${API_URL}/destino`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener destinos:', error);
      throw error;
    }
  },

  // Obtener un destino por ID
  async getDestinoById(id: number): Promise<Destino> {
    try {
      if (USE_MOCK_DATA) {
        await mockDelay();
        const destino = mockDestinos.find(d => d.id === id);
        if (!destino) throw new Error('Destino no encontrado');
        return destino;
      }
      const response = await axios.get(`${API_URL}/destino/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener destino con ID ${id}:`, error);
      throw error;
    }
  },

  // Crear un nuevo destino
  async createDestino(destino: CreateDestinoData): Promise<Destino> {
    try {
      if (USE_MOCK_DATA) {
        await mockDelay();
        const nextId = getNextId(mockDestinos);
        const newDestino: Destino = {
          ...destino,
          id: nextId,
          activo: true,
          contactos: destino.contactos || [],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        mockDestinos.push(newDestino);
        return newDestino;
      }

      // Remover contactos antes de enviar al backend
      const { contactos, ...destinoSinContactos } = destino;
      const response = await axios.post(`${API_URL}/destino`, destinoSinContactos as CreateDestinoBackendData);
      return response.data;
    } catch (error) {
      console.error('Error al crear destino:', error);
      throw error;
    }
  },

  // Crear un destino con contacto
  async createDestinoWithContacto(destino: CreateDestinoData & { 
    personaAutorizada: string;
    correoElectronico: string;
    telefono: number;
  }): Promise<Destino> {
    try {
      if (USE_MOCK_DATA) {
        await mockDelay();
        const nextId = getNextId(mockDestinos);
        const newDestino: Destino = {
          ...destino,
          id: nextId,
          activo: true,
          contactos: [{
            id: getNextContactoId(mockDestinos),
            personaAutorizada: destino.personaAutorizada,
            correoElectronico: destino.correoElectronico,
            telefono: destino.telefono,
            destinoId: nextId
          }],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        mockDestinos.push(newDestino);
        return newDestino;
      }
      const response = await axios.post(`${API_URL}/destinoContacto`, destino);
      return response.data;
    } catch (error) {
      console.error('Error al crear destino con contacto:', error);
      throw error;
    }
  },

  // Actualizar un destino existente
  async updateDestino(id: number, destino: Partial<CreateDestinoData>): Promise<Destino> {
    try {
      if (USE_MOCK_DATA) {
        await mockDelay();
        const index = mockDestinos.findIndex(d => d.id === id);
        if (index === -1) throw new Error('Destino no encontrado');
        
        mockDestinos[index] = {
          ...mockDestinos[index],
          ...destino,
          updatedAt: new Date()
        };
        return mockDestinos[index];
      }

      // Remover contactos antes de enviar al backend
      const { contactos, ...destinoSinContactos } = destino;
      const response = await axios.put(`${API_URL}/destino/${id}`, destinoSinContactos);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar destino con ID ${id}:`, error);
      throw error;
    }
  },

  // Eliminar un destino
  async deleteDestino(id: number): Promise<void> {
    try {
      if (USE_MOCK_DATA) {
        await mockDelay();
        const index = mockDestinos.findIndex(d => d.id === id);
        if (index === -1) throw new Error('Destino no encontrado');
        mockDestinos.splice(index, 1);
        return;
      }
      await axios.delete(`${API_URL}/destino/${id}`);
    } catch (error) {
      console.error(`Error al eliminar destino con ID ${id}:`, error);
      throw error;
    }
  },

  // Obtener destinos filtrados
  async getDestinosFiltrados(filtros: { pais?: string; provincia?: string; localidad?: string }): Promise<Destino[]> {
    try {
      if (USE_MOCK_DATA) {
        await mockDelay();
        return mockDestinos.filter(destino => {
          if (filtros.pais && destino.pais !== filtros.pais) return false;
          if (filtros.provincia && destino.provincia !== filtros.provincia) return false;
          if (filtros.localidad && destino.localidad !== filtros.localidad) return false;
          return true;
        });
      }
      const response = await axios.get(`${API_URL}/destinoFiltrado`, { params: filtros });
      return response.data;
    } catch (error) {
      console.error('Error al obtener destinos filtrados:', error);
      throw error;
    }
  }
};

// --- Servicios para georef ---
export const georefService = {
  async getProvincias() {
    const res = await fetch('https://apis.datos.gob.ar/georef/api/provincias?campos=id,nombre');
    const data = await res.json();
    return (data.provincias || []).sort((a: any, b: any) => a.nombre.localeCompare(b.nombre));
  },
  async getLocalidadesByProvincia(provinciaId: string) {
    const res = await fetch(`https://apis.datos.gob.ar/georef/api/localidades?provincia=${provinciaId}&campos=id,nombre&max=5000`);
    const data = await res.json();
    return (data.localidades || []).sort((a: any, b: any) => a.nombre.localeCompare(b.nombre));
  }
};