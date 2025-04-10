// Petición para generar OTP
export interface GenerateOtpRequest {
  email: string;
}

// Datos internos de la respuesta al generar OTP
export interface GenerateOtpData {
  email_otp_id: number;
  email: string;
  min_expires: number;
  created_at: string;
  updated_at: string;
}

// Respuesta completa del servidor al generar OTP
export interface GenerateOtpResponse {
  statusCode: number;
  message: string;
  data: GenerateOtpData;
  error?: string;
}

// Petición para validar OTP
export interface ValidateOtpRequest {
  email: string;
  otp_code: string;
}

// Datos del registro OTP al validar
export interface OtpRecordData {
  email_otp_id: number;
  email: string;
  otp_code: string;
  min_expires: number;
  created_at: string;
  updated_at: string;
}

// Datos completos de la respuesta de validación (con la estructura correcta)
export interface ValidateOtpData {
  otpRecord: OtpRecordData;
  token: string; // Token JWT para autorizar el cambio de contraseña
}

// Respuesta completa del servidor al validar OTP
export interface ValidateOtpResponse {
  statusCode: number;
  message: string;
  data: ValidateOtpData;
  error?: string;
}

// Petición para cambiar contraseña
export interface ResetPasswordRequest {
  password: string; // Nueva contraseña
}

// Datos internos de la respuesta al cambiar contraseña
export interface ResetPasswordData {
  user_id: string;
  password: string;
  usua_corr: string;
  usua_noco: string;
  usua_nomb: string;
  usua_fevc: string;
  usua_fein: string;
  usua_feve: string | null;
  usua_stat: boolean;
  is_admin_hotech: boolean;
  has_logged_in: boolean;
  rol_id: string;
}

// Respuesta completa del servidor al cambiar contraseña
export interface ResetPasswordResponse {
  statusCode: number;
  message: string;
  data: ResetPasswordData;
  error?: string;
}

// Estado del proceso de recuperación
export enum RecoveryStep {
  EMAIL_ENTRY = "EMAIL_ENTRY",
  OTP_ENTRY = "OTP_ENTRY",
  NEW_PASSWORD = "NEW_PASSWORD",
  SUCCESS = "SUCCESS",
}
