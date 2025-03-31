import { z } from "zod";

// --- Esquema Base ---
// Define validaciones comunes que aplican tanto a creación como actualización
const baseLicenseSchema = z.object({
  companyName: z.string().min(1, "El nombre de la empresa es requerido"),
  rnc: z
    .string()
    .min(1, "El RNC es requerido")
    .regex(/^[0-9]+$/, "El RNC solo debe contener números")
    .length(9, "El RNC debe tener 9 dígitos"), // Asumiendo RNC de Rep. Dom. - ajusta si es necesario
  allowedCompanies: z.coerce // Coerces string input from number field to number
    .number({ invalid_type_error: "Debe ser un número" })
    .int("Debe ser un número entero")
    .min(1, "Debe permitir al menos 1 compañía"),
  allowedEmployees: z.coerce
    .number({ invalid_type_error: "Debe ser un número" })
    .int("Debe ser un número entero")
    .min(1, "Debe permitir al menos 1 empleado"),
  // expirationDate: z.string().min(1, "La fecha de vencimiento es requerida")
  //     .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)"), // Validación básica de formato
  expirationDate: z
    .string()
    .min(1, "La fecha de vencimiento es requerida")
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Fecha inválida",
    }), // Asegura que sea una fecha parseable
  modules: z.array(z.string()).min(0), // Permite array vacío, pero debe ser array de strings
  status: z.enum(["active", "inactive"], {
    required_error: "El estado es requerido",
  }),
  notes: z.string().optional(), // Campo opcional
  contactInfo: z.object({
    name: z.string().min(1, "El nombre del contacto es requerido"),
    email: z
      .string()
      .min(1, "El correo es requerido")
      .email("Correo electrónico inválido"),
    phone: z.string().min(1, "El teléfono es requerido"), // Podrías añadir regex para formato
  }),
});

// --- Esquema para Creación ---
// Hereda del base y añade/modifica lo necesario para crear
export const createLicenseSchema = baseLicenseSchema.extend({
  // Podrías añadir campos específicos de creación si los hubiera
  // Ejemplo: password temporal si fuera necesario
});

// --- Esquema para Actualización ---
// Hereda del base, pero hace todos los campos opcionales porque solo envías lo que cambia
// Sin embargo, para la validación del *formulario* de edición, usualmente quieres que los
// campos *visibles* sigan siendo requeridos. Así que a menudo usamos el mismo schema
// o uno muy similar al de creación para validar el form de edición.
// El DTO de *envío* (`UpdateLicenseDto`) es el que tiene todo opcional.
export const updateLicenseSchema = baseLicenseSchema.extend({
  // No se necesitan cambios aquí si los requerimientos del formulario son los mismos
});

// --- Esquema para Renovación ---
export const renewLicenseSchema = z.object({
  // expirationDate: z.string().min(1, "La nueva fecha de vencimiento es requerida")
  //     .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)"),
  expirationDate: z
    .string()
    .min(1, "La nueva fecha de vencimiento es requerida")
    .refine((date) => !isNaN(Date.parse(date)), { message: "Fecha inválida" })
    .refine((date) => new Date(date) > new Date(), {
      message: "La fecha debe ser futura",
    }), // Opcional: Validar que sea futura
  status: z.enum(["active", "inactive"], {
    required_error: "El estado es requerido",
  }),
});

// --- Tipos inferidos de Zod ---
// Útiles para tipar los datos del formulario en React Hook Form
export type CreateLicenseFormData = z.infer<typeof createLicenseSchema>;
export type UpdateLicenseFormData = z.infer<typeof updateLicenseSchema>;
export type RenewLicenseFormData = z.infer<typeof renewLicenseSchema>;

// Combina Create y Update para el tipo de datos del formulario general
// Útil si usas el mismo componente de formulario para crear y editar
export type LicenseFormData = CreateLicenseFormData; // O usa z.infer<typeof baseLicenseSchema> si prefieres
