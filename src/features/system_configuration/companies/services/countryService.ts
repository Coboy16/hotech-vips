import { apiClient } from '../../../../services/api';
import { COUNTRY_ENDPOINTS } from '../../../../services/api/endpoints';

import { Country, CountryResponse } from '../types';

/**
 * Servicio para gestionar operaciones relacionadas con países
 */
export const countryService = {
  /**
   * Obtiene todos los países
   */
  async getAll(): Promise<Country[]> {
    try {
      const response = await apiClient.get<CountryResponse>(COUNTRY_ENDPOINTS.BASE);
      
      if (response.statusCode === 200 && Array.isArray(response.data)) {
        return response.data;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching countries:', error);
      return [];
    }
  },

  /**
   * Obtiene un país por su ID
   */
  async getById(id: string): Promise<Country | null> {
    try {
      const response = await apiClient.get<CountryResponse>(COUNTRY_ENDPOINTS.DETAIL(id));
      
      if (response.statusCode === 200 && Array.isArray(response.data) && response.data.length > 0) {
        return response.data[0];
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching country:', error);
      return null;
    }
  }
};