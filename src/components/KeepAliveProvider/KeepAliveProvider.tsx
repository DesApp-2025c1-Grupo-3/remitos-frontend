import React, { useEffect } from 'react';
import { keepAliveService } from '../../services/keepAliveService';

interface KeepAliveProviderProps {
  children: React.ReactNode;
}

export const KeepAliveProvider: React.FC<KeepAliveProviderProps> = ({ children }) => {
  useEffect(() => {
    // Iniciar el servicio de keep-alive cuando se monta el componente
    keepAliveService.start();

    // Cleanup: detener el servicio cuando se desmonta
    return () => {
      keepAliveService.stop();
    };
  }, []);

  return <>{children}</>;
};





