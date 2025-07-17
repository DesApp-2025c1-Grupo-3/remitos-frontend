import axios from 'axios';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001';
const USE_MOCK_DATA = (import.meta as any).env?.VITE_USE_MOCK_REMITOS === 'true';

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
  tipoMercaderia: string;
  valorDeclarado: number;
  volumenMetrosCubico: number;
  pesoMercaderia: number;
  cantidadBobinas?: number;
  cantidadRacks?: number;
  cantidadBultos?: number;
  cantidadPallets?: number;
  requisitosEspeciales?: string;
  remitosId: number;
}

export interface Remito {
  id: number;
  numeroAsignado: string;
  fechaEmision: string;
  observaciones?: string;
  archivoAdjunto?: string;
  prioridad: 'normal' | 'alta' | 'urgente';
  activo: boolean;
  clienteId?: number;
  destinoId?: number;
  estadoId?: number;
  mercaderiaId?: number;
  // Relaciones incluidas
  cliente?: Cliente;
  destino?: Destino;
  estado?: Estado;
  mercaderia?: Mercaderia;
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
  tipoMercaderia: string;
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
}

export interface RemitoUpdateData extends Partial<RemitoFormData> {
  razonNoEntrega?: string;
  estadoId?: number;
}

// Datos mock para desarrollo
const mockRemitos: Remito[] = [
  {
    id: 1,
    numeroAsignado: 'R-00123',
    fechaEmision: '2023-04-15T10:30:00Z',
    observaciones: 'Entrega urgente',
    prioridad: 'alta',
    activo: true,
    clienteId: 1,
    destinoId: 1,
    estadoId: 1,
    mercaderiaId: 1,
    cliente: {
      id: 1,
      razonSocial: 'Cliente A',
      cuit_rut: '20-12345678-9',
      direccion: 'Av. Corrientes 1234'
    },
    destino: {
      id: 1,
      nombre: 'Santiago',
      provincia: 'RM',
      localidad: 'Santiago',
      direccion: 'Las Condes 567'
    },
    estado: {
      id: 1,
      nombre: 'Pendiente'
    },
    mercaderia: {
      id: 1,
      tipoMercaderia: 'Electrónicos',
      valorDeclarado: 25000,
      volumenMetrosCubico: 3,
      pesoMercaderia: 1500,
      cantidadPallets: 4,
      cantidadBultos: 12,
      cantidadRacks: 2,
      cantidadBobinas: 0,
      requisitosEspeciales: 'Manipular con cuidado',
      remitosId: 1
    },
    createdAt: '2023-04-15T10:30:00Z',
    updatedAt: '2023-04-15T10:30:00Z'
  }
];

export const remitosService = {
  async getRemitos(page: number = 1, limit: number = 20, filters?: RemitosFilters): Promise<RemitosResponse> {
    try {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
          totalItems: mockRemitos.length,
          totalPages: Math.ceil(mockRemitos.length / limit),
          currentPage: page,
          data: mockRemitos
        };
      }
      
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

  async createRemito(remito: RemitoFormData): Promise<Remito> {
    try {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const newRemito: Remito = {
          id: Math.max(...mockRemitos.map(r => r.id)) + 1,
          numeroAsignado: remito.numeroAsignado,
          fechaEmision: new Date().toISOString(),
          observaciones: remito.observaciones,
          prioridad: remito.prioridad,
          activo: true,
          clienteId: remito.clienteId,
          destinoId: remito.destinoId,
          estadoId: 1,
          mercaderiaId: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        mockRemitos.push(newRemito);
        return newRemito;
      }

      // Crear FormData para manejar el archivo adjunto
      const formData = new FormData();
      formData.append('numeroAsignado', remito.numeroAsignado);
      formData.append('observaciones', remito.observaciones || '');
      formData.append('prioridad', remito.prioridad);
      formData.append('clienteId', remito.clienteId.toString());
      formData.append('destinoId', remito.destinoId.toString());
      
      // Campos de mercadería
      formData.append('tipoMercaderia', remito.tipoMercaderia);
      formData.append('valorDeclarado', remito.valorDeclarado.toString());
      formData.append('volumenMetrosCubico', remito.volumenMetrosCubico.toString());
      formData.append('pesoMercaderia', remito.pesoMercaderia.toString());
      
      if (remito.cantidadBobinas !== undefined) {
        formData.append('cantidadBobinas', remito.cantidadBobinas.toString());
      }
      if (remito.cantidadRacks !== undefined) {
        formData.append('cantidadRacks', remito.cantidadRacks.toString());
      }
      if (remito.cantidadBultos !== undefined) {
        formData.append('cantidadBultos', remito.cantidadBultos.toString());
      }
      if (remito.cantidadPallets !== undefined) {
        formData.append('cantidadPallets', remito.cantidadPallets.toString());
      }
      if (remito.requisitosEspeciales) {
        formData.append('requisitosEspeciales', remito.requisitosEspeciales);
      }
      
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
      if (USE_MOCK_DATA) {
        return {} as Remito;
      }

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
        
        // Campos de mercadería
        if (remitoData.tipoMercaderia) formData.append('tipoMercaderia', remitoData.tipoMercaderia);
        if (remitoData.valorDeclarado !== undefined) formData.append('valorDeclarado', remitoData.valorDeclarado.toString());
        if (remitoData.volumenMetrosCubico !== undefined) formData.append('volumenMetrosCubico', remitoData.volumenMetrosCubico.toString());
        if (remitoData.pesoMercaderia !== undefined) formData.append('pesoMercaderia', remitoData.pesoMercaderia.toString());
        if (remitoData.cantidadBobinas !== undefined) formData.append('cantidadBobinas', remitoData.cantidadBobinas.toString());
        if (remitoData.cantidadRacks !== undefined) formData.append('cantidadRacks', remitoData.cantidadRacks.toString());
        if (remitoData.cantidadBultos !== undefined) formData.append('cantidadBultos', remitoData.cantidadBultos.toString());
        if (remitoData.cantidadPallets !== undefined) formData.append('cantidadPallets', remitoData.cantidadPallets.toString());
        if (remitoData.requisitosEspeciales) formData.append('requisitosEspeciales', remitoData.requisitosEspeciales);
        
        // Archivo adjunto
        formData.append('archivoAdjunto', remitoData.archivoAdjunto);

        const response = await axios.put(`${API_URL}/remito/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data;
      } else {
        // Si no hay archivo, enviar como JSON normal
        const response = await axios.put(`${API_URL}/remito/${id}`, remitoData);
        return response.data;
      }
    } catch (error) {
      console.error(`Error al actualizar remito con ID ${id}:`, error);
      throw error;
    }
  },

  async updateEstadoRemito(remitoId: number, estadoId: number): Promise<Remito> {
    try {
      if (USE_MOCK_DATA) {
      return {} as Remito;
      }
      const response = await axios.put(`${API_URL}/remito/${remitoId}/estado/${estadoId}`);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar estado del remito ${remitoId}:`, error);
      throw error;
    }
  },

  async deleteRemito(id: number): Promise<void> {
    try {
      if (USE_MOCK_DATA) {
        return;
      }
      await axios.delete(`${API_URL}/remito/${id}`);
    } catch (error) {
      throw error;
    }
  },
};