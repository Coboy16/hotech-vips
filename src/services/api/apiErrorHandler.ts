import { AxiosError } from "axios";
import { toast } from "react-hot-toast";
import { ApiResponse } from "./types";

/**
 * Manejador centralizado para errores de API (Axios).
 * Intenta extraer mensajes significativos del error.
 */
export const handleApiError = (error: unknown): string => {
  let errorMessage =
    "Ocurrió un error inesperado. Inténtalo de nuevo más tarde.";

  if (error instanceof AxiosError) {
    const response = error.response;
    const data = response?.data as ApiResponse<unknown> | undefined; // Tipar la respuesta

    console.error("[API Error Handler] Axios Error:", {
      message: error.message,
      code: error.code,
      status: response?.status,
      data: data, // Loguear la data para depuración
      config: error.config, // Loguear la configuración de la petición
    });

    if (response) {
      // Intentar obtener el mensaje del cuerpo de la respuesta de la API
      if (data && data.message) {
        errorMessage = data.message;
      } else if (data && data.error) {
        errorMessage = data.error;
      }
      // Mensajes genéricos basados en el código de estado HTTP
      else if (response.status === 400) {
        errorMessage = "Solicitud incorrecta. Verifica los datos enviados.";
      } else if (response.status === 401) {
        errorMessage = "No autorizado. Por favor, inicia sesión de nuevo.";
        // Opcional: Redirigir al login aquí o en un interceptor
        // window.location.href = '/login';
      } else if (response.status === 403) {
        errorMessage = "No tienes permiso para realizar esta acción.";
      } else if (response.status === 404) {
        errorMessage = "El recurso solicitado no fue encontrado.";
      } else if (response.status >= 500) {
        errorMessage = "Error interno del servidor. Inténtalo más tarde.";
      }
    } else if (error.request) {
      // La solicitud se hizo pero no se recibió respuesta
      errorMessage =
        "No se pudo conectar con el servidor. Verifica tu conexión a internet.";
    } else {
      // Algo sucedió al configurar la solicitud que provocó un error
      errorMessage = `Error al configurar la solicitud: ${error.message}`;
    }
  } else if (error instanceof Error) {
    // Otros tipos de errores (ej. errores de JavaScript)
    console.error("[API Error Handler] Generic Error:", error);
    errorMessage = error.message || errorMessage;
  } else {
    // Errores desconocidos
    console.error("[API Error Handler] Unknown Error:", error);
  }

  // Mostrar el mensaje de error al usuario usando react-hot-toast
  // Evitar mostrar toasts duplicados si ya hay uno con el mismo mensaje
  toast.error(errorMessage, { id: errorMessage });

  // Devolver el mensaje de error para posible uso adicional
  return errorMessage;
};
