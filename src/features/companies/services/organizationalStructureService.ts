/* eslint-disable @typescript-eslint/no-explicit-any */
import { makeRequest } from "../../../../services/api/apiClient";
import { STRUCTURE_ENDPOINTS } from "../../../../services/api/endpoints";
import {
  ApiCompany,
  ApiLicenseWithCompanies,
  NodeType,
  ApiNode, // Tipo unión de todos los nodos de API
  CreateNodeDtoUnion,
  UpdateNodeDtoUnion,
} from "../../../../model/organizationalStructure"; // Importa desde model

/**
 * Servicio para gestionar operaciones CRUD de la estructura organizacional
 * (Compañías, Sucursales, Departamentos, Secciones, Unidades).
 */
export const organizationalStructureService = {
  /**
   * Obtiene el árbol organizacional completo anidado a partir de un ID de licencia.
   * Devuelve un array de compañías raíz con sus descendientes anidados.
   */
  async getOrganizationalTree(licenseId: string): Promise<ApiCompany[]> {
    console.log(
      `[OrgStructureService] Solicitando árbol para licencia ID: ${licenseId}`
    );
    // Usa el endpoint correcto definido en STRUCTURE_ENDPOINTS
    const endpoint = STRUCTURE_ENDPOINTS.GET_TREE_BY_LICENSE(licenseId);
    const response = await makeRequest<
      ApiLicenseWithCompanies | ApiLicenseWithCompanies[] // La API podría devolver uno o varios según la ruta exacta
    >("get", endpoint);

    let companies: ApiCompany[] = [];
    if (response && response.statusCode === 200 && response.data) {
      // Normalizar la respuesta (siempre trabajar con un array de licencias para buscar)
      const licensesData = Array.isArray(response.data)
        ? response.data
        : [response.data];

      // Encontrar la licencia específica o asumir que es la única si solo viene una
      // IMPORTANTE: Asegúrate que el ID de licencia realmente esté en la respuesta anidada si es un array
      const targetLicense =
        licensesData.find((lic) => lic.license_id === licenseId) ??
        (licensesData.length === 1 ? licensesData[0] : undefined);

      // Obtener las compañías de la licencia encontrada
      companies = targetLicense?.companies || [];
      console.log(
        `[OrgStructureService] Árbol obtenido para licencia ${licenseId}. ${companies.length} compañías raíz encontradas.`
      );
    } else {
      console.error(
        `[OrgStructureService] Error al obtener árbol para ${licenseId}:`,
        response?.message || "Respuesta inválida o no encontrada"
      );
      // Devolver vacío en caso de error para evitar que falle el frontend
    }
    return companies;
  },

  /**
   * Obtiene los detalles de un nodo específico por su tipo y ID.
   */
  async getNodeById(nodeType: NodeType, id: string): Promise<ApiNode | null> {
    let endpoint: string;
    switch (nodeType) {
      // case 'company': endpoint = COMPANY_ENDPOINTS.DETAIL(id); break; // Si existiera endpoint específico para GET /companies/{id}
      case "branch":
        endpoint = STRUCTURE_ENDPOINTS.BRANCH.DETAIL(id);
        break;
      case "department":
        endpoint = STRUCTURE_ENDPOINTS.DEPARTMENT.DETAIL(id);
        break;
      case "section":
        endpoint = STRUCTURE_ENDPOINTS.SECTION.DETAIL(id);
        break;
      case "unit":
        endpoint = STRUCTURE_ENDPOINTS.UNIT.DETAIL(id);
        break;
      default:
        console.error(
          `[OrgStructureService] Tipo de nodo no válido para getNodeById: ${nodeType}`
        );
        return null;
    }

    console.log(
      `[OrgStructureService] Solicitando nodo ${nodeType} con ID: ${id}`
    );
    const response = await makeRequest<ApiNode>("get", endpoint);

    if (
      response &&
      response.statusCode === 200 &&
      response.data &&
      !Array.isArray(response.data)
    ) {
      console.log(`[OrgStructureService] Nodo ${nodeType} ${id} obtenido.`);
      return response.data;
    } else {
      console.error(
        `[OrgStructureService] Error al obtener nodo ${nodeType} ${id}:`,
        response?.message || "No encontrado"
      );
      return null;
    }
  },

  /**
   * Crea un nuevo nodo (Branch, Department, Section, Unit).
   * La creación de Company raíz no está soportada por la API documentada.
   */
  async createNode(
    nodeType: NodeType,
    data: CreateNodeDtoUnion
  ): Promise<ApiNode | null> {
    let endpoint: string;
    switch (nodeType) {
      // case 'company': endpoint = COMPANY_ENDPOINTS.BASE; break; // Si existiera
      case "branch":
        endpoint = STRUCTURE_ENDPOINTS.BRANCH.BASE;
        break;
      case "department":
        endpoint = STRUCTURE_ENDPOINTS.DEPARTMENT.BASE;
        break;
      case "section":
        endpoint = STRUCTURE_ENDPOINTS.SECTION.BASE;
        break;
      case "unit":
        endpoint = STRUCTURE_ENDPOINTS.UNIT.BASE;
        break;
      default:
        console.error(
          `[OrgStructureService] Tipo de nodo no válido para createNode: ${nodeType}`
        );
        return null;
    }

    console.log(`[OrgStructureService] Creando nodo tipo ${nodeType}...`, data);
    const response = await makeRequest<ApiNode>("post", endpoint, data);

    // El ID del nuevo nodo puede tener diferentes nombres (branch_id, etc.)
    const newNodeId = response?.data
      ? (response.data as any)[`${nodeType}_id`] ??
        (response.data as any).comp_iden
      : null;

    if (response && response.statusCode === 201 && newNodeId) {
      console.log(
        `[OrgStructureService] Nodo ${nodeType} creado con ID: ${newNodeId}`
      );
      return response.data!; // El '!' asume que si hay ID, hay data
    } else {
      console.error(
        `[OrgStructureService] Error al crear nodo ${nodeType}:`,
        response?.message || "Respuesta inválida"
      );
      return null;
    }
  },

  /**
   * Actualiza un nodo existente (Branch, Department, Section, Unit).
   */
  async updateNode(
    nodeType: NodeType,
    id: string,
    data: UpdateNodeDtoUnion
  ): Promise<ApiNode | null> {
    let endpoint: string;
    switch (nodeType) {
      // case 'company': endpoint = COMPANY_ENDPOINTS.UPDATE(id); break; // Si existiera
      case "branch":
        endpoint = STRUCTURE_ENDPOINTS.BRANCH.UPDATE(id);
        break;
      case "department":
        endpoint = STRUCTURE_ENDPOINTS.DEPARTMENT.UPDATE(id);
        break;
      case "section":
        endpoint = STRUCTURE_ENDPOINTS.SECTION.UPDATE(id);
        break;
      case "unit":
        endpoint = STRUCTURE_ENDPOINTS.UNIT.UPDATE(id);
        break;
      default:
        console.error(
          `[OrgStructureService] Tipo de nodo no válido para updateNode: ${nodeType}`
        );
        return null;
    }

    console.log(
      `[OrgStructureService] Actualizando nodo ${nodeType} ID: ${id}...`,
      data
    );
    const response = await makeRequest<ApiNode>("put", endpoint, data);

    if (
      response &&
      response.statusCode === 200 &&
      response.data &&
      !Array.isArray(response.data)
    ) {
      console.log(`[OrgStructureService] Nodo ${nodeType} ${id} actualizado.`);
      return response.data;
    } else {
      console.error(
        `[OrgStructureService] Error al actualizar nodo ${nodeType} ${id}:`,
        response?.message || "Respuesta inválida"
      );
      return null;
    }
  },

  /**
   * Cambia el estado (activo/inactivo) de un nodo usando el endpoint PATCH /status.
   */
  async updateNodeStatus(
    nodeType: NodeType,
    id: string
  ): Promise<ApiNode | null> {
    let endpoint: string;
    switch (nodeType) {
      // case 'company': endpoint = `${COMPANY_ENDPOINTS.BASE}/${id}/status`; break; // Si existiera
      case "branch":
        endpoint = STRUCTURE_ENDPOINTS.BRANCH.UPDATE_STATUS(id);
        break;
      case "department":
        endpoint = STRUCTURE_ENDPOINTS.DEPARTMENT.UPDATE_STATUS(id);
        break;
      case "section":
        endpoint = STRUCTURE_ENDPOINTS.SECTION.UPDATE_STATUS(id);
        break;
      case "unit":
        endpoint = STRUCTURE_ENDPOINTS.UNIT.UPDATE_STATUS(id);
        break;
      default:
        console.error(
          `[OrgStructureService] Tipo de nodo no válido para updateNodeStatus: ${nodeType}`
        );
        return null;
    }

    console.log(
      `[OrgStructureService] Cambiando estado nodo ${nodeType} ID: ${id}...`
    );
    // PATCH sin body según la documentación para /status
    const response = await makeRequest<ApiNode>("patch", endpoint);

    if (
      response &&
      response.statusCode === 200 &&
      response.data &&
      !Array.isArray(response.data)
    ) {
      // Determinar el nombre del campo de estado según el tipo
      const statusFieldName = `${nodeType}_status`; // e.g., 'branch_status'
      const statusValue =
        (response.data as any)[statusFieldName] ??
        (response.data as any).comp_stat; // Fallback para comp_stat si es company

      console.log(
        `[OrgStructureService] Estado del nodo ${nodeType} ${id} actualizado a: ${
          statusValue ? "activo" : "inactivo"
        }.`
      );
      return response.data;
    } else {
      console.error(
        `[OrgStructureService] Error al cambiar estado ${nodeType} ${id}:`,
        response?.message || "Respuesta inválida"
      );
      return null;
    }
  },

  /**
   * Elimina un nodo por su tipo y ID.
   */
  async deleteNode(nodeType: NodeType, id: string): Promise<boolean> {
    let endpoint: string;
    switch (nodeType) {
      // case 'company': endpoint = COMPANY_ENDPOINTS.DELETE(id); break; // Si existiera
      case "branch":
        endpoint = STRUCTURE_ENDPOINTS.BRANCH.DELETE(id);
        break;
      case "department":
        endpoint = STRUCTURE_ENDPOINTS.DEPARTMENT.DELETE(id);
        break;
      case "section":
        endpoint = STRUCTURE_ENDPOINTS.SECTION.DELETE(id);
        break;
      case "unit":
        endpoint = STRUCTURE_ENDPOINTS.UNIT.DELETE(id);
        break;
      default:
        console.error(
          `[OrgStructureService] Tipo de nodo no válido para deleteNode: ${nodeType}`
        );
        return false;
    }

    console.log(
      `[OrgStructureService] Eliminando nodo ${nodeType} ID: ${id}...`
    );
    // DELETE no suele llevar body
    const response = await makeRequest<unknown>("delete", endpoint); // No esperamos 'data' significativa

    // La API podría devolver 200 OK o 204 No Content tras eliminar
    if (
      response &&
      (response.statusCode === 200 || response.statusCode === 204)
    ) {
      console.log(`[OrgStructureService] Nodo ${nodeType} ${id} eliminado.`);
      return true;
    } else {
      console.error(
        `[OrgStructureService] Error al eliminar nodo ${nodeType} ${id}:`,
        response?.message || "Respuesta inválida"
      );
      return false;
    }
  },
};
