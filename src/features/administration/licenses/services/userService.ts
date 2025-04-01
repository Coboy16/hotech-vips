import { makeRequest } from "../../../../services/api";
import { AUTH_ENDPOINTS } from "../../../../services/api/endpoints"; // Endpoint de registro está en AUTH
import { CreateUserDto, ApiUser } from "../../../../model/user";

export const userService = {
  /**
   * Registra un nuevo usuario en el sistema.
   */
  async register(userData: CreateUserDto): Promise<ApiUser | null> {
    console.log("[userService] Registrando nuevo usuario...");

    const response = await makeRequest<ApiUser>( // Espera un ApiUser en la propiedad 'data' de la respuesta
      "post",
      AUTH_ENDPOINTS.REGISTER, // Usa el endpoint /registration
      userData
    );

    // La respuesta de registro tiene statusCode, data (con el usuario creado), message, error
    if (
      response &&
      response.statusCode >= 200 &&
      response.statusCode < 300 && // 200 o 201 generalmente
      response.data &&
      response.data.user_id // Asegurarse que el objeto de usuario tenga al menos el ID
    ) {
      console.log(
        `[userService] Usuario registrado exitosamente con ID: ${response.data.user_id}`
      );
      return response.data; // Devuelve el objeto de usuario creado
    } else {
      console.error(
        "[userService] Error al registrar usuario:",
        response?.message || response?.error || "Respuesta inválida"
      );
      // Podrías lanzar el error o devolver null/mensaje de error
      // makeRequest ya debería haber mostrado un toast con el error de la API
      return null;
    }
  },

  // Aquí podrías añadir otros métodos como getUserById, updateUser, deleteUser, etc.
  // usando los USER_ENDPOINTS correspondientes.
};
