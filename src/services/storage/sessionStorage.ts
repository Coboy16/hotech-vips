/**
 * Servicio para manejar el almacenamiento de sesión (sessionStorage)
 * Proporciona una API consistente con manejo de errores y serialización/deserialización
 */
export const sessionStorageService = {
  /**
   * Guarda un valor en sessionStorage
   * @param key Clave
   * @param value Valor a guardar (puede ser cualquier tipo serializable)
   * @returns true si se guardó correctamente, false en caso contrario
   */
  set<T>(key: string, value: T): boolean {
    try {
      const serializedValue = JSON.stringify(value);
      sessionStorage.setItem(key, serializedValue);
      return true;
    } catch (error) {
      console.error('Error saving to sessionStorage:', error);
      return false;
    }
  },

  /**
   * Obtiene un valor de sessionStorage
   * @param key Clave
   * @param defaultValue Valor por defecto si no existe la clave
   * @returns El valor almacenado o el valor por defecto
   */
  get<T>(key: string, defaultValue: T | null = null): T | null {
    try {
      const value = sessionStorage.getItem(key);
      if (value === null) {
        return defaultValue;
      }
      return JSON.parse(value) as T;
    } catch (error) {
      console.error('Error reading from sessionStorage:', error);
      return defaultValue;
    }
  },

  /**
   * Elimina una clave de sessionStorage
   * @param key Clave a eliminar
   * @returns true si se eliminó correctamente, false en caso contrario
   */
  remove(key: string): boolean {
    try {
      sessionStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from sessionStorage:', error);
      return false;
    }
  },

  /**
   * Comprueba si existe una clave en sessionStorage
   * @param key Clave a comprobar
   * @returns true si existe, false en caso contrario
   */
  has(key: string): boolean {
    return sessionStorage.getItem(key) !== null;
  },

  /**
   * Limpia todo el sessionStorage
   * @returns true si se limpió correctamente, false en caso contrario
   */
  clear(): boolean {
    try {
      sessionStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing sessionStorage:', error);
      return false;
    }
  },

  /**
   * Obtiene todas las claves almacenadas en sessionStorage
   * @returns Array con todas las claves
   */
  getKeys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        keys.push(key);
      }
    }
    return keys;
  }
};