import { makeRequest } from "../../../../services/api"; // Importa makeRequest y ApiResponse
import { MODULE_ENDPOINTS } from "../../../../services/api/endpoints";
import { ModuleFromApi } from "../../../../model/module"; // Importa tipo del modelo

// Cache para almacenar módulos y evitar llamadas repetidas
let modulesCache: ModuleFromApi[] | null = null;

/**
 * Servicio para gestionar operaciones relacionadas con módulos
 */
export const moduleService = {
  /**
   * Obtiene todos los módulos disponibles
   * Utiliza caché para evitar llamadas repetidas a la API
   */
  async getAllModules(forceRefresh = false): Promise<ModuleFromApi[]> {
    // Si hay caché y no se fuerza actualización, devolver caché
    if (modulesCache && !forceRefresh) {
      console.log("[moduleService] Devolviendo módulos desde caché.");
      return modulesCache;
    }

    console.log("[moduleService] Solicitando módulos a la API...");
    const response = await makeRequest<ModuleFromApi[]>(
      "get",
      MODULE_ENDPOINTS.BASE
    );

    if (
      response &&
      response.statusCode === 200 &&
      Array.isArray(response.data)
    ) {
      console.log("[moduleService] Módulos recibidos y guardados en caché.");
      modulesCache = response.data; // Guardar en caché
      return response.data;
    } else {
      console.error(
        "[moduleService] Error al cargar módulos:",
        response?.message || "Respuesta inválida"
      );
      // No lanzar error aquí, devolver array vacío como fallback
      return [];
    }
  },

  /**
   * Limpia la caché de módulos
   */
  clearCache() {
    modulesCache = null;
    console.log("[moduleService] Caché de módulos limpiada.");
  },
};

export default moduleService;
