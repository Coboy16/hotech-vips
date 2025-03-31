import { useState, useEffect } from "react";

/**
 * Hook para debouncear un valor. Útil para retrasar ejecuciones
 * costosas como búsquedas en API mientras el usuario escribe.
 * @param value El valor a debouncear.
 * @param delay El retraso en milisegundos.
 * @returns El valor debounced.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Establecer un temporizador para actualizar el valor debounced
    // después del retraso especificado
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpiar el temporizador si el valor cambia (o si el componente se desmonta)
    // Esto es lo que previene que el valor se actualice hasta que el usuario deje de escribir
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Solo volver a ejecutar si el valor o el retraso cambian

  return debouncedValue;
}
