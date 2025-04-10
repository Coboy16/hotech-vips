import {
  UserFormData,
  StructureType,
  structureTypeEnum, // Importar el enum de Zod
} from "../schemas/userSchema";
import { LicenseInfoForUserForm } from "../../../../model/user";
// FIX: Asegúrate que User tenga TODOS los campos necesarios (rol_id, structure_id, etc.)
import { User } from "../types/user";
import { mapStructureType } from "./structureTypeMapper";

/**
 * Convierte los datos del FORMULARIO (UserFormData) al DTO para la API (Crear/Actualizar).
 * (Esta función parece correcta basada en tu código anterior, sin cambios aquí)
 */
export const formDataToApiDto = (
  formData: UserFormData
): Partial<UserFormData> => {
  console.log("[userAdapters] formDataToApiDto - Input FormData:", formData);

  const formatDateISO = (date?: string | Date): string | undefined => {
    if (!date) return undefined;
    try {
      const d = date instanceof Date ? date : new Date(date);
      if (isNaN(d.getTime())) return undefined;
      return d.toISOString();
    } catch (e) {
      console.warn("[userAdapters] Invalid date for ISO formatting:", date, e);
      return undefined;
    }
  };

  const dto: Partial<UserFormData> & { modules?: string[] } = {
    // Añadir modules al tipo parcial
    usua_nomb: formData.usua_nomb,
    usua_corr: formData.usua_corr,
    usua_noco: formData.usua_noco,
    usua_stat: formData.usua_stat ?? true,
    rol_id: formData.rol_id,
    company_license_id: formData.company_license_id,
    usua_fein: formatDateISO(formData.usua_fein),
    usua_fevc: formatDateISO(formData.usua_fevc),
    usua_feve: formatDateISO(formData.usua_feve),
    password:
      formData.password && formData.password.trim() !== ""
        ? formData.password
        : undefined,
    modules: formData.userPermissions || [], // Mapear desde userPermissions

    structure_type: undefined,
    structure_id: undefined,
  };

  // --- MANEJO DE ESTRUCTURA ---
  if (formData.assignStructureLater) {
    dto.structure_id = undefined;
    dto.structure_type = undefined;
  } else {
    const parsedType = structureTypeEnum.safeParse(formData.structure_type);
    if (parsedType.success && parsedType.data) {
      dto.structure_type = parsedType.data;
      if (dto.structure_type === "company" && formData.company_license_id) {
        dto.structure_id = formData.company_license_id;
      } else if (formData.structure_id) {
        dto.structure_id = formData.structure_id;
      } else {
        dto.structure_id = undefined;
      }
    } else {
      dto.structure_type = undefined;
      dto.structure_id = undefined;
    }
  }

  // Limpiar campos undefined (opcional)
  Object.keys(dto).forEach((key) => {
    const typedKey = key as keyof typeof dto;
    if (dto[typedKey] === undefined) {
      delete dto[typedKey];
    }
  });

  console.log(
    "[userAdapters] formDataToApiDto - Final DTO:",
    JSON.stringify(dto, null, 2)
  );
  // Eliminar 'modules' antes de retornar si la API no lo espera directamente en UserFormData
  // delete dto.modules; // Descomentar si es necesario
  return dto;
};

