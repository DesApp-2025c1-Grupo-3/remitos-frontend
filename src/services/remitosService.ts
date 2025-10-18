import axios from 'axios';
import { getApiUrl } from '../config/api';

const API_URL = getApiUrl();

// Interface que refleja la estructura real del backend
export interface Cliente {
  id: number;
  razonSocial: string;
  cuit_rut: string;
  direccion: string;
}

export interface Destino {
  id: number;
  nombre: string;
  provincia: string;
  localidad: string;
  direccion: string;
}

export interface Estado {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface Mercaderia {
  id: number;
  tipoMercaderiaId: number;
  valorDeclarado: number;
  volumenMetrosCubico: number;
  pesoMercaderia: number;
  cantidadBobinas?: number;
  cantidadRacks?: number;
  cantidadBultos?: number;
  cantidadPallets?: number;
  requisitosEspeciales?: string;
  remitosId: number;
  // Relación incluida
  tipoMercaderia?: {
    id: number;
    nombre: string;
    descripcion?: string;
  };
}

export interface Remito {
  id: number;
  numeroAsignado: string;
  fechaEmision: string;
  fechaAgenda?: string | null;
  observaciones?: string;
  archivoAdjunto?: string;
  prioridad: 'normal' | 'alta' | 'urgente';
  activo: boolean;
  clienteId?: number;
  destinoId?: number;
  estadoId?: number;
  mercaderiaId?: number; // Mantener por compatibilidad, pero usar mercaderias
  // Relaciones incluidas
  cliente?: Cliente;
  destino?: Destino;
  estado?: Estado;
  mercaderia?: Mercaderia; // Mantener por compatibilidad
  mercaderias?: Mercaderia[]; // Nueva estructura: array de mercaderías
  createdAt: string;
  updatedAt: string;
  razonesNoEntrega?: string[];
  esReentrega?: boolean;
}

export interface RemitoFormData {
  numeroAsignado: string;
  observaciones?: string;
  prioridad: 'normal' | 'alta' | 'urgente';
  clienteId: number;
  destinoId: number;
  // Mercaderías como array
  mercaderias: Mercaderia[];
  // Archivo adjunto
  archivoAdjunto?: File;
}

export interface RemitosResponse {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  data: Remito[];
}

export interface RemitosFilters {
  numeroAsignado?: string;
  clienteId?: number;
  destinoId?: number;
  estadoId?: number;
  prioridad?: 'normal' | 'alta' | 'urgente';
  fechaDesde?: string;
  fechaHasta?: string;
  fechaAgenda?: string;
}

export interface RemitoUpdateData extends Partial<RemitoFormData> {
  razonNoEntrega?: string;
  razonesNoEntrega?: string[];
  estadoId?: number;
  fechaEmision?: string | null;
  fechaAgenda?: string | null;
}

export const remitosService = {
  async getRemitos(page: number = 1, limit: number = 20, filters?: RemitosFilters): Promise<RemitosResponse> {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      
      if (filters) {
        if (filters.numeroAsignado) params.append('numeroAsignado', filters.numeroAsignado);
        if (filters.clienteId) params.append('clienteId', filters.clienteId.toString());
        if (filters.destinoId) params.append('destinoId', filters.destinoId.toString());
        if (filters.estadoId) params.append('estadoId', filters.estadoId.toString());
        if (filters.prioridad) params.append('prioridad', filters.prioridad);
        if (filters.fechaDesde) params.append('fechaDesde', filters.fechaDesde);
        if (filters.fechaHasta) params.append('fechaHasta', filters.fechaHasta);
        if (filters.fechaAgenda) params.append('fechaAgenda', filters.fechaAgenda);
      }
      
      const response = await axios.get(`${API_URL}/remito?${params.toString()}`);
      const responseData = response.data;
      
      // Validar y corregir los datos de paginación
      const result = {
        data: responseData.data || [],
        totalItems: responseData.totalItems || 0,
        totalPages: responseData.totalPages || 1,
        currentPage: responseData.currentPage || 1
      };
      
      const finalResult = {
        data: result.data,
        totalItems: Math.max(0, result.totalItems),
        totalPages: Math.max(1, result.totalPages),
        currentPage: Math.min(Math.max(1, result.currentPage), Math.max(1, result.totalPages))
      };
      
      return finalResult;
    } catch (error) {
      console.error('Error al obtener remitos:', error);
      throw error;
    }
  },

  async getRemitoById(id: number): Promise<Remito> {
    try {
      const response = await axios.get(`${API_URL}/remito/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener remito con ID ${id}:`, error);
      throw error;
    }
  },

