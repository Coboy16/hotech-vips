import {
  ApiLicense,
  License,
  CreateLicenseDto,
  UpdateLicenseDto,
  ModuleCompanyLicense,
} from "../types/license";

/**
 * Función auxiliar para extraer los nombres de los módulos principales
 * a partir de los módulos de la licencia
 */
export const extractMainModules = (
  modulesLicence?: ModuleCompanyLicense[]
): string[] => {
  if (!modulesLicence || modulesLicence.length === 0) return [];

  // Mapeamos los nombres de los módulos
  const moduleNames = modulesLicence.map((ml) => ml.module.name);

  // Lista de identificadores de módulos principales que queremos extraer
  const mainModules = [
    "panel_monitoreo",
    "empleados",
    "control_tiempo",
    "control_acceso",
    "comedor",
    "reportes",
  ];

  // Filtramos para obtener solo los módulos principales
  const foundMainModules = mainModules.filter((main) =>
    moduleNames.includes(main)
  );

  // También extraemos los módulos hijos que indican la presencia de un módulo principal
  const moduleMapping: Record<string, string> = {
    planificador_horarios: "control_tiempo",
    gestion_incidencias: "control_tiempo",
    calendario: "control_tiempo",
    visitantes: "control_acceso",
    permisos_acceso: "control_acceso",
  };

  // Verificamos módulos hijos para incluir sus padres
  moduleNames.forEach((name) => {
    if (
      moduleMapping[name] &&
      !foundMainModules.includes(moduleMapping[name])
    ) {
      foundMainModules.push(moduleMapping[name]);
    }
  });

  return foundMainModules;
};

/**
 * Convierte una licencia de la API a nuestro formato interno
 */
const fixTimeZoneIssue = (dateString: string | number | Date) => {
  if (!dateString) return "";

  // Crear una fecha desde el string y asegurarse de que se interprete en la zona horaria local
  const date = new Date(dateString);

  // Crear una nueva fecha con los componentes explícitos para evitar
  // la conversión automática de zona horaria que causa el problema de un día anterior
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  return new Date(year, month, day).toISOString();
};

export const formatDateDisplay = (dateString: string | number | Date) => {
  if (!dateString) return "";

  // Crear una fecha desde el string ISO
  const date = new Date(dateString);

  // Formatear la fecha para mostrar en la interfaz
  return date.toLocaleDateString("es-ES"); // Adaptar al formato deseado
};

export const apiToUiLicense = (apiLicense: ApiLicense): License => {
  // Extraer los IDs de módulos de modules_licence si existe
  const moduleIds = apiLicense.modules_licence
    ? apiLicense.modules_licence.map((ml) => ml.module.module_id)
    : apiLicense.modules || [];

  // Extraer los nombres de los módulos principales
  const mainModuleNames = extractMainModules(apiLicense.modules_licence);

  return {
    id: apiLicense.license_id,
    companyName: apiLicense.company_name,
    rnc: apiLicense.rnc,
    usedCompanies: apiLicense.used_companies || 0,
    allowedCompanies: apiLicense.allowed_companies,
    activeEmployees: apiLicense.active_employees || 0,
    allowedEmployees: apiLicense.allowed_employees,
    expirationDate: fixTimeZoneIssue(apiLicense.expiration_date),
    modules: moduleIds,
    moduleNames: mainModuleNames, // Añadimos los nombres de los módulos principales
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
 * Convierte una licencia de nuestro formato interno a formato de la API para crear
 */
export const uiToApiCreateLicense = (
  uiLicense: Partial<License>
): CreateLicenseDto => {
  return {
    company_name: uiLicense.companyName || "",
    rnc: uiLicense.rnc || "",
    expiration_date: uiLicense.expirationDate || "",
    allowed_companies: uiLicense.allowedCompanies || 1,
    allowed_employees: uiLicense.allowedEmployees || 100,
    contact_name: uiLicense.contactInfo?.name || "",
    email: uiLicense.contactInfo?.email || "",
    phone: uiLicense.contactInfo?.phone || "",
    status: uiLicense.status === "active",
    modules: uiLicense.modules || [],
    notes: uiLicense.notes,
  };
};

/**
 * Convierte una licencia de nuestro formato interno a formato de la API para actualizar
 */
export const uiToApiUpdateLicense = (
  uiLicense: Partial<License>
): UpdateLicenseDto => {
  // Creamos un objeto base
  const apiLicense: UpdateLicenseDto = {};

  // Solo incluimos los campos que existen en la licencia de UI
  if (uiLicense.companyName !== undefined)
    apiLicense.company_name = uiLicense.companyName;
  if (uiLicense.rnc !== undefined) apiLicense.rnc = uiLicense.rnc;
  if (uiLicense.expirationDate !== undefined)
    apiLicense.expiration_date = uiLicense.expirationDate;
  if (uiLicense.allowedCompanies !== undefined)
    apiLicense.allowed_companies = uiLicense.allowedCompanies;
  if (uiLicense.allowedEmployees !== undefined)
    apiLicense.allowed_employees = uiLicense.allowedEmployees;
  if (uiLicense.status !== undefined)
    apiLicense.status = uiLicense.status === "active";
  if (uiLicense.modules !== undefined) apiLicense.modules = uiLicense.modules;
  if (uiLicense.notes !== undefined) apiLicense.notes = uiLicense.notes;

  // Añadimos la información de contacto si existe
  if (uiLicense.contactInfo) {
    if (uiLicense.contactInfo.name !== undefined)
      apiLicense.contact_name = uiLicense.contactInfo.name;
    if (uiLicense.contactInfo.email !== undefined)
      apiLicense.email = uiLicense.contactInfo.email;
    if (uiLicense.contactInfo.phone !== undefined)
      apiLicense.phone = uiLicense.contactInfo.phone;
  }

  return apiLicense;
};
