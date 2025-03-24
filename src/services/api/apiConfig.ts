import { ApiConfigMap } from './types';

/**
 * Configuración de la API para diferentes entornos
 * Centralizado para facilitar cambios entre entornos
 */
export const API_CONFIG: ApiConfigMap = {
  development: {
    baseURL: process.env.REACT_APP_API_URL || 'http://142.93.246.123:4001/api',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json'
    }
  },
  test: {
    baseURL: '',
    timeout: 12000,
    headers: {
      'Content-Type': 'application/json'
    }
  },
  production: {
    baseURL: 'http://142.93.246.123:4001/api', 
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json'
    }
  }
};


/**
 * Determina el entorno actual basado en variables de entorno
 */
export const getEnvironment = (): string => {
  return process.env.REACT_APP_ENV || process.env.NODE_ENV || 'development';
};

/**
 * Obtiene la configuración para el entorno actual
 */
export const getApiConfig = (): ApiConfigMap[keyof ApiConfigMap] => {
  const env = getEnvironment();
  return API_CONFIG[env] || API_CONFIG.development;
};

/**
 * Obtiene el valor de una variable de entorno específica con un valor por defecto
 */
export const getEnvVariable = (key: string, defaultValue: string = ''): string => {
  const envKey = `REACT_APP_${key}`;
  return process.env[envKey] || defaultValue;
};

export default getApiConfig();