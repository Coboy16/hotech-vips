/* eslint-disable @typescript-eslint/no-explicit-any */
import { toast } from "react-hot-toast";
import {
  LoginCredentials,
  AuthResponse,
  LoginSuccessData,
  User, // Asegúrate que User usa la nueva estructura con userModule
} from "../types/auth";
import { tokenStorage, StorageType } from "../utils/tokenStorage";
import { makeRequest } from "../../../services/api";
import { AUTH_ENDPOINTS } from "../../../services/api/endpoints";

/**
 * Servicio para manejar operaciones de autenticación
 */
export const authService = {
  /**
   * Realiza el proceso de login
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    console.log(
      "[authService] Iniciando login con credenciales:",
      credentials.email
    );

    try {
      // Solo enviamos email y password a la API
      const { email, password } = credentials;
      // Especificamos el tipo de datos esperado en la respuesta exitosa
      const response = await makeRequest<LoginSuccessData>(
        "post",
        AUTH_ENDPOINTS.LOGIN,
        { email, password }
      );

      // Revisar si la petición falló a nivel de red o Axios (makeRequest devolvería null)
      if (!response) {
        console.error(
          "[authService] La petición a la API falló o no retornó respuesta."
        );
        // El error ya debería haber sido mostrado por el interceptor/errorHandler
        return {
          success: false,
          error: "No se pudo conectar con el servidor.", // Mensaje genérico
        };
      }

      console.log("[authService] Respuesta completa del servidor:", response);

      // Verificar si la respuesta es exitosa según el statusCode y si contiene data
      if (response && response.statusCode === 200 && response.data) {
        console.log("[authService] Login exitoso, procesando respuesta");
        const userData: User = response.data.user; // userData ahora tiene la estructura correcta con userModule
        const token = response.data.token;

        // console.log(
        //   "[authService] Token recibido (primeros 10 chars):",
        //   token.substring(0, 10) + "..."
        // );
        // console.log("[authService] Usuario recibido:", userData ? "Sí" : "No");
        // console.log("[authService] Rol del usuario:", userData?.role?.nombre);
        // console.log(
        //   "[authService] Módulos asignados (userModule):",
        //   userData.userModule?.map((um) => um.module.name) ?? "Ninguno"
        // );

        // Guardar el token según la opción "recordarme"
        const storageType = credentials.rememberMe
          ? StorageType.LOCAL
          : StorageType.SESSION;
        tokenStorage.setToken(token, storageType);

        // Guardamos los datos completos del usuario (incluyendo userModule)
        tokenStorage.setUser(userData, storageType);

        return {
          success: true,
          token,
          user: userData, // Devolvemos el usuario con sus módulos reales
        };
      } else {
        // Si statusCode no es 200 o no hay data, consideramos error de API
        const errorMessage =
          response?.error ||
          response?.message ||
          "Credenciales inválidas o error desconocido";
        console.log(
          "[authService] Error en respuesta lógica de la API:",
          errorMessage
        );
        // Mostramos el error específico de la API si existe
        toast.error(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      }
    } catch (error) {
      // Este catch es por si makeRequest lanza una excepción inesperada
      // (aunque apiErrorHandler debería manejar la mayoría)
      console.error("[authService] Error inesperado en login:", error);
      // handleApiError ya debería haber mostrado un toast si es un AxiosError
      // Si no lo es, mostramos uno genérico aquí.
      if (!(error instanceof Error && (error as any).isAxiosError)) {
        toast.error("Error inesperado al intentar iniciar sesión.");
      }
      return {
        success: false,
        error: "Error inesperado al intentar iniciar sesión.",
      };
    }
  },

  /**
   * Realiza el proceso de cierre de sesión
   */
  async logout(): Promise<void> {
    console.log("[authService] Iniciando proceso de logout");
    try {
      const token = tokenStorage.getToken();
      console.log("[authService] Token presente para logout:", !!token);

      if (token) {
        // Hacemos la petición pero no esperamos necesariamente una respuesta exitosa

        // await makeRequest("post", AUTH_ENDPOINTS.LOGOUT).catch((err) => {
        //   console.warn(
        //     "[authService] Petición de logout al servidor falló, continuando con limpieza local:",
        //     err.message
        //   );
        // });
        console.log(
          "[authService] Petición de logout al servidor enviada (o falló)."
        );
      }

      // Limpieza local es lo más importante
      tokenStorage.clearSession();
      toast.success("Sesión cerrada correctamente");
    } catch (error) {
      console.error("[authService] Error en logout (inesperado):", error);
      toast.error("Error al cerrar sesión");
      // Limpiamos la sesión de todos modos por seguridad
      tokenStorage.clearSession();
    }
  },
};
