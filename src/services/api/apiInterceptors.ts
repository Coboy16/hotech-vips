import {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import { tokenStorage } from "../../features/auth/utils/tokenStorage"; // Ajusta la ruta si es necesario
import { handleApiError } from "./apiErrorHandler";

/**
 * Interceptor de solicitud: Añade el token de autenticación si existe.
 */
const requestInterceptor = (
  config: InternalAxiosRequestConfig
): InternalAxiosRequestConfig => {
  const token = tokenStorage.getToken();
  console.log("[Interceptor Request] Verificando token..."); // Log

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log(
      "[Interceptor Request] Token añadido a la cabecera Authorization."
    ); // Log
  } else {
    console.log("[Interceptor Request] No hay token o cabeceras no definidas."); // Log
  }

  // Podrías añadir otros headers comunes aquí si es necesario
  // config.headers['X-Custom-Header'] = 'valor';

  return config;
};

/**
 * Interceptor de respuesta: Procesa respuestas exitosas y maneja errores.
 */
const responseInterceptor = (response: AxiosResponse): AxiosResponse => {
  // Procesa respuestas exitosas si es necesario
  // Por ejemplo, podrías normalizar la estructura de datos aquí, aunque es mejor hacerlo en el servicio específico
  console.log("[Interceptor Response] Respuesta recibida:", {
    status: response.status,
    // data: response.data // Descomentar con precaución, puede ser muy verboso
  });
  // Simplemente retornamos la respuesta si es exitosa (2xx)
  return response;
};

/**
 * Interceptor de errores: Maneja errores de red o respuestas con códigos de error.
 */
const errorInterceptor = (error: AxiosError): Promise<never> => {
  // Usamos nuestro manejador de errores centralizado
  // handleApiError se encargará de mostrar el toast y loguear
  handleApiError(error);

  // Rechazamos la promesa para que el error pueda ser capturado por el .catch() de la llamada original
  // Devolvemos el error original o una estructura de error normalizada si lo prefieres
  // Devolver el error permite a la lógica del servicio/componente reaccionar si es necesario
  return Promise.reject(error);
};

/**
 * Aplica los interceptores a una instancia de Axios.
 */
export const applyInterceptors = (axiosInstance: AxiosInstance): void => {
  axiosInstance.interceptors.request.use(requestInterceptor);
  axiosInstance.interceptors.response.use(
    responseInterceptor,
    errorInterceptor
  );
  console.log(
    "[Interceptors] Interceptores de solicitud y respuesta aplicados."
  ); // Log
};
