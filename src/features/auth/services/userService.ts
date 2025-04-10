/* eslint-disable @typescript-eslint/no-explicit-any */
import { makeRequest } from "../../../services/api";
import { USER_ENDPOINTS } from "../../../services/api/endpoints";
import { toast } from "react-hot-toast";

export const userService = {
  async updatePassword(password: string): Promise<boolean> {
    // <<<--- Cambia el tipo de retorno a boolean
    console.log("[userService] Actualizando contraseña...");

    try {
      // No necesitamos especificar el tipo de respuesta si solo verificamos el statusCode
      const response = await makeRequest<unknown>(
        "patch",
        USER_ENDPOINTS.UPDATE_PASSWORD_TOKEN,
        { password }
      );

      // Verificar si la petición fue exitosa (StatusCode 200)
      if (response && response.statusCode === 200) {
        console.log(
          "[userService] Contraseña actualizada exitosamente (API respondió 200)."
        );
        toast.success(
          response.message || "Contraseña actualizada exitosamente"
        );
        return true; // <<<--- Devuelve true en éxito
      } else {
        // Manejar errores específicos de la API
        const errorMessage =
          response?.message ||
          response?.error ||
          "Error al actualizar la contraseña";
        console.error(
          "[userService] Error al actualizar contraseña:",
          errorMessage
        );
        toast.error(errorMessage);
        return false; // <<<--- Devuelve false en error
      }
    } catch (error) {
      console.error("[userService] Error inesperado en updatePassword:", error);
      if (!(error instanceof Error && (error as any).isAxiosError)) {
        toast.error("Error inesperado al conectar con el servidor.");
      }
      return false;
    }
  },
};
