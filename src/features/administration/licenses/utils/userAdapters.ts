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
  console.log(
    "[userAdapters] Iniciando adaptación de FormData a CreateUserDto. FormData:",
    formData // Loguea los datos ANTES de procesarlos
  );

  // const now = new Date();
  const oneYearFromNowCalc = new Date();
  oneYearFromNowCalc.setFullYear(oneYearFromNowCalc.getFullYear() + 1);

  const formatDateISO = (date: Date): string => {
    return date.toISOString();
  };

  const dto: CreateUserDto = {
    usua_nomb: formData.usua_nomb,
    usua_corr: formData.usua_corr,
    usua_noco: formData.usua_noco,
    usua_stat: formData.usua_stat,
    rol_id: formData.rol_id, // Zod ya validó que es UUID si llegó aquí

    // ----- MODIFICACIÓN CLAVE -----
    // Si assignStructureLater es true, enviar NULL en lugar de "".
    // Si es false, enviar el structure_id (Zod/superRefine ya validaron que es UUID).
    structure_id: formData.assignStructureLater
      ? null // <-- Cambiado de "" a null
      : formData.structure_id ?? null, // Envía null si es undefined/null por alguna razón

    structure_type: formData.structure_type,
    company_license_id: formData.company_license_id, // Zod ya validó que es UUID

    // Incluir password solo si no está vacío
    ...(formData.password && { password: formData.password }),

    // Fechas
    usua_fein: formData.usua_fein
      ? formData.usua_fein
      : formatDateISO(new Date()),
    usua_fevc: formData.usua_fevc
      ? formData.usua_fevc
      : formatDateISO(oneYearFromNowCalc),
    usua_feve: formData.usua_feve
      ? formData.usua_feve
      : formatDateISO(oneYearFromNowCalc),
  };

  // Verifica si la contraseña es requerida y no está presente
  if (!dto.password) {
    console.warn(
      "[userAdapters] Contraseña no proporcionada en formData para creación. Asegúrate de que la API no la requiera estrictamente o asigna un valor por defecto si es necesario."
    );
    // Si la API falla por falta de contraseña:
    // throw new Error("La contraseña es requerida para crear un usuario.");
  }

  // Log final del DTO antes de enviarlo
  console.log(
    "[userAdapters] DTO final a enviar a la API (intentando structure_id: null):",
    JSON.stringify(dto, null, 2) // Muestra el payload exacto
  );

  // Nota: Si la API no acepta `null` y prefiere que el campo se omita por completo,
  // necesitaríamos eliminar la clave `structure_id` del DTO en lugar de asignarle `null`.
  // Ejemplo para omitir si es null:
  // if (dto.structure_id === null) {
  //   delete dto.structure_id;
  // }

  return dto;
};

/**
 * (Opcional) Convierte un usuario de la API al formato del formulario (si necesitaras editar)
 */
export const apiUserToFormData = (
  apiUser: ApiUser,
  licenseInfo: LicenseInfoForUserForm
): UserFormData => {
  console.log("[userAdapters] Adaptando ApiUser a FormData:", apiUser); // DEBUG
  const userStructure = apiUser.userStructures?.[0];

  // Asegurarse de que las fechas de la API (si existen) estén en formato string ISO
  const formatApiDate = (
    date: string | Date | undefined | null
  ): string | undefined => {
    if (!date) return undefined;
    try {
      return new Date(date).toISOString();
    } catch (e) {
      console.error(`error ${e}`);
      console.warn("Fecha inválida recibida de la API:", date);
      return undefined;
    }
  };

  const formData: UserFormData = {
    usua_nomb: apiUser.usua_nomb || "",
    usua_corr: apiUser.usua_corr || "",
    usua_noco: apiUser.usua_noco || "",
    password: "", // Nunca precargar contraseña
    // Convertir fechas de API a string ISO si es necesario
    usua_fein: formatApiDate(apiUser.usua_fein),
    usua_fevc: formatApiDate(apiUser.usua_fevc),
    usua_feve: formatApiDate(apiUser.usua_feve),
    usua_stat: apiUser.usua_stat ?? true,
    rol_id: apiUser.rol_id || "",
    structure_id: userStructure?.structure_id || "",
    structure_type:
      (userStructure?.structure_type as UserFormData["structure_type"]) ||
      "company",
    company_license_id: userStructure?.company_license_id || licenseInfo.id,
    assignStructureLater: !userStructure?.structure_id,
  };
  console.log("[userAdapters] FormData resultante:", formData); // DEBUG
  return formData;
};
