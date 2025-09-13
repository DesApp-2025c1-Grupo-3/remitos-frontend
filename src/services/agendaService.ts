import axios from 'axios';
import { getApiUrl } from '../config/api';
import { Remito, RemitosResponse, RemitosFilters, remitosService, RemitoUpdateData } from './remitosService';

const API_URL = getApiUrl();

export interface AgendaDaySummary {
  date: string; // YYYY-MM-DD
  remitos: Remito[];
}

export interface MonthGridRequest {
  year: number; // 2025
  month: number; // 1-12
}

const toIsoDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const agendaService = {
  async getByDate(date: string): Promise<Remito[]> {
    const filters: RemitosFilters = { fechaAgenda: date };
    const { data } = await remitosService.getRemitos(1, 1000, filters);
    // Normalizar a YYYY-MM-DD por si backend envía fecha con tiempo
    const asIsoDay = (val: string | null | undefined) => {
      if (!val) return null;
      try {
        const d = new Date(val);
        if (isNaN(d.getTime())) return (typeof val === 'string' && val.length >= 10) ? val.slice(0,10) : null;
        // Usar métodos UTC para fechas UTC del backend (como updatedAt)
        const year = d.getUTCFullYear();
        const month = d.getUTCMonth() + 1;
        const day = d.getUTCDate();
        return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      } catch {
        return (typeof val === 'string' && val.length >= 10) ? val.slice(0,10) : null;
      }
    };
    return data.filter(remito => asIsoDay(remito.fechaAgenda) === date);
  },


  async getMonthGrid({ year, month }: MonthGridRequest): Promise<AgendaDaySummary[]> {
    // Genera todas las fechas del mes y consulta día a día (backend actual soporta filtro por día)
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);

    const days: string[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(toIsoDate(d));
    }

    const results = await Promise.all(days.map(async (day) => {
      const remitos = await this.getByDate(day);
      return { date: day, remitos } as AgendaDaySummary;
    }));

    return results;
  },

  async assignRemitoToDate(remitoId: number, date: string): Promise<Remito> {
    console.log('🔍 DEBUG - assignRemitoToDate - Remito ID:', remitoId, 'Fecha:', date);
    
    // Convertir la fecha YYYY-MM-DD a UTC para ser consistente con updatedAt
    const utcDate = `${date}T00:00:00.000Z`;
    console.log('🔍 DEBUG - assignRemitoToDate - Fecha UTC enviada:', utcDate);
    
    const payload = { fechaAgenda: utcDate } as unknown as RemitoUpdateData;
    console.log('🔍 DEBUG - assignRemitoToDate - Payload:', payload);
    
    const result = await remitosService.updateRemito(remitoId, payload);
    console.log('🔍 DEBUG - assignRemitoToDate - Resultado:', result);
    console.log('🔍 DEBUG - assignRemitoToDate - fechaAgenda en respuesta:', result.fechaAgenda);
    
    return result;
  },

  async moveRemitoToDate(remitoId: number, date: string): Promise<Remito> {
    // Convertir la fecha YYYY-MM-DD a UTC para ser consistente con updatedAt
    const utcDate = `${date}T00:00:00.000Z`;
    const payload = { fechaAgenda: utcDate } as unknown as RemitoUpdateData;
    return remitosService.updateRemito(remitoId, payload);
  },

  async removeRemitoDate(remitoId: number): Promise<Remito> {
    const payload = { fechaAgenda: null } as unknown as RemitoUpdateData;
    return remitosService.updateRemito(remitoId, payload);
  },

  // Obtener remitos disponibles para agendar (sin fechaAgenda)
  async getRemitosDisponibles(): Promise<Remito[]> {
    try {
      // Pedir al backend directamente los de fechaAgenda=null
      const filters: RemitosFilters = { fechaAgenda: 'null' as unknown as string } as any;
      const { data } = await remitosService.getRemitos(1, 1000, filters);
      return data;
    } catch (error) {
      console.error('❌ Error obteniendo remitos disponibles:', error);
      return [];
    }
  },

};
