import { User } from '../types/auth';

export const TOKEN_KEY = 'auth_token';
export const USER_KEY = 'user_data';
export const SESSION_TYPE_KEY = 'session_type';

// Tipos de almacenamiento
export enum StorageType {
  LOCAL = 'local',
  SESSION = 'session'
}

/**
 * Utilidades para gestionar el almacenamiento de tokens y datos de sesión
 */
export const tokenStorage = {
  /**
   * Guarda el token de autenticación
   * @param token Token a guardar
   * @param storageType Tipo de almacenamiento (local o sesión)
   */
  setToken(token: string, storageType: StorageType = StorageType.LOCAL): void {
    // Guardar el token en el almacenamiento correspondiente
    if (storageType === StorageType.SESSION) {
      sessionStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.setItem(TOKEN_KEY, token);
    }
    // Guardar el tipo de almacenamiento para referencia futura
    localStorage.setItem(SESSION_TYPE_KEY, storageType);
  },

  /**
   * Obtiene el token de autenticación
   */
  getToken(): string | null {
    // Determinar dónde buscar el token según la configuración guardada
    const storageType = this.getStorageType();
    
    if (storageType === StorageType.SESSION) {
      return sessionStorage.getItem(TOKEN_KEY);
    }
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Obtiene el tipo de almacenamiento configurado
   */
  getStorageType(): StorageType {
    const type = localStorage.getItem(SESSION_TYPE_KEY);
    return type === StorageType.SESSION ? StorageType.SESSION : StorageType.LOCAL;
  },

  /**
   * Guarda los datos del usuario
   * @param user Datos del usuario
   * @param storageType Tipo de almacenamiento (local o sesión)
   */
  setUser(user: User, storageType: StorageType = StorageType.LOCAL): void {
    const userData = JSON.stringify(user);
    
    if (storageType === StorageType.SESSION) {
      sessionStorage.setItem(USER_KEY, userData);
    } else {
      localStorage.setItem(USER_KEY, userData);
    }
  },

  /**
   * Obtiene los datos del usuario
   */
  getUser(): User | null {
    const storageType = this.getStorageType();
    let userData: string | null;
    
    if (storageType === StorageType.SESSION) {
      userData = sessionStorage.getItem(USER_KEY);
    } else {
      userData = localStorage.getItem(USER_KEY);
    }
    
    return userData ? JSON.parse(userData) : null;
  },

  /**
   * Limpia todos los datos de sesión
   */
  clearSession(): void {
    // Limpiar localStorage
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(SESSION_TYPE_KEY);
    
    // Limpiar sessionStorage
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
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