import { z } from "zod";
import { NodeType } from "../../../../model/organizationalStructure";

// --- Mensajes de error comunes ---
const requiredMsg = (field: string) => `${field} es requerido`;
const invalidFormatMsg = "Formato inválido";

// --- Esquemas específicos para metadatos si son complejos ---
const contactSchema = z
  .object({
    managerFullName: z.string().optional(),
    position: z.string().optional(),
    email: z.string().email(invalidFormatMsg).optional().or(z.literal("")), // Permite vacío o email válido
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
  .optional();

const metadataSchema = z
  .object({
    employeeCount: z.coerce.number().int().min(0).optional(), // Opcional y >= 0
    countryId: z.string().uuid("ID de país inválido").optional(), // Opcional, debe ser UUID si existe
    address: z.string().optional(), // Para sucursal
    contact: contactSchema,
    // Añadir otros campos de metadatos aquí si los usas
  })
  .optional();

// --- Esquema Base para todos los nodos ---
const baseNodeSchema = z.object({
  // id: z.string().uuid(), // El ID se genera en backend, no en el form
  name: z.string().min(1, requiredMsg("Nombre")),
  type: z.enum(["company", "branch", "department", "section", "unit"]), // El tipo lo determina el contexto o selección
  status: z.enum(["active", "inactive"]),
  code: z.string().optional(), // RNC para company, código para otros
  description: z.string().optional(),
  // level: z.number().int().min(1), // El nivel se calcula, no se pone en el form
  metadata: metadataSchema,
  // Campos necesarios para DTOs (se añadirán dinámicamente o al transformar)
  // company_id, branch_id, department_id, section_id, license_id
});

// --- Esquema específico para Compañía (refina el base) ---
// Añade validación para RNC si el tipo es 'company'
export const companySchema = baseNodeSchema
  .refine(
    (data) =>
      data.type !== "company" ||
      (typeof data.code === "string" && data.code.trim().length > 0),
    {
      message: requiredMsg("RNC / Identificación"),
      path: ["code"], // Aplica el error al campo 'code'
    }
  )
  .refine(
    (data) =>
      data.type !== "company" ||
      (typeof data.metadata?.countryId === "string" &&
        data.metadata.countryId.length > 0),
    {
      message: requiredMsg("País"),
      path: ["metadata.countryId"], // Aplica el error al campo 'countryId'
    }
  );

// --- Esquema para los demás tipos (pueden heredar del base sin refinar tanto) ---
// No necesitan validación extra de 'code' o 'countryId' como requeridos
export const genericNodeSchema = baseNodeSchema;

// --- Esquema Final Discriminado (para validar el formulario completo) ---
// Aunque el tipo se selecciona fuera, Zod necesita saber qué schema aplicar.
// Podríamos usar un schema que refine según el tipo, o simplificar asumiendo
// que la lógica del formulario se asegura de enviar los campos correctos.
// Vamos a usar el schema base refinado para compañía y el genérico para otros,
// asumiendo que el *componente* NodeForm mostrará/ocultará campos según el tipo.
export const nodeFormSchema = z.union([companySchema, genericNodeSchema]);

// --- Tipo inferido de Zod para usar en el formulario ---
// Usaremos el tipo base para el formulario, ya que los campos son mayormente los mismos,
// y la lógica condicional se maneja en la UI y al transformar a DTO.
export type NodeFormData = z.infer<typeof baseNodeSchema>;

// Tipo para los valores por defecto, omitiendo campos calculados como 'id' o 'level'
// y haciendo opcionales los que podrían no estar al inicio.
export type NodeFormDefaultValues = Partial<Omit<NodeFormData, "type">> & {
  type?: NodeType;
};
