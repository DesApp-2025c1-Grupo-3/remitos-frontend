import axios from 'axios';
import { getApiUrl } from '../config/api';

const API_URL = getApiUrl();

export interface TipoEmpresa {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const tipoEmpresaService = {
  async getTiposEmpresa(): Promise<TipoEmpresa[]> {
    try {
      const response = await axios.get(`${API_URL}/api/tipos-empresa`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error al obtener los tipos de empresa:', error);
      throw error;
    }
  },

  async getTipoEmpresaById(id: number): Promise<TipoEmpresa> {
    try {
      const response = await axios.get(`${API_URL}/api/tipos-empresa/${id}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error al obtener el tipo de empresa:', error);
      throw error;
    }
  },

  async createTipoEmpresa(data: { nombre: string; descripcion?: string }): Promise<TipoEmpresa> {
    try {
      const response = await axios.post(`${API_URL}/api/tipos-empresa`, data);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error al crear el tipo de empresa:', error);
      throw error;
    }
  },

  async updateTipoEmpresa(id: number, data: { nombre?: string; descripcion?: string; activo?: boolean }): Promise<TipoEmpresa> {
    try {
      const response = await axios.put(`${API_URL}/api/tipos-empresa/${id}`, data);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error al actualizar el tipo de empresa:', error);
      throw error;
    }
  },

  async deleteTipoEmpresa(id: number): Promise<void> {
    try {
      await axios.delete(`${API_URL}/api/tipos-empresa/${id}`);
    } catch (error) {
      console.error('Error al eliminar el tipo de empresa:', error);
      throw error;
    }
  }
};
