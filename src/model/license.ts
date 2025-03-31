// Tipos relacionados con Licencias movidos aquí

// Interfaz de la respuesta de la API (la estructura que envuelve los datos)
// Nota: ApiResponse<T> podría estar en src/services/api/types.ts si es genérico
// export interface LicenseApiResponse {
//   statusCode: number;
//   data: ApiLicense | ApiLicense[];
//   message: string;
//   error?: string;
// }

// Interfaz para el objeto Module dentro de modules_licence
export interface ModuleCompanyLicenseModule {
  name: string;
  module_id: string;
}

// Interfaz para el objeto dentro del array modules_licence
export interface ModuleCompanyLicense {
  module_company_license_id: string;
  module: ModuleCompanyLicenseModule;
}

// Interfaz que representa la estructura de una licencia tal como viene de la API
export interface ApiLicense {
  license_id: string;
  company_name: string;
  rnc: string;
  expiration_date: string; // Formato ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)
  allowed_companies: number;
  allowed_employees: number;
  contact_name: string;
  email: string;
  phone: string;
  status: boolean; // true para activo, false para inactivo
  used_companies?: number;
  active_employees?: number;
  modules?: string[]; // Puede que la API devuelva IDs de módulos aquí también o en lugar de modules_licence
  modules_licence?: ModuleCompanyLicense[]; // Array de módulos asociados
  created_at?: string; // Fecha de creación (puede tener diferentes nombres)
  creation_date?: string; // Alternativa a created_at
  updated_at?: string; // Fecha de última actualización (puede tener diferentes nombres)
  last_update?: string; // Alternativa a updated_at
  notes?: string;
}

// DTO (Data Transfer Object) para crear una licencia
export interface CreateLicenseDto {
  company_name: string;
  rnc: string;
  expiration_date: string; // Formato YYYY-MM-DD
  allowed_companies: number;
  allowed_employees: number;
  contact_name: string;
  email: string;
  phone: string;
  status: boolean; // true para activo, false para inactivo
  modules?: string[]; // Array de module_id
  notes?: string;
}

// DTO para actualizar una licencia (todos los campos son opcionales)
export interface UpdateLicenseDto {
  company_name?: string;
  rnc?: string;
  expiration_date?: string; // Formato YYYY-MM-DD
  allowed_companies?: number;
  allowed_employees?: number;
  contact_name?: string;
  email?: string;
  phone?: string;
  status?: boolean; // true para activo, false para inactivo
  modules?: string[]; // Array de module_id
  notes?: string;
}

// Interfaz que representa la estructura de una licencia en la UI (más limpia)
export interface License {
  id: string;
  companyName: string;
  rnc: string;
  usedCompanies: number;
  allowedCompanies: number;
  activeEmployees: number;
  allowedEmployees: number;
  expirationDate: string; // Formato YYYY-MM-DD para consistencia con inputs
  modules: string[]; // Array de module_id
  status: "active" | "inactive";
  creationDate?: string; // Formato ISO o legible
  lastUpdate?: string; // Formato ISO o legible
  notes?: string;
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
  // Opcional: Nombres legibles de módulos principales para mostrar en UI
  moduleNames?: string[];
}

// DTO para la renovación (simplificado, solo los campos que se cambian)
export interface RenewLicenseDto {
  expiration_date: string; // Formato YYYY-MM-DD
  status: boolean; // true para activo, false para inactivo
}
