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
  razonNoEntrega?: string;
}

export interface RemitoFormData {
  numeroAsignado: string;
  observaciones?: string;
  prioridad: 'normal' | 'alta' | 'urgente';
  clienteId: number;
  destinoId: number;
  // Campos de mercadería
  tipoMercaderiaId: number;
  valorDeclarado: number;
  volumenMetrosCubico: number;
  pesoMercaderia: number;
  cantidadBobinas?: number;
  cantidadRacks?: number;
  cantidadBultos?: number;
  cantidadPallets?: number;
  requisitosEspeciales?: string;
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
  fechaEmision?: string;
  fechaAgenda?: string;
}

export interface RemitoUpdateData extends Partial<RemitoFormData> {
  razonNoEntrega?: string;
  estadoId?: number;
  tipoMercaderiaId?: number;
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
        if (filters.fechaEmision) params.append('fechaEmision', filters.fechaEmision);
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
      
      // Crear objeto de mercadería
      const mercaderia = {
        tipoMercaderiaId: parseInt(remito.tipoMercaderiaId.toString()),
        valorDeclarado: parseInt(remito.valorDeclarado.toString()),
        volumenMetrosCubico: parseInt(remito.volumenMetrosCubico.toString()),
        pesoMercaderia: parseInt(remito.pesoMercaderia.toString()),
        cantidadBobinas: remito.cantidadBobinas ? parseInt(remito.cantidadBobinas.toString()) : null,
        cantidadRacks: remito.cantidadRacks ? parseInt(remito.cantidadRacks.toString()) : null,
        cantidadBultos: remito.cantidadBultos ? parseInt(remito.cantidadBultos.toString()) : null,
        cantidadPallets: remito.cantidadPallets ? parseInt(remito.cantidadPallets.toString()) : null,
        requisitosEspeciales: remito.requisitosEspeciales || null
      };
      
      // Agregar mercaderías como array JSON
      formData.append('mercaderias', JSON.stringify([mercaderia]));
      
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
        
        // Crear objeto de mercadería
        const mercaderia = {
          tipoMercaderiaId: parseInt(remitoData.tipoMercaderiaId.toString()),
          valorDeclarado: parseInt(remitoData.valorDeclarado.toString()),
          volumenMetrosCubico: parseInt(remitoData.volumenMetrosCubico.toString()),
          pesoMercaderia: parseInt(remitoData.pesoMercaderia.toString()),
          cantidadBobinas: remitoData.cantidadBobinas ? parseInt(remitoData.cantidadBobinas.toString()) : null,
          cantidadRacks: remitoData.cantidadRacks ? parseInt(remitoData.cantidadRacks.toString()) : null,
          cantidadBultos: remitoData.cantidadBultos ? parseInt(remitoData.cantidadBultos.toString()) : null,
          cantidadPallets: remitoData.cantidadPallets ? parseInt(remitoData.cantidadPallets.toString()) : null,
          requisitosEspeciales: remitoData.requisitosEspeciales || null
        };
        
        // Agregar mercaderías como array JSON
        formData.append('mercaderias', JSON.stringify([mercaderia]));
        
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
        
        // Crear objeto de mercadería
        const mercaderia = {
          tipoMercaderiaId: parseInt(remitoData.tipoMercaderiaId.toString()),
          valorDeclarado: parseInt(remitoData.valorDeclarado.toString()),
          volumenMetrosCubico: parseInt(remitoData.volumenMetrosCubico.toString()),
          pesoMercaderia: parseInt(remitoData.pesoMercaderia.toString()),
          cantidadBobinas: remitoData.cantidadBobinas ? parseInt(remitoData.cantidadBobinas.toString()) : null,
          cantidadRacks: remitoData.cantidadRacks ? parseInt(remitoData.cantidadRacks.toString()) : null,
          cantidadBultos: remitoData.cantidadBultos ? parseInt(remitoData.cantidadBultos.toString()) : null,
          cantidadPallets: remitoData.cantidadPallets ? parseInt(remitoData.cantidadPallets.toString()) : null,
          requisitosEspeciales: remitoData.requisitosEspeciales || null
        };
        
        // Agregar mercaderías como array
        updateData.mercaderias = [mercaderia];
        
        // Remover campos individuales de mercadería
        delete updateData.tipoMercaderiaId;
        delete updateData.valorDeclarado;
        delete updateData.volumenMetrosCubico;
        delete updateData.pesoMercaderia;
        delete updateData.cantidadBobinas;
        delete updateData.cantidadRacks;
        delete updateData.cantidadBultos;
        delete updateData.cantidadPallets;
        delete updateData.requisitosEspeciales;
        
        const response = await axios.put(`${API_URL}/remito/${id}`, updateData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
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
};