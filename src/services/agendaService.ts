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
        // Usar métodos locales para fechas que ya incluyen zona horaria
        const year = d.getFullYear();
        const month = d.getMonth() + 1;
        const day = d.getDate();
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
    
    // Crear una fecha local para el día seleccionado a las 00:00 hora local
    // Esto evita problemas de zona horaria al enviar a la base de datos
    const [year, month, day] = date.split('-').map(Number);
    const localDate = new Date(year, month - 1, day, 0, 0, 0, 0);
    
    console.log('🔍 DEBUG - assignRemitoToDate - Fecha local creada:', localDate);
    console.log('🔍 DEBUG - assignRemitoToDate - Fecha local ISO:', localDate.toISOString());
    
    // Al agendar un remito, también cambiar su estado a "Agendado" (id = 8)
    const payload = { 
      fechaAgenda: localDate.toISOString(),
      estadoId: 8 // Estado "Agendado"
    } as unknown as RemitoUpdateData;
    console.log('🔍 DEBUG - assignRemitoToDate - Payload:', payload);
    
    const result = await remitosService.updateRemito(remitoId, payload);
    console.log('🔍 DEBUG - assignRemitoToDate - Resultado:', result);
    console.log('🔍 DEBUG - assignRemitoToDate - fechaAgenda en respuesta:', result.fechaAgenda);
    
    return result;
  },

  async moveRemitoToDate(remitoId: number, date: string): Promise<Remito> {
    // Crear una fecha local para el día seleccionado a las 00:00 hora local
    const [year, month, day] = date.split('-').map(Number);
    const localDate = new Date(year, month - 1, day, 0, 0, 0, 0);
    
    // Al mover un remito a otra fecha, mantener el estado "Agendado" (id = 8)
    const payload = { 
      fechaAgenda: localDate.toISOString(),
      estadoId: 8 // Estado "Agendado"
    } as unknown as RemitoUpdateData;
    return remitosService.updateRemito(remitoId, payload);
  },

  async removeRemitoDate(remitoId: number): Promise<Remito> {
    // Al quitar un remito de la agenda, también cambiar su estado de vuelta a "Autorizado" (id = 1)
    const payload = { 
      fechaAgenda: null,
      estadoId: 1 // Estado "Autorizado"
    } as unknown as RemitoUpdateData;
    return remitosService.updateRemito(remitoId, payload);
  },

  // Obtener remitos disponibles para agendar (solo los que están autorizados)
  async getRemitosDisponibles(): Promise<Remito[]> {
    try {
      // Primero obtener el estado "Autorizado"
      const estadosResponse = await axios.get(`${API_URL}/estado`);
      const estadoAutorizado = estadosResponse.data.find((estado: any) => estado.nombre === 'Autorizado');
      
      if (!estadoAutorizado) {
        console.warn('⚠️ No se encontró el estado "Autorizado"');
        return [];
      }
      
      // Filtrar remitos que estén autorizados y sin fechaAgenda
      const filters: RemitosFilters = { 
        estadoId: estadoAutorizado.id,
        fechaAgenda: 'null' as unknown as string 
      } as any;
      
      const { data } = await remitosService.getRemitos(1, 1000, filters);
      return data;
    } catch (error) {
      console.error('❌ Error obteniendo remitos disponibles:', error);
      return [];
    }
  },

};
