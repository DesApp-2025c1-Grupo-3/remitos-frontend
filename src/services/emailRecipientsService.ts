import axios from 'axios';
import { getApiUrl } from '../config/api';
import { EmailRecipient } from '../components/EmailChipsInput/EmailChipsInput';

const API_URL = getApiUrl();

export interface CreateEmailRecipientRequest {
  email: string;
  nombre?: string;
}

export interface UpdateEmailRecipientRequest {
  email?: string;
  nombre?: string;
  activo?: boolean;
}

export const emailRecipientsService = {
  // Obtener todos los destinatarios activos
  async getRecipients(): Promise<EmailRecipient[]> {
    try {
      const response = await axios.get(`${API_URL}/api/email-destinatarios`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error obteniendo destinatarios:', error);
      throw new Error('No se pudieron obtener los destinatarios');
    }
  },

  // Crear un nuevo destinatario
  async createRecipient(email: string, nombre?: string): Promise<EmailRecipient> {
    try {
      const response = await axios.post(`${API_URL}/api/email-destinatarios`, {
        email,
        nombre
      });
      return response.data.data;
    } catch (error) {
      console.error('Error creando destinatario:', error);
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('No se pudo crear el destinatario');
    }
  },

  // Actualizar un destinatario
  async updateRecipient(id: number, data: UpdateEmailRecipientRequest): Promise<EmailRecipient> {
    try {
      const response = await axios.put(`${API_URL}/api/email-destinatarios/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error actualizando destinatario:', error);
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('No se pudo actualizar el destinatario');
    }
  },

  // Eliminar (desactivar) un destinatario
  async deleteRecipient(id: number): Promise<void> {
    try {
      await axios.delete(`${API_URL}/api/email-destinatarios/${id}`);
    } catch (error) {
      console.error('Error eliminando destinatario:', error);
      throw new Error('No se pudo eliminar el destinatario');
    }
  },

  // Validar formato de email
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  },

  // Formatear email para mostrar
  formatEmailForDisplay(email: string): string {
    return email.trim().toLowerCase();
  }
};
