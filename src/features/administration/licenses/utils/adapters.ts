import {
  ApiLicense,
  License,
  CreateLicenseDto,
  UpdateLicenseDto,
  ModuleCompanyLicense,
  RenewLicenseDto, // Asegúrate que este tipo esté definido en model/license.ts si aplica
} from "../../../../model/license"; // <- Importa desde model
import {
  RenewLicenseFormData,
  LicenseFormData,
} from "../schemas/licenseSchema"; // Importa tipos de Zod

/**
 * Formatea una fecha ISO o Date a 'YYYY-MM-DD' para inputs tipo date.
 * Devuelve una cadena vacía si la entrada es inválida.
 */
export const formatDateForInput = (
  dateString: string | Date | undefined | null
): string => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    // Comprobar si la fecha es válida
    if (isNaN(date.getTime())) return "";
    // Ajustar por zona horaria para evitar problemas de día anterior/posterior
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().split("T")[0];
  } catch (e) {
    console.error("Error formateando fecha para input:", e);
    return "";
  }
};

/**
 * Formatea una fecha ISO o 'YYYY-MM-DD' a un formato legible (ej: DD/MM/YYYY).
 * Devuelve una cadena vacía si la entrada es inválida.
 */
export const formatDateForDisplay = (
  dateString: string | Date | undefined | null
): string => {
  if (!dateString) return "";
  try {
    // Intenta parsear, maneja ambos ISO y YYYY-MM-DD
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    // Para mostrar, no necesitamos el ajuste de zona horaria necesariamente, depende del requisito
    // const adjustedDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000); // Ajuste para mostrar día correcto
    return date.toLocaleDateString("es-ES", {
      // es-ES usa DD/MM/YYYY
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch (e) {
    console.error("Error formateando fecha para display:", e);
    return "";
  }
};

/**
 * Función auxiliar para extraer los nombres de los módulos principales
 * a partir de los módulos de la licencia
 */
export const extractMainModules = (
  modulesLicence?: ModuleCompanyLicense[]
): string[] => {
  if (!modulesLicence || modulesLicence.length === 0) return [];

  const moduleNames = modulesLicence.map((ml) => ml.module.name);
  const mainModules = [
    "panel_monitoreo",
    "empleados",
    "control_tiempo",
    "control_acceso",
    "comedor",
    "reportes",
  ];
  const foundMainModules = new Set<string>(); // Usar Set para evitar duplicados

  mainModules.forEach((main) => {
    if (moduleNames.includes(main)) {
      foundMainModules.add(main);
    }
  });

  // Mapeo de hijos a padres para inferir módulos principales
  const moduleMapping: Record<string, string> = {
    gestion_empleados: "empleados", // Asumiendo que gestión_empleados implica empleados
    planificador_horarios: "control_tiempo",
    gestion_incidencias: "control_tiempo",
    calendario: "control_tiempo",
    visitantes: "control_acceso",
    permisos_acceso: "control_acceso",
    reportes_mas_usados: "reportes", // Asumiendo que reportes_mas_usados implica reportes
  };

  moduleNames.forEach((name) => {
    const parentModule = moduleMapping[name];
    if (parentModule) {
      foundMainModules.add(parentModule);
    }
  });

  // Devolver como array ordenado si es necesario, o simplemente el Set convertido a array
  return Array.from(foundMainModules);
};

/**
 * Convierte una licencia de la API a nuestro formato interno de UI (License)
 */
export const apiToUiLicense = (apiLicense: ApiLicense): License => {
  const moduleIds = apiLicense.modules_licence
    ? apiLicense.modules_licence.map((ml) => ml.module.module_id)
    : apiLicense.modules || [];

  const mainModuleNames = extractMainModules(apiLicense.modules_licence);

  return {
    id: apiLicense.license_id,
    companyName: apiLicense.company_name,
    rnc: apiLicense.rnc,
    usedCompanies: apiLicense.used_companies ?? 0, // Usa ?? para default 0 si es null/undefined
    allowedCompanies: apiLicense.allowed_companies,
    activeEmployees: apiLicense.active_employees ?? 0,
    allowedEmployees: apiLicense.allowed_employees,
    expirationDate: formatDateForInput(apiLicense.expiration_date), // <- Formato YYYY-MM-DD
    modules: moduleIds,
    moduleNames: mainModuleNames,
    status: apiLicense.status ? "active" : "inactive",
    creationDate: apiLicense.creation_date || apiLicense.created_at,
    lastUpdate: apiLicense.last_update || apiLicense.updated_at,
    notes: apiLicense.notes,
    contactInfo: {
      name: apiLicense.contact_name,
      email: apiLicense.email,
      phone: apiLicense.phone,
    },
  };
};

/**
 * Convierte los datos del formulario (validados por Zod) a DTO para crear licencia
 */
export const licenseFormDataToApiCreateDto = (
  formData: LicenseFormData
): CreateLicenseDto => {
  return {
    company_name: formData.companyName,
    rnc: formData.rnc,
    expiration_date: formData.expirationDate, // Ya debería estar en YYYY-MM-DD
    allowed_companies: formData.allowedCompanies,
    allowed_employees: formData.allowedEmployees,
    contact_name: formData.contactInfo.name,
    email: formData.contactInfo.email,
    phone: formData.contactInfo.phone,
    status: formData.status === "active",
    modules: formData.modules,
    notes: formData.notes,
  };
};

/**
 * Convierte los datos del formulario (validados por Zod) a DTO para actualizar licencia
 * Nota: Este DTO debería ser Partial, pero para el envío usualmente se manda todo.
 * Si la API realmente espera solo los campos cambiados, se necesita lógica adicional.
 */
export const licenseFormDataToApiUpdateDto = (
  formData: LicenseFormData
): UpdateLicenseDto => {
  // Por simplicidad, enviamos todos los campos validados, la API debería manejarlo.
  // Si la API requiere solo campos modificados, necesitarías comparar con el estado original.
  return {
    company_name: formData.companyName,
    rnc: formData.rnc,
    expiration_date: formData.expirationDate,
    allowed_companies: formData.allowedCompanies,
    allowed_employees: formData.allowedEmployees,
    contact_name: formData.contactInfo.name,
    email: formData.contactInfo.email,
    phone: formData.contactInfo.phone,
    status: formData.status === "active",
    modules: formData.modules,
    notes: formData.notes,
  };
};

/**
 * Convierte datos del formulario de renovación a DTO para la API
 */
export const renewalFormDataToApiDto = (
  formData: RenewLicenseFormData
): RenewLicenseDto => {
  return {
    expiration_date: formData.expirationDate, // Ya debería estar en YYYY-MM-DD
    status: formData.status === "active",
  };
};
