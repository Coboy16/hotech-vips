import { z } from "zod";

const UUID_REGEX =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

// Tipo para los valores permitidos de structure_type (exportado)
export const structureTypeEnum = z.enum(
  ["company", "sede", "department", "section", "unit"],
  {
    // Mensajes de error si la validación falla, aunque la obligatoriedad se ve en superRefine
    invalid_type_error: "Tipo de estructura inválido",
  }
);
export type StructureType = z.infer<typeof structureTypeEnum>;

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
    usua_fein: z.string().optional().or(z.literal("")),
    usua_fevc: z.string().optional().or(z.literal("")),
    usua_feve: z.string().optional().or(z.literal("")),

    // --- Estado ---
    usua_stat: z.boolean().default(true),

    // --- Permisos y Roles ---
    rol_id: z
      .string({ required_error: "Debe seleccionar un rol" })
      .min(1, "Debe seleccionar un rol")
      .uuid({ message: "El ID del rol seleccionado no es un UUID válido" }),
    userPermissions: z
      .array(
        z.string().uuid("Cada permiso debe ser un ID de módulo válido (UUID)")
      )
      .optional()
      .default([]),

    // --- Estructuras ---
    // Tipos opcionales aquí, la validación fuerte está en superRefine
    structure_type: structureTypeEnum.or(z.literal("")).optional(),
    // ID opcional aquí, validado en superRefine
    structure_id: z.string().optional(),
    assignStructureLater: z.boolean().default(false),

    // ID de la licencia
    company_license_id: z
      .string({ required_error: "La licencia es requerida" })
      .min(1, "La licencia es requerida")
      .uuid({ message: "El ID de la licencia asociada no es un UUID válido" }),
  })
  .superRefine((data, ctx) => {
    console.log("[userSchema] Ejecutando superRefine con data:", data);

    // --- Validación condicional para ESTRUCTURAS ---
    // Solo validar tipo e ID si NO se va a asignar más tarde
    if (!data.assignStructureLater) {
      // 1. Validar que structure_type esté seleccionado (no sea vacío o nulo)
      if (!data.structure_type || data.structure_type === undefined) {
        console.log(
          "[userSchema] superRefine Error: structure_type requerido pero está vacío."
        );
        ctx.addIssue({
          code: z.ZodIssueCode.custom, // Usar custom para mensaje específico
          message: "Debe seleccionar un tipo de estructura",
          path: ["structure_type"], // Ruta al campo que falló
        });
      }

      // 2. Validar que structure_id esté presente y sea UUID
      // (No necesitamos validar formato si el tipo es 'company', ya que usaremos license_id)
      if (!data.structure_id || data.structure_id.trim() === "") {
        console.log(
          "[userSchema] superRefine Error: structure_id requerido pero está vacío/nulo."
        );
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Debe seleccionar una estructura específica",
          path: ["structure_id"],
        });
      }
      // Validar formato UUID solo si el ID existe y el tipo NO es company
      // (porque para company usamos license_id que ya validamos arriba)
      else if (
        data.structure_type !== "company" &&
        !UUID_REGEX.test(data.structure_id)
      ) {
        console.log(
          `[userSchema] superRefine Error: structure_id (${data.structure_id}) no es UUID válido para tipo ${data.structure_type}.`
        );
        ctx.addIssue({
          code: z.ZodIssueCode.invalid_string,
          validation: "uuid",
          message: `El ID de estructura seleccionado no es válido`,
          path: ["structure_id"],
        });
      }
      // Podríamos añadir una validación extra para asegurar que si type es company, el ID coincida con license_id,
      // pero como lo forzamos en el form y el adapter, quizás no sea necesario aquí.
      // else if (data.structure_type === 'company' && data.structure_id !== data.company_license_id) {
      //    // ... añadir issue ...
      // }
    } // Fin del if (!data.assignStructureLater)

    console.log("[userSchema] Validación superRefine completada.");
  });

// Tipo derivado
export type UserFormData = z.infer<typeof userFormValidationSchema>;
