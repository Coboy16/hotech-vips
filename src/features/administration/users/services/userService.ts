import { makeRequest } from "../../../../services/api";
import { USER_ENDPOINTS } from "../../../../services/api/endpoints";
import {
  ApiUser,
  CreateUserDto,
  DeleteUserDto,
  UpdatePasswordDto,
  UpdateUserDto,
  User,
  UserResponse,
} from "../types/user";
import { transformApiUserToUser } from "../utils/index";

/**
 * Servicio para gestionar operaciones relacionadas con usuarios
 */
export const userService = {
  /**
   * Obtiene todos los usuarios
   */
  async getAll(): Promise<User[]> {
    console.log("[userService] Solicitando todos los usuarios...");

    const response = await makeRequest<UserResponse>(
      "get",
      USER_ENDPOINTS.BASE
    );

    if (
      response &&
      response.statusCode === 200 &&
      Array.isArray(response.data)
    ) {
      console.log(`[userService] ${response.data.length} usuarios obtenidos.`);
      return response.data.map(transformApiUserToUser);
    } else {
      console.error(
        "[userService] Error al obtener todos los usuarios:",
        response?.message || "Respuesta inválida"
      );
      return []; // Devuelve array vacío en caso de error
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
  async create(userData: CreateUserDto): Promise<User | null> {
    console.log("[userService] Creando nuevo usuario...");

    const response = await makeRequest<UserResponse>(
      "post",
      USER_ENDPOINTS.BASE,
      userData
    );

    if (
      response &&
      response.statusCode === 201 &&
      !Array.isArray(response.data)
    ) {
      console.log(`[userService] Usuario creado con éxito.`);
      return transformApiUserToUser(response.data as unknown as ApiUser);
    } else {
      console.error(
        "[userService] Error al crear usuario:",
        response?.message || "Respuesta inválida"
      );
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
      "put",
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

    const response = await makeRequest<UserResponse>(
      "delete",
      USER_ENDPOINTS.DELETE_BY_EMAIL(email)
    );

    if (response && response.statusCode === 200) {
      console.log(`[userService] Usuario con email ${email} eliminado.`);
      return true;
    } else {
      console.error(
        `[userService] Error al eliminar usuario con email ${email}:`,
        response?.message || "Respuesta inválida"
      );
      return false;
    }
  },
};
