import { useEffect, useMemo } from "react";
import {
  ApiStructureTreeResponse, // Este tipo AHORA representa el objeto DENTRO de data[0]
  StructureSelectItem,
} from "../../../../../model/structure";
import { StructureType } from "../../schemas/userSchema";

interface StructureSelectorProps {
  selectedStructure: string;
  structureType: StructureType | "";
  // **REVISADO:** El árbol completo pre-cargado (el objeto DENTRO de data[0])
  tree: ApiStructureTreeResponse | null;
  onChange: (structureId: string) => void;
  className?: string;
  disabled?: boolean;
}

// **REVISADO:** Función auxiliar para aplanar el árbol
const flattenStructureTree = (
  tree: ApiStructureTreeResponse | null,
  targetType: StructureType | ""
): StructureSelectItem[] => {
  // Si no hay árbol (objeto de licencia) o no hay tipo, devolver vacío
  if (!tree || !tree.license_id || !targetType) {
    console.log(
      `[StructureSelector] flattenStructureTree: No tree, license_id or targetType.`
    );
    return [];
  }

  const items: StructureSelectItem[] = [];
  console.log(`[StructureSelector] Flattening tree for type: ${targetType}`);

  // CASO ESPECIAL: Tipo 'company'
  if (targetType === "company") {
    // Crear la opción para la compañía raíz usando los datos del objeto `tree`
    items.push({
      id: tree.license_id, // Usar license_id como ID para 'company' según requerimiento
      name: tree.company_name, // Usar el nombre de la compañía del objeto `tree`
      type: "company",
    });
    console.log(
      `[StructureSelector] Added company (root): ${tree.company_name} (ID: ${tree.license_id})`
    );
  }
  // CASOS ANIDADOS: Iterar sobre el array 'companies' (si existe y no es 'company' el target)
  else if (tree.companies) {
    tree.companies.forEach((company) => {
      // Iterar compañías DENTRO del árbol
      company.branches?.forEach((branch) => {
        if (targetType === "sede") {
          items.push({
            id: branch.branch_id,
            name: branch.branch_name,
            type: "sede",
          });
          console.log(
            `[StructureSelector] Added sede: ${branch.branch_name} (ID: ${branch.branch_id})`
          );
        }
        branch.departments?.forEach((department) => {
          if (targetType === "department") {
            items.push({
              id: department.department_id,
              name: department.department_name,
              type: "department",
            });
            console.log(
              `[StructureSelector] Added department: ${department.department_name} (ID: ${department.department_id})`
            );
          }
          department.sections?.forEach((section) => {
            if (targetType === "section") {
              items.push({
                id: section.section_id,
                name: section.section_name,
                type: "section",
              });
              console.log(
                `[StructureSelector] Added section: ${section.section_name} (ID: ${section.section_id})`
              );
            }
            section.units?.forEach((unit) => {
              if (targetType === "unit") {
                items.push({
                  id: unit.unit_id,
                  name: unit.unit_name,
                  type: "unit",
                });
                console.log(
                  `[StructureSelector] Added unit: ${unit.unit_name} (ID: ${unit.unit_id})`
                );
              }
            });
          });
        });
      });
    });
  }

  console.log(
    `[StructureSelector] Flattened items for type ${targetType}:`,
    items
  );
  return items;
};

export function StructureSelector({
  selectedStructure,
  structureType,
  tree, // Recibe el árbol como prop
  onChange,
  className = "",
  disabled = false,
}: StructureSelectorProps) {
  const structureOptions = useMemo(() => {
    console.log(
      `[StructureSelector] Recalculating options for type: ${structureType}`
    );
    return flattenStructureTree(tree, structureType);
  }, [tree, structureType]);

  // Validar selección actual
  useEffect(() => {
    // Si hay algo seleccionado pero ya no está en las opciones (o no hay opciones), resetear
    if (
      selectedStructure &&
      !structureOptions.some((opt) => opt.id === selectedStructure)
    ) {
      console.warn(
        `[StructureSelector] Current selection ${selectedStructure} is invalid for type ${structureType}. Resetting.`
      );
      onChange("");
    } else if (
      selectedStructure &&
      structureOptions.length === 0 &&
      structureType
    ) {
      console.warn(
        `[StructureSelector] No options available for type ${structureType}. Resetting.`
      );
      onChange("");
    }
    // No incluir onChange en dependencias para evitar bucles si resetea
  }, [structureOptions, selectedStructure, structureType]);

  const baseClasses =
    "block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed";

  return (
    <select
      value={selectedStructure}
      onChange={(e) => onChange(e.target.value)}
      className={`${baseClasses} ${className}`}
      // Simplificar disabled: si está explícitamente disabled O si no hay tipo O no hay opciones
      disabled={disabled || !structureType || structureOptions.length === 0}
    >
      <option value="" disabled>
        {/* Mensajes más específicos */}
        {!structureType
          ? "Seleccione un tipo primero"
          : disabled // Si está deshabilitado por otra razón (ej: assignLater)
          ? "..." // Mostrar puntos suspensivos o nada
          : structureOptions.length === 0
          ? `No hay ${structureType}s disponibles`
          : `Seleccione ${structureType}...`}
      </option>
      {structureOptions.map((structure) => (
        <option key={structure.id} value={structure.id}>
          {structure.name}
        </option>
      ))}
    </select>
  );
}
