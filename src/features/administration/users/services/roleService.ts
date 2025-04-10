/* eslint-disable @typescript-eslint/no-explicit-any */
import { makeRequest } from "../../../../services/api";
import { ROLE_ENDPOINTS } from "../../../../services/api/endpoints";
import { ApiRole } from "../../../../model/role";
import { tokenStorage } from "../../../auth/utils/tokenStorage";
import toast from "react-hot-toast";

// Cache para roles
let rolesCache: ApiRole[] | null = null;

export const roleService = {
  /**
   * Obtiene todos los roles disponibles desde la API, usando caché.
   */
  async getAllRoles(forceRefresh = false): Promise<ApiRole[]> {
    if (rolesCache && !forceRefresh) {
      console.log("[roleService] Devolviendo roles desde caché.");
      return rolesCache;
    }

    console.log("[roleService] Solicitando roles a la API...");
    const licenseId = tokenStorage.getLicenseId();
    console.log(`[licenseId]`);
    console.log(`[licenseId] ${licenseId}`);
    console.log(`[licenseId]`);

    // 2. Verificar si se obtuvo el licenseId
    if (!licenseId) {
      console.error(
        "[userService] No se encontró un licenseId en tokenStorage. No se pueden obtener usuarios."
      );
      toast.error("Error interno: No se pudo determinar la licencia.");
      return [];
    }

    const response = await makeRequest<ApiRole[]>(
      "get",
      ROLE_ENDPOINTS.BY_LICENSE(licenseId)
    );

    if (
      response &&
      response.statusCode === 200 &&
      Array.isArray(response.data)
    ) {
      console.log("[roleService] Roles recibidos y guardados en caché.");
      rolesCache = response.data;
      return rolesCache || [];
    } else {
      console.error(
        "[roleService] Error al cargar roles:",
        response?.message || "Respuesta inválida"
      );
      // Limpiar caché en caso de error para intentar de nuevo la próxima vez
      rolesCache = null;
      return []; // Devolver vacío en caso de error
    }
  },

  async getRoleById(uid: string): Promise<ApiRole | null> {
    console.log(`[roleService] Buscando rol en la API: ${uid}`);

    try {
      const response = await makeRequest<any>(
        "get",
        ROLE_ENDPOINTS.DETAIL(uid)
      );

      if (response && response.statusCode === 200) {
        // Verificar la estructura de la respuesta con logs detallados
        console.log(`[roleService] Respuesta completa:`, response);

        // Si la respuesta tiene un campo data, usarlo
        const roleData = response.data;

        if (roleData) {
          console.log(`[roleService] Rol encontrado:`, roleData);
          return roleData;
        } else {
          console.warn(`[roleService] La respuesta no contiene datos del rol`);
          return null;
        }
      } else {
        console.error(
          `[roleService] Error en respuesta: ${response?.statusCode}, ${response?.message}`
        );
        return null;
      }
    } catch (error) {
      console.error(`[roleService] Excepción al obtener rol:`, error);
      return null;
    }
  },

  /**
   * Limpia la caché de roles.
   */
  clearCache() {
    rolesCache = null;
    console.log("[roleService] Caché de roles limpiada.");
  },
};
