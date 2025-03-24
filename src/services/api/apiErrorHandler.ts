import { AxiosError } from 'axios';
import { toast } from 'react-hot-toast';

/**
 * Clase para manejar errores de API de forma centralizada
 */
export class ApiErrorHandler {
  /**
   * Maneja los errores de la API y los transforma en un formato estándar
   */
  static handleError(error: unknown): {
    message: string;
    code: string;
    status?: number;
    details?: unknown;
  } {
    if (this.isAxiosError(error)) {
      return this.handleAxiosError(error);
    }
    return this.handleGenericError(error);
  }

  /**
   * Determina si un error es de tipo AxiosError
   */
  private static isAxiosError(error: unknown): error is AxiosError {
    return (error as AxiosError).isAxiosError !== undefined;
  }

  /**
   * Maneja errores específicos de Axios
   */
  private static handleAxiosError(error: AxiosError): {
    message: string;
    code: string;
    status: number;
    details?: unknown;
  } {
    const status = error.response?.status || 500;
    let message = 'Error en la petición';
    let code = 'API_ERROR';
    let details;

    // Intentar extraer detalles del error
    if (error.response?.data) {
      const data = error.response.data as { message?: string; error?: string; code?: string; details?: unknown };
      message = data.message || data.error || message;
      code = data.code || this.getCodeFromStatus(status);
      details = data.details || undefined;
    } else {
      // Manejo de errores de red
      if (error.code === 'ECONNABORTED') {
        message = 'La petición ha excedido el tiempo de espera';
        code = 'TIMEOUT_ERROR';
      } else if (!error.response) {
        message = 'No se pudo conectar con el servidor';
        code = 'NETWORK_ERROR';
      }
    }

    // Errores comunes basados en códigos HTTP
    if (!error.response?.data) {
      switch (status) {
        case 400:
          message = 'Petición incorrecta';
          break;
        case 401:
          message = 'No autorizado, inicie sesión nuevamente';
          break;
        case 403:
          message = 'No tiene permisos para realizar esta acción';
          break;
        case 404:
          message = 'Recurso no encontrado';
          break;
        case 422:
          message = 'Datos de entrada inválidos';
          break;
        case 500:
          message = 'Error interno del servidor';
          break;
        default:
          if (status >= 500) {
            message = 'Error del servidor, intente más tarde';
          }
      }
    }

    return {
      message,
      code,
      status,
      details
    };
  }

  /**
   * Maneja errores genéricos no relacionados con Axios
   */
  private static handleGenericError(error: unknown): {
    message: string;
    code: string;
    details?: unknown;
  } {
    let message = 'Ocurrió un error inesperado';
    const code = 'UNKNOWN_ERROR';
    let details;

    if (error instanceof Error) {
      message = error.message;
      details = {
        name: error.name,
        stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
      };
    } else if (typeof error === 'string') {
      message = error;
    } else if (error !== null && typeof error === 'object') {
      message = (error as { message?: string }).message || message;
      details = error;
    }

    return {
      message,
      code,
      details
    };
  }

  /**
   * Obtiene un código de error basado en el status HTTP
   */
  private static getCodeFromStatus(status: number): string {
    switch (status) {
      case 400:
        return 'BAD_REQUEST';
      case 401:
        return 'UNAUTHORIZED';
      case 403:
        return 'FORBIDDEN';
      case 404:
        return 'NOT_FOUND';
      case 422:
        return 'VALIDATION_ERROR';
      case 429:
        return 'TOO_Munknown_REQUESTS';
      case 500:
        return 'SERVER_ERROR';
      default:
        return `HTTP_ERROR_${status}`;
    }
  }

  /**
   * Muestra un mensaje de error en un toast
   */
  static showErrorToast(error: unknown): void {
    const { message } = this.handleError(error);
    toast.error(message);
  }
}