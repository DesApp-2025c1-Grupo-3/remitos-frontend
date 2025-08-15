import axios from 'axios';
import { getApiUrl } from '../config/api';

const API_URL = getApiUrl();

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