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
    const { data } = await remitosService.getRemitos(1, 500, filters);
    // Solo retornar remitos que realmente tengan fechaAgenda (estén agendados)
    const remitosAgendados = data.filter(remito => remito.fechaAgenda === date);
    
    return remitosAgendados;
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
    const payload = { fechaAgenda: date } as unknown as RemitoUpdateData;
    return remitosService.updateRemito(remitoId, payload);
  },

  async moveRemitoToDate(remitoId: number, date: string): Promise<Remito> {
    const payload = { fechaAgenda: date } as unknown as RemitoUpdateData;
    return remitosService.updateRemito(remitoId, payload);
  },

  async removeRemitoDate(remitoId: number): Promise<Remito> {
    const payload = { fechaAgenda: null } as unknown as RemitoUpdateData;
    return remitosService.updateRemito(remitoId, payload);
  },

  // Obtener remitos disponibles para agendar (sin fechaAgenda)
  async getRemitosDisponibles(): Promise<Remito[]> {
    try {
      // Buscar remitos que no tengan fechaAgenda (no estén agendados)
      const { data } = await remitosService.getRemitos(1, 100, {});
      
      // Filtrar solo los que no tienen fechaAgenda (null, undefined, o string vacío)
      const remitosDisponibles = data.filter(remito => 
        remito.fechaAgenda === null || 
        remito.fechaAgenda === undefined || 
        remito.fechaAgenda === '' ||
        remito.fechaAgenda === 'null'
      );
      
      console.log('🔍 Remitos del backend:', data.length, 'Disponibles:', remitosDisponibles.length);
      console.log('📊 Detalle remitos backend:', data.map(r => ({ 
        id: r.id, 
        numero: r.numeroAsignado, 
        fechaAgenda: r.fechaAgenda 
      })));
      
      return remitosDisponibles;
    } catch (error) {
      console.error('❌ Error obteniendo remitos disponibles:', error);
      return [];
    }
  },

};
