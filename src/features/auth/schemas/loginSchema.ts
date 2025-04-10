import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string({
      required_error: "El correo electrónico es requerido.",
      invalid_type_error: "El correo debe ser texto.",
    })
    .min(1, { message: "El correo electrónico es requerido." }) // No debe estar vacío
    .email({ message: "Por favor, introduce un correo electrónico válido." })
    .max(100, { message: "El correo no puede exceder los 100 caracteres." }) // Límite de longitud
    .trim(), // Elimina espacios al inicio y final
  password: z
    .string({
      required_error: "La contraseña es requerida.",
      invalid_type_error: "La contraseña debe ser texto.",
    })
    .min(1, { message: "La contraseña es requerida." }) // No debe estar vacía
    // Añade aquí reglas más específicas si las tienes (longitud, caracteres especiales, etc.)
    // Ejemplo: .min(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
    .max(100, {
      message: "La contraseña no puede exceder los 100 caracteres.",
    }), // Límite de longitud
  // Zod no valida contra listas de contraseñas comunes, eso sería lógica adicional
  rememberMe: z.boolean().optional(), // Checkbox es opcional
});
