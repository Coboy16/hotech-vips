import { useState, useCallback } from "react";
import { recoveryService } from "../services/recoveryService";
import { toast } from "react-hot-toast";
import {
  GenerateOtpRequest,
  ValidateOtpRequest,
  RecoveryStep,
} from "../types/recovery";

// Extendemos RecoveryState para incluir el token
interface RecoveryState {
  step: RecoveryStep;
  email: string;
  otp: string;
  token: string; // Token JWT para autorizar el cambio de contraseña
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook personalizado para manejar el flujo de recuperación de contraseña
 */
export const useRecovery = () => {
  // Estado del proceso de recuperación
  const [state, setState] = useState<RecoveryState>({
    step: RecoveryStep.EMAIL_ENTRY,
    email: "",
    otp: "",
    token: "",
    isLoading: false,
    error: null,
  });

  /**
   * Solicita un código OTP para el correo proporcionado
   */
  const requestOtp = useCallback(async (email: string) => {
    // Actualizamos el estado para mostrar loading
    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
      email,
    }));

    try {
      const data: GenerateOtpRequest = { email };
      const response = await recoveryService.generateOtp(data);

      if (response.success) {
        toast.success(response.message || "Código enviado a su correo");
        // Avanzamos al siguiente paso
        setState((prev) => ({
          ...prev,
          step: RecoveryStep.OTP_ENTRY,
          isLoading: false,
        }));
        return true;
      } else {
        toast.error(response.error || "Error al solicitar código");
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: response.error || "Error al solicitar código",
        }));
        return false;
      }
    } catch (error) {
      console.error("Error en requestOtp:", error);
      toast.error("Error inesperado al solicitar código");
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Error inesperado al solicitar código",
      }));
      return false;
    }
  }, []);

  /**
   * Valida el código OTP ingresado y obtiene el token de autorización
   */
  const validateOtp = useCallback(
    async (otpCode: string) => {
      // Actualizamos el estado para mostrar loading
      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
        otp: otpCode,
      }));

      try {
        const data: ValidateOtpRequest = {
          email: state.email,
          otp_code: otpCode,
        };

        const response = await recoveryService.validateOtp(data);

        if (response.success && response.token) {
          toast.success(response.message || "Código validado exitosamente");
          // Guardamos el token y avanzamos al siguiente paso
          setState((prev) => ({
            ...prev,
            token: response.token || "",
            step: RecoveryStep.NEW_PASSWORD,
            isLoading: false,
          }));
          return true;
        } else {
          const errorMsg = response.token
            ? response.error
            : "No se recibió token de autorización";
          toast.error(errorMsg || "Código inválido");
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: errorMsg || "Código inválido",
          }));
          return false;
        }
      } catch (error) {
        console.error("Error en validateOtp:", error);
        toast.error("Error inesperado al validar código");
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: "Error inesperado al validar código",
        }));
        return false;
      }
    },
    [state.email]
  );

  /**
   * Actualiza la contraseña usando el token obtenido previamente
   */
  const resetPassword = useCallback(
    async (newPassword: string) => {
      // Verificamos que tengamos un token
      if (!state.token) {
        toast.error("No se puede actualizar la contraseña sin autorización");
        return false;
      }

      // Actualizamos el estado para mostrar loading
      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      try {
        // Ahora solo necesitamos enviar la nueva contraseña y el token
        const response = await recoveryService.resetPassword(
          newPassword,
          state.token
        );

        if (response.success) {
          toast.success(
            response.message || "Contraseña actualizada exitosamente"
          );
          // Avanzamos al paso final
          setState((prev) => ({
            ...prev,
            step: RecoveryStep.SUCCESS,
            isLoading: false,
          }));
          return true;
        } else {
          toast.error(response.error || "Error al actualizar contraseña");
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: response.error || "Error al actualizar contraseña",
          }));
          return false;
        }
      } catch (error) {
        console.error("Error en resetPassword:", error);
        toast.error("Error inesperado al actualizar contraseña");
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: "Error inesperado al actualizar contraseña",
        }));
        return false;
      }
    },
    [state.token]
  );

  /**
   * Reinicia el proceso de recuperación
   */
  const resetRecoveryProcess = useCallback(() => {
    setState({
      step: RecoveryStep.EMAIL_ENTRY,
      email: "",
      otp: "",
      token: "",
      isLoading: false,
      error: null,
    });
  }, []);

  return {
    state,
    requestOtp,
    validateOtp,
    resetPassword,
    resetRecoveryProcess,
  };
};
