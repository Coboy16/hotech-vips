import { apiClient } from "../../../../services/api";
import { COMPANY_ENDPOINTS } from "../../../../services/api/endpoints";
import { tokenStorage } from "../../../auth/utils";
import {
  Company,
  CompanyResponse,
  CreateCompanyDto,
  UpdateCompanyDto,
} from "../types";

/**
 * Servicio para gestionar operaciones relacionadas con compañías
 */
export const companyService = {
  /**
   * Obtiene todas las compañías
   */
  async getAll(): Promise<Company[]> {
    const token = tokenStorage.getToken();
    if (!token) {
      console.error("No hay token de autenticación disponible");
      return [];
    }
    try {
      console.log("GET request to:", COMPANY_ENDPOINTS.BASE);
      const response = await apiClient.get<CompanyResponse>(
        COMPANY_ENDPOINTS.BASE,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Response:", response);
      return response.statusCode === 200 && Array.isArray(response.data)
        ? response.data
        : [];
    } catch (error) {
      console.error("Error al cargar todas las compañías:", error);
      return [];
    }
  },

  /**
   * Obtiene una compañía por su ID
   */
  async getById(id: string): Promise<Company | null> {
    const token = tokenStorage.getToken();
    if (!token) {
      console.error("No hay token de autenticación disponible");
      return null;
    }
    try {
      console.log("GET request to:", COMPANY_ENDPOINTS.DETAIL(id));
      const response = await apiClient.get<CompanyResponse>(
        COMPANY_ENDPOINTS.DETAIL(id),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Response:", response);
      return response.statusCode === 200 && !Array.isArray(response.data)
        ? (response.data as Company)
        : null;
    } catch (error) {
      console.error("Error fetching company:", error);
      return null;
    }
  },

  /**
   * Crea una nueva compañía
   */
  async create(companyData: CreateCompanyDto): Promise<Company | null> {
    const token = tokenStorage.getToken();
    if (!token) {
      console.error("No hay token de autenticación disponible");
      return null;
    }
    try {
      console.log(
        "POST request to:",
        COMPANY_ENDPOINTS.BASE,
        "with data:",
        companyData
      );
      const response = await apiClient.post<CompanyResponse>(
        COMPANY_ENDPOINTS.BASE,
        companyData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Response:", response);
      return response.statusCode === 201 && !Array.isArray(response.data)
        ? (response.data as Company)
        : null;
    } catch (error) {
      console.error("Error creating company:", error);
      return null;
    }
  },

  /**
   * Actualiza una compañía existente
   */
  async update(
    id: string,
    companyData: UpdateCompanyDto
  ): Promise<Company | null> {
    const token = tokenStorage.getToken();
    if (!token) {
      console.error("No hay token de autenticación disponible");
      return null;
    }
    try {
      console.log(
        "PATCH request to:",
        COMPANY_ENDPOINTS.UPDATE(id),
        "with data:",
        companyData
      );
      const response = await apiClient.patch<CompanyResponse>(
        COMPANY_ENDPOINTS.UPDATE(id),
        companyData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Response:", response);
      return response.statusCode === 200 && !Array.isArray(response.data)
        ? (response.data as Company)
        : null;
    } catch (error) {
      console.error("Error updating company:", error);
      return null;
    }
  },

  /**
   * Elimina una compañía
   */
  async delete(id: string): Promise<boolean> {
    const token = tokenStorage.getToken();
    if (!token) {
      console.error("No hay token de autenticación disponible");
      return false;
    }
    try {
      console.log("DELETE request to:", COMPANY_ENDPOINTS.DELETE(id));
      const response = await apiClient.delete<CompanyResponse>(
        COMPANY_ENDPOINTS.DELETE(id),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Response:", response);
      return response.statusCode === 200;
    } catch (error) {
      console.error("Error deleting company:", error);
      return false;
    }
  },
};
