import {
  ApiLicense,
  License,
  CreateLicenseDto,
  UpdateLicenseDto,
} from "../types/license";

/**
 * Convierte una licencia de la API a nuestro formato interno
 */
export const apiToUiLicense = (apiLicense: ApiLicense): License => {
  // Extraer los IDs de módulos de modules_licence si existe
  const moduleIds = apiLicense.modules_licence
    ? apiLicense.modules_licence.map((ml) => ml.module.module_id)
    : apiLicense.modules || [];

  return {
    id: apiLicense.license_id,
    companyName: apiLicense.company_name,
    rnc: apiLicense.rnc,
    usedCompanies: apiLicense.used_companies || 0,
    allowedCompanies: apiLicense.allowed_companies,
    activeEmployees: apiLicense.active_employees || 0,
    allowedEmployees: apiLicense.allowed_employees,
    expirationDate: apiLicense.expiration_date,
    modules: moduleIds,
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
