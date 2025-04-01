import { UserFormData } from "../schemas/userSchema";
import {
  CreateUserDto,
  ApiUser,
  LicenseInfoForUserForm,
} from "../../../../model/user";

/**
 * Convierte los datos del formulario (validados por Zod) al DTO esperado por la API de registro.
 */
export const formDataToApiCreateDto = (
  formData: UserFormData
): CreateUserDto => {
  const dto: CreateUserDto = {
    usua_nomb: formData.usua_nomb,
    usua_corr: formData.usua_corr,
    usua_noco: formData.usua_noco,
    usua_stat: formData.usua_stat,
    rol_id: formData.rol_id,
    // Si assignStructureLater es true, enviar "", de lo contrario enviar el ID seleccionado (asegurando que no sea null/undefined)
    structure_id: formData.assignStructureLater
      ? ""
      : formData.structure_id ?? "",
    structure_type: formData.structure_type,
    company_license_id: formData.company_license_id,
    // Incluir password solo si no está vacío
    ...(formData.password && { password: formData.password }),
    // Fechas no incluidas, asumimos que la API las maneja o no son necesarias al crear
  };
  return dto;
};

/**
 * (Opcional) Convierte un usuario de la API al formato del formulario (si necesitaras editar)
 */
export const apiUserToFormData = (
  apiUser: ApiUser,
  licenseInfo: LicenseInfoForUserForm
): UserFormData => {
  const userStructure = apiUser.userStructures?.[0];

  return {
    usua_nomb: apiUser.usua_nomb || "",
    usua_corr: apiUser.usua_corr || "",
    usua_noco: apiUser.usua_noco || "",
    password: "",
    usua_stat: apiUser.usua_stat ?? true,
    rol_id: apiUser.rol_id || "",
    structure_id: userStructure?.structure_id || "",
    structure_type:
      (userStructure?.structure_type as UserFormData["structure_type"]) ||
      "company",
    company_license_id: userStructure?.company_license_id || licenseInfo.id,
    assignStructureLater: !userStructure?.structure_id, // Marcar si no tiene estructura inicial
  };
};
