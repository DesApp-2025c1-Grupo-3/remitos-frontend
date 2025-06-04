import axios from 'axios';
import { Contacto } from '../types/contacto';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_CLIENTES === 'true';

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

// Datos mock para desarrollo
const mockClientes: Cliente[] = [
  {
    id: 1,
    razonSocial: "Empresa A S.A.",
    cuit_rut: "30123456789",
    tipoEmpresa: "empresa",
    direccion: "Av. Rivadavia 1234",
    activo: true,
    contactos: [
      {
        id: 1,
        personaAutorizada: "Juan Pérez",
        correoElectronico: "juan@empresaa.com",
        telefono: 1112345678,
        clienteId: 1
      }
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 2,
    razonSocial: "Comercio B S.R.L.",
    cuit_rut: "30876543210",
    tipoEmpresa: "empresa",
    direccion: "Calle Corrientes 567",
    activo: true,
    contactos: [
      {
        id: 2,
        personaAutorizada: "María García",
        correoElectronico: "maria@comerciob.com",
        telefono: 1187654321,
        clienteId: 2
      }
    ],
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02')
  },
  {
    id: 3,
    razonSocial: "Distribuidora C",
    cuit_rut: "30456789012",
    tipoEmpresa: "empresa",
    direccion: "Av. Santa Fe 789",
    activo: true,
    contactos: [
      {
        id: 3,
        personaAutorizada: "Carlos Rodríguez",
        correoElectronico: "carlos@distribuidorac.com",
        telefono: 1145678901,
        clienteId: 3
      }
    ],
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03')
  },
  {
    id: 4,
    razonSocial: "Importadora D S.A.",
    cuit_rut: "30234567890",
    tipoEmpresa: "empresa",
    direccion: "Av. del Libertador 456",
    activo: true,
    contactos: [
      {
        id: 4,
        personaAutorizada: "Ana Martínez",
        correoElectronico: "ana@importadorad.com",
        telefono: 1123456789,
        clienteId: 4
      }
    ],
    createdAt: new Date('2024-01-04'),
    updatedAt: new Date('2024-01-04')
  },
  {
    id: 5,
    razonSocial: "Exportadora E S.R.L.",
    cuit_rut: "30345678901",
    tipoEmpresa: "empresa",
    direccion: "Av. Leandro N. Alem 123",
    activo: true,
    contactos: [
      {
        id: 5,
        personaAutorizada: "Luis Fernández",
        correoElectronico: "luis@exportadorae.com",
        telefono: 1134567890,
        clienteId: 5
      }
    ],
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05')
  }
];

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

export const clientesService = {
  // Obtener todos los clientes
  async getClientes(): Promise<Cliente[]> {
    try {
      if (USE_MOCK_DATA) {
        await mockDelay();
        return mockClientes;
      }
      const response = await axios.get(`${API_URL}/cliente`);
      return response.data;
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
      return response.data;
    } catch (error) {
      console.error(`Error al obtener cliente con ID ${id}:`, error);
      throw error;
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
      const response = await axios.post(`${API_URL}/cliente`, cliente);
      return response.data;
    } catch (error) {
      console.error('Error al crear cliente:', error);
      throw error;
    }
  },

  // Crear un cliente con contacto
  async createClienteWithContacto(cliente: CreateClienteData & {
    personaAutorizada: string;
    correoElectronico: string;
    telefono: number;
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
      const response = await axios.post(`${API_URL}/clienteContacto`, cliente);
      return response.data;
    } catch (error) {
      console.error('Error al crear cliente con contacto:', error);
      throw error;
    }
  },

  // Actualizar un cliente existente
  async updateCliente(id: number, cliente: Partial<CreateClienteData>): Promise<Cliente> {
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
      const response = await axios.put(`${API_URL}/cliente/${id}`, cliente);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar cliente con ID ${id}:`, error);
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
      await axios.delete(`${API_URL}/cliente/${id}`);
    } catch (error) {
      console.error(`Error al eliminar cliente con ID ${id}:`, error);
      throw error;
    }
  }
}; 