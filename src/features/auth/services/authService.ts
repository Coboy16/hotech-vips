import { toast } from 'react-hot-toast';
import { 
  LoginCredentials, 
  AuthResponse, 
  ApiResponse, 
  LoginResponse,
} from '../types/auth';
import { tokenStorage } from '../utils/tokenStorage';
import { apiClient } from '../../../services/api';
import { AUTH_ENDPOINTS } from '../../../services/api/endpoints';

/**
 * Servicio para manejar operaciones de autenticación
 */
export const authService = {
  /**
   * Realiza el proceso de login
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    console.log('[authService] Iniciando login con credenciales:', credentials.email);
    
    try {
      // Solo enviamos email y password a la API, no la opción rememberMe
      const { email, password } = credentials;
      const response = await apiClient.post<LoginResponse>(AUTH_ENDPOINTS.LOGIN, { email, password });
      
      console.log('[authService] Respuesta completa del servidor:', response);
      
      // Verificar si la respuesta es exitosa según el statusCode
      if (response.statusCode === 200 && response.data) {
        console.log('[authService] Login exitoso, procesando respuesta');
        const userData = response.data.user;
        const token = response.data.token;
        
        console.log('[authService] Token recibido (primeros 10 chars):', token.substring(0, 10) + '...');
        console.log('[authService] Usuario recibido:', userData ? 'Sí' : 'No');
        
        return {
          success: true,
          token,
          user: userData
        };
      }
      
      // Si llegamos aquí, hubo un error en la respuesta
      console.log('[authService] Error en respuesta:', response.error || response.message);
      return {
        success: false,
        error: response.error || response.message || 'Error de autenticación'
      };
    } catch (error) {
      console.error('[authService] Error en login:', error);
      
      // Si es un error con estructura de API
      if (typeof error === 'object' && error !== null && 'statusCode' in error) {
        const apiError = error as ApiResponse<unknown>;
        return {
          success: false,
          error: apiError.message || 'Error al intentar iniciar sesión'
        };
      }
      
      return {
        success: false,
        error: 'Error al intentar iniciar sesión'
      };
    }
  },

  /**
   * Realiza el proceso de cierre de sesión
   */
  async logout(): Promise<void> {
    console.log('[authService] Iniciando proceso de logout');
    try {
      const token = tokenStorage.getToken();
      console.log('[authService] Token presente para logout:', !!token);
      
      if (token) {
        await apiClient.post(AUTH_ENDPOINTS.LOGOUT);
        console.log('[authService] Petición de logout al servidor completada');
      }
      
      tokenStorage.clearSession();
      toast.success('Sesión cerrada correctamente');
    } catch (error) {
      console.error('[authService] Error en logout:', error);
      toast.error('Error al cerrar sesión');
      // Limpiamos la sesión de todos modos por seguridad
      tokenStorage.clearSession();
    }
  }
};