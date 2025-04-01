import {
  UserFormData,
  StructureType,
  structureTypeEnum,
} from "../schemas/userSchema"; // Importar StructureType
import {
  CreateUserDto,
  ApiUser,
  LicenseInfoForUserForm,
  UserPermissionDtoEntry,
} from "../../../../model/user";
import { ModuleCompanyLicense } from "../../../../model/license";

/**
 * Convierte los datos del FORMULARIO (UserFormData) al DTO para CREAR un usuario (CreateUserDto).
 * **REVISADO:** Implementa la lógica especial para structure_id cuando el tipo es 'company'.
 */
export const formDataToApiCreateDto = (
  formData: UserFormData,
  originalLicenseModules: ModuleCompanyLicense[]
): CreateUserDto => {
  console.log(
    "[userAdapters] formDataToApiCreateDto - Input FormData:",
    formData
  );

  const oneYearFromNowCalc = new Date();
  oneYearFromNowCalc.setFullYear(oneYearFromNowCalc.getFullYear() + 1);
  const formatDateISO = (date: Date): string => date.toISOString();

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

  if (formData.password && formData.password.trim() !== "") {
    dto.password = formData.password;
  }

  if (formData.userPermissions && formData.userPermissions.length > 0) {
    const selectedOriginalModules = originalLicenseModules.filter((licModule) =>
      formData.userPermissions.includes(licModule.module.module_id)
    );
    dto.userPermissions = selectedOriginalModules.map(
      (origModule) =>
        ({
          module_company_license_id: origModule.module_company_license_id,
          module: {
            name: origModule.module.name,
            module_id: origModule.module.module_id,
          },
        } as UserPermissionDtoEntry)
    );
  }

  // --- MANEJO DE ESTRUCTURA REVISADO ---
  if (formData.assignStructureLater) {
    // CASO 1: Asignar más tarde
    dto.structure_id = null;
    dto.structure_type = undefined; // Usar undefined en lugar de null
    dto.userStructures = [];
    console.log(
      `[userAdapters] Assign structure later: structure_id=null, structure_type=null, userStructures=[]`
    );
  } else {
    // CASO 2: Asignar ahora
    const selectedType = formData.structure_type as StructureType | ""; // Castear para seguridad
    dto.structure_type = selectedType || undefined; // Enviar tipo o undefined si está vacío

    // *** REGLA ESPECIAL: Si el tipo es 'company', usar license_id ***
    if (selectedType === "company") {
      // IMPORTANTE: Usar el ID de la licencia que viene en formData
      dto.structure_id = formData.company_license_id;
      console.log(
        `[userAdapters] Specific structure (COMPANY): structure_id=${dto.structure_id} (using license ID), structure_type=${dto.structure_type}`
      );
    }
    // *** Para otros tipos, usar el ID seleccionado en el form ***
    else if (formData.structure_id) {
      dto.structure_id = formData.structure_id; // ID de sede, depto, etc.
      console.log(
        `[userAdapters] Specific structure (Other: ${selectedType}): structure_id=${dto.structure_id} (from form selection), structure_type=${dto.structure_type}`
      );
    }
    // *** Fallback: Si no es 'company' y no hay ID (inesperado si la validación funciona) ***
    else {
      dto.structure_id = null;
      console.warn(
        `[userAdapters] Assigning now, but structure_id is missing for type ${selectedType}. Sending null.`
      );
    }
    // No enviar userStructures: [] cuando se asigna una estructura específica
  }

  console.log(
    "[userAdapters] formDataToApiCreateDto - Final DTO:",
    JSON.stringify(dto, null, 2)
  );
  return dto as CreateUserDto;
};

// --- Adaptador apiUserToFormData (Sin cambios funcionales necesarios) ---
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

  const formData: UserFormData = {
    usua_nomb: apiUser.usua_nomb || "",
    usua_corr: apiUser.usua_corr || "",
    usua_noco: apiUser.usua_noco || "",
    password: "",
    usua_fein: formatApiDateForInput(apiUser.usua_fein),
    usua_fevc: formatApiDateForInput(apiUser.usua_fevc),
    usua_feve: formatApiDateForInput(apiUser.usua_feve),
    usua_stat: apiUser.usua_stat ?? true,
    rol_id: apiUser.rol_id || "",
    userPermissions:
      apiUser.userPermissions
        ?.map((p) => p.module?.module_id)
        .filter((id): id is string => !!id) || [],
    structure_id: userStructureInfo?.structure_id || "",
    // Asegurar que el tipo es válido o vacío
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
