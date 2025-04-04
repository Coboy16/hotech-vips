/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from "react";
import { StructureType, UserFormData } from "../../schemas/userSchema";
import { ApiStructureTreeResponse } from "../../../../../model";
import { structureService } from "../../services/structureService";
import { UseFormSetValue } from "react-hook-form";

// Función para determinar los tipos de estructura disponibles
export const getAvailableStructureTypes = (
  tree: ApiStructureTreeResponse | null
): StructureType[] => {
  const availableTypes = new Set<StructureType>();

  // Si el árbol (objeto de licencia con relaciones) existe, 'company' está disponible.
  if (tree?.license_id) {
    availableTypes.add("company");
  } else {
    return []; // Si no hay árbol, no hay tipos.
  }

  // Revisar el array 'companies' DENTRO del árbol para tipos anidados
  tree.companies?.forEach((company) => {
    // Iterar incluso si está vacío, no causa error
    if (company.branches && company.branches.length > 0) {
      availableTypes.add("sede");
      company.branches.forEach((branch) => {
        if (branch.departments && branch.departments.length > 0) {
          availableTypes.add("department");
          branch.departments.forEach((department) => {
            if (department.sections && department.sections.length > 0) {
              availableTypes.add("section");
              department.sections.forEach((section) => {
                if (section.units && section.units.length > 0) {
                  availableTypes.add("unit");
                }
              });
            }
          });
        }
      });
    }
  });

  const order: StructureType[] = [
    "company",
    "sede",
    "department",
    "section",
    "unit",
  ];
  return order.filter((type) => availableTypes.has(type));
};

// Mapa de tipos de estructura a etiquetas legibles
export const structureTypeLabels: Record<StructureType, string> = {
  company: "Compañía",
  sede: "Sede",
  department: "Departamento",
  section: "Sección",
  unit: "Unidad",
};

interface UseStructureTreeProps {
  licenseId: string;
  user?: any | null;
  setValue: UseFormSetValue<UserFormData>;
  trigger: () => void;
}

export function useStructureTree({
  licenseId,
  user,
  setValue,
}: UseStructureTreeProps) {
  const [structureTree, setStructureTree] =
    useState<ApiStructureTreeResponse | null>(null);
  const [isTreeLoading, setIsTreeLoading] = useState(true);
  const [treeError, setTreeError] = useState<string | null>(null);

  // Cargar Árbol de Estructura
  useEffect(() => {
    let isMounted = true; // Flag para evitar setear estado si el componente se desmonta
    const fetchTree = async () => {
      if (!licenseId) {
        setIsTreeLoading(false);
        setTreeError("ID de Licencia no disponible.");
        return;
      }
      console.log(
        `[UserForm] Iniciando carga de árbol para licencia: ${licenseId}`
      );
      setIsTreeLoading(true);
      setTreeError(null);
      setStructureTree(null);
      try {
        // structureService.getStructureTree ahora devuelve el objeto directamente (o null)
        const treeData = await structureService.getStructureTree(licenseId);
        console.log("[UserForm] Árbol recibido:", treeData);
        if (isMounted) {
          setStructureTree(treeData); // Guardar el objeto (o null)

          // Lógica para setear tipo por defecto DESPUÉS de cargar el árbol
          if (!user && treeData) {
            // Solo en creación y si el árbol cargó
            const availableTypes = getAvailableStructureTypes(treeData);
            console.log(
              "[UserForm] Tipos disponibles detectados:",
              availableTypes
            );
            if (availableTypes.length === 1) {
              console.log(
                `[UserForm] Estableciendo tipo por defecto a: ${availableTypes[0]}`
              );
              // Usar setValue para actualizar el form state
              setValue("structure_type", availableTypes[0], {
                shouldValidate: false, // Cambiado a false para evitar validaciones inmediatas
              });
              // Si el único tipo es company, pre-seleccionar su ID (license_id)
              if (availableTypes[0] === "company") {
                setValue("structure_id", treeData.license_id, {
                  shouldValidate: false, // Cambiado a false para evitar validaciones inmediatas
                });
                console.log(
                  `[UserForm] Pre-seleccionando ID de compañía: ${treeData.license_id}`
                );
              }
            } else {
              console.log(
                "[UserForm] Múltiples o ningún tipo disponible, requiere selección."
              );
              setValue("structure_type", "", { shouldValidate: false });
              setValue("structure_id", "", { shouldValidate: false });
            }
          } else if (!user && !treeData) {
            // Caso: Creación pero el árbol vino null o vacío
            console.warn(
              "[UserForm] Árbol de estructura no encontrado o vacío para la licencia."
            );
            setValue("structure_type", "", { shouldValidate: false });
            setValue("structure_id", "", { shouldValidate: false });
          }

          // No disparamos el trigger aquí para evitar validaciones inmediatas
        }
      } catch (err) {
        console.error("[UserForm] Error al cargar árbol de estructura:", err);
        if (isMounted) {
          setTreeError("No se pudo cargar la estructura organizacional.");
        }
      } finally {
        if (isMounted) {
          setIsTreeLoading(false);
          console.log("[UserForm] Carga de árbol finalizada.");
        }
      }
    };

    fetchTree();

    return () => {
      isMounted = false; // Cleanup: marcar como desmontado
    };
  }, [licenseId, user, setValue]);

  // Calcular tipos disponibles
  const availableTypes = useMemo(
    () => getAvailableStructureTypes(structureTree),
    [structureTree]
  );

  return {
    structureTree,
    isTreeLoading,
    treeError,
    availableTypes,
    structureTypeLabels,
  };
}
