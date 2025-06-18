export interface Contacto {
    id?: number;
    personaAutorizada: string;
    correoElectronico: string;
    telefono: string; // Backend espera string con patrón /^\+?\d{10,15}$/
    clienteId?: number;
    destinoId?: number;
    createdAt?: Date;
    updatedAt?: Date;
} 