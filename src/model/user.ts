export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Información del módulo dentro de userModule
export interface ModuleInfo {
  name: string;
  module_id: string;
}

// Item dentro del array userModule
export interface UserModuleItem {
  user_module_id: string;
  module: ModuleInfo;
}

// Información del rol
export interface RoleInfo {
  rol_id: string;
  nombre: string; // Nombre del rol (ej: "Super Administrador", "Gerente")
  created_at: string;
  updated_at: string;
}

// Permiso específico asignado al usuario (si aplica)
export interface UserPermissionItem {
  user_permission_id: string;
  user_id: string;
  permission_id: string;
  created_at: string;
  updated_at: string;
  permission: {
    permission_id: string;
    descripcion: string;
    modu_id: string; // ID del módulo al que pertenece el permiso
    created_at: string;
    updated_at: string;
  };
}

// Estructura organizacional asignada al usuario (si aplica)
export interface UserStructureItem {
  user_structure_id: string;
  user_id: string;
  structure_id: string;
  structure_type: "company" | "branch" | "department" | "section" | "unit"; // Tipos de estructura
  company_license_id: string; // ID de la licencia asociada a esta estructura
  created_at: string;
  updated_at: string;
  company_license?: {
    // Información opcional de la licencia (puede no venir siempre)
    license_id: string;
    modules_licence?: Array<{
      // Módulos *permitidos por la licencia*
      module_company_license_id: string;
      module: ModuleInfo;
    }>;
  };
}

// Interfaz principal del usuario, reflejando la API
export interface User {
  user_id: string;
  password?: string; // Generalmente no se envía al frontend después del login
  usua_corr: string;
  usua_noco: string;
  usua_nomb: string;
  usua_fevc: string;
  usua_fein: string;
  usua_feve: string;
  usua_stat: boolean;
  rol_id: string;
  role?: RoleInfo; // Objeto con información del rol
  userModule?: UserModuleItem[]; // Array de módulos asignados al usuario
  userPermissions?: UserPermissionItem[]; // Array de permisos específicos
  userStructures?: UserStructureItem[]; // Array de estructuras asignadas
}

// Respuesta genérica de la API (si no la tienes definida globalmente)
export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data?: T;
  error?: string;
}

// Estructura específica de la respuesta del login exitoso
export interface LoginSuccessData {
  user: User;
  token: string;
}

// Respuesta completa para el login
export type LoginResponse = ApiResponse<LoginSuccessData>;

// Respuesta para el hook/contexto de autenticación
export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
}

// Props para componentes
export interface LoginScreenProps {
  onLogin?: () => void;
}

export interface LogoutModalProps {
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface LicenseInfoForUserForm {
  id: string;
  name: string;
  code: string;
}
// // Deprecado: Ya no usamos este mapa booleano, usamos userModule
// export interface ModulesPermissions {
//   [key: string]: boolean;
//   // panel_monitoreo: boolean;
//   // ...otros módulos
// }
