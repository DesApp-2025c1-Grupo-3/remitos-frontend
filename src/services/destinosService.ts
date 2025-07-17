import axios from 'axios';
import { Contacto } from '../types/contacto';

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3001';
const USE_MOCK_DATA = (import.meta as any).env.VITE_USE_MOCK_DESTINOS === 'true';

// Función auxiliar para manejar errores de validación del backend
const handleValidationErrors = (error: any): string => {
  if (axios.isAxiosError(error) && error.response) {
    const { status, data } = error.response;
    
    if (status === 400 && data.errores) {
      // Errores de validación específicos
      const errores = data.errores;
      if (Array.isArray(errores)) {
        const mensajes = errores.map((err: any) => {
          if (err.atributo === 'contactos' && err.error.includes('requerido')) {
            return 'Se requiere agregar al menos un contacto para el destino.';
          }
          return err.error || err.message || 'Error de validación';
        });
        return mensajes.join('. ');
      }
    } else if (status === 400) {
      return 'Datos inválidos. Verifique que todos los campos requeridos estén completos y que haya al menos un contacto.';
    } else if (status === 422) {
      return 'Error de validación. Verifique el formato de los datos y que haya al menos un contacto.';
    }
  }
  return 'Error inesperado. Por favor, intente nuevamente.';
};

