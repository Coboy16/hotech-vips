export interface RegisterResponse {
  statusCode: number;
  message: string;
  data?: {
    user: ApiUser;
  };
  error?: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  departments: string[];
  permissions: Permission;
  lastLogin: string;
  status: "active" | "inactive";
  avatar?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
  startDate?: string;
  twoFactorEnabled?: boolean;
  endDate?: string;
  password?: string;
}

export interface Permission {
  approveHours: boolean;
  modifyChecks: boolean;
  manageReports: boolean;
  adminAccess?: boolean;
}

export interface Role {
  value: string;
  label: string;
  description?: string;
}

// Interfaces adicionales para conectar con la API
export interface ApiUser {
  user_id: string;
  password: string;
  usua_corr: string;
  usua_noco: string;
  usua_nomb: string;
  usua_fevc: string; // Fecha de creación
  usua_fein: string; // Fecha de inicio
  usua_feve: string; // Fecha de vencimiento
  usua_stat: boolean;
  rol_id: string;
  company_license_id?: string | null;
  structure_id?: string | null;
  structure_type?: string | null;
  role?: {
    rol_id: string;
    nombre: string;
    created_at: string;
    updated_at: string;
  };
  userPermissions?: UserPermission[];
  userStructures?: UserStructure[];
}

export interface UserPermission {
  user_permission_id: string;
  user_id: string;
  permission_id: string;
  created_at: string;
  updated_at: string;
  module?: {
    module_id: string;
  } | null;
}

export interface UserStructure {
  structure_id?: string | null;
  structure_type: string;
}

export interface CreateUserDto {
  password: string;
  usua_corr: string;
  usua_noco: string;
  usua_nomb: string;
  usua_fevc: string;
  usua_fein: string;
  usua_feve: string;
  usua_stat: boolean;
  rol_id: string;
  company_license_id?: string | null;
  structure_id?: string | null;
  structure_type?: string | null;
  modules?: string[];
}

export type UpdateUserDto = Partial<CreateUserDto>;

export interface UpdatePasswordDto {
  password: string;
}

export interface DeleteUserDto {
  iduser: number;
  comment: string;
}

export interface UserResponse {
  statusCode: number;
  message: string;
  data: ApiUser | ApiUser[];
  error?: string;
}
