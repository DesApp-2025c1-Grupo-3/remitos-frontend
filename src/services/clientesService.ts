import axios from 'axios';
import { Contacto } from '../types/contacto';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_CLIENTES === 'true';

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
            return 'Se requiere agregar al menos un contacto para el cliente.';
          }
          return err.error || err.message || 'Error de validación';
        });
        return mensajes.join('. ');
      }
    } else if (status === 400) {
      return 'Datos inválidos. Verifique que todos los campos requeridos estén completos y que haya al menos un contacto.';
    } else if (status === 422) {
      return 'Error de validación. Verifique el formato de los datos y que haya al menos un contacto.';
    } else if (status === 404) {
      return 'Cliente no encontrado.';
    }
  }
  return 'Error inesperado. Por favor, intente nuevamente.';
};

// Interfaz para la respuesta del backend
export interface Cliente {
  id: number;
  razonSocial: string | null;
  cuit_rut: string | null; // Cambiado a string para coincidir con el backend
  tipoEmpresa: string;
  direccion: string;
  activo: boolean;
  contactos?: Contacto[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Interfaz para crear/actualizar cliente (sin campos no permitidos por el backend)
export interface CreateClienteData {
  razonSocial: string | null;
  cuit_rut: string | null; // Cambiado a string para coincidir con el backend
  tipoEmpresa: string;
  direccion: string;
}

// Interfaz para actualizar cliente que incluye contactos
export interface UpdateClienteData extends CreateClienteData {
  contactos?: Contacto[];
}

// Interfaz para datos que se envían al backend (con tipos correctos)
interface ClienteBackendData {
  razonSocial: string | null;
  cuit_rut: number | null;
  tipoEmpresa: string;
  direccion: string;
}

// Datos mock para desarrollo
const mockClientes: Cliente[] = [];

// Simular delay de red
const mockDelay = () => new Promise(resolve => setTimeout(resolve, 500));

// Función auxiliar para obtener el siguiente ID
const getNextId = (items: { id: number }[]): number => {
  return items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;
};

// Función auxiliar para obtener el siguiente ID de contacto
const getNextContactoId = (clientes: Cliente[]): number => {
  const allContactos = clientes.flatMap(c => c.contactos || []);
  if (allContactos.length === 0) return 1;
  const maxId = Math.max(...allContactos.map(c => c.id || 0));
  return maxId + 1;
};

// Función auxiliar para limpiar contactos (remover campos no permitidos por el backend)
const limpiarContactos = (contactos: Contacto[]) => {
  return contactos.map(contacto => ({
    personaAutorizada: contacto.personaAutorizada,
    correoElectronico: contacto.correoElectronico,
    telefono: contacto.telefono
    // NO incluir: id, createdAt, updatedAt, clienteId, destinoId
  }));
};

// Función auxiliar para preparar datos de contacto según el endpoint
const prepararContactoParaEndpoint = (contacto: Contacto, endpoint: 'update' | 'create' | 'add') => {
  const baseData = {
    correoElectronico: contacto.correoElectronico,
    telefono: contacto.telefono
  };

  // Todos los endpoints usan 'personaAutorizada' según el esquema de validación
  return {
    ...baseData,
    personaAutorizada: contacto.personaAutorizada
  };
};

// Función auxiliar para validar datos básicos del cliente
const validarClienteBasico = (cliente: ClienteBackendData): boolean => {
  if (!cliente.direccion || cliente.direccion.length < 3) {
    throw new Error('La dirección es requerida y debe tener al menos 3 caracteres');
  }
  if (!cliente.tipoEmpresa || !['particular', 'empresa', 'organismo estatal'].includes(cliente.tipoEmpresa)) {
    throw new Error('El tipo de empresa debe ser: particular, empresa u organismo estatal');
  }
  if (cliente.cuit_rut && cliente.cuit_rut.toString().length !== 11) {
    throw new Error('El CUIT debe tener exactamente 11 dígitos');
  }
  return true;
};

// Función auxiliar para preparar datos de actualización con contacto mínimo requerido
const prepararDatosActualizacion = (cliente: UpdateClienteData): any => {
  const clienteBasico = {
    razonSocial: cliente.razonSocial,
    cuit_rut: cliente.cuit_rut, // Mantener como string según el backend
    tipoEmpresa: cliente.tipoEmpresa,
    direccion: cliente.direccion
  };

  // Preparar contactos limpiando campos de base de datos
  const contactos = cliente.contactos && cliente.contactos.length > 0 
    ? limpiarContactos(cliente.contactos)
    : [];

  return {
    ...clienteBasico,
    contactos
  };
};

export const clientesService = {
  // Obtener todos los clientes
  async getClientes(params?: { page?: number, limit?: number }): Promise<{ data: Cliente[], totalItems: number, totalPages: number, currentPage: number }> {
    try {
      if (USE_MOCK_DATA) {
        await mockDelay();
        return {
          data: mockClientes,
          totalItems: mockClientes.length,
          totalPages: 1,
          currentPage: 1
        };
      }
      const response = await axios.get(`${API_URL}/cliente`, { params });
      // El backend devuelve una respuesta paginada
      const responseData = response.data;
      if (responseData && responseData.data && Array.isArray(responseData.data)) {
        return {
          data: responseData.data,
          totalItems: responseData.totalItems || responseData.data.length,
          totalPages: responseData.totalPages || 1,
          currentPage: responseData.currentPage || 1
        };
      } else if (Array.isArray(responseData)) {
        // Fallback: si la respuesta es directamente un array
        return {
          data: responseData,
          totalItems: responseData.length,
          totalPages: 1,
          currentPage: 1
        };
      } else {
        console.error('Respuesta inesperada del backend:', responseData);
        return {
          data: [],
          totalItems: 0,
          totalPages: 1,
          currentPage: 1
        };
      }
    } catch (error) {
      console.error('Error al obtener clientes:', error);
      throw error;
    }
  },

  // Obtener un cliente por ID
  async getClienteById(id: number): Promise<Cliente> {
    try {
      if (USE_MOCK_DATA) {
        await mockDelay();
        const cliente = mockClientes.find(c => c.id === id);
        if (!cliente) throw new Error('Cliente no encontrado');
        return cliente;
      }
      
      const response = await axios.get(`${API_URL}/cliente/${id}`);
      // El backend puede devolver una respuesta paginada o directa
      const responseData = response.data;
      
      if (responseData && responseData.data) {
        // Si la respuesta tiene estructura paginada
        return responseData.data;
      } else if (responseData) {
        // Si la respuesta es directa
        return responseData;
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (error) {
      console.error(`Error al obtener cliente con ID ${id}:`, error);
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 404) {
          throw new Error('Cliente no encontrado');
        }
      }
      throw new Error('Error al obtener el cliente. Por favor, intente nuevamente.');
    }
  },

  // Crear un nuevo cliente
  async createCliente(cliente: CreateClienteData): Promise<Cliente> {
    try {
      if (USE_MOCK_DATA) {
        await mockDelay();
        const nextId = getNextId(mockClientes);
        const newCliente: Cliente = {
          ...cliente,
          id: nextId,
          activo: true,
          contactos: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        mockClientes.push(newCliente);
        return newCliente;
      }
      
      // El backend requiere al menos un contacto, pero no tenemos datos del formulario
      // Deberíamos usar createClienteWithContacto en su lugar
      throw new Error('Para crear un cliente se requiere al menos un contacto. Use createClienteWithContacto.');
    } catch (error) {
      console.error('Error al crear cliente:', error);
      if (axios.isAxiosError(error) && error.response) {
        // Manejar errores específicos del backend
        if (error.response.status === 400) {
          throw new Error('Datos inválidos. Verifique que todos los campos requeridos estén completos.');
        } else if (error.response.status === 422) {
          throw new Error('Error de validación. Verifique el formato de los datos.');
        }
      }
      throw new Error('Error al crear el cliente. Por favor, intente nuevamente.');
    }
  },

  // Crear un cliente con contacto
  async createClienteWithContacto(cliente: CreateClienteData & {
    personaAutorizada: string;
    correoElectronico: string;
    telefono: string;
  }): Promise<Cliente> {
    try {
      if (USE_MOCK_DATA) {
        await mockDelay();
        const nextId = getNextId(mockClientes);
        const newCliente: Cliente = {
          ...cliente,
          id: nextId,
          activo: true,
          contactos: [{
            id: getNextContactoId(mockClientes),
            personaAutorizada: cliente.personaAutorizada,
            correoElectronico: cliente.correoElectronico,
            telefono: cliente.telefono,
            clienteId: nextId
          }],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        mockClientes.push(newCliente);
        return newCliente;
      }
      // Preparar los datos para el backend, removiendo IDs de relación
      const clienteData = {
        razonSocial: cliente.razonSocial,
        cuit_rut: cliente.cuit_rut,
        tipoEmpresa: cliente.tipoEmpresa,
        direccion: cliente.direccion,
        contactos: [{
          personaAutorizada: cliente.personaAutorizada,
          correoElectronico: cliente.correoElectronico,
          telefono: cliente.telefono
          // NO incluir: id, createdAt, updatedAt, clienteId, destinoId
        }]
      };
      
      const response = await axios.post(`${API_URL}/clienteContacto`, clienteData);
      return response.data;
    } catch (error) {
      console.error('Error al crear cliente con contacto:', error);
      const mensaje = handleValidationErrors(error);
      throw new Error(mensaje);
    }
  },

  // Actualizar un cliente existente
  async updateCliente(id: number, cliente: UpdateClienteData): Promise<Cliente> {
    try {
      if (USE_MOCK_DATA) {
        await mockDelay();
        const index = mockClientes.findIndex(c => c.id === id);
        if (index === -1) throw new Error('Cliente no encontrado');
        
        mockClientes[index] = {
          ...mockClientes[index],
          ...cliente,
          updatedAt: new Date()
        };
        return mockClientes[index];
      }
      
      // Preparar datos para la actualización
      const datosActualizacion = prepararDatosActualizacion(cliente);
      
      // Validar que haya al menos un contacto (requerido por el esquema del backend)
      if (!datosActualizacion.contactos || datosActualizacion.contactos.length === 0) {
        throw new Error('Se requiere agregar al menos un contacto para el cliente.');
      }
      
      // Validar datos básicos antes de enviar
      validarClienteBasico({
        razonSocial: datosActualizacion.razonSocial,
        cuit_rut: datosActualizacion.cuit_rut,
        tipoEmpresa: datosActualizacion.tipoEmpresa,
        direccion: datosActualizacion.direccion
      });
      
      // El esquema del backend requiere SIEMPRE contactos, así que enviamos todo junto
      // Usar PUT /cliente/:id con todos los datos incluyendo contactos
      const response = await axios.put(`${API_URL}/cliente/${id}`, datosActualizacion);
      
      // Si la respuesta no incluye contactos, obtener el cliente completo
      if (response.data && response.data.id) {
        const clienteCompleto = await this.getClienteById(id);
        return clienteCompleto;
      }
      
      return response.data;
      
    } catch (error) {
      console.error(`Error al actualizar cliente con ID ${id}:`, error);
      const mensaje = handleValidationErrors(error);
      throw new Error(mensaje);
    }
  },

  // Agregar contacto a un cliente existente
  async agregarContactoACliente(clienteId: number, contacto: {
    personaAutorizada: string;
    correoElectronico: string;
    telefono: string;
  }): Promise<void> {
    try {
      if (USE_MOCK_DATA) {
        await mockDelay();
        const cliente = mockClientes.find(c => c.id === clienteId);
        if (!cliente) throw new Error('Cliente no encontrado');
        
        const nuevoContacto: Contacto = {
          id: getNextContactoId(mockClientes),
          personaAutorizada: contacto.personaAutorizada,
          correoElectronico: contacto.correoElectronico,
          telefono: contacto.telefono,
          clienteId: clienteId
        };
        
        if (!cliente.contactos) cliente.contactos = [];
        cliente.contactos.push(nuevoContacto);
        return;
      }
      
      const contactoFormateado = prepararContactoParaEndpoint(contacto as Contacto, 'add');
      await axios.post(`${API_URL}/agregarContactoACliente/${clienteId}`, contactoFormateado);
    } catch (error) {
      console.error(`Error al agregar contacto al cliente ${clienteId}:`, error);
      throw error;
    }
  },

  // Eliminar contacto de un cliente
  async eliminarContactoDeCliente(clienteId: number, contactoId: number): Promise<void> {
    try {
      if (USE_MOCK_DATA) {
        await mockDelay();
        const cliente = mockClientes.find(c => c.id === clienteId);
        if (!cliente) throw new Error('Cliente no encontrado');
        
        if (cliente.contactos) {
          cliente.contactos = cliente.contactos.filter(c => c.id !== contactoId);
        }
        return;
      }
      
      await axios.delete(`${API_URL}/eliminarContactoDeCliente/${clienteId}/${contactoId}`);
    } catch (error) {
      console.error(`Error al eliminar contacto ${contactoId} del cliente ${clienteId}:`, error);
      throw error;
    }
  },

  // Actualizar contacto de un cliente
  async actualizarContactoDeCliente(clienteId: number, contactoId: number, contacto: {
    personaAutorizada: string;
    correoElectronico: string;
    telefono: string;
  }): Promise<void> {
    try {
      if (USE_MOCK_DATA) {
        await mockDelay();
        const cliente = mockClientes.find(c => c.id === clienteId);
        if (!cliente) throw new Error('Cliente no encontrado');
        
        if (cliente.contactos) {
          const index = cliente.contactos.findIndex(c => c.id === contactoId);
          if (index !== -1) {
            cliente.contactos[index] = {
              ...cliente.contactos[index],
              ...contacto
            };
          }
        }
        return;
      }
      
      const contactoFormateado = prepararContactoParaEndpoint(contacto as Contacto, 'update');
      await axios.put(`${API_URL}/actualizarContactoDeCliente/${clienteId}/${contactoId}`, contactoFormateado);
    } catch (error) {
      console.error(`Error al actualizar contacto ${contactoId} del cliente ${clienteId}:`, error);
      throw error;
    }
  },

  // Eliminar un cliente
  async deleteCliente(id: number): Promise<void> {
    try {
      if (USE_MOCK_DATA) {
        await mockDelay();
        const index = mockClientes.findIndex(c => c.id === id);
        if (index === -1) throw new Error('Cliente no encontrado');
        mockClientes.splice(index, 1);
        return;
      }
      
      // El backend debería manejar la eliminación en cascada de contactos
      await axios.delete(`${API_URL}/cliente/${id}`);
    } catch (error) {
      console.error(`Error al eliminar cliente con ID ${id}:`, error);
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 404) {
          throw new Error('Cliente no encontrado');
        } else if (error.response.status === 400) {
          throw new Error('No se puede eliminar el cliente. Verifique que no tenga registros asociados.');
        }
      }
      throw new Error('Error al eliminar el cliente. Por favor, intente nuevamente.');
    }
  },

  // Obtener contactos de un cliente específico
  async getContactosDeCliente(clienteId: number): Promise<Contacto[]> {
    try {
      if (USE_MOCK_DATA) {
        await mockDelay();
        const cliente = mockClientes.find(c => c.id === clienteId);
        if (!cliente) throw new Error('Cliente no encontrado');
        return cliente.contactos || [];
      }
      
      const response = await axios.get(`${API_URL}/cliente/${clienteId}/contactos`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener contactos del cliente ${clienteId}:`, error);
      throw error;
    }
  },
}; 