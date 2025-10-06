import { getApiUrl } from '../config/api';

// Servicio para mantener la API activa en producción
export class KeepAliveService {
  private static instance: KeepAliveService;
  private intervalId: NodeJS.Timeout | null = null;
  private isProduction: boolean = false;

  private constructor() {
    // Detectar si estamos en producción
    this.isProduction = import.meta.env.PROD && import.meta.env.VITE_USE_RENDER_API === 'true';
  }

  public static getInstance(): KeepAliveService {
    if (!KeepAliveService.instance) {
      KeepAliveService.instance = new KeepAliveService();
    }
    return KeepAliveService.instance;
  }

  // Iniciar el servicio de keep-alive
  public start(): void {
    // Solo ejecutar en producción
    if (!this.isProduction) {
      console.log('KeepAlive: Solo se ejecuta en producción');
      return;
    }

    // Si ya está corriendo, no hacer nada
    if (this.intervalId) {
      console.log('KeepAlive: Ya está corriendo');
      return;
    }

    console.log('KeepAlive: Iniciando servicio de keep-alive...');
    
    // Hacer ping inmediatamente
    this.pingApi();

    // Configurar intervalo de 20 minutos (1200000 ms)
    this.intervalId = setInterval(() => {
      this.pingApi();
    }, 20 * 60 * 1000);

    console.log('KeepAlive: Servicio iniciado - pings cada 20 minutos');
  }

  // Detener el servicio
  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('KeepAlive: Servicio detenido');
    }
  }

  // Hacer ping a la API
  private async pingApi(): Promise<void> {
    try {
      const apiUrl = getApiUrl();
      const pingUrl = `${apiUrl}/api/health`; // Endpoint de health check
      
      const response = await fetch(pingUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Timeout de 10 segundos
        signal: AbortSignal.timeout(10000)
      });

      if (response.ok) {
        console.log('KeepAlive: Ping exitoso a la API');
      } else {
        console.warn('KeepAlive: Ping falló - Status:', response.status);
      }
    } catch (error) {
      console.error('KeepAlive: Error en ping:', error);
    }
  }

  // Verificar si el servicio está corriendo
  public isRunning(): boolean {
    return this.intervalId !== null;
  }

  // Hacer un ping manual (útil para testing)
  public async manualPing(): Promise<boolean> {
    try {
      await this.pingApi();
      return true;
    } catch (error) {
      console.error('KeepAlive: Error en ping manual:', error);
      return false;
    }
  }
}

// Exportar instancia singleton
export const keepAliveService = KeepAliveService.getInstance();





