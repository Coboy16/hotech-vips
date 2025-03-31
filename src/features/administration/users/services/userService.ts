import { apiClient } from "../../../../services/api";
import { USER_ENDPOINTS } from "../../../../services/api/endpoints";
import { tokenStorage } from "../../../auth/utils";

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
    const token = tokenStorage.getToken();
    if (!token) {
      console.error("No hay token de autenticación disponible");
      return [];
    }
    try {
      console.log("GET request to:", USER_ENDPOINTS.BASE);
      const response = await apiClient.get<UserResponse>(USER_ENDPOINTS.BASE, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Response:", response);

      if (response.statusCode === 200 && Array.isArray(response.data)) {
        return response.data.map(transformApiUserToUser);
      }

      return [];
    } catch (error) {
      console.error("Error al cargar todos los usuarios:", error);
      return [];
    }
  },

  /**
   * Obtiene un usuario por su ID
   */
  async getById(id: string): Promise<User | null> {
    const token = tokenStorage.getToken();
    if (!token) {
      console.error("No hay token de autenticación disponible");
      return null;
    }
    try {
      console.log("GET request to:", USER_ENDPOINTS.DETAIL(id));
      const response = await apiClient.get<UserResponse>(
        USER_ENDPOINTS.DETAIL(id),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Response:", response);

      if (response.statusCode === 200 && !Array.isArray(response.data)) {
        return transformApiUserToUser(response.data as ApiUser);
      }

      return null;
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  },

  /**
   * Crea un nuevo usuario
   */
  async create(userData: CreateUserDto): Promise<User | null> {
    const token = tokenStorage.getToken();
    if (!token) {
      console.error("No hay token de autenticación disponible");
      return null;
    }
    try {
      console.log(
        "POST request to:",
        USER_ENDPOINTS.BASE,
        "with data:",
        userData
      );
      const response = await apiClient.post<UserResponse>(
        USER_ENDPOINTS.BASE,
        userData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Response:", response);

      if (response.statusCode === 201 && !Array.isArray(response.data)) {
        return transformApiUserToUser(response.data as ApiUser);
      }

      return null;
    } catch (error) {
      console.error("Error creating user:", error);
      return null;
    }
  },

  /**
   * Actualiza un usuario existente
   */
  async update(id: string, userData: UpdateUserDto): Promise<User | null> {
    const token = tokenStorage.getToken();
    if (!token) {
      console.error("No hay token de autenticación disponible");
      return null;
    }
    try {
      console.log(
        "PUT request to:",
        USER_ENDPOINTS.UPDATE(id),
        "with data:",
        userData
      );
      const response = await apiClient.put<UserResponse>(
        USER_ENDPOINTS.UPDATE(id),
        userData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Response:", response);

      if (response.statusCode === 200 && !Array.isArray(response.data)) {
        return transformApiUserToUser(response.data as ApiUser);
      }

      return null;
    } catch (error) {
      console.error("Error updating user:", error);
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
    const token = tokenStorage.getToken();
    if (!token) {
      console.error("No hay token de autenticación disponible");
      return false;
    }
    try {
      console.log(
        "PUT request to:",
        USER_ENDPOINTS.UPDATE_PASSWORD(id),
        "with data:",
        passwordData
      );
      const response = await apiClient.put<UserResponse>(
        USER_ENDPOINTS.UPDATE_PASSWORD(id),
        passwordData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Response:", response);

      return response.statusCode === 200;
    } catch (error) {
      console.error("Error updating password:", error);
      return false;
    }
  },

  /**
   * Elimina un usuario
   */
  async delete(id: string, deleteData?: DeleteUserDto): Promise<boolean> {
    const token = tokenStorage.getToken();
    if (!token) {
      console.error("No hay token de autenticación disponible");
      return false;
    }
    try {
      console.log("DELETE request to:", USER_ENDPOINTS.DELETE(id));

      // Corregido: usar el parámetro options correctamente
      const response = await apiClient.delete<UserResponse>(
        USER_ENDPOINTS.DELETE(id),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: deleteData ? { ...deleteData } : undefined,
        }
      );
      console.log("Response:", response);

      return response.statusCode === 200;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  },

  /**
   * Elimina un usuario por email
   */
  async deleteByEmail(email: string): Promise<boolean> {
    const token = tokenStorage.getToken();
    if (!token) {
      console.error("No hay token de autenticación disponible");
      return false;
    }
    try {
      console.log("DELETE request to:", USER_ENDPOINTS.DELETE_BY_EMAIL(email));
      const response = await apiClient.delete<UserResponse>(
        USER_ENDPOINTS.DELETE_BY_EMAIL(email),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Response:", response);

      return response.statusCode === 200;
    } catch (error) {
      console.error("Error deleting user by email:", error);
      return false;
    }
  },
};