export interface Destino {
  id: number;
  nombre: string;
  pais: string;
  provincia: string;
  localidad: string;
  direccion: string;
  activo: boolean;
  contactos?: Contacto[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateDestinoData {
  nombre: string;
  pais: string;
  provincia: string;
  localidad: string;
  direccion: string;
  contactos?: Contacto[];
}

// Ya no necesitamos esta interfaz separada, siempre usamos destinoContactoSchema

// Datos mock para desarrollo
const mockDestinos: Destino[] = [];

// Simular delay de red
const mockDelay = () => new Promise(resolve => setTimeout(resolve, 500));

// Función auxiliar para obtener el siguiente ID
const getNextId = (items: { id: number }[]): number => {
  return items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;
};

// Función auxiliar para obtener el siguiente ID de contacto
const getNextContactoId = (destinos: Destino[]): number => {
  const allContactos = destinos.flatMap(d => d.contactos || []);
  if (allContactos.length === 0) return 1;
  const maxId = Math.max(...allContactos.map(c => c.id || 0));
  return maxId + 1;
};

export const destinosService = {
  // Obtener todos los destinos
  async getDestinos(params?: { page?: number, limit?: number }): Promise<{ data: Destino[], totalItems: number, totalPages: number, currentPage: number }> {
    try {
      if (USE_MOCK_DATA) {
        await mockDelay();
        return {
          data: mockDestinos,
          totalItems: mockDestinos.length,
          totalPages: 1,
          currentPage: 1
        };
      }
      const response = await axios.get(`${API_URL}/destino`, { params });
      // El backend devuelve una respuesta paginada, necesitamos extraer el array data
      const responseData = response.data;
      
      let result;
      if (responseData && responseData.data && Array.isArray(responseData.data)) {
        result = {
          data: responseData.data,
          totalItems: responseData.totalItems || responseData.data.length,
          totalPages: responseData.totalPages || 1,
          currentPage: responseData.currentPage || 1
        };
      } else if (Array.isArray(responseData)) {
        // Fallback: si la respuesta es directamente un array
        result = {
          data: responseData,
          totalItems: responseData.length,
          totalPages: 1,
          currentPage: 1
        };
      } else {
        console.error('Respuesta inesperada del backend:', responseData);
        result = {
          data: [],
          totalItems: 0,
          totalPages: 1,
          currentPage: 1
        };
      }
      
      // Validar y corregir los datos de paginación
      const finalResult = {
        data: result.data,
        totalItems: Math.max(0, result.totalItems),
        totalPages: Math.max(1, result.totalPages),
        currentPage: Math.min(Math.max(1, result.currentPage), Math.max(1, result.totalPages))
      };
      
      return finalResult;
    } catch (error) {
      console.error('Error al obtener destinos:', error);
      throw error;
    }
  },

  // Obtener un destino por ID
  async getDestinoById(id: number): Promise<Destino> {
    try {
      if (USE_MOCK_DATA) {
        await mockDelay();
        const destino = mockDestinos.find(d => d.id === id);
        if (!destino) throw new Error('Destino no encontrado');
        return destino;
      }
      const response = await axios.get(`${API_URL}/destino/${id}`);
      // El backend puede devolver una respuesta paginada o directa
      const responseData = response.data;
      if (responseData && responseData.data) {
        return responseData.data;
      } else {
        return responseData;
      }
    } catch (error) {
      console.error(`Error al obtener destino con ID ${id}:`, error);
      throw error;
    }
  },

  // Crear un nuevo destino
  async createDestino(destino: CreateDestinoData): Promise<Destino> {
    try {
      if (USE_MOCK_DATA) {
        await mockDelay();
        const nextId = getNextId(mockDestinos);
        const newDestino: Destino = {
          ...destino,
          id: nextId,
          activo: true,
          contactos: destino.contactos || [],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        mockDestinos.push(newDestino);
        return newDestino;
      }

      // Validar que haya al menos un contacto (requerido por el esquema del backend)
      if (!destino.contactos || destino.contactos.length === 0) {
        throw new Error('Se requiere agregar al menos un contacto para el destino.');
      }

      // Usar siempre /destinoContacto para incluir el nombre independientemente de si hay contactos
      const contactosParaEnvio = destino.contactos.map(contacto => {
        // Validar formato de teléfono según backend: patrón /^\+?\d{10,15}$/
        const telefonoStr = String(contacto.telefono).trim();
        const telefonoRegex = /^\+?\d{10,15}$/;
        
        if (!telefonoRegex.test(telefonoStr)) {
          throw new Error(`El teléfono "${telefonoStr}" debe tener entre 10 y 15 dígitos, opcionalmente iniciando con "+"`);
        }
        
        return {
          personaAutorizada: contacto.personaAutorizada,
          correoElectronico: contacto.correoElectronico,
          telefono: telefonoStr // Enviar como string según backend
        };
      });

      const destinoCompleto = {
        nombre: destino.nombre,
        pais: destino.pais,
        provincia: destino.provincia,
        localidad: destino.localidad,
        direccion: destino.direccion,
        contactos: contactosParaEnvio
      };
      
      const response = await axios.post(`${API_URL}/destinoContacto`, destinoCompleto);
      return response.data;
    } catch (error) {
      console.error('Error al crear destino:', error);
      const mensaje = handleValidationErrors(error);
      throw new Error(mensaje);
    }
  },

  // Crear un destino con contacto
  async createDestinoWithContacto(destino: CreateDestinoData & { 
    personaAutorizada: string;
    correoElectronico: string;
    telefono: string; // Cambiado a string según backend
  }): Promise<Destino> {
    try {
      if (USE_MOCK_DATA) {
        await mockDelay();
        const nextId = getNextId(mockDestinos);
        const newDestino: Destino = {
          ...destino,
          id: nextId,
          activo: true,
          contactos: [{
            id: getNextContactoId(mockDestinos),
            personaAutorizada: destino.personaAutorizada,
            correoElectronico: destino.correoElectronico,
            telefono: destino.telefono,
            destinoId: nextId
          }],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        mockDestinos.push(newDestino);
        return newDestino;
      }
      
      // Intentar usar /destinoContacto con contactos sin IDs de relación
      const destinoData = {
        nombre: destino.nombre,
        pais: destino.pais,
        provincia: destino.provincia,
        localidad: destino.localidad,
        direccion: destino.direccion,
        contactos: [{
          personaAutorizada: destino.personaAutorizada,
          correoElectronico: destino.correoElectronico,
          telefono: destino.telefono
          // NO incluir clienteId ni destinoId
        }]
      };
      
      try {
        const response = await axios.post(`${API_URL}/destinoContacto`, destinoData);
        return response.data;
      } catch (contactoError) {
        console.warn('Error al crear destino con contacto, intentando sin contactos:', contactoError);
        
        // Si falla, intentar crear sin contactos y luego agregar el contacto por separado
        const { nombre, ...destinoSinNombre } = destino;
        const destinoData = {
          pais: destinoSinNombre.pais,
          provincia: destinoSinNombre.provincia,
          localidad: destinoSinNombre.localidad,
          direccion: destinoSinNombre.direccion
        };
        
        const response = await axios.post(`${API_URL}/destino`, destinoData);
        const nuevoDestino = response.data;
        
        // Agregar el contacto por separado
        try {
          await axios.post(`${API_URL}/agregarContactoADestino/${nuevoDestino.id}`, {
            personaAutorizada: destino.personaAutorizada,
            correoElectronico: destino.correoElectronico,
            telefono: destino.telefono
          });
          
          // Obtener el destino con contacto actualizado
          const destinoConContacto = await axios.get(`${API_URL}/destino/${nuevoDestino.id}`);
          return destinoConContacto.data;
        } catch (contactoError) {
          console.warn('Error al agregar contacto:', contactoError);
          // Retornar el destino sin contacto si falla
          return nuevoDestino;
        }
      }
    } catch (error) {
      console.error('Error al crear destino con contacto:', error);
      const mensaje = handleValidationErrors(error);
      throw new Error(mensaje);
    }
  },

  // Actualizar un destino existente
  async updateDestino(id: number, destino: Partial<CreateDestinoData>): Promise<Destino> {
    try {
      if (USE_MOCK_DATA) {
        await mockDelay();
        const index = mockDestinos.findIndex(d => d.id === id);
        if (index === -1) throw new Error('Destino no encontrado');
        
        mockDestinos[index] = {
          ...mockDestinos[index],
          ...destino,
          updatedAt: new Date()
        };
        return mockDestinos[index];
      }

      // Preparar datos para actualización
      // Validar que haya al menos un contacto (requerido por el esquema del backend)
      if (!destino.contactos || destino.contactos.length === 0) {
        throw new Error('Se requiere agregar al menos un contacto para el destino.');
      }
      
      // Filtrar contactos para enviar solo los campos que acepta el backend
      const contactosParaEnvio = destino.contactos.map((contacto: any) => ({
        personaAutorizada: contacto.personaAutorizada,
        correoElectronico: contacto.correoElectronico,
        telefono: String(contacto.telefono)
        // NO incluir: id, createdAt, updatedAt, clienteId, destinoId
      }));

      const updateData: any = {
        nombre: destino.nombre,
        pais: destino.pais,
        provincia: destino.provincia,
        localidad: destino.localidad,
        direccion: destino.direccion,
        contactos: contactosParaEnvio
      };

            const response = await axios.put(`${API_URL}/destino/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar destino con ID ${id}:`, error);
      const mensaje = handleValidationErrors(error);
      throw new Error(mensaje);
    }
  },

  // Eliminar un destino
  async deleteDestino(id: number): Promise<void> {
    try {
      if (USE_MOCK_DATA) {
        await mockDelay();
        const index = mockDestinos.findIndex(d => d.id === id);
        if (index === -1) throw new Error('Destino no encontrado');
        mockDestinos.splice(index, 1);
        return;
      }
      await axios.delete(`${API_URL}/destino/${id}`);
    } catch (error) {
      console.error(`Error al eliminar destino con ID ${id}:`, error);
      throw error;
    }
  },

  // Obtener destinos filtrados
  async getDestinosFiltrados(filtros: { pais?: string; provincia?: string; localidad?: string }): Promise<Destino[]> {
    try {
      if (USE_MOCK_DATA) {
        await mockDelay();
        return mockDestinos.filter(destino => {
          if (filtros.pais && destino.pais !== filtros.pais) return false;
          if (filtros.provincia && destino.provincia !== filtros.provincia) return false;
          if (filtros.localidad && destino.localidad !== filtros.localidad) return false;
          return true;
        });
      }
      const response = await axios.get(`${API_URL}/destinoFiltrado`, { params: filtros });
      return response.data;
    } catch (error) {
      console.error('Error al obtener destinos filtrados:', error);
      throw error;
    }
  }
};

// --- Servicios para georef ---
export const georefService = {
  async getProvincias() {
    const res = await fetch('https://apis.datos.gob.ar/georef/api/provincias?campos=id,nombre');
    const data = await res.json();
    return (data.provincias || []).sort((a: any, b: any) => a.nombre.localeCompare(b.nombre));
  },
  async getLocalidadesByProvincia(provinciaId: string) {
    const res = await fetch(`https://apis.datos.gob.ar/georef/api/localidades?provincia=${provinciaId}&campos=id,nombre&max=5000`);
    const data = await res.json();
    return (data.localidades || []).sort((a: any, b: any) => a.nombre.localeCompare(b.nombre));
  },
  async getBrEstados() {
    const res = await fetch('https://brasilapi.com.br/api/ibge/uf/v1');
    const data = await res.json();
    return (data || []).map((uf: any) => ({ id: uf.sigla, nombre: uf.nome, sigla: uf.sigla }));
  },
  async getBrMunicipios(uf: string) {
    const res = await fetch(`https://brasilapi.com.br/api/ibge/municipios/v1/${uf}`);
    const data = await res.json();
    return (data || []).map((mun: any) => ({ id: mun.codigo_ibge, nombre: mun.nome }));
  }
};