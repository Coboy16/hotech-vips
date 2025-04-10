/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiResponse } from "../../../services/api/types";
import {
  GenerateOtpData,
  ValidateOtpData,
  ResetPasswordData,
} from "../types/recovery";

/**
 * Normalizadores para transformar las respuestas de API
 */
export const apiTransformers = {
  /**
   * Normaliza la respuesta de generación de código OTP
   */
  normalizeGenerateOtpResponse(response: ApiResponse<GenerateOtpData>) {
    return {
      success: response.statusCode === 201,
      message: response.message || "Código OTP generado exitosamente",
      email: response.data?.email || "",
      expirationMinutes: response.data?.min_expires || 0,
      error: response.error || "",
    };
  },

  /**
   * Normaliza la respuesta de validación de código OTP
   * Este transformador maneja la estructura real donde el token está dentro de data
   */
  normalizeValidateOtpResponse(response: ApiResponse<ValidateOtpData>) {
    return {
      success: response.statusCode === 200,
      message: response.message || "Código OTP validado exitosamente",
      email: response.data?.otpRecord?.email || "",
      otpCode: response.data?.otpRecord?.otp_code || "",
      token: response.data?.token || "",
      error: response.error || "",
    };
  },

  /**
   * Normaliza la respuesta de restablecimiento de contraseña
   */
  normalizeResetPasswordResponse(response: ApiResponse<ResetPasswordData>) {
    return {
      success: response.statusCode === 200,
      message: response.message || "Contraseña actualizada exitosamente",
      error: response.error || "",
    };
  },
};

/**
 * Parsea una respuesta de error de la API para obtener un mensaje legible
 */
export function parseApiError(error: any): string {
  // Si el error tiene un mensaje del servidor, lo usamos
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  // Si el error tiene un mensaje del servidor bajo 'error'
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }

  // Si el error es una cadena directa
  if (typeof error === "string") {
    return error;
  }

  // Si el error es un objeto con una propiedad message
  if (error?.message) {
    return error.message;
  }

  // Mensaje genérico por defecto
  return "Ocurrió un error inesperado. Por favor, inténtelo de nuevo más tarde.";
}
