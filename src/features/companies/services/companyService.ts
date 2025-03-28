import { makeRequest } from "../../../../services/api/apiClient";
import { COMPANY_ENDPOINTS } from "../../../../services/api/endpoints";
import { ApiCompany } from "../../../../model/organizationalStructure";

export const companyService = {
  // Ejemplo: Obtener todas las compañías (si existiera el endpoint y fuera necesario)
  async getAllCompanies(): Promise<ApiCompany[]> {
    const response = await makeRequest<ApiCompany[]>(
      "get",
      COMPANY_ENDPOINTS.BASE
    );
    if (
      response &&
      response.statusCode === 200 &&
      Array.isArray(response.data)
    ) {
      return response.data;
    }
    return [];
  },
  // Ejemplo: Actualizar datos específicos de una compañía (si /companies/{id} PUT existiera y fuera diferente de la estructura)
  /*
   async updateCompanyDetails(id: string, data: UpdateCompanyDto): Promise<ApiCompany | null> {
        const response = await makeRequest<ApiCompany>('put', COMPANY_ENDPOINTS.UPDATE(id), data);
        if (response && response.statusCode === 200 && response.data) {
            return response.data;
        }
        return null;
   }
   */
};
