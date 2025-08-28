import axios from 'axios';
import { getApiUrl } from '../config/api';

const API_URL = getApiUrl();

export interface TipoMercaderia {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const tipoMercaderiaService = {
  async getTiposMercaderia(): Promise<TipoMercaderia[]> {
    try {
      const response = await axios.get(`${API_URL}/api/tipos-mercaderia`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error al obtener los tipos de mercadería:', error);
      throw error;
    }
  },

  async getTipoMercaderiaById(id: number): Promise<TipoMercaderia> {
    try {
      const response = await axios.get(`${API_URL}/api/tipos-mercaderia/${id}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error al obtener el tipo de mercadería:', error);
      throw error;
    }
  },

  async createTipoMercaderia(data: { nombre: string; descripcion?: string }): Promise<TipoMercaderia> {
    try {
      const response = await axios.post(`${API_URL}/api/tipos-mercaderia`, data);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error al crear el tipo de mercadería:', error);
      throw error;
    }
  },

  async updateTipoMercaderia(id: number, data: { nombre?: string; descripcion?: string; activo?: boolean }): Promise<TipoMercaderia> {
    try {
      const response = await axios.put(`${API_URL}/api/tipos-mercaderia/${id}`, data);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error al actualizar el tipo de mercadería:', error);
      throw error;
    }
  },

  async deleteTipoMercaderia(id: number): Promise<void> {
    try {
      await axios.delete(`${API_URL}/api/tipos-mercaderia/${id}`);
    } catch (error) {
      console.error('Error al eliminar el tipo de mercadería:', error);
      throw error;
    }
  }
};
