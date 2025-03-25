import { toast } from 'react-hot-toast';
import { LoginCredentials, AuthResponse } from '../types/auth';
import { tokenStorage } from '../utils/tokenStorage';
import { apiClient } from '../../../services/api';

/**
 * Servicio para manejar operaciones de autenticación
 */
export const authService = {
  /**
   * Realiza el proceso de login
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // En desarrollo, usamos una simulación
      if (process.env.NODE_ENV === 'development') {
        return this.mockLogin(credentials);
      }
      
      // En producción, hacemos la llamada real a la API
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      
      if (response.success) {
        this.saveSession(response);
      }
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
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
        await apiClient.post('/auth/logout');
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

    if (credentials.username === 'admin' && credentials.password === 'admin') {
      const response = {
        success: true,
        token: 'sample_token_123',
        user: {
          id: '1',
          username: credentials.username,
          role: 'admin'
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