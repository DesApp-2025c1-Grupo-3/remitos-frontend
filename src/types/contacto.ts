export interface Contacto {
    id?: number;
    personaAutorizada: string;
    correoElectronico: string;
    telefono: number;
    clienteId?: number;
    destinoId?: number;
    createdAt?: Date;
    updatedAt?: Date;
} 