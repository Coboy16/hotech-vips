import * as z from "zod";

/**
 * Esquema para validar el formulario de solicitud de código OTP
 */
export const requestOtpSchema = z.object({
  email: z
    .string()
    .min(1, "El correo electrónico es obligatorio")
    .email("Ingrese un correo electrónico válido"),
});

/**
 * Esquema para validar el formulario de verificación de código OTP
 */
export const validateOtpSchema = z.object({
  otp_code: z
    .string()
    .min(6, "El código OTP debe tener 6 dígitos")
    .max(6, "El código OTP debe tener 6 dígitos")
    .regex(/^\d+$/, "El código OTP debe contener solo números"),
});

/**
 * Esquema para validar el formulario de cambio de contraseña
 */
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres")
      .max(50, "La contraseña no puede exceder los 50 caracteres"),
    confirm_password: z
      .string()
      .min(6, "La confirmación de contraseña debe tener al menos 6 caracteres"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Las contraseñas no coinciden",
    path: ["confirm_password"],
  });

// Tipos derivados de los esquemas
export type RequestOtpFormData = z.infer<typeof requestOtpSchema>;
export type ValidateOtpFormData = z.infer<typeof validateOtpSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
