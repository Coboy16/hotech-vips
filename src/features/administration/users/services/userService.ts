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

  async register(userData: CreateUserDto): Promise<ApiUser | null> {
    console.log("[userService] Registrando nuevo usuario...");
    console.log(
      "[userService] Enviando datos a /registration:",
      JSON.stringify(userData, null, 2)
    );

    const response = await makeRequest<RegisterResponse>(
      "post",
      AUTH_ENDPOINTS.REGISTER,
      userData
    );

    // ----- LÓGICA DE ÉXITO/ERROR CORREGIDA -----
    if (response && response.statusCode >= 200 && response.statusCode < 300) {
      // ÉXITO (Status 2xx)
      console.log(
        `[userService] Registro recibido con éxito de la API. Status: ${response.statusCode}, Mensaje API: ${response.message}`
      );

      // Verificamos si la estructura de 'data' es la esperada (contiene user)
      if (response.data && response.data.user) {
        console.log(
          `[userService] Datos del usuario (${response.data.user.user_id}) recibidos correctamente.`
        );
        // Todo bien, devuelve los datos del usuario
        return response.data.user;
      } else {
        // Status 2xx pero 'data' no tiene 'user' o 'data' es null/undefined
        console.warn(
          `[userService] Registro exitoso (Status ${response.statusCode}), pero la estructura de 'response.data' es inesperada o no contiene 'user'. Respuesta completa:`,
          response
        );
        // AUN ASÍ, DEVOLVEMOS 'response.data.user'. Puede que la API devuelva el usuario
        // sin el ID en esta respuesta específica, o que 'data' sea null pero el registro
        // se haya completado.
        return response.data?.user ?? null; // Convertimos undefined a null para coincidir con el tipo de retorno
      }
    } else {
      // ERROR (Status no 2xx)
      console.error(
        "[userService] Error en la API al registrar usuario:",
        `Status: ${response?.statusCode}, Mensaje: ${
          response?.message || response?.error || "Respuesta inválida"
        }`
      );
      // Aquí sí devolvemos null porque la operación falló en la API
      return null;
    }
  },

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
