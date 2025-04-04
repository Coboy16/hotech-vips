import { makeRequest } from "../../../../services/api";
import { LICENSE_ENDPOINTS } from "../../../../services/api/endpoints";
import {
  ApiLicense,
  CreateLicenseDto,
  UpdateLicenseDto,
  RenewLicenseDto,
} from "../../../../model/license"; // Importa tipos del modelo

/**
 * Servicio para gestionar operaciones relacionadas con licencias de empresas
 */
export const licenseService = {
  /**
   * Obtiene todas las licencias
   */
  async getAll(): Promise<ApiLicense[]> {
    console.log("[licenseService] Solicitando todas las licencias...");
    const response = await makeRequest<ApiLicense[]>(
      "get",
      LICENSE_ENDPOINTS.BASE
    );

    if (
      response &&
      response.statusCode === 200 &&
      Array.isArray(response.data)
    ) {
      console.log(
        `[licenseService] ${response.data.length} licencias obtenidas.`
      );
      return response.data;
    } else {
      console.error(
        "[licenseService] Error al obtener todas las licencias:",
        response?.message || "Respuesta inválida"
      );
      return []; // Devuelve array vacío en caso de error
    }
  },

  /**
   * Obtiene una licencia por su ID
   */
  async getById(id: string): Promise<ApiLicense | null> {
    console.log(`[licenseService] Solicitando licencia con ID: ${id}`);
    const response = await makeRequest<ApiLicense>(
      "get",
      LICENSE_ENDPOINTS.DETAIL(id)
    );

    // Asumiendo que si viene data, es un objeto ApiLicense, no un array
    if (
      response &&
      response.statusCode === 200 &&
      response.data &&
      !Array.isArray(response.data)
    ) {
      console.log(`[licenseService] Licencia ${id} obtenida.`);
      return response.data;
    } else {
      console.error(
        `[licenseService] Error al obtener licencia ${id}:`,
        response?.message || "Respuesta inválida o no encontrada"
      );
      return null;
    }
  },

  /**
   * Crea una nueva licencia
   */
  async create(licenseData: CreateLicenseDto): Promise<ApiLicense | null> {
    console.log("[licenseService] Creando nueva licencia...");
    const response = await makeRequest<ApiLicense>(
      "post",
      LICENSE_ENDPOINTS.BASE,
      licenseData
    );

    if (
      response &&
      response.statusCode === 201 &&
      response.data &&
      !Array.isArray(response.data)
    ) {
      console.log(
        `[licenseService] Licencia creada con ID: ${response.data.license_id}`
      );
      return response.data;
    } else {
      console.error(
        "[licenseService] Error al crear licencia:",
        response?.message || "Respuesta inválida"
      );
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
    console.log(`[licenseService] Actualizando licencia con ID: ${id}`);
    const response = await makeRequest<ApiLicense>(
      "put", // o 'patch' dependiendo de tu API
      LICENSE_ENDPOINTS.UPDATE(id),
      licenseData
    );

    if (
      response &&
      response.statusCode === 200 &&
      response.data &&
      !Array.isArray(response.data)
    ) {
      console.log(`[licenseService] Licencia ${id} actualizada.`);
      return response.data;
    } else {
      console.error(
        `[licenseService] Error al actualizar licencia ${id}:`,
        response?.message || "Respuesta inválida"
      );
      return null;
    }
  },

  /**
   * Renueva una licencia existente (simplificado, usa update pero podría tener endpoint propio)
   * Asume que la renovación solo cambia expirationDate y status.
   */
  async renew(
    id: string,
    renewalData: RenewLicenseDto
  ): Promise<ApiLicense | null> {
    console.log(`[licenseService] Renovando licencia con ID: ${id}`);
    // Reutilizamos el endpoint de update, pero podrías tener uno específico /licenses/{id}/renew
    const response = await makeRequest<ApiLicense>(
      "put", // o 'patch'
      LICENSE_ENDPOINTS.UPDATE(id), // Endpoint de actualización general
      renewalData // Enviamos solo los datos de renovación
    );

    if (
      response &&
      response.statusCode === 200 &&
      response.data &&
      !Array.isArray(response.data)
    ) {
      console.log(`[licenseService] Licencia ${id} renovada.`);
      return response.data;
    } else {
      console.error(
        `[licenseService] Error al renovar licencia ${id}:`,
        response?.message || "Respuesta inválida"
      );
      return null;
    }
  },

  /**
   * Elimina una licencia
   */
  async delete(id: string): Promise<boolean> {
    console.log(`[licenseService] Eliminando licencia con ID: ${id}`);
    const response = await makeRequest<unknown>( // No esperamos data específica al eliminar
      "delete",
      LICENSE_ENDPOINTS.DELETE(id)
    );

    if (response && response.statusCode === 200) {
      console.log(`[licenseService] Licencia ${id} eliminada.`);
      return true;
    } else {
      console.error(
        `[licenseService] Error al eliminar licencia ${id}:`,
        response?.message || "Respuesta inválida"
      );
      return false;
    }
  },
};
