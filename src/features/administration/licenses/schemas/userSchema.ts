import { z } from "zod";

// Regex para validar UUIDs
const UUID_REGEX =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

// Helper para validar fechas ISO 8601 (YYYY-MM-DDTHH:mm:ssZ o YYYY-MM-DDTHH:mm:ss.sssZ)
const isoDateTimeRegex =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;

// Schema de validación para el formulario de usuario
export const userFormValidationSchema = z
  .object({
    // --- Datos personales ---
    usua_nomb: z.string().min(1, "El nombre es requerido"),
    usua_corr: z
      .string()
      .min(1, "El correo electrónico es requerido")
      .email("Ingrese un correo electrónico válido"),
    usua_noco: z
      .string()
      .min(1, "El teléfono es requerido")
      .regex(/^[0-9+\-() ]+$/, "Ingrese un número de teléfono válido"),

    // --- Credenciales ---
    password: z
      .string()
      .min(8, { message: "La contraseña debe tener al menos 8 caracteres" })
      .optional()
      .or(z.literal("")),

    // --- Fechas ---
    usua_fein: z
      .string()
      .regex(isoDateTimeRegex, "Formato de fecha inicio inválido (ISO 8601)")
      .optional(),
    usua_fevc: z
      .string()
      .regex(isoDateTimeRegex, "Formato de fecha control inválido (ISO 8601)")
      .optional(),
    usua_feve: z
      .string()
      .regex(
        isoDateTimeRegex,
        "Formato de fecha vencimiento inválido (ISO 8601)"
      )
      .optional(),

    // --- Estado ---
    usua_stat: z.boolean().default(true),

    // --- Accesos y Permisos ---
    // Añadido refine para chequear explícitamente que no sea string vacío
    rol_id: z
      .string({ required_error: "Debe seleccionar un rol" })
      .min(1, "Debe seleccionar un rol") // Ya chequea string vacío
      .uuid({ message: "El ID del rol seleccionado no es un UUID válido" }), // Mensaje más específico

    // --- Estructuras ---
    structure_type: z.enum(
      ["company", "sede", "department", "section", "unit"],
      {
        required_error: "Debe seleccionar un tipo de estructura",
        invalid_type_error: "Tipo de estructura inválido",
      }
    ),
    structure_id: z.string().optional(), // La validación UUID se hace en superRefine
    assignStructureLater: z.boolean().default(false),

    // Añadido refine para chequear explícitamente que no sea string vacío
    company_license_id: z
      .string({ required_error: "La licencia es requerida" })
      .min(1, "La licencia es requerida") // Ya chequea string vacío
      .uuid({ message: "El ID de la licencia asociada no es un UUID válido" }), // Mensaje más específico
  })
  .superRefine((data, ctx) => {
    console.log("[userSchema] Ejecutando superRefine con data:", data);

    // Validación condicional para structure_id
    if (!data.assignStructureLater) {
      // Chequeo más explícito de string vacío o null/undefined
      if (!data.structure_id || data.structure_id.trim() === "") {
        console.log(
          "[userSchema] Error: structure_id requerido pero está vacío/nulo."
        );
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Debe seleccionar una estructura válida", // Mensaje claro
          path: ["structure_id"],
        });
        // Solo validar formato UUID si *no* está vacío
      } else if (!UUID_REGEX.test(data.structure_id)) {
        console.log(
          "[userSchema] Error: structure_id no es UUID válido:",
          data.structure_id
        );
        ctx.addIssue({
          code: z.ZodIssueCode.custom, // Usar custom para mensaje específico
          message: `El ID de estructura '${data.structure_id}' no es un UUID válido`,
          path: ["structure_id"],
        });
      }
    }

    console.log("[userSchema] Validación superRefine completada.");
  });

// Tipo derivado del schema para usar en React Hook Form
export type UserFormData = z.infer<typeof userFormValidationSchema>;
