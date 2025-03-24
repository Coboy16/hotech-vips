/**
 * Constantes que definen los endpoints de la API
 * Centralizar estas rutas facilita el mantenimiento y evita errores de tipeo
 */

/**
 * Endpoints relacionados con autenticación
 */
// src/services/api/endpoints.ts
export const AUTH_ENDPOINTS = {
  LOGIN: '/login', 
  LOGOUT: '/logout', 
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

/**
 * Endpoints para operaciones de hotel (ejemplo)
 */
export const HOTEL_ENDPOINTS = {
  BASE: '/hotels',
  DETAIL: (id: string) => `/hotels/${id}`,
  ROOMS: (id: string) => `/hotels/${id}/rooms`,
  SERVICES: (id: string) => `/hotels/${id}/services`,
  RESERVATIONS: (id: string) => `/hotels/${id}/reservations`
};

/**
 * Endpoints para operaciones de reservación (ejemplo)
 */
export const RESERVATION_ENDPOINTS = {
  BASE: '/reservations',
  DETAIL: (id: string) => `/reservations/${id}`,
  CANCEL: (id: string) => `/reservations/${id}/cancel`,
  CONFIRM: (id: string) => `/reservations/${id}/confirm`,
  CHECK_IN: (id: string) => `/reservations/${id}/check-in`,
  CHECK_OUT: (id: string) => `/reservations/${id}/check-out`
};

/**
 * Agrupar todos los endpoints para exportación
 */
export const API_ENDPOINTS = {
  AUTH: AUTH_ENDPOINTS,
  USER: USER_ENDPOINTS,
  HOTEL: HOTEL_ENDPOINTS,
  RESERVATION: RESERVATION_ENDPOINTS
};