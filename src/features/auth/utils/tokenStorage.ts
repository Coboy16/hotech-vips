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
    console.log(`[tokenStorage] Guardando token en ${storageType}. Token (primeros 10 chars): ${token.substring(0, 10)}...`);
    
    // Guardar el token en el almacenamiento correspondiente
    if (storageType === StorageType.SESSION) {
      sessionStorage.setItem(TOKEN_KEY, token);
      console.log('[tokenStorage] Token guardado en sessionStorage');
    } else {
      localStorage.setItem(TOKEN_KEY, token);
      console.log('[tokenStorage] Token guardado en localStorage');
    }
    
    // Guardar el tipo de almacenamiento para referencia futura
    localStorage.setItem(SESSION_TYPE_KEY, storageType);
    console.log(`[tokenStorage] Tipo de almacenamiento guardado: ${storageType}`);
  },

  /**
   * Obtiene el token de autenticación
   */
  getToken(): string | null {
    
    // Verificar en localStorage
    const localToken = localStorage.getItem(TOKEN_KEY);
    if (localToken) {
      console.log('[tokenStorage] Token encontrado en localStorage');
      return localToken;
    }
    
    // Verificar en sessionStorage
    const sessionToken = sessionStorage.getItem(TOKEN_KEY);
    if (sessionToken) {
      console.log('[tokenStorage] Token encontrado en sessionStorage');
      return sessionToken;
    }
    
    console.log('[tokenStorage] No se encontró ningún token');
    return null;
  },

  /**
   * Obtiene el tipo de almacenamiento configurado
   */
  getStorageType(): StorageType {
    const type = localStorage.getItem(SESSION_TYPE_KEY);
    console.log(`[tokenStorage] Tipo de almacenamiento recuperado: ${type || 'no definido, usando LOCAL por defecto'}`);
    return type === StorageType.SESSION ? StorageType.SESSION : StorageType.LOCAL;
  },

  /**
   * Guarda los datos del usuario
   * @param user Datos del usuario
   * @param storageType Tipo de almacenamiento (local o sesión)
   */
  setUser(user: User, storageType: StorageType = StorageType.LOCAL): void {
    console.log(`[tokenStorage] Guardando datos de usuario en ${storageType}`);
    const userData = JSON.stringify(user);
    
    // Siempre guardar los datos del usuario en el mismo sitio que el token
    if (storageType === StorageType.SESSION) {
      sessionStorage.setItem(USER_KEY, userData);
      console.log('[tokenStorage] Datos de usuario guardados en sessionStorage');
    } else {
      localStorage.setItem(USER_KEY, userData);
      console.log('[tokenStorage] Datos de usuario guardados en localStorage');
    }
  },

  /**
   * Obtiene los datos del usuario
   */
  getUser(): User | null {
    console.log('[tokenStorage] Intentando obtener datos de usuario...');
    
    // Verificar en localStorage
    const localUserData = localStorage.getItem(USER_KEY);
    if (localUserData) {
      console.log('[tokenStorage] Datos de usuario encontrados en localStorage');
      return JSON.parse(localUserData);
    }
    
    // Verificar en sessionStorage
    const sessionUserData = sessionStorage.getItem(USER_KEY);
    if (sessionUserData) {
      console.log('[tokenStorage] Datos de usuario encontrados en sessionStorage');
      return JSON.parse(sessionUserData);
    }
    
    console.log('[tokenStorage] No se encontraron datos de usuario');
    return null;
  },

  /**
   * Limpia todos los datos de sesión
   */
  clearSession(): void {
    console.log('[tokenStorage] Limpiando datos de sesión...');
    
    // Limpiar localStorage
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(SESSION_TYPE_KEY);
    
    // Limpiar sessionStorage
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    
    console.log('[tokenStorage] Datos de sesión limpiados');
  },

  /**
   * Verifica si hay un usuario autenticado
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    console.log(`[tokenStorage] isAuthenticated: ${!!token}`);
    return !!token;
  }
};