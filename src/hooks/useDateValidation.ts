import { useState, useMemo } from 'react';

export interface DateValidationResult {
  isValid: boolean;
  errorMessage: string | null;
}

export const useDateValidation = (fechaDesde?: string, fechaHasta?: string) => {
  const validationResult = useMemo((): DateValidationResult => {
    // Si no hay fechas, es válido
    if (!fechaDesde && !fechaHasta) {
      return { isValid: true, errorMessage: null };
    }

    // Si solo hay una fecha, es válido
    if (!fechaDesde || !fechaHasta) {
      return { isValid: true, errorMessage: null };
    }

    // Convertir a objetos Date para comparar
    const desde = new Date(fechaDesde);
    const hasta = new Date(fechaHasta);

    // Verificar que las fechas sean válidas
    if (isNaN(desde.getTime()) || isNaN(hasta.getTime())) {
      return { isValid: false, errorMessage: 'Las fechas seleccionadas no son válidas' };
    }

    // Verificar que fechaDesde no sea posterior a fechaHasta
    if (desde > hasta) {
      return { 
        isValid: false, 
        errorMessage: 'La fecha de inicio no puede ser posterior a la fecha de fin' 
      };
    }

    // Verificar que no sea una diferencia muy grande (opcional)
    const diffInDays = Math.ceil((hasta.getTime() - desde.getTime()) / (1000 * 60 * 60 * 24));
    if (diffInDays > 365) {
      return { 
        isValid: false, 
        errorMessage: 'El rango de fechas no puede ser mayor a 1 año' 
      };
    }

    return { isValid: true, errorMessage: null };
  }, [fechaDesde, fechaHasta]);

  return validationResult;
};



