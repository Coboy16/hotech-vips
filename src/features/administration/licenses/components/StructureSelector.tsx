import { useEffect, useState } from "react";
import { structureService } from "../services/structureService";
import {
  ApiStructureTreeResponse,
  StructureSelectItem,
} from "../../../../model/structure";
import { Loader2, AlertCircle } from "lucide-react";

interface StructureSelectorProps {
  selectedStructure: string;
  structureType: "company" | "sede" | "department" | "section" | "unit"; // Mantenemos 'sede' para UI
  licenseId: string; // ID de la licencia para filtrar
  onChange: (structureId: string) => void;
  className?: string;
  disabled?: boolean;
}

// Función auxiliar para aplanar el árbol de estructuras según el tipo deseado
const flattenStructureTree = (
  tree: ApiStructureTreeResponse | null,
  targetType: "company" | "sede" | "department" | "section" | "unit"
): StructureSelectItem[] => {
  if (!tree || !tree.companies) return [];

  const items: StructureSelectItem[] = [];

  tree.companies.forEach((company) => {
    if (targetType === "company") {
      items.push({
        id: company.comp_iden,
        name: company.comp_noco || company.comp_raso,
        type: "company",
      });
    }
    company.branches?.forEach((branch) => {
      if (targetType === "sede") {
        // 'sede' en UI mapea a 'branch' en API
        items.push({
          id: branch.branch_id,
          name: branch.branch_name,
          type: "sede",
        });
      }
      branch.departments?.forEach((department) => {
        if (targetType === "department") {
          items.push({
            id: department.department_id,
            name: department.department_name,
            type: "department",
          });
        }
        department.sections?.forEach((section) => {
          if (targetType === "section") {
            items.push({
              id: section.section_id,
              name: section.section_name,
              type: "section",
            });
          }
          section.units?.forEach((unit) => {
            // Cuidado con el typo 'container_positio' en ApiUnit si lo usaras
            if (targetType === "unit") {
              items.push({
                id: unit.unit_id,
                name: unit.unit_name,
                type: "unit",
              });
            }
          });
        });
      });
    });
  });

  return items;
};

export function StructureSelector({
  selectedStructure,
  structureType,
  licenseId,
  onChange,
  className = "",
  disabled = false,
}: StructureSelectorProps) {
  const [structureOptions, setStructureOptions] = useState<
    StructureSelectItem[]
  >([]);
  const [isLoading, setIsLoading] = useState(false); // Inicia en false, carga al cambiar licenseId/type
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStructures = async () => {
      if (!licenseId || !structureType) {
        setStructureOptions([]); // Limpia si no hay licencia o tipo
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setStructureOptions([]); // Limpia opciones anteriores

      try {
        const tree = await structureService.getStructureTree(licenseId);
        const flattened = flattenStructureTree(tree, structureType);
        setStructureOptions(flattened);

        // Validar si la selección actual sigue siendo válida
        if (
          selectedStructure &&
          !flattened.some((opt) => opt.id === selectedStructure)
        ) {
          onChange(""); // Resetear si la selección ya no existe en las nuevas opciones
        }
      } catch (err) {
        console.error("Error fetching structure tree:", err);
        setError("No se pudo cargar la estructura.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStructures();
    // Dependencias: Ejecutar cuando cambie la licencia o el tipo de estructura
  }, [licenseId, structureType, onChange, selectedStructure]);

  const baseClasses =
    "block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-2 border border-gray-300 rounded-md bg-gray-50">
        <Loader2 className="w-4 h-4 mr-2 animate-spin text-gray-500" />
        <span className="text-sm text-gray-500">Cargando estructuras...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center p-2 border border-red-300 rounded-md bg-red-50 text-red-700">
        <AlertCircle className="w-4 h-4 mr-2" />
        <span className="text-sm">{error}</span>
      </div>
    );
  }

  return (
    <select
      value={selectedStructure}
      onChange={(e) => onChange(e.target.value)}
      className={`${baseClasses} ${className}`}
      disabled={disabled || structureOptions.length === 0 || !structureType}
    >
      <option value="">
        {!structureType
          ? "Seleccione un tipo primero"
          : structureOptions.length > 0
          ? `Seleccione ${structureType}`
          : `No hay ${structureType}s disponibles`}
      </option>
      {structureOptions.map((structure) => (
        <option key={structure.id} value={structure.id}>
          {structure.name}
        </option>
      ))}
    </select>
  );
}
