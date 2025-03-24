import { User } from '../types/auth';

export const TOKEN_KEY = 'auth_token';
export const USER_KEY = 'user_data';

/**
 * Utilidades para gestionar el almacenamiento de tokens y datos de sesión
 */
export const tokenStorage = {
  /**
   * Guarda el token de autenticación
   */
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  /**
   * Obtiene el token de autenticación
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Guarda los datos del usuario
   */
  setUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  /**
   * Obtiene los datos del usuario
   */
  getUser(): User | null {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  },

  /**
   * Limpia todos los datos de sesión
   */
  clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.clear();
    
    // Limpiar cookies
    document.cookie.split(';').forEach(cookie => {
      document.cookie = cookie
        .replace(/^ +/, '')
        .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
    });
  },

  /**
   * Verifica si hay un usuario autenticado
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
};