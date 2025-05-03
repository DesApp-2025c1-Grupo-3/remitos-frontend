//import axios from 'axios';

const API_URL = 'http://localhost:3000/api'; // Ajusta la URL según tu configuración

export interface Cliente {
    id: number;
    razonSocial: string,
    cuit_rut: string,
    direccion: string,
    tipoEmpresa: string,
    contactos
}

// Datos mock para desarrollo
const mockClientes: Cliente[] = [
  {
    id: 1,
    razonSocial: "La Perla SRL",
    cuit_rut: "30-1245437-5",
    direccion: "Maipu 4071",
    tipoEmpresa: "Privada",
    contactos: [
      { nombre: "Juan Pérez", email: "juan@example.com", telefono: "123456789" },
      { nombre: "Ana López", email: "ana@example.com", telefono: "987654321" }
    ]
  },
  {
    id: 2,
    razonSocial: "Distribuidora Central",
    cuit_rut: "30-9876543-2",
    direccion: "Av. San Martín 3456",
    tipoEmpresa: "Pública",
    contactos: [
      { nombre: "Carlos Gómez", email: "carlos@example.com", telefono: "111222333" }
    ]
  }
];



export const clientesService = {
  // Obtener todos los clientes
  async getClientes(): Promise<Cliente[]> {
    try {
      // Simulamos un delay de la API
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockClientes;
      // const response = await axios.get(`${API_URL}/clientes`);
      // return response.data;
    } catch (error) {
      console.error('Error al obtener clientes:', error);
      throw error;
    }
  },

  // Obtener un cliente por ID
  async getClienteById(id: number): Promise<Cliente> {
    try {
      // Simulamos un delay de la API
      await new Promise(resolve => setTimeout(resolve, 500));
      const cliente = mockClientes.find(d => d.id === id);
      if (!cliente) throw new Error('Cliente no encontrado');
      return cliente;
      // const response = await axios.get(`${API_URL}/cliente/${id}`);
      // return response.data;
    } catch (error) {
      console.error(`Error al obtener cliente con ID ${id}:`, error);
      throw error;
    }
  },

  // Crear un nuevo cliente
  async createCliente(cliente: Omit<Cliente, 'id'>): Promise<Cliente> {
    try {
      // Simulamos un delay de la API
      await new Promise(resolve => setTimeout(resolve, 500));
      const newCliente = {
        ...cliente,
        id: Math.max(...mockClientes.map(d => d.id)) + 1
      };
      mockClientes.push(newCliente);
      return newCliente;
      // const response = await axios.post(`${API_URL}/cliente`, cliente);
      // return response.data;
    } catch (error) {
      console.error('Error al crear cliente:', error);
      throw error;
    }
  },

  // Actualizar un cliente existente
  async updateCliente(id: number, cliente:Partial<Cliente>): Promise<Cliente> {
    try {
      // Simulamos un delay de la API
      await new Promise(resolve => setTimeout(resolve, 500));
      const index = mockClientes.findIndex(d => d.id === id);
      if (index === -1) throw new Error('Cliente no encontrado');
      
      mockClientes[index] = {
        ...mockClientes[index],
        ...cliente
      };
      return mockClientes[index];
      // const response = await axios.put(`${API_URL}/cliente/${id}`, cliente);
      // return response.data;
    } catch (error) {
      console.error(`Error al actualizar cliente con ID ${id}:`, error);
      throw error;
    }
  },

  // Eliminar un cliente
  async deleteCliente(id: number): Promise<void> {
    try {
      // Simulamos un delay de la API
      await new Promise(resolve => setTimeout(resolve, 500));
      const index = mockClientes.findIndex(d => d.id === id);
      if (index === -1) throw new Error('Cliente no encontrado');
      mockClientes.splice(index, 1);
      // await axios.delete(`${API_URL}/cliente/${id}`);
    } catch (error) {
      console.error(`Error al eliminar cliente con ID ${id}:`, error);
      throw error;
    }
  }
}; 