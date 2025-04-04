import { makeRequest } from "../../../../services/api";
import { STRUCTURE_ENDPOINTS } from "../../../../services/api/endpoints";
import { ApiStructureTreeResponse } from "../../../../model/structure";

export const structureService = {
  /**
   * Obtiene el árbol completo de estructuras (compañías, ramas, etc.) para una licencia específica.
   */
  async getStructureTree(
    licenseId: string
  ): Promise<ApiStructureTreeResponse | null> {
    if (!licenseId) {
      console.warn(
        "[structureService] Se requiere licenseId para obtener el árbol."
      );
      return null;
    }

    console.log(
      `[structureService] Solicitando árbol de estructuras para licencia: ${licenseId}`
    );
    const response = await makeRequest<ApiStructureTreeResponse>( // Espera UN objeto ApiStructureTreeResponse
      "get",
      STRUCTURE_ENDPOINTS.GET_TREE_BY_LICENSE(licenseId)
    );

    // La API devuelve un array con UN SOLO elemento que contiene la estructura.
    // Necesitamos acceder a ese primer elemento.
    if (
      response &&
      response.statusCode === 200 &&
      Array.isArray(response.data) && // Verifica que data sea un array
      response.data.length > 0 && // Verifica que no esté vacío
      response.data[0].companies // Verifica que el primer elemento tenga 'companies'
    ) {
      console.log(
        `[structureService] Árbol de estructuras para ${licenseId} obtenido.`
      );
      // Devuelve el primer (y único) elemento del array 'data'
      return response.data[0] as ApiStructureTreeResponse;
    } else if (
      response &&
      response.statusCode === 200 &&
      Array.isArray(response.data) &&
      response.data.length === 0
    ) {
      console.warn(
        `[structureService] No se encontró estructura para la licencia ${licenseId}. Respuesta vacía.`
      );
      return null; // Devuelve null si la estructura está vacía
    } else {
      console.error(
        `[structureService] Error al cargar árbol de estructuras para ${licenseId}:`,
        response?.message || "Respuesta inválida o no encontrada"
      );
      return null;
    }
  },
};
