import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { setupInterceptors } from './apiInterceptors';
import { getApiConfig } from './apiConfig';
import { ApiClientInterface, ApiRequestOptions, HttpMethod } from './types';


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
// src/services/api/apiClient.ts (método request)
public async request<T>(
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
    const response = await this.instance.request<T>(config);
    
    // Devolver los datos directamente
    return response.data;
  } catch (error) {
    // Si es un error de Axios con una respuesta del servidor
    if (axios.isAxiosError(error) && error.response) {
      // Devolver la respuesta del servidor tal cual
      return error.response.data as T;
    }
    
    // Para otros tipos de errores
    throw error;
  }
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