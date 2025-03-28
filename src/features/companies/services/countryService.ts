import { makeRequest } from "../../../../services/api/apiClient";
import { COUNTRY_ENDPOINTS } from "../../../../services/api/endpoints";
import { Country } from "../../../../model/country"; // Importa desde model

// Cache simple para países
let countriesCache: Country[] | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos en milisegundos
let cacheTimestamp: number | null = null;

export const countryService = {
  /**
   * Obtiene todos los países, utilizando caché.
   * @param forceRefresh - Si es true, ignora la caché y recarga desde la API.
   */
  async getAllCountries(forceRefresh = false): Promise<Country[]> {
    const now = Date.now();

    // Verificar si la caché es válida
    if (
      !forceRefresh &&
      countriesCache &&
      cacheTimestamp &&
      now - cacheTimestamp < CACHE_DURATION
    ) {
      console.log("[CountryService] Devolviendo países desde caché.");
      return countriesCache;
    }

    console.log("[CountryService] Solicitando países a la API...");
    const response = await makeRequest<Country[]>(
      "get",
      COUNTRY_ENDPOINTS.BASE
    );

    if (
      response &&
      response.statusCode === 200 &&
      Array.isArray(response.data)
    ) {
      console.log(
        `[CountryService] ${response.data.length} países obtenidos y guardados en caché.`
      );
      countriesCache = response.data; // Actualizar caché
      cacheTimestamp = now; // Actualizar timestamp
      return response.data;
    } else {
      console.error(
        "[CountryService] Error al obtener países:",
        response?.message || "Respuesta inválida"
      );
      // En caso de error, devolver caché antigua si existe, o vacío
      return countriesCache || [];
    }
  },

  /**
   * Limpia la caché de países.
   */
  clearCache() {
    countriesCache = null;
    cacheTimestamp = null;
    console.log("[CountryService] Caché de países limpiada.");
  },

  /**
   * Obtiene un país por su ID (no suele usarse, pero se incluye por completitud).
   * No utiliza caché para obtener por ID.
   */
  async getCountryById(id: string): Promise<Country | null> {
    console.log(`[CountryService] Solicitando país con ID: ${id}`);
    const response = await makeRequest<Country>(
      "get",
      COUNTRY_ENDPOINTS.DETAIL(id) // Asume que este endpoint existe
    );

    if (
      response &&
      response.statusCode === 200 &&
      response.data &&
      !Array.isArray(response.data)
    ) {
      console.log(`[CountryService] País ${id} obtenido.`);
      return response.data;
    } else {
      console.error(
        `[CountryService] Error al obtener país ${id}:`,
        response?.message || "No encontrado"
      );
      return null;
    }
  },
};
