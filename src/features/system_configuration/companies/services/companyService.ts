
import { apiClient } from '../../../../services/api';
import { COMPANY_ENDPOINTS } from '../../../../services/api/endpoints';
import { Company, CompanyResponse, CreateCompanyDto, UpdateCompanyDto } from '../types';

/**
 * Servicio para gestionar operaciones relacionadas con compañías
 */
export const companyService = {
  /**
   * Obtiene todas las compañías
   */
  async getAll(): Promise<Company[]> {
    const response = await apiClient.get<CompanyResponse>(COMPANY_ENDPOINTS.BASE);
    
    if (response.statusCode === 200 && Array.isArray(response.data)) {
      return response.data;
    }
    
    return [];
  },

  /**
   * Obtiene una compañía por su ID
   */
  async getById(id: string): Promise<Company | null> {
    try {
      const response = await apiClient.get<CompanyResponse>(COMPANY_ENDPOINTS.DETAIL(id));
      
      if (response.statusCode === 200 && !Array.isArray(response.data)) {
        return response.data as Company;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching company:', error);
      return null;
    }
  },

  /**
   * Crea una nueva compañía
   */
  async create(companyData: CreateCompanyDto): Promise<Company | null> {
    try {
      const response = await apiClient.post<CompanyResponse>(COMPANY_ENDPOINTS.BASE, companyData);
      
      if (response.statusCode === 201 && !Array.isArray(response.data)) {
        return response.data as Company;
      }
      
      return null;
    } catch (error) {
      console.error('Error creating company:', error);
      return null;
    }
  },

  /**
   * Actualiza una compañía existente
   */
  async update(id: string, companyData: UpdateCompanyDto): Promise<Company | null> {
    try {
      const response = await apiClient.patch<CompanyResponse>(COMPANY_ENDPOINTS.UPDATE(id), companyData);
      
      if (response.statusCode === 200 && !Array.isArray(response.data)) {
        return response.data as Company;
      }
      
      return null;
    } catch (error) {
      console.error('Error updating company:', error);
      return null;
    }
  },

  /**
   * Elimina una compañía
   */
  async delete(id: string): Promise<boolean> {
    try {
      const response = await apiClient.delete<CompanyResponse>(COMPANY_ENDPOINTS.DELETE(id));
      return response.statusCode === 200;
    } catch (error) {
      console.error('Error deleting company:', error);
      return false;
    }
  }
};