import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { setupInterceptors } from './apiInterceptors';
import { ApiErrorHandler } from './apiErrorHandler';
import { getApiConfig } from './apiConfig';
import { ApiClientInterface, ApiRequestOptions, HttpMethod, ApiResponse } from './types';

/**
 * Implementación del cliente API basado en Axios
 * Proporciona métodos para realizar peticiones HTTP con manejo de errores y configuración.
 */
class ApiClient implements ApiClientInterface {
  private instance: AxiosInstance;
  private tokenGetter: () => string | null;
  private refreshTokenFn?: () => Promise<string | null>;
  private unauthorizedCallback?: () => void;

  /**
   * Constructor del cliente API
   * @param tokenGetter Función para obtener el token actual
   * @param refreshTokenFn Función opcional para refrescar el token
   * @param unauthorizedCallback Callback opcional para manejar respuestas no autorizadas
   */
  constructor(
    tokenGetter: () => string | null = () => null,
    refreshTokenFn?: () => Promise<string | null>,
    unauthorizedCallback?: () => void
  ) {
    // Obtener configuración del entorno actual
    const config = getApiConfig();

    // Crear instancia de axios con la configuración base
    this.instance = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers
      }
    });

    // Guardar funciones de autenticación
    this.tokenGetter = tokenGetter;
    this.refreshTokenFn = refreshTokenFn;
    this.unauthorizedCallback = unauthorizedCallback;

    // Configurar interceptores
    setupInterceptors(
      this.instance,
      this.tokenGetter,
      this.refreshTokenFn,
      this.unauthorizedCallback
    );
  }

  /**
   * Realiza una petición HTTP genérica
   * @param method Método HTTP (get, post, put, delete, patch)
   * @param endpoint URL del endpoint
   * @param data Datos a enviar (opcional)
   * @param options Opciones adicionales para la petición
   * @returns Promesa con la respuesta procesada
   */
  public async request<T = unknown>(
    method: HttpMethod,
    endpoint: string,
    data?: unknown,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    try {
      const config: AxiosRequestConfig = {
        method,
        url: endpoint,
        ...options
      };

      // Añadir datos según el método
      if (method === 'get' || method === 'delete') {
        config.params = data;
      } else {
        config.data = data;
      }

      // Realizar la petición
      const response = await this.instance.request<unknown, AxiosResponse<ApiResponse<T>>>(config);
      
      // Verificar si la respuesta tiene formato de ApiResponse
      if (this.isApiResponse(response.data)) {
        if (!response.data.success) {
          throw response.data.error || { message: 'Error en la respuesta' };
        }
        return response.data.data as T;
      }
      
      // Si no tiene el formato esperado, devolver directamente
      return response.data as T;
    } catch (error) {
      // Usar el manejador centralizado para procesar el error
      const processedError = ApiErrorHandler.handleError(error);
      
      // Registrar el error para depuración
      console.error(`API Error (${method.toUpperCase()} ${endpoint}):`, processedError);
      
      // Propagar el error procesado
      throw processedError;
    }
  }

  /**
   * Verifica si una respuesta tiene el formato ApiResponse
   */
  private isApiResponse(data: unknown): data is ApiResponse {
    return Boolean(data && typeof data === 'object' && 'success' in data);
  }

  /**
   * Realiza una petición GET
   */
  public get<T = unknown>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    return this.request<T>('get', endpoint, options.params, {
      ...options,
      params: undefined
    });
  }

  /**
   * Realiza una petición POST
   */
  public post<T = unknown>(endpoint: string, data?: unknown, options: ApiRequestOptions = {}): Promise<T> {
    return this.request<T>('post', endpoint, data, options);
  }

  /**
   * Realiza una petición PUT
   */
  public put<T = unknown>(endpoint: string, data?: unknown, options: ApiRequestOptions = {}): Promise<T> {
    return this.request<T>('put', endpoint, data, options);
  }

  /**
   * Realiza una petición PATCH
   */
  public patch<T = unknown>(endpoint: string, data?: unknown, options: ApiRequestOptions = {}): Promise<T> {
    return this.request<T>('patch', endpoint, data, options);
  }

  /**
   * Realiza una petición DELETE
   */
  public delete<T = unknown>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    return this.request<T>('delete', endpoint, options.params, {
      ...options,
      params: undefined
    });
  }

  /**
   * Cambia la URL base de las peticiones
   */
  public setBaseURL(url: string): void {
    this.instance.defaults.baseURL = url;
  }

  /**
   * Establece una cabecera por defecto
   */
  public setDefaultHeader(key: string, value: string): void {
    this.instance.defaults.headers.common[key] = value;
  }

  /**
   * Elimina una cabecera por defecto
   */
  public removeDefaultHeader(key: string): void {
    delete this.instance.defaults.headers.common[key];
  }

  /**
   * Devuelve la URL base actual
   */
  public getBaseURL(): string {
    return this.instance.defaults.baseURL || '';
  }

  /**
   * Crea un controlador de aborto para cancelar peticiones
   */
  public createAbortController(): AbortController {
    return new AbortController();
  }
}

/**
 * Token getter function that uses localStorage
 * This can be customized based on your token storage strategy
 */
const defaultTokenGetter = (): string | null => {
  return localStorage.getItem('auth_token');
};

/**
 * Default unauthorized callback
 * Redirects to login page
 */
const defaultUnauthorizedCallback = (): void => {
  // Clear auth data
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_data');
  
  // Redirect to login
  window.location.href = '/login';
};

/**
 * Instancia única exportada del cliente API
 */
export const apiClient: ApiClientInterface = new ApiClient(
  defaultTokenGetter,
  undefined, // Add refresh token function if needed
  defaultUnauthorizedCallback
);