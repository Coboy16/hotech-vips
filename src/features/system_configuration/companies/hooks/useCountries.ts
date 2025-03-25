import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Country } from '../types';
import { countryService } from '../services/countryService';

export const useCountries = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar todos los países
  const loadCountries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await countryService.getAll();
      setCountries(data);
    } catch (err) {
      console.error('Error al cargar todos los países :', err);
      setError('Error al cargar los países');
      toast.error('No se pudieron cargar los países');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar países al montar el componente
  useEffect(() => {
    loadCountries();
  }, [loadCountries]);

  return {
    countries,
    loading,
    error,
    loadCountries
  };
};