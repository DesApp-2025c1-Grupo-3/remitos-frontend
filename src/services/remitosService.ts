import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_REMITOS === 'true';

export interface Remito {
  id: number;
  numero: string;
  cliente: string;
  destino?: string;
  fecha: string;
  peso: string;
  volumen: string;
  valor: string;
  tipo: string;
  requisitos: string;
  observaciones: string;
  cantidadPallets: string;
  cantidadBultos: string;
  cantidadRacks: string;
  cantidadBobinas: string;
  cantidadTambores: string;
}

// Datos mock para desarrollo
const mockRemitos: Remito[] = [
  {
    id: 1,
    numero: 'R-00123',
    cliente: 'Cliente A',
    destino: undefined,
    fecha: '15/04/2023',
    peso: '1500',
    volumen: '3.5',
    valor: '25000',
    tipo: 'categoria1',
    requisitos: 'Manipular con cuidado',
    observaciones: 'Entrega urgente',
    cantidadPallets: '4',
    cantidadBultos: '12',
    cantidadRacks: '2',
    cantidadBobinas: '0',
    cantidadTambores: '0',
  },
  {
    id: 2,
    numero: 'R-00124',
    cliente: 'Cliente B',
    destino: 'Santiago, Chile',
    fecha: '18/04/2023',
    peso: '1200',
    volumen: '2.1',
    valor: '18000',
    tipo: 'categoria2',
    requisitos: '',
    observaciones: '',
    cantidadPallets: '2',
    cantidadBultos: '8',
    cantidadRacks: '1',
    cantidadBobinas: '0',
    cantidadTambores: '0',
  },
];

export const remitosService = {
  async getRemitos(): Promise<Remito[]> {
    try {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return mockRemitos;
      }
      const response = await axios.get(`${API_URL}/remitos`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener remitos:', error);
      throw error;
    }
  },

  async getRemitoById(id: number): Promise<Remito> {
    try {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const remito = mockRemitos.find(r => r.id === id);
        if (!remito) throw new Error('Remito no encontrado');
        return remito;
      }
      const response = await axios.get(`${API_URL}/remito/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener remito con ID ${id}:`, error);
      throw error;
    }
  },

  async createRemito(remito: Omit<Remito, 'id'>): Promise<Remito> {
    try {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const newRemito = {
          ...remito,
          id: Math.max(...mockRemitos.map(r => r.id)) + 1
        };
        mockRemitos.push(newRemito);
        return newRemito;
      }
      const response = await axios.post(`${API_URL}/remito`, remito);
      return response.data;
    } catch (error) {
      console.error('Error al crear remito:', error);
      throw error;
    }
  },

  async updateRemito(id: number, remito: Partial<Remito>): Promise<Remito> {
    try {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const index = mockRemitos.findIndex(r => r.id === id);
        if (index === -1) throw new Error('Remito no encontrado');
        mockRemitos[index] = {
          ...mockRemitos[index],
          ...remito
        };
        return mockRemitos[index];
      }
      const response = await axios.put(`${API_URL}/remito/${id}`, remito);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar remito con ID ${id}:`, error);
      throw error;
    }
  },

  async deleteRemito(id: number): Promise<void> {
    try {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const index = mockRemitos.findIndex(r => r.id === id);
        if (index === -1) throw new Error('Remito no encontrado');
        mockRemitos.splice(index, 1);
        return;
      }
      await axios.delete(`${API_URL}/remito/${id}`);
    } catch (error) {
      console.error(`Error al eliminar remito con ID ${id}:`, error);
      throw error;
    }
  }
};