// --- Adaptador apiUserToFormData ---
// FIX: Mapeo explícito de campos personales y manejo seguro de structure_type
export const apiUserToFormData = (
  user: User | null | undefined, // Aceptar null/undefined
  licenseInfo: LicenseInfoForUserForm
): UserFormData => {
  // --- VALORES POR DEFECTO --- (Se usarán si user es null/undefined o le faltan datos)
  const defaultValues: UserFormData = {
    usua_nomb: "",
    usua_corr: "",
    usua_noco: "",
    password: "",
    usua_stat: true,
    rol_id: "",
    structure_type: "",
    structure_id: "",
    assignStructureLater: false, // Default a false, el usuario debe elegir omitir
    userPermissions: [],
    company_license_id: licenseInfo.id,
    usua_fein: new Date().toISOString().split("T")[0],
    usua_fevc: new Date().toISOString().split("T")[0],
    usua_feve: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
      .toISOString()
      .split("T")[0],
  };

  // Si no hay usuario válido, devolver los valores por defecto
  if (!user || !user.id) {
    console.warn(
      "[userAdapters] apiUserToFormData - Recibido usuario inválido o null. Usando valores por defecto."
    );
    return defaultValues;
  }

  console.log(
    "[userAdapters] apiUserToFormData - Input User válido:",
    JSON.stringify(user)
  );

  const formatApiDateForInput = (isoDateString?: string | null): string => {
    if (!isoDateString) return "";
    try {
      const date = new Date(isoDateString);
      if (isNaN(date.getTime())) return "";
      // Devuelve YYYY-MM-DD
      return date.toISOString().split("T")[0];
    } catch (e) {
      return `error: ${e}`;
    }
  };

  // --- Validación y Mapeo de structure_type ---
  let validatedStructureType: StructureType | "" = "";
  let structureId = user.structure_id || "";

  if (user.structure_type) {
    // Usar el mapper para normalizar el tipo
    validatedStructureType = mapStructureType(user.structure_type);

    if (validatedStructureType) {
      console.log(
        `[userAdapters] Structure type validado: ${validatedStructureType}`
      );
      // Caso especial: Si el tipo es 'company', el ID *debe* ser el de la licencia
      if (validatedStructureType === "company") {
        structureId = user.company_license_id || licenseInfo.id || "";
        console.log(
          `[userAdapters] Tipo es company, usando ID de licencia: ${structureId}`
        );
      }
    } else {
      console.warn(
        `[userAdapters] Valor de structure_type inválido ('${user.structure_type}') recibido. Se establecerá como "".`
      );
      structureId = "";
    }
  } else {
    console.log("[userAdapters] No structure_type encontrado en el usuario.");
    structureId = "";
  }
  // --- Fin Validación ---

  // Determinar si se debe marcar "assignLater"
  // Se marca si NO hay un ID de estructura válido Y NO hay un tipo de estructura válido
  const assignLater = !structureId && !validatedStructureType;
  if (assignLater) {
    console.log("[userAdapters] Se marcará assignStructureLater como true.");
  }

  // --- Permisos ---
  // IMPORTANTE: Asumimos que `transformApiUserToUser` NO está poblando un array de IDs de permisos
  // en el objeto `User`. Por lo tanto, iniciamos `userPermissions` vacío aquí.
  // El `useEffect` en `UserForm` que depende de `rol_id` se encargará de
  // buscar los módulos del rol y *visualmente* seleccionarlos en el `UserModuleSelector` (read-only).
  // NO establecemos los permisos aquí para evitar sobrescribir la lógica del UserForm.
  const initialUserPermissions: string[] = [];
  console.log(
    "[userAdapters] userPermissions inicializado vacío. UserForm cargará por rol."
  );

  const formData: UserFormData = {
    // --- Mapeo Explícito de Datos Personales ---
    usua_nomb: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
    usua_corr: user.email || "",
    usua_noco: user.phone || "",
    // --- Fin Mapeo ---

    password: "", // Siempre vacío al cargar para edición
    usua_fein: formatApiDateForInput(user.startDate),
    usua_fevc: formatApiDateForInput(user.createdAt), // Ajustar si es lastLogin
    usua_feve: formatApiDateForInput(user.endDate),
    usua_stat: user.status === "active",

    // Campos que DEBEN existir en el tipo User y ser mapeados por transformApiUserToUser
    rol_id: user.rol_id || "",
    company_license_id: user.company_license_id || licenseInfo.id,

    // Permisos (inicializado vacío)
    userPermissions: initialUserPermissions,

    // --- Usar valores procesados de estructura ---
    structure_id: structureId,
    structure_type: validatedStructureType,
    assignStructureLater: assignLater,
    // --- Fin ---
  };

  console.log(
    "[userAdapters] apiUserToFormData - Resulting FormData:",
    JSON.stringify(formData)
  );
  return formData;
};
