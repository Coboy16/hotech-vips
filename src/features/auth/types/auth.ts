// src/features/auth/types/auth.ts
export interface LoginCredentials {
  email: string;      // Cambiado de username a email según la documentación
  password: string;
}

export interface User {
  user_id: string;    // Actualizado según la respuesta del API
  usua_corr: string;  // Email
  usua_nomb: string;  // Nombre completo
  usua_noco: string;  // Número de contacto
  usua_fevc: string;  // Fecha de vencimiento de contraseña
  usua_fein: string;  // Fecha de inicio 
  usua_feve: string;  // Fecha de vencimiento
  usua_stat: boolean; // Estado
  rol_id: string;     // ID del rol
}

// La estructura de respuesta de la API
export interface ApiResponse<T = unknown> {
  headers: unknown;
  statusCode: number;
  data: T;
  message: string;
  error: string;
}

// Respuesta específica para autenticación
export interface AuthResponse {
  success: boolean;      // Añadimos esto para mantener compatibilidad con tu código actual
  token?: string;        // Tendremos que extraer esto de las cabeceras o cookies
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