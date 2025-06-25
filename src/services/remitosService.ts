import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_REMITOS === 'true';

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
  async getRemitos(page: number = 1, limit: number = 20): Promise<RemitosResponse> {
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
      const response = await axios.get(`${API_URL}/remito?page=${page}&limit=${limit}`);
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

  async updateRemito(id: number, remito: Partial<RemitoFormData>): Promise<Remito> {
    try {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const index = mockRemitos.findIndex(r => r.id === id);
        if (index === -1) throw new Error('Remito no encontrado');
        mockRemitos[index] = {
          ...mockRemitos[index],
          numeroAsignado: remito.numeroAsignado || mockRemitos[index].numeroAsignado,
          observaciones: remito.observaciones || mockRemitos[index].observaciones,
          prioridad: remito.prioridad || mockRemitos[index].prioridad,
          updatedAt: new Date().toISOString()
        };
        return mockRemitos[index];
      }

      // Para actualización, enviamos los campos básicos del remito incluyendo cliente y destino
      const updateData = {
        numeroAsignado: remito.numeroAsignado,
        observaciones: remito.observaciones,
        prioridad: remito.prioridad,
        clienteId: remito.clienteId,
        destinoId: remito.destinoId
      };

      const response = await axios.put(`${API_URL}/remito/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar remito con ID ${id}:`, error);
      throw error;
    }
  },

  async updateEstadoRemito(remitoId: number, estadoId: number): Promise<Remito> {
    try {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const index = mockRemitos.findIndex(r => r.id === remitoId);
        if (index === -1) throw new Error('Remito no encontrado');
        mockRemitos[index] = {
          ...mockRemitos[index],
          estadoId,
          updatedAt: new Date().toISOString()
        };
        return mockRemitos[index];
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
  },

  async activateRemito(id: number): Promise<Remito> {
    try {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const index = mockRemitos.findIndex(r => r.id === id);
        if (index === -1) throw new Error('Remito no encontrado');
        mockRemitos[index] = {
          ...mockRemitos[index],
          activo: true,
          updatedAt: new Date().toISOString()
        };
        return mockRemitos[index];
      }
      const response = await axios.put(`${API_URL}/remito/${id}/darAlta`);
      return response.data;
    } catch (error) {
      console.error(`Error al activar remito con ID ${id}:`, error);
      throw error;
    }
  },

  async updateMercaderia(remitoId: number, mercaderia: Partial<RemitoFormData>): Promise<Mercaderia> {
    try {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const remito = mockRemitos.find(r => r.id === remitoId);
        if (!remito || !remito.mercaderia) throw new Error('Remito o mercadería no encontrada');
        
        remito.mercaderia = {
          ...remito.mercaderia,
          tipoMercaderia: mercaderia.tipoMercaderia || remito.mercaderia.tipoMercaderia,
          valorDeclarado: mercaderia.valorDeclarado || remito.mercaderia.valorDeclarado,
          volumenMetrosCubico: mercaderia.volumenMetrosCubico || remito.mercaderia.volumenMetrosCubico,
          pesoMercaderia: mercaderia.pesoMercaderia || remito.mercaderia.pesoMercaderia,
          cantidadBobinas: mercaderia.cantidadBobinas ?? remito.mercaderia.cantidadBobinas,
          cantidadRacks: mercaderia.cantidadRacks ?? remito.mercaderia.cantidadRacks,
          cantidadBultos: mercaderia.cantidadBultos ?? remito.mercaderia.cantidadBultos,
          cantidadPallets: mercaderia.cantidadPallets ?? remito.mercaderia.cantidadPallets,
          requisitosEspeciales: mercaderia.requisitosEspeciales ?? remito.mercaderia.requisitosEspeciales,
        };
        return remito.mercaderia;
      }

      // Crear objeto solo con los campos de mercadería
      const mercaderiaData = {
        tipoMercaderia: mercaderia.tipoMercaderia,
        valorDeclarado: mercaderia.valorDeclarado,
        volumenMetrosCubico: mercaderia.volumenMetrosCubico,
        pesoMercaderia: mercaderia.pesoMercaderia,
        cantidadBobinas: mercaderia.cantidadBobinas,
        cantidadRacks: mercaderia.cantidadRacks,
        cantidadBultos: mercaderia.cantidadBultos,
        cantidadPallets: mercaderia.cantidadPallets,
        requisitosEspeciales: mercaderia.requisitosEspeciales,
      };

      const response = await axios.put(`${API_URL}/remito/${remitoId}/mercaderia`, mercaderiaData);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar mercadería del remito ${remitoId}:`, error);
      throw error;
    }
  }
};