import {
  UserFormData,
  StructureType,
  structureTypeEnum,
} from "../schemas/userSchema";
import { LicenseInfoForUserForm } from "../../../../model/user";
import { ApiUser, CreateUserDto } from "../types/user";

/**
 * Convierte los datos del FORMULARIO (UserFormData) al DTO para CREAR un usuario (CreateUserDto).
 * **REVISADO:** Envía `modules: string[]` en lugar de `userPermissions`.
 * **REVISADO:** Ya no necesita `originalLicenseModules`.
 */
export const formDataToApiCreateDto = (
  formData: UserFormData
  // originalLicenseModules: ModuleCompanyLicense[] // <- Parámetro eliminado
): CreateUserDto => {
  console.log(
    "[userAdapters] formDataToApiCreateDto - Input FormData:",
    formData
  );

  const oneYearFromNowCalc = new Date();
  oneYearFromNowCalc.setFullYear(oneYearFromNowCalc.getFullYear() + 1);
  const formatDateISO = (date: Date): string => date.toISOString();

  // Usar Partial para construir gradualmente, luego castear
  const dto: Partial<CreateUserDto> = {
    usua_nomb: formData.usua_nomb,
    usua_corr: formData.usua_corr,
    usua_noco: formData.usua_noco,
    usua_stat: formData.usua_stat,
    rol_id: formData.rol_id,
    company_license_id: formData.company_license_id,
    usua_fein: formData.usua_fein || formatDateISO(new Date()),
    usua_fevc: formData.usua_fevc || formatDateISO(oneYearFromNowCalc),
    usua_feve: formData.usua_feve || formatDateISO(oneYearFromNowCalc),
  };

  // Incluir contraseña solo si se proporcionó
  if (formData.password && formData.password.trim() !== "") {
    dto.password = formData.password;
  }

  // --- MANEJO DE MÓDULOS (NUEVO) ---
  // Directamente asignar el array de IDs desde formData.userPermissions
  // Zod asegura que userPermissions es un array (por defecto [])
  dto.modules = formData.userPermissions;
  console.log("[userAdapters] Asignando modules:", dto.modules);

  /* --- SECCIÓN ANTERIOR DE USERPERMISSIONS (ELIMINADA) ---
  if (formData.userPermissions && formData.userPermissions.length > 0) {
    // ... lógica compleja que usaba originalLicenseModules ...
    // dto.userPermissions = ... ;
  }
  */

  // --- MANEJO DE ESTRUCTURA (SIN CAMBIOS EN LA LÓGICA) ---
  if (formData.assignStructureLater) {
    dto.structure_id = null;
    dto.structure_type = undefined;
    // dto.userStructures = []; // Opcional, depende de la API
    console.log(
      `[userAdapters] Assign structure later: structure_id=null, structure_type=undefined`
    );
  } else {
    const selectedType = formData.structure_type as StructureType | "";
    dto.structure_type = selectedType || undefined;

    if (selectedType === "company") {
      dto.structure_id = formData.company_license_id;
      console.log(
        `[userAdapters] Specific structure (COMPANY): structure_id=${dto.structure_id} (using license ID), structure_type=${dto.structure_type}`
      );
    } else if (formData.structure_id) {
      dto.structure_id = formData.structure_id;
      console.log(
        `[userAdapters] Specific structure (Other: ${selectedType}): structure_id=${dto.structure_id} (from form selection), structure_type=${dto.structure_type}`
      );
    } else {
      dto.structure_id = null; // Fallback si falta ID (validación debería prevenir)
      console.warn(
        `[userAdapters] Assigning now, but structure_id is missing for type ${selectedType}. Sending null.`
      );
    }
  }

  console.log(
    "[userAdapters] formDataToApiCreateDto - Final DTO:",
    JSON.stringify(dto, null, 2)
  );
  // Castear a CreateUserDto al final
  return dto as CreateUserDto;
};

// --- Adaptador apiUserToFormData (Sin cambios necesarios para ESTE requerimiento) ---
export const apiUserToFormData = (
  apiUser: ApiUser,
  licenseInfo: LicenseInfoForUserForm
): UserFormData => {
  console.log("[userAdapters] apiUserToFormData - Input ApiUser:", apiUser);
  const userStructureInfo = apiUser.userStructures?.[0] || {
    structure_id: apiUser.structure_id,
    structure_type: apiUser.structure_type,
  };
  const formatApiDateForInput = (
    date: string | Date | undefined | null
  ): string => {
    if (!date) return "";
    try {
      const d = date instanceof Date ? date : new Date(date);
      if (isNaN(d.getTime())) return "";
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      return d.toISOString().split("T")[0];
    } catch (e) {
      console.warn("[userAdapters] Invalid date:", date, e);
      return "";
    }
  };

  // Al convertir *DESDE* la API *HACIA* el formulario, seguimos extrayendo los IDs
  // de los módulos desde `apiUser.userPermissions` (si la API los devuelve así al GET user)
  // y los ponemos en `formData.userPermissions`. Si la API devolviera un campo `modules`
  // directamente en el GET user, ajustaríamos aquí.
  const moduleIdsFromApi =
    apiUser.userPermissions
      ?.map((p) => p.module?.module_id)
      .filter((id): id is string => !!id) || [];

  const formData: UserFormData = {
    usua_nomb: apiUser.usua_nomb || "",
    usua_corr: apiUser.usua_corr || "",
    usua_noco: apiUser.usua_noco || "",
    password: "", // Siempre vacío al cargar
    usua_fein: formatApiDateForInput(apiUser.usua_fein),
    usua_fevc: formatApiDateForInput(apiUser.usua_fevc),
    usua_feve: formatApiDateForInput(apiUser.usua_feve),
    usua_stat: apiUser.usua_stat ?? true,
    rol_id: apiUser.rol_id || "",
    // El formulario sigue usando el campo 'userPermissions' para los IDs seleccionados
    userPermissions: moduleIdsFromApi,
    structure_id: userStructureInfo?.structure_id || "",
    structure_type: (structureTypeEnum.safeParse(
      userStructureInfo?.structure_type
    ).success
      ? userStructureInfo.structure_type
      : "") as StructureType | "",
    company_license_id: apiUser.company_license_id || licenseInfo.id,
    assignStructureLater: !userStructureInfo?.structure_id,
  };
  console.log(
    "[userAdapters] apiUserToFormData - Resulting FormData:",
    formData
  );
  return formData;
};
