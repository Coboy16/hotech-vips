import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { countryService } from "../services/countryService"; // Asegura ruta correcta
import { Country } from "../../../../model/country"; // Importa desde model

/**
 * Hook para obtener y gestionar la lista de países.
 */
export const useCountries = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadCountries = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await countryService.getAllCountries(forceRefresh);
      setCountries(data);
    } catch (err) {
      const message = "Error al cargar los países";
      setError(message);
      console.error(message, err);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar países al montar el componente
  useEffect(() => {
    loadCountries();
  }, [loadCountries]);

  return { countries, loading, error, loadCountries };
};
