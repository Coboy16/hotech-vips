import toast from "react-hot-toast";
import { Module, ModulesApiResponse, ApiNestedModule } from "../types";
import { transformApiModuleToModule } from "../utils/transformations"; // Importa la transformación
import { makeRequest, MODULE_ENDPOINTS } from "../../../../services/api";

// Simple cache en memoria
let modulesCache: Module[] | null = null;

export const moduleService = {
  /**
   * Obtiene todos los módulos disponibles. Usa caché.
   */
  async getAllModules(forceRefresh = false): Promise<Module[]> {
    if (modulesCache && !forceRefresh) {
      console.log("[moduleService] Devolviendo módulos desde caché.");
      return modulesCache;
    }

    console.log(
      `[moduleService] Solicitando todos los módulos... ${
        forceRefresh ? "(Forzando recarga)" : ""
      }`
    );
    try {
      // Especificamos que esperamos ApiNestedModule[] en la respuesta 'data'
      const response = await makeRequest<
        ModulesApiResponse & { data: ApiNestedModule[] }
      >("get", MODULE_ENDPOINTS.BASE);

      if (
        response &&
        response.statusCode === 200 &&
        Array.isArray(response.data)
      ) {
        console.log(
          `[moduleService] ${response.data.length} módulos (ApiNestedModule) obtenidos. Transformando y guardando en caché...`
        );
        const transformedModules = response.data.map(
          transformApiModuleToModule
        );
        modulesCache = transformedModules; // Actualizar caché
        return transformedModules;
      } else {
        console.error(
          "[moduleService] Error al obtener módulos:",
          response?.message || response?.error || "Respuesta inválida"
        );
        toast.error(response?.message || "Error al cargar los módulos.");
        return [];
      }
    } catch (error) {
      console.error("[moduleService] Excepción al obtener módulos:", error);
      toast.error("Error de red o del servidor al obtener módulos.");
      return [];
    }
  },

  /**
   * Obtiene un módulo por su UUID. (No usa caché por defecto para detalles individuales)
   */
  async getModuleById(uuid: string): Promise<Module | null> {
    console.log(`[moduleService] Solicitando módulo con UUID: ${uuid}`);
    try {
      // Tipo específico para la respuesta de un solo módulo
      const response = await makeRequest<{
        statusCode: number;
        data: ApiNestedModule;
        message: string;
        error: string;
      }>(
        "get",
        MODULE_ENDPOINTS.DETAIL(uuid) // Asumiendo que tienes MODULE_ENDPOINTS.DETAIL
      );

      if (response && response.statusCode === 200 && response.data) {
        console.log(
          `[moduleService] Módulo ${uuid} obtenido. Transformando...`
        );
        return transformApiModuleToModule(response.data.data);
      } else {
        console.error(
          `[moduleService] Error al obtener módulo ${uuid}:`,
          response?.message || response?.error || "Respuesta inválida"
        );
        toast.error(
          response?.message || `Error al obtener detalle del módulo ${uuid}.`
        );
        return null;
      }
    } catch (error) {
      console.error(
        `[moduleService] Excepción al obtener módulo ${uuid}:`,
        error
      );
      toast.error(`Error de red o del servidor al obtener el módulo ${uuid}.`);
      return null;
    }
  },

  /**
   * Limpia la caché de módulos.
   */
  clearCache() {
    modulesCache = null;
    console.log("[moduleService] Caché de módulos limpiada.");
  },
};
