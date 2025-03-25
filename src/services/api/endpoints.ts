/**
 * Constantes que definen los endpoints de la API
 * Centralizar estas rutas facilita el mantenimiento y evita errores de tipeo
 */

/**
 * Endpoints relacionados con autenticación
 */
export const AUTH_ENDPOINTS = {
  LOGIN: '/login', 
  LOGOUT: '/logout', 
};

/**
 * Endpoints relacionados con compañías
 */
export const COMPANY_ENDPOINTS = {
  BASE: '/companies',
  DETAIL: (id: string) => `/companies/${id}`,
  UPDATE: (id: string) => `/companies/${id}`,
  DELETE: (id: string) => `/companies/${id}`
};

/**
 * Endpoints relacionados con países
 */
export const COUNTRY_ENDPOINTS = {
  BASE: '/countries',
  DETAIL: (id: string) => `/countries/${id}`
};

/**
 * Endpoints relacionados con usuarios
 */
export const USER_ENDPOINTS = {
  BASE: '/users',
  DETAIL: (id: string) => `/users/${id}`,
  UPDATE: (id: string) => `/users/${id}`,
  DELETE: (id: string) => `/users/${id}`,
  CHANGE_PASSWORD: (id: string) => `/users/${id}/change-password`,
  UPLOAD_AVATAR: (id: string) => `/users/${id}/avatar`
};

