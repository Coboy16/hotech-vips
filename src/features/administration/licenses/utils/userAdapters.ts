import { UserFormData } from "../schemas/userSchema";
import {
  CreateUserDto,
  ApiUser, // Asegúrate que ApiUser esté definido correctamente en model/user.ts
  LicenseInfoForUserForm,
  UserPermissionDtoEntry, // Asegúrate que esté definido en model/user.ts
} from "../../../../model/user";
import { ModuleCompanyLicense } from "../../../../model/license"; // Tipo de los módulos originales

/**
 * Convierte los datos del FORMULARIO (UserFormData) al DTO para CREAR un usuario (CreateUserDto).
 * Necesita los módulos originales de la licencia para construir 'userPermissions' correctamente.
 */
export const formDataToApiCreateDto = (
  formData: UserFormData,
  originalLicenseModules: ModuleCompanyLicense[] // Módulos originales [{ module_company_license_id, module: {...} }, ...]
): CreateUserDto => {
  console.log(
    "[userAdapters] formDataToApiCreateDto - Input FormData:",
    formData
  );
  console.log(
    "[userAdapters] formDataToApiCreateDto - Input originalLicenseModules:",
    originalLicenseModules
  );

  const oneYearFromNowCalc = new Date();
  oneYearFromNowCalc.setFullYear(oneYearFromNowCalc.getFullYear() + 1);
  const formatDateISO = (date: Date): string => date.toISOString();

  // 1. Construir el DTO base (campos siempre presentes)
  // Usamos Partial<> temporalmente para añadir campos opcionales/condicionales
  const dto: Partial<CreateUserDto> = {
    usua_nomb: formData.usua_nomb,
    usua_corr: formData.usua_corr,
    usua_noco: formData.usua_noco,
    usua_stat: formData.usua_stat,
    rol_id: formData.rol_id,
    company_license_id: formData.company_license_id,
    // Fechas (con defaults si el formulario las deja vacías)
    // El schema ahora permite "", así que usamos || para el default.
    usua_fein: formData.usua_fein || formatDateISO(new Date()),
    usua_fevc: formData.usua_fevc || formatDateISO(oneYearFromNowCalc),
    usua_feve: formData.usua_feve || formatDateISO(oneYearFromNowCalc),
  };

  // 2. Añadir contraseña (si se proporcionó)
  if (formData.password && formData.password.trim() !== "") {
    dto.password = formData.password;
  }

  // 3. Construir/Omitir 'userPermissions' según el formato complejo esperado
  if (formData.userPermissions && formData.userPermissions.length > 0) {
    // Filtrar los módulos completos de la licencia original usando los IDs seleccionados en el form
    const selectedOriginalModules = originalLicenseModules.filter((licModule) =>
      formData.userPermissions.includes(licModule.module.module_id)
    );

    // Mapear al formato complejo [{ module_company_license_id, module: { name, module_id } }, ...]
    dto.userPermissions = selectedOriginalModules.map(
      (origModule) =>
        ({
          module_company_license_id: origModule.module_company_license_id,
          module: {
            name: origModule.module.name,
            module_id: origModule.module.module_id,
          },
        } as UserPermissionDtoEntry)
    ); // Asegurar el tipo aquí

    console.log(
      "[userAdapters] formDataToApiCreateDto - Constructed userPermissions:",
      dto.userPermissions
    );
  } else {
    // Si no hay permisos seleccionados, OMITIR la clave userPermissions del DTO
    console.log(
      "[userAdapters] formDataToApiCreateDto - No permissions selected, omitting userPermissions key."
    );
    // delete dto.userPermissions; // Ya no está en el dto parcial inicial
  }

  // 4. Manejar 'structure_id' y 'userStructures'
  if (formData.assignStructureLater || !formData.structure_id) {
    // Si se asigna más tarde O no hay ID seleccionado
    dto.structure_id = null; // El ID específico es null
    dto.userStructures = []; // Enviar array vacío, como en tu JSON de ejemplo
    // Mantener u omitir structure_type? Lo mantenemos por ahora.
    dto.structure_type = formData.structure_type;
    console.log(
      "[userAdapters] formDataToApiCreateDto - No structure: structure_id=null, userStructures=[]"
    );
  } else {
    // Si se asigna una estructura específica
    dto.structure_id = formData.structure_id; // Enviar el ID seleccionado
    dto.structure_type = formData.structure_type; // Enviar el tipo seleccionado
    // NO enviar userStructures: [] en este caso (basado en la diferencia entre tus JSON)
    console.log(
      "[userAdapters] formDataToApiCreateDto - Structure selected: structure_id=",
      dto.structure_id
    );
  }

  // 5. Log final y conversión de tipo
  console.log(
    "[userAdapters] formDataToApiCreateDto - Final DTO:",
    JSON.stringify(dto, null, 2)
  );
  // Convertimos el objeto parcial al tipo completo CreateUserDto.
  // TypeScript confiará en que hemos añadido todos los campos requeridos.
  return dto as CreateUserDto;
};

// =========================================================================
// Función Opcional: Convertir datos de la API (ApiUser) al formato del Formulario (UserFormData)
// Útil si implementas la EDICIÓN de usuarios.
// =========================================================================
export const apiUserToFormData = (
  apiUser: ApiUser, // <--- PARÁMETRO REQUERIDO
  licenseInfo: LicenseInfoForUserForm
): UserFormData => {
  console.log("[userAdapters] apiUserToFormData - Input ApiUser:", apiUser);
  const userStructure = apiUser.userStructures?.[0]; // Asume que la API devuelve la estructura aquí

  // Función interna para formatear fechas de la API a YYYY-MM-DD para inputs
  const formatApiDateForInput = (
    date: string | Date | undefined | null
  ): string => {
    if (!date) return "";
    try {
      const d = date instanceof Date ? date : new Date(date);
      if (isNaN(d.getTime())) return ""; // Fecha inválida
      // Ajustar por zona horaria local para evitar problemas de día +/- 1
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      return d.toISOString().split("T")[0];
    } catch (e) {
      console.warn(
        "[userAdapters] apiUserToFormData - Invalid date from API:",
        date,
        e
      );
      return "";
    }
  };

  // Construir los datos para el formulario
  const formData: UserFormData = {
    usua_nomb: apiUser.usua_nomb || "",
    usua_corr: apiUser.usua_corr || "",
    usua_noco: apiUser.usua_noco || "",
    password: "", // NUNCA precargar la contraseña en el formulario
    usua_fein: formatApiDateForInput(apiUser.usua_fein),
    usua_fevc: formatApiDateForInput(apiUser.usua_fevc),
    usua_feve: formatApiDateForInput(apiUser.usua_feve),
    usua_stat: apiUser.usua_stat ?? true, // Default a true si no viene
    rol_id: apiUser.rol_id || "",

    // Extraer SOLO los IDs de los módulos para el estado del formulario
    // El componente UserModuleSelector solo necesita los IDs para marcar los checkboxes
    userPermissions:
      apiUser.userPermissions
        ?.map((p) => p.module.module_id)
        .filter((id) => !!id) || [],

    // Datos de estructura
    structure_id: userStructure?.structure_id || "", // El ID específico de la estructura
    structure_type:
      (userStructure?.structure_type as UserFormData["structure_type"]) ||
      "company", // El tipo
    company_license_id: apiUser.company_license_id || licenseInfo.id, // La licencia padre
    assignStructureLater: !userStructure?.structure_id, // Marcar si no tiene estructura asignada
  };

  console.log(
    "[userAdapters] apiUserToFormData - Resulting FormData:",
    formData
  );
  return formData;
};
