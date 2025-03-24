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

    // Intentar extraer detalles del error de la respuesta de la API
    if (error.response?.data) {
      const data = error.response.data as {
        statusCode?: number;
        message?: string;
        error?: string;
        code?: string;
        details?: unknown;
      };
      
      // Formato específico de la API
      if (data.statusCode && data.message) {
        message = data.message;
        code = `ERROR_${data.statusCode}`;
        details = data.error || undefined;
      } 
      // Formato genérico
      else {
        message = data.message || data.error || message;
        code = data.code || this.getCodeFromStatus(status);
        details = data.details || undefined;
      }
    } else {
      // Manejo estándar para otros errores
      // (Resto del código sin cambios)
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