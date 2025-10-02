export interface Mercaderia {
  id?: number;
  tipoMercaderiaId: number;
  valorDeclarado: number;
  volumenMetrosCubico: number;
  pesoMercaderia: number;
  cantidadBobinas?: number | null;
  cantidadRacks?: number | null;
  cantidadBultos?: number | null;
  cantidadPallets?: number | null;
  requisitosEspeciales?: string | null;
  remitoId?: number;
  estadoId?: number;
  activo?: boolean;
  // Relación incluida
  tipoMercaderia?: {
    id: number;
    nombre: string;
    descripcion?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MercaderiaFormData {
  tipoMercaderiaId: number | null;
  valorDeclarado: number | string;
  volumenMetrosCubico: number | string;
  pesoMercaderia: number | string;
  cantidadBobinas: number | string;
  cantidadRacks: number | string;
  cantidadBultos: number | string;
  cantidadPallets: number | string;
  requisitosEspeciales: string;
}


