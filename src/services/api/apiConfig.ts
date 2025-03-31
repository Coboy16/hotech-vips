const API_URL = "/api";

// Configuración base de la API
export const apiConfig = {
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

console.log("[apiConfig] API Base URL:", apiConfig.baseURL);
