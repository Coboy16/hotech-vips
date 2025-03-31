import axios, { AxiosInstance, AxiosRequestConfig, Method } from "axios";
import { apiConfig } from "./apiConfig";
import { applyInterceptors } from "./apiInterceptors";
import { ApiResponse } from "./types";

// Asegurarnos de que la URL base esté correcta
const cleanBaseURL = apiConfig.baseURL.replace(/"/g, "");
console.log("[apiClient] URL Base limpia:", cleanBaseURL);

// Crear configuración limpia
const cleanConfig = {
  ...apiConfig,
  baseURL: cleanBaseURL,
};

// Crear instancia de Axios con configuración base limpia
const axiosInstance: AxiosInstance = axios.create(cleanConfig);

// Aplicar interceptores a la instancia
applyInterceptors(axiosInstance);

/**
 * Función genérica para realizar peticiones HTTP usando la instancia configurada de Axios.
 * Maneja la inyección del token y el manejo básico de errores.
 */
export async function makeRequest<T = unknown>(
  method: Method,
  url: string,
  data?: unknown,
  params?: unknown,
  options?: AxiosRequestConfig
): Promise<ApiResponse<T> | null> {
  try {
    console.log(
      `[makeRequest] Iniciando petición: ${method.toUpperCase()} ${url} a ${cleanBaseURL}${url}`,
      { data, params }
    );

    // Construir la configuración de la solicitud
    const config: AxiosRequestConfig = {
      method,
      url,
      data: data,
      params: params,
      ...options, // Permite sobreescribir o añadir configuración específica
    };

    // Realizar la petición usando la instancia de Axios
    const response = await axiosInstance.request<ApiResponse<T>>(config);

    console.log(
      `[makeRequest] Respuesta recibida para ${method.toUpperCase()} ${url}:`,
      {
        status: response.status,
      }
    );

    // Devolver la estructura completa de la respuesta de la API
    return response.data;
  } catch (error) {
    console.error(
      `[makeRequest] Error en petición ${method.toUpperCase()} ${url}:`,
      error
    );
    return null;
  }
}

// Exportar la instancia de Axios si necesitas usarla directamente en algún caso excepcional
export const apiClient = axiosInstance;

// Exportar la función makeRequest como principal forma de interactuar
export default makeRequest;
