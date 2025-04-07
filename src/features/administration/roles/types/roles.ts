// --- Tipos base para módulos y roles ---

// Tipo para un módulo individual (como viene de GET /modules y dentro de rolesModules)
export interface Module {
  id: string; // Usaremos 'id' internamente, mapeado desde module_id
  name: string; // Mapeado desde name
  apiName?: string; // Nombre original de la API si es útil para mapeos
}

// Tipo para el objeto 'module' dentro de 'rolesModules' en la API de Roles
export interface ApiNestedModule {
  module_id: string;
  name: string;
}

// Tipo para un elemento dentro del array 'rolesModules' de la API
export interface ApiRoleModule {
  role_module_id: string;
  module: ApiNestedModule;
}

// Representa un Rol como viene de la API (GET /roles/license/{licenseId} o GET /roles/{uuid})
export interface ApiRole {
  rol_id: string;
  nombre: string;
  company_license_id: string;
  created_at?: string;
  updated_at?: string;
  rolesModules?: ApiRoleModule[];
}

// Representa un Rol en el frontend (transformado desde ApiRole)
export interface Role {
  id: string;
  name: string;
  licenseId: string;
  moduleIds: string[];
  associatedModules?: Module[];
  createdAt: string;
}

// --- DTOs para crear y actualizar roles ---

export interface CreateRoleDto {
  nombre: string;
  company_license_id: string;
  modules: string[]; // UUIDs (module_id) de módulos
}

export interface UpdateRoleDto {
  nombre: string;
  modules: string[];
}

// --- Tipos de respuesta de la API ---

export interface RolesApiResponse {
  statusCode: number;
  data: ApiRole[];
  message: string;
  error: string;
}

export interface RoleApiResponse {
  statusCode: number;
  data:
    | ApiRole
    | { rol_id: string; nombre: string; company_license_id: string };
  message: string;
  error: string;
}

export interface ModulesApiResponse {
  statusCode: number;
  data: ApiNestedModule[]; // Estructura de GET /modules
  message: string;
  error: string;
}

export interface RoleKPIsData {
  totalRoles: number;
}

// --- Tipos para la UI de selección de módulos agrupados ---

export interface ModuleGroupUI {
  id: string;
  label: string;
  permission: string;
  icon: React.ElementType;
  isExpanded: boolean;
  modules: ModuleItemUI[];
}

export interface ModuleItemUI {
  id: string;
  label: string;
  permission: string;
}
