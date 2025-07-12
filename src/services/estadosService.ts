import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface Estado {
  id: number;
  nombre: string;
  descripcion?: string;
}

export const estadosService = {
  async getEstados(): Promise<Estado[]> {
    try {
      const response = await axios.get(`${API_URL}/estado`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener los estados:', error);
      throw error;
    }
  },
}; 