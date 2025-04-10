/* eslint-disable @typescript-eslint/no-explicit-any */
import toast from "react-hot-toast";
import { makeRequest } from "../../../../services/api";
import {
  AUTH_ENDPOINTS,
  USER_ENDPOINTS,
} from "../../../../services/api/endpoints";
import {
  ApiUser,
  CreateUserDto,
  DeleteUserDto,
  RegisterResponse,
  UpdatePasswordDto,
  UpdateUserDto,
  User,
  UserResponse,
} from "../types/user";
import { transformApiUserToUser } from "../utils/index";
import { tokenStorage } from "../../../auth/utils/tokenStorage";

/**
 * Servicio para gestionar operaciones relacionadas con usuarios
 */
export const userService = {
  /**
   * Obtiene todos los usuarios
   */

  async getAll(): Promise<User[]> {
    // <-- Sin parámetro licenseId
    console.log(
      `[userService] Solicitando usuarios para la licencia almacenada...`
    );

    // 1. Obtener licenseId desde tokenStorage INTERNAMENTE
    const licenseId = tokenStorage.getLicenseId();

    // 2. Verificar si se obtuvo el licenseId
    if (!licenseId) {
      console.error(
        "[userService] No se encontró un licenseId en tokenStorage. No se pueden obtener usuarios."
      );
      toast.error("Error interno: No se pudo determinar la licencia.");
      return [];
    }

    console.log(
      `[userService] Usando licenseId "${licenseId}" obtenido de tokenStorage.`
    );

    try {
      const response = await makeRequest<UserResponse>(
        "get",
        USER_ENDPOINTS.BY_LICENSE(licenseId)
      );

      if (
        response &&
        response.statusCode === 200 &&
        Array.isArray(response.data)
      ) {
        console.log(
          `[userService] ${response.data.length} usuarios (ApiUser) obtenidos para la licencia ${licenseId}. Transformando...`
        );
        const transformedUsers: User[] = response.data.map(
          transformApiUserToUser
        );
        return transformedUsers;
      } else {
        console.error(
          `[userService] Error al obtener usuarios para la licencia ${licenseId}:`,
          response?.message ||
            response?.error ||
            "Respuesta inválida o datos no son un array"
        );
        return [];
      }
    } catch (error) {
      console.error(
        `[userService] Excepción al llamar a makeRequest para licencia ${licenseId}:`,
        error
      );
      toast.error("Error de red o del servidor al obtener usuarios.");
      return [];
    }
  },

  /**
   * Obtiene un usuario por su ID
   */
  async getById(id: string): Promise<User | null> {
    console.log(`[userService] Solicitando usuario con ID: ${id}`);

    const response = await makeRequest<UserResponse>(
      "get",
      USER_ENDPOINTS.DETAIL(id)
    );

    if (
      response &&
      response.statusCode === 200 &&
      !Array.isArray(response.data)
    ) {
      console.log(`[userService] Usuario ${id} obtenido.`);
      return transformApiUserToUser(response.data as unknown as ApiUser);
    } else {
      console.error(
        `[userService] Error al obtener usuario ${id}:`,
        response?.message || "Respuesta inválida o no encontrada"
      );
      return null;
    }
  },

  /**
   * Crea un nuevo usuario
   */
  // En userService.ts
  async create(userData: CreateUserDto): Promise<User | null> {
    try {
      const response = await makeRequest<RegisterResponse>(
        "post",
        AUTH_ENDPOINTS.REGISTER,
        userData
      );

      if (response && response.statusCode >= 200 && response.statusCode < 300) {
        console.log(`[userService] Usuario creado con éxito:`, response);

        // Ahora sabemos que la respuesta tiene la estructura data.user
        if (response.data && response.data.user) {
          return transformApiUserToUser(
            response.data.user as unknown as ApiUser
          );
        } else {
          console.warn(
            "[userService] Respuesta exitosa pero sin datos de usuario:",
            response
          );
          return null;
        }
      }

      console.error(
        "[userService] Error al crear usuario:",
        response?.message || response?.error || "Respuesta inválida"
      );
      return null;
    } catch (error) {
      console.error("[userService] Excepción al crear usuario:", error);
      return null;
    }
  },

  /**
   * Actualiza un usuario existente
   */
  async update(id: string, userData: UpdateUserDto): Promise<User | null> {
    console.log(`[userService] Actualizando usuario con ID: ${id}`);

    const response = await makeRequest<UserResponse>(
      "put",
      USER_ENDPOINTS.UPDATE(id),
      userData
    );

    if (
      response &&
      response.statusCode === 200 &&
      !Array.isArray(response.data)
    ) {
      console.log(`[userService] Usuario ${id} actualizado.`);
      return transformApiUserToUser(response.data as unknown as ApiUser);
    } else {
      console.error(
        `[userService] Error al actualizar usuario ${id}:`,
        response?.message || "Respuesta inválida"
      );
      return null;
    }
  },

  /**
   * Actualiza la contraseña de un usuario
   */
  async updatePassword(
    id: string,
    passwordData: UpdatePasswordDto
  ): Promise<boolean> {
    console.log(
      `[userService] Actualizando contraseña del usuario con ID: ${id}`
    );

    const response = await makeRequest<UserResponse>(
      "patch",
      USER_ENDPOINTS.UPDATE_PASSWORD(id),
      passwordData
    );

    if (response && response.statusCode === 200) {
      console.log(`[userService] Contraseña del usuario ${id} actualizada.`);
      return true;
    } else {
      console.error(
        `[userService] Error al actualizar contraseña del usuario ${id}:`,
        response?.message || "Respuesta inválida"
      );
      return false;
    }
  },

  /**
   * Elimina un usuario
   */
  async delete(id: string, deleteData?: DeleteUserDto): Promise<boolean> {
    console.log(`[userService] Eliminando usuario con ID: ${id}`);

    const response = await makeRequest<UserResponse>(
      "delete",
      USER_ENDPOINTS.DELETE(id),
      undefined,
      deleteData // Pasando deleteData como parámetros de consulta
    );

    if (response && response.statusCode === 200) {
      console.log(`[userService] Usuario ${id} eliminado.`);
      return true;
    } else {
      console.error(
        `[userService] Error al eliminar usuario ${id}:`,
        response?.message || "Respuesta inválida"
      );
      return false;
    }
  },

  /**
   * Elimina un usuario por email
   */
  async deleteByEmail(email: string): Promise<boolean> {
    console.log(`[userService] Eliminando usuario con email: ${email}`);
    try {
      const response = await makeRequest<{
        statusCode: number;
        message: string;
      }>( // Ajusta el tipo esperado si es necesario
        "delete",
        USER_ENDPOINTS.DELETE_BY_EMAIL(email) // Usa el endpoint correcto
      );
      // La API ahora devuelve 200 en éxito según tu doc
      if (response && response.statusCode === 200) {
        console.log(`[userService] Usuario con email ${email} eliminado.`);
        return true;
      } else {
        console.error(
          `[userService] Error al eliminar usuario con email ${email}:`,
          response?.message ||
            `Status Code: ${response?.statusCode}` ||
            "Respuesta inválida"
        );
        // Lanza un error para que el hook lo capture y muestre en toast
        throw new Error(
          response?.message || "Error al eliminar el usuario desde la API."
        );
      }
    } catch (error: any) {
      console.error(
        `[userService] Excepción al eliminar usuario ${email}:`,
        error
      );
      // Relanza el error para que el hook lo maneje
      throw error;
    }
  },
};
