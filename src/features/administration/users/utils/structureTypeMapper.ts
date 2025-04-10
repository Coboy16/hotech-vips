import { StructureType } from "../schemas/userSchema";

/**
 * Mapea tipos de estructura para normalizar valores incorrectos a valores válidos
 * @param type El tipo de estructura que viene de la API
 * @returns Un tipo de estructura válido o cadena vacía
 */
export const mapStructureType = (type?: string | null): StructureType | "" => {
  if (!type) return "";

  // Mapa de conversión para valores incorrectos
  const typeMapping: Record<string, StructureType | ""> = {
    organization: "company", // Mapear 'organization' a 'company'
    // Puedes agregar más mapeos si hay otros valores que necesiten conversión
  };

  // Si el tipo está en el mapeo, devolver el valor mapeado
  if (typeMapping[type]) {
    console.log(
      `[structureTypeMapper] Mapeando tipo de estructura: ${type} → ${typeMapping[type]}`
    );
    return typeMapping[type];
  }

  // Si es un tipo válido de StructureType, devolverlo como está
  if (["company", "sede", "department", "section", "unit"].includes(type)) {
    return type as StructureType;
  }

  // Si no es un tipo válido, devolver cadena vacía
  console.warn(
    `[structureTypeMapper] Tipo de estructura no reconocido: ${type}`
  );
  return "";
};
