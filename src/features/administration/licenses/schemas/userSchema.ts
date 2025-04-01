import { z } from "zod";

// Regex para validar UUIDs
const UUID_REGEX =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

// Schema de validación para el formulario de usuario
export const userFormValidationSchema = z
  .object({
    // Datos personales
    usua_nomb: z.string().min(1, "El nombre es requerido"),
    usua_corr: z
      .string()
      .min(1, "El correo electrónico es requerido")
      .email("Ingrese un correo electrónico válido"),
    usua_noco: z
      .string()
      .min(1, "El teléfono es requerido")
      .regex(/^[0-9+\-() ]+$/, "Ingrese un número de teléfono válido"),

    // Credenciales - Opcional en edición
    // Si es creación (user=null), la UI debería forzarlo, pero Zod lo permite opcional aquí.
    // Se podría refinar si tuviéramos el contexto 'isEditing'.
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .optional()
      .or(z.literal("")),

    // Estado
    usua_stat: z.boolean().default(true),

    // Accesos y Permisos
    rol_id: z
      .string()
      .uuid("Debe seleccionar un rol válido")
      .min(1, "Debe seleccionar un rol"),

    // Estructuras
    structure_type: z.enum(
      ["company", "sede", "department", "section", "unit"],
      {
        required_error: "Debe seleccionar un tipo de estructura",
      }
    ),
    // Hacer opcional aquí, la obligatoriedad se define en superRefine
    structure_id: z.string().optional(),
    // Nuevo campo para controlar la asignación posterior
    assignStructureLater: z.boolean().default(false),
    company_license_id: z
      .string()
      .uuid("La licencia es requerida")
      .min(1, "La licencia es requerida"),
  })
  .superRefine((data, ctx) => {
    // Validación condicional para structure_id
    if (!data.assignStructureLater) {
      // Si NO se va a asignar después, structure_id es requerido y debe ser UUID
      if (!data.structure_id || data.structure_id.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Debe seleccionar una estructura",
          path: ["structure_id"],
        });
      } else if (!UUID_REGEX.test(data.structure_id)) {
        // Solo validar formato UUID si no está vacío y no se asigna después
        ctx.addIssue({
          code: z.ZodIssueCode.invalid_string,
          validation: "uuid",
          message: "Formato de ID de estructura inválido",
          path: ["structure_id"],
        });
      }
    }
    // Si assignStructureLater es true, structure_id puede ser vacío/undefined, no se valida aquí.

    // Podrías añadir validación para la contraseña si es creación vs edición aquí
    // if (isCreating && (!data.password || data.password.length < 8)) { ... }
  });

// Tipo derivado del schema para usar en React Hook Form
export type UserFormData = z.infer<typeof userFormValidationSchema>;
