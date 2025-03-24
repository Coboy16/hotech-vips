/**
 * Tipos y interfaces para el cliente API
 */

/**
 * Configuración por entorno para el cliente API
 */
export interface ApiEnvironmentConfig {
  baseURL: string;
  timeout: number;
  headers?: Record<string, string>;
}

/**
 * Mapa de configuraciones para todos los entornos disponibles
 */
export interface ApiConfigMap {
  development: ApiEnvironmentConfig;
  test: ApiEnvironmentConfig;
  production: ApiEnvironmentConfig;
  [key: string]: ApiEnvironmentConfig;
}

/**
 * Respuesta genérica de la API
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

/**
 * Opciones para las peticiones a la API
 */
export interface ApiRequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  timeout?: number;
  withCredentials?: boolean;
  signal?: AbortSignal;
}

/**
 * Métodos HTTP soportados
 */
export type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';

/**
 * Interfaz del cliente API
 */
export interface ApiClientInterface {
  request<T = unknown>(method: HttpMethod, endpoint: string, data?: unknown, options?: ApiRequestOptions): Promise<T>;
  get<T = unknown>(endpoint: string, options?: ApiRequestOptions): Promise<T>;
  post<T = unknown>(endpoint: string, data?: unknown, options?: ApiRequestOptions): Promise<T>;
  put<T = unknown>(endpoint: string, data?: unknown, options?: ApiRequestOptions): Promise<T>;
  patch<T = unknown>(endpoint: string, data?: unknown, options?: ApiRequestOptions): Promise<T>;
  delete<T = unknown>(endpoint: string, options?: ApiRequestOptions): Promise<T>;
  setBaseURL(url: string): void;
  setDefaultHeader(key: string, value: string): void;
  removeDefaultHeader(key: string): void;
  getBaseURL(): string;
  createAbortController(): AbortController;
}