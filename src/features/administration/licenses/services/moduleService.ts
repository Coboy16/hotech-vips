import { apiClient } from "../../../../services/api";
import { tokenStorage } from "../../../auth/utils";

// Interfaces
export interface Module {
  module_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

interface ModuleResponse {
  statusCode: number;
  message: string;
  data: Module[];
}

// Cache para almacenar módulos y evitar llamadas repetidas
let modulesCache: Module[] | null = null;

/**
 * Servicio para gestionar operaciones relacionadas con módulos
 */
export const moduleService = {
  /**
   * Obtiene todos los módulos disponibles
   * Utiliza caché para evitar llamadas repetidas a la API
   */
  async getAllModules(forceRefresh = false): Promise<Module[]> {
    // Si hay caché y no se fuerza actualización, devolver caché
    if (modulesCache && !forceRefresh) {
      return modulesCache;
    }

    const token = tokenStorage.getToken();
    if (!token) {
      console.error("[moduleService] No hay token de autenticación disponible");
      return [];
    }

    try {
      console.log("[moduleService] GET request to: /modules");
      const response = await apiClient.get<ModuleResponse>("/modules", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("[moduleService] Response:", response);

      if (response.statusCode === 200 && Array.isArray(response.data)) {
        // Guardar en caché
        modulesCache = response.data;
        return response.data;
      }
      return [];
    } catch (error) {
      console.error("[moduleService] Error al cargar módulos:", error);
      return [];
    }
  },

  /**
   * Limpia la caché de módulos
   */
  clearCache() {
    modulesCache = null;
  },
};

export default moduleService;
