// src/features/auth/services/authService.ts
import { toast } from 'react-hot-toast';
import { LoginCredentials, AuthResponse, ApiResponse, User } from '../types/auth';
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
      // En desarrollo, usamos una simulación si está habilitada
      if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_USE_MOCK === 'true') {
        return this.mockLogin(credentials);
      }
      
      // Llamada real a la API
      const response = await apiClient.post<ApiResponse<User>>(AUTH_ENDPOINTS.LOGIN, credentials, {
        // Para capturar tokens JWT en la cabecera
        withCredentials: true
      });
      
      // Verificar si la respuesta es exitosa
      if (response.statusCode === 200) {
        // Extraer token del header (si viene ahí) o de una cookie
        // Puedes necesitar ajustar esto según cómo tu backend envía el token
        const token = (response.headers as Record<string, string>)?.authorization || document.cookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, "$1");
        
        // Guardar la sesión
        this.saveSession({
          success: true,
          token: token || 'token-placeholder', // Si no hay token explícito pero la respuesta es exitosa
          user: response.data
        });
        
        return {
          success: true,
          token: token || 'token-placeholder',
          user: response.data
        };
      }
      
      // Si llegamos aquí, hubo un error en la respuesta
      return {
        success: false,
        error: response.error || response.message || 'Error de autenticación'
      };
    } catch (error) {
      console.error('Login error:', error);
      
      // Verificar si el error es una respuesta de la API
      if (typeof error === 'object' && error && 'statusCode' in error) {
        const apiError = error as ApiResponse<unknown>;
        return {
          success: false,
          error: apiError.error || apiError.message || 'Error al intentar iniciar sesión'
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
      // En producción, hacemos la llamada real a la API si es necesario
      if (process.env.NODE_ENV !== 'development') {
        await apiClient.post(AUTH_ENDPOINTS.LOGOUT);
      } else {
        // Simulamos un delay para desarrollo
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Limpiamos la sesión
      tokenStorage.clearSession();
      
      toast.success('Sesión cerrada correctamente');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error al cerrar sesión');
    }
  },

  /**
   * Guarda los datos de la sesión
   */
  saveSession(response: AuthResponse): void {
    if (response.token) {
      tokenStorage.setToken(response.token);
    }
    if (response.user) {
      tokenStorage.setUser(response.user);
    }
  },
  
  /**
   * Mock del login para desarrollo
   */
  async mockLogin(credentials: LoginCredentials): Promise<AuthResponse> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (credentials.email === 'admin@gmail.com' && credentials.password === '12345') {
      // Mock similar a la respuesta real de la API
      const response = {
        success: true,
        token: 'sample_token_123',
        user: {
          user_id: '550e8400-e29b-41d4-a716-446655440000',
          usua_corr: 'admin@gmail.com',
          usua_nomb: 'Administrador',
          usua_noco: '12345678',
          usua_fevc: '2024-12-31T23:59:59Z',
          usua_fein: '2024-01-01T00:00:00Z',
          usua_feve: '2024-12-31T23:59:59Z',
          usua_stat: true,
          rol_id: '550e8400-e29b-41d4-a716-446655440000'
        }
      };

      this.saveSession(response);
      return response;
    }

    return {
      success: false,
      error: 'Credenciales inválidas'
    };
  }
};