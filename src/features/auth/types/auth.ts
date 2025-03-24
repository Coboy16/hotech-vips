// src/features/auth/types/auth.ts
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  user_id: string;
  password?: string; // No lo usaremos en la interfaz
  usua_corr: string;
  usua_noco: string;
  usua_nomb: string;
  usua_fevc: string;
  usua_fein: string;
  usua_feve: string;
  usua_stat: boolean;
  rol_id: string;
  role?: {
    rol_id: string;
    nombre: string;
    created_at: string;
    updated_at: string;
  };
  userPermissions?: Array<{
    user_permission_id: string;
    user_id: string;
    permission_id: string;
    created_at: string;
    updated_at: string;
    permission: {
      permission_id: string;
      descripcion: string;
      modu_id: string;
      created_at: string;
      updated_at: string;
    };
  }>;
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