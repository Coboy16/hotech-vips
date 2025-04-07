/* eslint-disable @typescript-eslint/no-explicit-any */
import toast from "react-hot-toast";
// import { makeRequest } from "../../../services/api"; // Ajusta ruta
// import { ROLE_ENDPOINTS } from "../../../services/api/endpoints"; // Ajusta ruta
// import { tokenStorage } from "../../auth/utils/tokenStorage"; // Ajusta ruta
import {
  ApiRole,
  CreateRoleDto,
  Role,
  RoleApiResponse,
  RolesApiResponse,
  UpdateRoleDto,
} from "../types";
import { makeRequest, ROLE_ENDPOINTS } from "../../../../services/api";
import { tokenStorage } from "../../../auth/utils/tokenStorage";
import { transformApiRoleToRole } from "../utils";

export const roleService = {
  /**
   * Obtiene todos los roles para una licencia específica.
   */
  async getRolesByLicense(licenseId: string): Promise<Role[]> {
    console.log(
      `[roleService] Solicitando roles para la licencia: ${licenseId}`
    );
    try {
      const response = await makeRequest<RolesApiResponse>(
        "get",
        ROLE_ENDPOINTS.BY_LICENSE(licenseId)
      );

      if (
        response &&
        response.statusCode === 200 &&
        Array.isArray(response.data)
      ) {
        console.log(
          `[roleService] ${response.data.length} roles (ApiRole) obtenidos. Transformando...`
        );
        return response.data.map(transformApiRoleToRole);
      } else {
        console.error(
          `[roleService] Error al obtener roles para licencia ${licenseId}:`,
          response?.message || response?.error || "Respuesta inválida"
        );
        toast.error(response?.message || "Error al cargar los roles.");
        return [];
      }
    } catch (error) {
      console.error(
        `[roleService] Excepción al obtener roles para licencia ${licenseId}:`,
        error
      );
      toast.error("Error de red o del servidor al obtener roles.");
      return [];
    }
  },

  /**
   * Obtiene un rol por su UUID.
   * Útil para pre-rellenar el formulario de edición.
   */
  async getRoleById(roleId: string): Promise<Role | null> {
    console.log(`[roleService] Solicitando rol con UUID: ${roleId}`);
    try {
      const response = await makeRequest<RoleApiResponse>(
        "get",
        ROLE_ENDPOINTS.DETAIL(roleId)
      );

      if (response && response.statusCode === 200 && response.data) {
        console.log(`[roleService] Rol ${roleId} obtenido. Transformando...`);
        // Nota: La API GET /roles/{uuid} devuelve modules? Asegúrate.
        // Si no, necesitarás obtenerlos por separado o ajustar la lógica.
        // Asumimos que sí los devuelve para la transformación.
        return transformApiRoleToRole(response.data as unknown as ApiRole);
      } else {
        console.error(
          `[roleService] Error al obtener rol ${roleId}:`,
          response?.message || response?.error || "Respuesta inválida"
        );
        toast.error(
          response?.message || `Error al obtener detalle del rol ${roleId}.`
        );
        return null;
      }
    } catch (error) {
      console.error(`[roleService] Excepción al obtener rol ${roleId}:`, error);
      toast.error(`Error de red o del servidor al obtener el rol ${roleId}.`);
      return null;
    }
  },

  /**
   * Crea un nuevo rol.
   */
  async createRole(roleData: CreateRoleDto): Promise<Role | null> {
    console.log("[roleService] Creando nuevo rol:", roleData);
    try {
      // Obtener company_license_id del token si no viene en roleData explícitamente
      // O asegurarse de que se pasa correctamente desde el componente.
      // Aquí asumimos que viene en roleData.
      if (!roleData.company_license_id) {
        const licenseId = tokenStorage.getLicenseId();
        if (!licenseId) {
          toast.error("No se pudo determinar la licencia para crear el rol.");
          console.error(
            "[roleService] Falta company_license_id y no se encontró en tokenStorage."
          );
          return null;
        }
        roleData.company_license_id = licenseId;
        console.log(
          `[roleService] Usando licenseId ${licenseId} de tokenStorage.`
        );
      }

      const response = await makeRequest<RoleApiResponse>(
        "post",
        ROLE_ENDPOINTS.BASE,
        roleData
      );

      // La API devuelve 201 en creación exitosa
      if (response && response.statusCode === 201 && response.data) {
        console.log("[roleService] Rol creado exitosamente:", response.data);
        toast.success(response.message || "Rol creado exitosamente.");
        // La respuesta tiene 'rol_id', 'nombre', 'company_license_id'.
        // Le faltan los 'modules' que acabamos de enviar.
        // Creamos un objeto Role parcial o completo si es posible.
        return transformApiRoleToRole({
          ...response.data,
          // Añadimos los módulos enviados para tener el objeto completo en el frontend
          modules: roleData.modules,
        } as unknown as ApiRole); // Forzamos el tipo ApiRole aunque falten campos si es necesario
      } else {
        console.error(
          "[roleService] Error al crear rol:",
          response?.message || response?.error || "Respuesta inválida"
        );
        toast.error(
          response?.message || response?.error || "Error al crear el rol."
        );
        return null;
      }
    } catch (error: any) {
      console.error("[roleService] Excepción al crear rol:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Error de red o del servidor al crear el rol.";
      toast.error(errorMessage);
      return null;
    }
  },

  /**
   * Actualiza un rol existente.
   */
  async updateRole(
    roleId: string,
    roleData: UpdateRoleDto
  ): Promise<Role | null> {
    console.log(`[roleService] Actualizando rol ${roleId}:`, roleData);
    try {
      const response = await makeRequest<RoleApiResponse>(
        "put",
        ROLE_ENDPOINTS.DETAIL(roleId), // Usa DETAIL que es PUT /roles/{uuid}
        roleData
      );

      if (response && response.statusCode === 200 && response.data) {
        console.log(
          `[roleService] Rol ${roleId} actualizado exitosamente:`,
          response.data
        );
        toast.success(response.message || "Rol actualizado exitosamente.");
        // Similar a create, la respuesta puede no tener los módulos.
        return transformApiRoleToRole({
          ...response.data,
          modules: roleData.modules, // Añadimos los módulos actualizados
        } as unknown as ApiRole);
      } else {
        console.error(
          `[roleService] Error al actualizar rol ${roleId}:`,
          response?.message || response?.error || "Respuesta inválida"
        );
        toast.error(
          response?.message ||
            response?.error ||
            `Error al actualizar el rol ${roleId}.`
        );
        return null;
      }
    } catch (error: any) {
      console.error(
        `[roleService] Excepción al actualizar rol ${roleId}:`,
        error
      );
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        `Error de red o del servidor al actualizar el rol ${roleId}.`;
      toast.error(errorMessage);
      return null;
    }
  },

  /**
   * Elimina un rol por su UUID.
   */
  async deleteRole(roleId: string): Promise<boolean> {
    console.log(`[roleService] Eliminando rol con UUID: ${roleId}`);
    try {
      const response = await makeRequest<RoleApiResponse>( // La respuesta puede ser más simple
        "delete",
        ROLE_ENDPOINTS.DETAIL(roleId) // Usa DETAIL que es DELETE /roles/{uuid}
      );

      if (response && response.statusCode === 200) {
        console.log(`[roleService] Rol ${roleId} eliminado exitosamente.`);
        toast.success(response.message || "Rol eliminado exitosamente.");
        return true;
      } else {
        console.error(
          `[roleService] Error al eliminar rol ${roleId}:`,
          response?.message || response?.error || "Respuesta inválida"
        );
        toast.error(
          response?.message ||
            response?.error ||
            `Error al eliminar el rol ${roleId}.`
        );
        return false;
      }
    } catch (error: any) {
      console.error(
        `[roleService] Excepción al eliminar rol ${roleId}:`,
        error
      );
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        `Error de red o del servidor al eliminar el rol ${roleId}.`;
      toast.error(errorMessage);
      return false;
    }
  },
};
