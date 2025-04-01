import { makeRequest } from "../../../../services/api";
import { AUTH_ENDPOINTS } from "../../../../services/api/endpoints"; // Endpoint de registro está en AUTH
import { CreateUserDto, ApiUser } from "../../../../model/user";

export const userService = {
  /**
   * Registra un nuevo usuario en el sistema.
   */
  async register(userData: CreateUserDto): Promise<ApiUser | null> {
    console.log("[userService] Registrando nuevo usuario...");
    console.log(
      "[userService] Enviando datos a /registration:",
      JSON.stringify(userData, null, 2)
    );

    const response = await makeRequest<ApiUser>( // Espera un ApiUser en la propiedad 'data'
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

      // Verificamos si la estructura de 'data' es la esperada (contiene user_id)
      if (response.data && response.data.user_id) {
        console.log(
          `[userService] Datos del usuario (${response.data.user_id}) recibidos correctamente.`
        );
        // Todo bien, devuelve los datos del usuario
        return response.data;
      } else {
        // Status 2xx pero 'data' no tiene 'user_id' o 'data' es null/undefined
        console.warn(
          `[userService] Registro exitoso (Status ${response.statusCode}), pero la estructura de 'response.data' es inesperada o no contiene 'user_id'. Respuesta completa:`,
          response
        );
        // AUN ASÍ, DEVOLVEMOS 'response.data'. Puede que la API devuelva el usuario
        // sin el ID en esta respuesta específica, o que 'data' sea null pero el registro
        // se haya completado. Devolver 'data' (incluso si es null) es mejor que devolver 'null'
        // desde el bloque de error. LicensesScreen decidirá qué hacer.
        // Si 'response.data' realmente es el objeto ApiUser, esto funcionará.
        return response.data ?? null; // Convertimos undefined a null para coincidir con el tipo de retorno
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

  // Aquí podrías añadir otros métodos como getUserById, updateUser, deleteUser, etc.
  // usando los USER_ENDPOINTS correspondientes.
};
