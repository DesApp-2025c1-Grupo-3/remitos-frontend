import axios from 'axios';

const API_URL = 'http://localhost:3000/api'; // Ajusta la URL según tu configuración

export interface Destino {
  id: number;
  nombre: string;
  pais: string;
  provincia: string;
  localidad: string;
  direccion: string;
}

// Datos mock para desarrollo
const mockDestinos: Destino[] = [
  {
    id: 1,
    nombre: "Depósito Central",
    pais: "Argentina",
    provincia: "Buenos Aires",
    localidad: "La Plata",
    direccion: "Calle 7 1234"
  },
  {
    id: 2,
    nombre: "Sucursal Montevideo",
    pais: "Uruguay",
    provincia: "Montevideo",
    localidad: "Centro",
    direccion: "Av. 18 de Julio 456"
  },
  {
    id: 3,
    nombre: "Sucursal Santiago",
    pais: "Chile",
    provincia: "Santiago",
    localidad: "Las Condes",
    direccion: "Av. Apoquindo 789"
  },
  {
    id: 4,
    nombre: "Depósito Norte",
    pais: "Argentina",
    provincia: "Córdoba",
    localidad: "Córdoba Capital",
    direccion: "Av. Colón 1234"
  },
  {
    id: 5,
    nombre: "Sucursal Rosario",
    pais: "Argentina",
    provincia: "Santa Fe",
    localidad: "Rosario",
    direccion: "Av. Pellegrini 456"
  }
];

export const destinosService = {
  // Obtener todos los destinos
  async getDestinos(): Promise<Destino[]> {
    try {
      // Simulamos un delay de la API
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockDestinos;
      // const response = await axios.get(`${API_URL}/destinos`);
      // return response.data;
    } catch (error) {
      console.error('Error al obtener destinos:', error);
      throw error;
    }
  },

  // Obtener un destino por ID
  async getDestinoById(id: number): Promise<Destino> {
    try {
      // Simulamos un delay de la API
      await new Promise(resolve => setTimeout(resolve, 500));
      const destino = mockDestinos.find(d => d.id === id);
      if (!destino) throw new Error('Destino no encontrado');
      return destino;
      // const response = await axios.get(`${API_URL}/destino/${id}`);
      // return response.data;
    } catch (error) {
      console.error(`Error al obtener destino con ID ${id}:`, error);
      throw error;
    }
  },

  // Crear un nuevo destino
  async createDestino(destino: Omit<Destino, 'id'>): Promise<Destino> {
    try {
      // Simulamos un delay de la API
      await new Promise(resolve => setTimeout(resolve, 500));
      const newDestino = {
        ...destino,
        id: Math.max(...mockDestinos.map(d => d.id)) + 1
      };
      mockDestinos.push(newDestino);
      return newDestino;
      // const response = await axios.post(`${API_URL}/destino`, destino);
      // return response.data;
    } catch (error) {
      console.error('Error al crear destino:', error);
      throw error;
    }
  },

  // Actualizar un destino existente
  async updateDestino(id: number, destino: Partial<Destino>): Promise<Destino> {
    try {
      // Simulamos un delay de la API
      await new Promise(resolve => setTimeout(resolve, 500));
      const index = mockDestinos.findIndex(d => d.id === id);
      if (index === -1) throw new Error('Destino no encontrado');
      
      mockDestinos[index] = {
        ...mockDestinos[index],
        ...destino
      };
      return mockDestinos[index];
      // const response = await axios.put(`${API_URL}/destino/${id}`, destino);
      // return response.data;
    } catch (error) {
      console.error(`Error al actualizar destino con ID ${id}:`, error);
      throw error;
    }
  },

  // Eliminar un destino
  async deleteDestino(id: number): Promise<void> {
    try {
      // Simulamos un delay de la API
      await new Promise(resolve => setTimeout(resolve, 500));
      const index = mockDestinos.findIndex(d => d.id === id);
      if (index === -1) throw new Error('Destino no encontrado');
      mockDestinos.splice(index, 1);
      // await axios.delete(`${API_URL}/destino/${id}`);
    } catch (error) {
      console.error(`Error al eliminar destino con ID ${id}:`, error);
      throw error;
    }
  }
}; 