  async createRemito(remito: RemitoFormData): Promise<Remito> {
    try {
      // Crear FormData para manejar el archivo adjunto
      const formData = new FormData();
      formData.append('numeroAsignado', remito.numeroAsignado);
      formData.append('observaciones', remito.observaciones || '');
      formData.append('prioridad', remito.prioridad);
      formData.append('clienteId', remito.clienteId.toString());
      formData.append('destinoId', remito.destinoId.toString());
      
      // Agregar todas las mercaderías como array JSON
      formData.append('mercaderias', JSON.stringify(remito.mercaderias || []));
      
      // Archivo adjunto
      if (remito.archivoAdjunto) {
        formData.append('archivoAdjunto', remito.archivoAdjunto);
      }

      const response = await axios.post(`${API_URL}/remitoFinal`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error al crear remito:', error);
      throw error;
    }
  },

  async updateRemito(id: number, remitoData: RemitoUpdateData): Promise<Remito> {
    try {
      // Debug: Mostrar qué datos se están enviando
      console.log('🔍 DEBUG - updateRemito - Datos recibidos:', remitoData);
      console.log('🔍 DEBUG - updateRemito - Tipo de datos:', typeof remitoData);
      console.log('🔍 DEBUG - updateRemito - Campos individuales:');
      Object.keys(remitoData).forEach(key => {
        const value = (remitoData as any)[key];
        console.log(`  ${key}:`, value, `(tipo: ${typeof value})`);
      });
      
      // Si hay un archivo adjunto, usar FormData
      if (remitoData.archivoAdjunto) {
        const formData = new FormData();
        
        // Agregar todos los campos del remito
        if (remitoData.numeroAsignado) formData.append('numeroAsignado', remitoData.numeroAsignado);
        if (remitoData.observaciones !== undefined) formData.append('observaciones', remitoData.observaciones);
        if (remitoData.prioridad) formData.append('prioridad', remitoData.prioridad);
        if (remitoData.clienteId) formData.append('clienteId', remitoData.clienteId.toString());
        if (remitoData.destinoId) formData.append('destinoId', remitoData.destinoId.toString());
        if (remitoData.estadoId) formData.append('estadoId', remitoData.estadoId.toString());
        if (remitoData.razonNoEntrega) formData.append('razonNoEntrega', remitoData.razonNoEntrega);
        
        // Agregar mercaderías como array JSON
        formData.append('mercaderias', JSON.stringify(remitoData.mercaderias || []));
        
        // Archivo adjunto
        formData.append('archivoAdjunto', remitoData.archivoAdjunto);

        const response = await axios.put(`${API_URL}/remito/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data;
      } else {
        // Si no hay archivo, enviar como JSON pero con mercaderías como array
        const updateData = { ...remitoData };
        
        // Debug: Mostrar qué se envía al backend
        console.log('🔍 DEBUG - updateRemito - Datos que se envían al backend:', updateData);
        console.log('🔍 DEBUG - updateRemito - URL:', `${API_URL}/remito/${id}`);
        console.log('🔍 DEBUG - updateRemito - Headers:', {
          'Content-Type': 'application/json',
        });
        
        const response = await axios.put(`${API_URL}/remito/${id}`, updateData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        // Debug: Mostrar respuesta del backend
        console.log('🔍 DEBUG - updateRemito - Respuesta del backend:', response.data);
        console.log('🔍 DEBUG - updateRemito - Status:', response.status);
        console.log('🔍 DEBUG - updateRemito - Headers de respuesta:', response.headers);
        
        return response.data;
      }
    } catch (error) {
      console.error(`Error al actualizar remito con ID ${id}:`, error);
      throw error;
    }
  },

  async updateEstadoRemito(remitoId: number, estadoId: number): Promise<Remito> {
    try {
      const response = await axios.put(`${API_URL}/remito/${remitoId}/estado/${estadoId}`);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar estado del remito ${remitoId}:`, error);
      throw error;
    }
  },

  async liberarRemito(remitoId: number): Promise<Remito> {
    try {
      const response = await axios.put(`${API_URL}/remito/${remitoId}/liberar`);
      return response.data;
    } catch (error) {
      console.error(`Error al liberar remito ${remitoId}:`, error);
      throw error;
    }
  },

  async deleteRemito(id: number): Promise<void> {
    try {
      await axios.delete(`${API_URL}/remito/${id}`);
    } catch (error) {
      throw error;
    }
  },

  async iniciarReentrega(id: number): Promise<Remito> {
    try {
      const response = await axios.post(`${API_URL}/remito/${id}/iniciar-reentrega`);
      return response.data;
    } catch (error) {
      console.error(`Error al iniciar reentrega del remito ${id}:`, error);
      throw error;
    }
  },
};