// src/features/auth/services/authService.ts
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
    try {
      console.log('Iniciando login con credenciales:', credentials.email);
      
      const response = await apiClient.post<LoginResponse>(AUTH_ENDPOINTS.LOGIN, credentials);
      
      console.log('Respuesta de la API:', response);
      
      // Verificar si la respuesta es exitosa según el statusCode
      if (response.statusCode === 200 && response.data) {
        const userData = response.data.user;
        const token = response.data.token;
        
        // Guardar en localStorage
        tokenStorage.setToken(token);
        tokenStorage.setUser(userData);
        
        return {
          success: true,
          token,
          user: userData
        };
      }
      
      // Si llegamos aquí, hubo un error en la respuesta
      return {
        success: false,
        error: response.error || response.message || 'Error de autenticación'
      };
    } catch (error) {
      console.error('Login error:', error);
      
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
    try {
      await apiClient.post(AUTH_ENDPOINTS.LOGOUT);
      tokenStorage.clearSession();
      toast.success('Sesión cerrada correctamente');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error al cerrar sesión');
      // Limpiamos la sesión de todos modos por seguridad
      tokenStorage.clearSession();
    }
  }
};