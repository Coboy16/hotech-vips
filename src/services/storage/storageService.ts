export enum StorageType {
  LOCAL = "localStorage",
  SESSION = "sessionStorage",
}

const isServer = typeof window === "undefined";

/**
 * Obtiene el objeto de almacenamiento correcto (localStorage o sessionStorage).
 * Devuelve null si está en el servidor.
 */
const getStorage = (type: StorageType): Storage | null => {
  if (isServer) {
    return null;
  }
  return type === StorageType.LOCAL
    ? window.localStorage
    : window.sessionStorage;
};

/**
 * Guarda un valor en el almacenamiento especificado.
 * @param type Tipo de almacenamiento (localStorage o sessionStorage)
 * @param key Clave bajo la cual guardar el valor.
 * @param value Valor a guardar (se convertirá a JSON).
 */
export const setItem = <T>(type: StorageType, key: string, value: T): void => {
  const storage = getStorage(type);
  if (storage) {
    try {
      const serializedValue = JSON.stringify(value);
      storage.setItem(key, serializedValue);
      console.log(`[storageService] Guardado en ${type}: ${key}`);
    } catch (error) {
      console.error(
        `[storageService] Error guardando en ${type} (${key}):`,
        error
      );
    }
  } else {
    console.warn(
      `[storageService] Intento de guardar en ${type} (${key}) en el servidor.`
    );
  }
};

/**
 * Obtiene un valor del almacenamiento especificado.
 * @param type Tipo de almacenamiento (localStorage o sessionStorage)
 * @param key Clave del valor a obtener.
 * @returns El valor parseado o null si no se encuentra o hay error.
 */
export const getItem = <T>(type: StorageType, key: string): T | null => {
  const storage = getStorage(type);
  if (storage) {
    try {
      const serializedValue = storage.getItem(key);
      if (serializedValue === null) {
        console.log(`[storageService] No encontrado en ${type}: ${key}`);
        return null;
      }
      console.log(`[storageService] Obtenido de ${type}: ${key}`);
      return JSON.parse(serializedValue) as T;
    } catch (error) {
      console.error(
        `[storageService] Error obteniendo de ${type} (${key}):`,
        error
      );
      // Opcional: remover el item corrupto si falla el parseo
      // storage.removeItem(key);
      return null;
    }
  } else {
    console.warn(
      `[storageService] Intento de obtener de ${type} (${key}) en el servidor.`
    );
    return null;
  }
};

/**
 * Elimina un valor del almacenamiento especificado.
 * @param type Tipo de almacenamiento (localStorage o sessionStorage)
 * @param key Clave del valor a eliminar.
 */
export const removeItem = (type: StorageType, key: string): void => {
  const storage = getStorage(type);
  if (storage) {
    storage.removeItem(key);
    console.log(`[storageService] Eliminado de ${type}: ${key}`);
  } else {
    console.warn(
      `[storageService] Intento de eliminar de ${type} (${key}) en el servidor.`
    );
  }
};

/**
 * Limpia todo el almacenamiento especificado. ¡Usar con cuidado!
 * @param type Tipo de almacenamiento (localStorage o sessionStorage)
 */
export const clear = (type: StorageType): void => {
  const storage = getStorage(type);
  if (storage) {
    storage.clear();
    console.log(`[storageService] Limpiado ${type}`);
  } else {
    console.warn(`[storageService] Intento de limpiar ${type} en el servidor.`);
  }
};

export const storageService = {
  setItem,
  getItem,
  removeItem,
  clear,
  StorageType,
};
