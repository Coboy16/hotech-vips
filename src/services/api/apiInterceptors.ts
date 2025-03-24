import { 
  AxiosInstance, 
  InternalAxiosRequestConfig, 
  AxiosResponse, 
  AxiosError 
} from 'axios';
import { ApiErrorHandler } from './apiErrorHandler';

/**
 * Configuración de interceptores para Axios
 * Centraliza la lógica de manipulación de peticiones y respuestas
 */
export const setupInterceptors = (
  instance: AxiosInstance,
  tokenGetter: () => string | null,
  refreshTokenFn?: () => Promise<string | null>,
  onUnauthorized?: () => void
): AxiosInstance => {
  // Interceptor de peticiones
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
      // Añadir token de autenticación si existe
      const token = tokenGetter();
      if (token && config.headers) {
        // Formato común para JWT: "Bearer {token}"
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Resto del código igual
      return config;
    },
    (error: AxiosError): Promise<AxiosError> => {
      return Promise.reject(error);
    }
  );

  // Interceptor de respuestas
  instance.interceptors.response.use(
    (response: AxiosResponse): AxiosResponse => {
      // Capturar token de la respuesta si existe (para logins)
      const authHeader = response.headers['authorization'] || response.headers['Authorization'];
      if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7); // Quitar 'Bearer '
        localStorage.setItem('auth_token', token);
      }
      
      return response;
    },
    async (error: AxiosError): Promise<unknown> => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
      
      // Renovar token si recibimos un 401 y tenemos función de refresh
      if (error.response?.status === 401 && refreshTokenFn && !originalRequest._retry) {
        try {
          originalRequest._retry = true;
          const newToken = await refreshTokenFn();
          
          if (newToken && originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return instance(originalRequest);
          }
        } catch (refreshError) {
          console.error('Error refreshing token:', refreshError);
          // Si falla el refresh, manejamos como no autorizado
          if (onUnauthorized) {
            onUnauthorized();
          }
        }
      }
      
      // Errores de red (sin respuesta del servidor)
      if (!error.response) {
        console.error('Network error:', error.message);
      }

      // Errores específicos por código de estado
      switch (error.response?.status) {
        case 401:
          if (onUnauthorized) {
            onUnauthorized();
          }
          break;
        case 403:
          console.warn('Forbidden resource:', originalRequest.url);
          break;
        case 404:
          console.warn('Resource not found:', originalRequest.url);
          break;
        case 500:
          console.error('Server error:', originalRequest.url);
          break;
      }

      // Usar el manejador centralizado de errores
      const formattedError = ApiErrorHandler.handleError(error);
      return Promise.reject(formattedError);
    }
  );

  return instance;
};