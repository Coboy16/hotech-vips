import { makeRequest, RECOVERY_ENDPOINTS } from "../../../services/api";
import {
  GenerateOtpRequest,
  GenerateOtpData,
  ValidateOtpRequest,
  ValidateOtpData,
  ResetPasswordRequest,
  ResetPasswordData,
} from "../types/recovery";
import { apiTransformers, parseApiError } from "../utils/apiTransformers";

/**
 * Servicio para manejar operaciones de recuperación de contraseña
 */
export const recoveryService = {
  /**
   * Solicita un código OTP para recuperación de contraseña
   */
  async generateOtp(data: GenerateOtpRequest): Promise<{
    success: boolean;
    data?: GenerateOtpData;
    message?: string;
    error?: string;
  }> {
    console.log("[recoveryService] Solicitando código OTP para:", data.email);

    try {
      const response = await makeRequest<GenerateOtpData>(
        "post",
        RECOVERY_ENDPOINTS.GENERATE_OTP,
        data
      );

      if (!response) {
        console.error("[recoveryService] No se recibió respuesta del servidor");
        return {
          success: false,
          error: "No se pudo conectar con el servidor",
        };
      }

      // Usamos el transformador para normalizar la respuesta
      const normalizedResponse =
        apiTransformers.normalizeGenerateOtpResponse(response);

      if (normalizedResponse.success) {
        console.log("[recoveryService] Código OTP solicitado exitosamente");
        return {
          success: true,
          data: response.data,
          message: normalizedResponse.message,
        };
      } else {
        console.error(
          "[recoveryService] Error al solicitar OTP:",
          normalizedResponse.error
        );
        return {
          success: false,
          error: normalizedResponse.error || "Error al solicitar código OTP",
        };
      }
    } catch (error) {
      console.error(
        "[recoveryService] Error inesperado al solicitar OTP:",
        error
      );
      const errorMessage = parseApiError(error);
      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  /**
   * Valida un código OTP y obtiene el token para cambio de contraseña
   */
  async validateOtp(data: ValidateOtpRequest): Promise<{
    success: boolean;
    data?: ValidateOtpData;
    token?: string;
    message?: string;
    error?: string;
  }> {
    console.log("[recoveryService] Validando código OTP para:", data.email);

    try {
      // La respuesta del API viene con data.otpRecord y data.token
      const response = await makeRequest<ValidateOtpData>(
        "post",
        RECOVERY_ENDPOINTS.VALIDATE_OTP,
        data
      );

      if (!response) {
        console.error("[recoveryService] No se recibió respuesta del servidor");
        return {
          success: false,
          error: "No se pudo conectar con el servidor",
        };
      }

      console.log("[recoveryService] Respuesta de validación recibida:", {
        statusCode: response.statusCode,
        hasData: !!response.data,
        hasToken: !!response.data?.token,
      });

      // Usamos el transformador para normalizar la respuesta
      const normalizedResponse =
        apiTransformers.normalizeValidateOtpResponse(response);

      if (normalizedResponse.success && normalizedResponse.token) {
        console.log(
          "[recoveryService] Código OTP validado exitosamente y token obtenido"
        );
        return {
          success: true,
          data: response.data,
          token: normalizedResponse.token,
          message: normalizedResponse.message,
        };
      } else {
        const errorMsg = normalizedResponse.token
          ? normalizedResponse.error
          : "Token de autorización no recibido";
        console.error("[recoveryService] Error al validar OTP:", errorMsg);
        return {
          success: false,
          error: errorMsg || "Código OTP inválido",
        };
      }
    } catch (error) {
      console.error(
        "[recoveryService] Error inesperado al validar OTP:",
        error
      );
      const errorMessage = parseApiError(error);
      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  /**
   * Envía la nueva contraseña para completar el proceso de recuperación
   * Usa el token JWT obtenido en la validación del OTP
   */
  async resetPassword(
    password: string,
    token: string
  ): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    console.log(
      "[recoveryService] Actualizando contraseña con token de autorización"
    );

    try {
      // Creamos el objeto de la petición
      const requestData: ResetPasswordRequest = {
        password,
      };

      // Configuramos los headers con el token
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      // Realizamos la petición PATCH con el token en los headers
      const response = await makeRequest<ResetPasswordData>(
        "patch",
        RECOVERY_ENDPOINTS.RESET_PASSWORD,
        requestData,
        undefined, // No enviamos params
        { headers } // Enviamos los headers con el token
      );

      if (!response) {
        console.error("[recoveryService] No se recibió respuesta del servidor");
        return {
          success: false,
          error: "No se pudo conectar con el servidor",
        };
      }

      // Usamos el transformador para normalizar la respuesta
      const normalizedResponse =
        apiTransformers.normalizeResetPasswordResponse(response);

      if (normalizedResponse.success) {
        console.log("[recoveryService] Contraseña actualizada exitosamente");
        return {
          success: true,
          message: normalizedResponse.message,
        };
      } else {
        console.error(
          "[recoveryService] Error al actualizar contraseña:",
          normalizedResponse.error
        );
        return {
          success: false,
          error: normalizedResponse.error || "Error al actualizar contraseña",
        };
      }
    } catch (error) {
      console.error(
        "[recoveryService] Error inesperado al actualizar contraseña:",
        error
      );
      const errorMessage = parseApiError(error);
      return {
        success: false,
        error: errorMessage,
      };
    }
  },
};
