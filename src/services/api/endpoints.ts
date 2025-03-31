/**
 * Constantes que definen los endpoints de la API
 * Centralizar estas rutas facilita el mantenimiento y evita errores de tipeo
 */

/**
 * Endpoints relacionados con autenticación
 */
export const AUTH_ENDPOINTS = {
  LOGIN: "/login",
  LOGOUT: "/logout",
};

/**
 * Endpoints relacionados con compañías
 */
export const COMPANY_ENDPOINTS = {
  BASE: "/companies",
  DETAIL: (id: string) => `/companies/${id}`,
  UPDATE: (id: string) => `/companies/${id}`,
  DELETE: (id: string) => `/companies/${id}`,
};

/**
 * Endpoints relacionados con países
 */
export const COUNTRY_ENDPOINTS = {
  BASE: "/countries",
  DETAIL: (id: string) => `/countries/${id}`,
};

/**
 * Endpoints relacionados con usuarios
 */
export const USER_ENDPOINTS = {
  BASE: "/users",
  DETAIL: (id: string) => `/users/${id}`,
  UPDATE: (id: string) => `/users/${id}`,
  DELETE: (id: string) => `/users/${id}`,
  UPDATE_PASSWORD: (id: string) => `/users/password/${id}`,
  DELETE_BY_EMAIL: (email: string) => `/users/${email}`,
};
/**
 * Endpoints relacionados con licencias de empresas
 */
export const LICENSE_ENDPOINTS = {
  BASE: "/company-licenses",
  DETAIL: (id: string) => `/company-licenses/license/${id}`,
  UPDATE: (id: string) => `/company-licenses/${id}`,
  DELETE: (id: string) => `/company-licenses/${id}`,
  GET_COMPANIES_BY_LICENSE: (licenseId: string) =>
    `/company-licenses/companies-with-relations/${licenseId}`,
};

export const MODULE_ENDPOINTS = {
  BASE: "/modules",
};
/**
 * Endpoints relacionados con la estructura organizacional
 */
export const STRUCTURE_ENDPOINTS = {
  // --- Branches ---
  BRANCH: {
    BASE: "/branches",
    DETAIL: (id: string) => `/branches/${id}`,
    UPDATE: (id: string) => `/branches/${id}`,
    DELETE: (id: string) => `/branches/${id}`,
    UPDATE_STATUS: (id: string) => `/branches/${id}/status`,
  },

  // --- Departments ---
  DEPARTMENT: {
    BASE: "/departments",
    DETAIL: (id: string) => `/departments/${id}`,
    UPDATE: (id: string) => `/departments/${id}`,
    DELETE: (id: string) => `/departments/${id}`,
    UPDATE_STATUS: (id: string) => `/departments/${id}/status`,
  },

  // --- Sections ---
  SECTION: {
    BASE: "/sections",
    DETAIL: (id: string) => `/sections/${id}`,
    UPDATE: (id: string) => `/sections/${id}`,
    DELETE: (id: string) => `/sections/${id}`,
    UPDATE_STATUS: (id: string) => `/sections/${id}/status`,
  },

  // --- Units ---
  UNIT: {
    BASE: "/units",
    DETAIL: (id: string) => `/units/${id}`,
    UPDATE: (id: string) => `/units/${id}`,
    DELETE: (id: string) => `/units/${id}`,
    UPDATE_STATUS: (id: string) => `/units/${id}/status`,
  },

  // --- Get Tree By License ---
  GET_TREE_BY_LICENSE: (licenseId: string) =>
    `/company-licenses/companies-with-relations/${licenseId}`,
};
