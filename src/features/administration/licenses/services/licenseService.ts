import { apiClient } from "../../../../services/api";
import { LICENSE_ENDPOINTS } from "../../../../services/api/endpoints";
import { tokenStorage } from "../../../auth/utils";

import {
  LicenseResponse,
  CreateLicenseDto,
  UpdateLicenseDto,
  ApiLicense,
} from "../types/license";

/**
 * Servicio para gestionar operaciones relacionadas con licencias de empresas
 */
export const licenseService = {
  /**
   * Obtiene todas las licencias
   */
  async getAll(): Promise<ApiLicense[]> {
    const token = tokenStorage.getToken();
    if (!token) {
      console.error(
        "[licenseService] No hay token de autenticación disponible"
      );
      return [];
    }
    try {
      console.log("[licenseService] GET request to:", LICENSE_ENDPOINTS.BASE);
      const response = await apiClient.get<LicenseResponse>(
        LICENSE_ENDPOINTS.BASE,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("[licenseService] Response:", response);

      // Procesar los datos para adaptarlos a nuestra interfaz
      if (response.statusCode === 200 && Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error(
        "[licenseService] Error al cargar todas las licencias:",
        error
      );
      return [];
    }
  },

  /**
   * Obtiene una licencia por su ID
   */
  async getById(id: string): Promise<ApiLicense | null> {
    const token = tokenStorage.getToken();
    if (!token) {
      console.error(
        "[licenseService] No hay token de autenticación disponible"
      );
      return null;
    }
    try {
      console.log(
        "[licenseService] GET request to:",
        LICENSE_ENDPOINTS.DETAIL(id)
      );
      const response = await apiClient.get<LicenseResponse>(
        LICENSE_ENDPOINTS.DETAIL(id),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("[licenseService] Response:", response);

      if (response.statusCode === 200 && !Array.isArray(response.data)) {
        return response.data as ApiLicense;
      }
      return null;
    } catch (error) {
      console.error("[licenseService] Error al obtener licencia:", error);
      return null;
    }
  },

  /**
   * Crea una nueva licencia
   */
  async create(licenseData: CreateLicenseDto): Promise<ApiLicense | null> {
    const token = tokenStorage.getToken();
    if (!token) {
      console.error(
        "[licenseService] No hay token de autenticación disponible"
      );
      return null;
    }
    try {
      console.log(
        "[licenseService] POST request to:",
        LICENSE_ENDPOINTS.BASE,
        "with data:",
        licenseData
      );
      const response = await apiClient.post<LicenseResponse>(
        LICENSE_ENDPOINTS.BASE,
        licenseData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("[licenseService] Response:", response);

      if (response.statusCode === 201 && !Array.isArray(response.data)) {
        return response.data as ApiLicense;
      }
      return null;
    } catch (error) {
      console.error("[licenseService] Error al crear licencia:", error);
      return null;
    }
  },

  /**
   * Actualiza una licencia existente
   */
  async update(
    id: string,
    licenseData: UpdateLicenseDto
  ): Promise<ApiLicense | null> {
    const token = tokenStorage.getToken();
    if (!token) {
      console.error(
        "[licenseService] No hay token de autenticación disponible"
      );
      return null;
    }
    try {
      console.log(
        "[licenseService] PATCH request to:",
        LICENSE_ENDPOINTS.UPDATE(id),
        "with data:",
        licenseData
      );
      const response = await apiClient.patch<LicenseResponse>(
        LICENSE_ENDPOINTS.UPDATE(id),
        licenseData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("[licenseService] Response:", response);

      if (response.statusCode === 200 && !Array.isArray(response.data)) {
        return response.data as ApiLicense;
      }
      return null;
    } catch (error) {
      console.error("[licenseService] Error al actualizar licencia:", error);
      return null;
    }
  },

  /**
   * Elimina una licencia
   */
  async delete(id: string): Promise<boolean> {
    const token = tokenStorage.getToken();
    if (!token) {
      console.error(
        "[licenseService] No hay token de autenticación disponible"
      );
      return false;
    }
    try {
      console.log(
        "[licenseService] DELETE request to:",
        LICENSE_ENDPOINTS.DELETE(id)
      );
      const response = await apiClient.delete<LicenseResponse>(
        LICENSE_ENDPOINTS.DELETE(id),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("[licenseService] Response:", response);
      return response.statusCode === 200;
    } catch (error) {
      console.error("[licenseService] Error al eliminar licencia:", error);
      return false;
    }
  },
};
