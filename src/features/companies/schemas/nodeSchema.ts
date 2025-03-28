import { z } from "zod";
import { NodeType } from "../../../../model/organizationalStructure";

// --- Mensajes de error comunes ---
const requiredMsg = (field: string) => `${field} es requerido`;
const invalidFormatMsg = "Formato inválido";
const invalidUUIDMsg = "ID de país inválido (UUID)";

// --- Esquemas específicos para metadatos si son complejos ---
const contactSchema = z
  .object({
    managerFullName: z.string().optional(),
    position: z.string().optional(),
    email: z.string().email(invalidFormatMsg).optional().or(z.literal("")),
    phone: z.string().optional(),
    extension: z.string().optional(),
    physicalLocation: z
      .object({
        building: z.string().optional(),
        floor: z.string().optional(),
        office: z.string().optional(),
      })
      .optional(),
  })
  .default({}) // Default a objeto vacío para evitar errores si metadata existe pero contact no
  .optional();

const metadataSchema = z
  .object({
    employeeCount: z.coerce // Usa coerce para convertir string/null a number
      .number({ invalid_type_error: "Debe ser un número" })
      .int("Debe ser entero")
      .min(0, "No puede ser negativo")
      .optional(), // Hacer opcional si puede no venir
    countryId: z.string().uuid(invalidUUIDMsg).optional().or(z.literal("")), // Permite UUID, vacío o undefined
    address: z.string().optional(),
    contact: contactSchema,
  })
  .default({}) // Default a objeto vacío para evitar errores al acceder a metadata.contact etc.
  .optional();

// --- Esquema Base para todos los nodos ---
// Define los campos comunes y sus validaciones básicas
const baseNodeSchema = z.object({
  name: z.string().trim().min(1, requiredMsg("Nombre")), // trim() para quitar espacios
  type: z.enum(["company", "branch", "department", "section", "unit"]),
  status: z.enum(["active", "inactive"]),
  code: z.string().optional(), // Validación específica más adelante
  description: z.string().optional(),
  metadata: metadataSchema,
});

// --- Esquema específico para Compañía ---
// Extiende el base y añade validaciones específicas para 'company'
const companySpecificSchema = baseNodeSchema.extend({
  type: z.literal("company"), // Fija el tipo a 'company'
  code: z.string().trim().min(1, requiredMsg("RNC / Identificación")), // Hace 'code' requerido
  metadata: z
    .object({
      employeeCount: z.coerce
        .number({ invalid_type_error: "Debe ser un número" })
        .int("Debe ser entero")
        .min(0, "No puede ser negativo")
        .optional(),
      countryId: z
        .string({ required_error: requiredMsg("País") })
        .uuid(invalidUUIDMsg)
        .min(1, requiredMsg("País")),
      address: z.string().optional(),
      contact: contactSchema,
    })
    .optional(),
});

// --- Esquema específico para Sucursal ---
const branchSpecificSchema = baseNodeSchema.extend({
  type: z.literal("branch"),
  // Podrías añadir validaciones específicas para sucursal si las hubiera
  // metadata: metadataSchema.extend({ address: z.string().min(1, "Dirección requerida para sucursal") }) // Ejemplo
});

// --- Esquemas para los demás tipos (pueden usar el base si no tienen validaciones extra) ---
const departmentSpecificSchema = baseNodeSchema.extend({
  type: z.literal("department"),
});
const sectionSpecificSchema = baseNodeSchema.extend({
  type: z.literal("section"),
});
const unitSpecificSchema = baseNodeSchema.extend({ type: z.literal("unit") });

// --- Esquema Final Discriminado ---
// Usa `discriminatedUnion` para validar correctamente según el campo 'type'
export const nodeFormSchema = z.discriminatedUnion("type", [
  companySpecificSchema,
  branchSpecificSchema,
  departmentSpecificSchema,
  sectionSpecificSchema,
  unitSpecificSchema,
]);

// --- Tipo inferido de Zod para usar en el formulario ---
// Este tipo representa la estructura de datos validada
export type NodeFormData = z.infer<typeof nodeFormSchema>;

// Tipo para los valores por defecto
// Hacemos opcionales los campos que pueden no tener valor al inicio o son condicionales
export type NodeFormDefaultValues = Partial<Omit<NodeFormData, "metadata">> & {
  type: NodeType; // El tipo siempre debe estar presente
  metadata?: Partial<NodeFormData["metadata"]>; // Metadatos opcionales
};
