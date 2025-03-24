/**
 * Servicio para manejar el almacenamiento local (localStorage)
 * Proporciona una API consistente con manejo de errores y serialización/deserialización
 */
export const localStorageService = {
  /**
   * Guarda un valor en localStorage
   * @param key Clave
   * @param value Valor a guardar (puede ser cualquier tipo serializable)
   * @returns true si se guardó correctamente, false en caso contrario
   */
  set<T>(key: string, value: T): boolean {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  },

  /**
   * Obtiene un valor de localStorage
   * @param key Clave
   * @param defaultValue Valor por defecto si no existe la clave
   * @returns El valor almacenado o el valor por defecto
   */
  get<T>(key: string, defaultValue: T | null = null): T | null {
    try {
      const value = localStorage.getItem(key);
      if (value === null) {
        return defaultValue;
      }
      return JSON.parse(value) as T;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  },

  /**
   * Elimina una clave de localStorage
   * @param key Clave a eliminar
   * @returns true si se eliminó correctamente, false en caso contrario
   */
  remove(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  },

  /**
   * Comprueba si existe una clave en localStorage
   * @param key Clave a comprobar
   * @returns true si existe, false en caso contrario
   */
  has(key: string): boolean {
    return localStorage.getItem(key) !== null;
  },

  /**
   * Limpia todo el localStorage
   * @returns true si se limpió correctamente, false en caso contrario
   */
  clear(): boolean {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  },

  /**
   * Obtiene todas las claves almacenadas en localStorage
   * @returns Array con todas las claves
   */
  getKeys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        keys.push(key);
      }
    }
    return keys;
  }
};