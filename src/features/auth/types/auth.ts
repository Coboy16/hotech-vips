/* eslint-disable @typescript-eslint/no-explicit-any */
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// interface Module {
//   name: string;
// }

// interface UserModule {
//   module: Module;
// }

export interface User {
  user_id: string;
  password?: string;
  usua_corr: string;
  usua_noco: string;
  usua_nomb: string;
  usua_fevc: string;
  usua_fein: string;
  usua_feve: string;
  usua_stat: boolean;
  is_admin_hotech?: boolean;
  has_logged_in: boolean;
  rol_id: string;
  role?: {
    rol_id: string;
    nombre: string;
    company_license_id: string | null;
    created_at: string;
    updated_at: string;
    rolesModules?: Array<{
      role_module_id: string;
      module: {
        name: string;
        module_id: string;
      };
    }>;
  };
  userModule?: Array<{
    user_module_id: string;
    module: {
      name: string;
      module_id: string;
    };
  }>;
  userPermissions?: Array<any>; // Aquí puedes definir la estructura exacta
  userStructures?: Array<any>; // Aquí puedes definir la estructura exacta
}
export interface ModulesPermissions {
  panel_monitoreo: boolean;
  empleados: boolean;
  gestion_empleados: boolean;
  control_tiempo: boolean;
  planificador_horarios: boolean;
  gestion_incidencias: boolean;
  calendario: boolean;
  control_acceso: boolean;
  visitantes: boolean;
  permisos_acceso: boolean;
  comedor: boolean;
  reportes: boolean;
  reportes_mas_usados: boolean;
  // Puedes agregar más módulos según sea necesario
}

// Respuesta genérica de la API
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

// Respuesta para el hook de autenticación
export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
}

export interface LoginScreenProps {
  onLogin?: () => void;
}

export interface LogoutModalProps {
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}
