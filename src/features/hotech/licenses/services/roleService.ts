import { makeRequest } from "../../../../services/api";
import { ROLE_ENDPOINTS } from "../../../../services/api/endpoints";
import { ApiRole } from "../../../../model/role";

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
    const response = await makeRequest<ApiRole[]>("get", ROLE_ENDPOINTS.BASE);

    if (
      response &&
      response.statusCode === 200 &&
      Array.isArray(response.data)
    ) {
      console.log("[roleService] Roles recibidos y guardados en caché.");
      rolesCache = response.data;
      return rolesCache;
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

  /**
   * Limpia la caché de roles.
   */
  clearCache() {
    rolesCache = null;
    console.log("[roleService] Caché de roles limpiada.");
  },
};
