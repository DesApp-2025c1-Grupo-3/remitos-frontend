import axios from 'axios';
import { getApiUrl } from '../config/api';

const API_URL = getApiUrl();

export interface CronConfig {
  id?: number;
  hora: string; // Formato HH:MM (ej: "09:00", "14:30")
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Campos adicionales del backend
  formattedTime?: string;
  schedule?: string;
  timezone?: string;
  initialized?: boolean;
  isRunning?: boolean;
}

export interface CronConfigRequest {
  hora: string;
  activo?: boolean;
}

export const cronConfigService = {
  // Obtener la configuración actual del cron
  async getConfig(): Promise<CronConfig> {
    try {
      const response = await axios.get(`${API_URL}/api/email/cron-config`);
      const backendData = response.data;
      
      // Convertir la respuesta del backend al formato esperado por el frontend
      return {
        hora: backendData.formattedTime || '09:00',
        activo: true,
        formattedTime: backendData.formattedTime,
        schedule: backendData.schedule,
        timezone: backendData.timezone,
        initialized: backendData.initialized,
        isRunning: backendData.isRunning
      };
    } catch (error) {
      console.error('Error obteniendo configuración del cron:', error);
      // Si no existe configuración, retornar una por defecto
      return {
        hora: '09:00',
        activo: true
      };
    }
  },

  // Actualizar la configuración del cron
  async updateConfig(config: CronConfigRequest): Promise<CronConfig> {
    try {
      const response = await axios.post(`${API_URL}/api/email/update-schedule`, {
        hora: parseInt(config.hora.split(':')[0]),
        minutos: parseInt(config.hora.split(':')[1])
      });
      return response.data;
    } catch (error) {
      console.error('Error actualizando configuración del cron:', error);
      throw new Error('No se pudo actualizar la configuración del cron');
    }
  },

  // Crear nueva configuración del cron
  async createConfig(config: CronConfigRequest): Promise<CronConfig> {
    try {
      const response = await axios.post(`${API_URL}/api/email/update-schedule`, {
        hora: parseInt(config.hora.split(':')[0]),
        minutos: parseInt(config.hora.split(':')[1])
      });
      return response.data;
    } catch (error) {
      console.error('Error creando configuración del cron:', error);
      throw new Error('No se pudo crear la configuración del cron');
    }
  },

  // Guardar configuración (crear o actualizar según corresponda)
  async saveConfig(config: CronConfigRequest): Promise<CronConfig> {
    try {
      // Siempre usar el endpoint de actualización ya que el backend no mantiene estado persistente
      return await this.updateConfig(config);
    } catch (error) {
      console.error('Error guardando configuración del cron:', error);
      throw new Error('No se pudo guardar la configuración del cron');
    }
  },

  // Validar formato de hora
  validateTimeFormat(time: string): boolean {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  },

  // Formatear hora para mostrar
  formatTimeForDisplay(time: string): string {
    if (!this.validateTimeFormat(time)) {
      return '09:00';
    }
    return time;
  }
};
