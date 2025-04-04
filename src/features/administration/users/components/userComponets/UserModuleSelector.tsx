import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  AlertCircle,
  BarChart2,
  Clock,
  Users,
  DoorClosed,
  Utensils,
  AlignCenter,
} from "lucide-react";

// Interfaces
export interface AvailableModuleOption {
  id: string;
  label: string;
}

interface UserModuleSelectorProps {
  availableModules: AvailableModuleOption[];
  selectedPermissions: string[];
  onChange: (selectedIds: string[]) => void;
  disabled?: boolean;
}

// Mapeo de etiquetas a iconos (similar al del ModuleSelector)
const labelToIconMap: Record<string, React.ElementType> = {
  "Panel de Monitoreo": BarChart2,
  Empleados: Users,
  "Control de Tiempo": Clock,
  "Control de Acceso": DoorClosed,
  Comedor: Utensils,
  Reportes: AlignCenter,
};

// Definición de estructura de grupos de módulos y sus hijos (igual que en ModuleSelector)
const moduleGroupsStructure: Record<string, string[]> = {
  "Panel de Monitoreo": [],
  Empleados: ["Gestión de Empleados"],
  "Control de Tiempo": [
    "Planificador de horarios",
    "Gestión de Incidencias",
    "Calendario",
  ],
  "Control de Acceso": ["Visitantes", "Permisos de Acceso"],
  Comedor: [],
  Reportes: ["Reportes más usados"],
};

// Orden de los grupos principales
const groupOrder = [
  "Panel de Monitoreo",
  "Empleados",
  "Control de Tiempo",
  "Control de Acceso",
  "Comedor",
  "Reportes",
];

export function UserModuleSelector({
  availableModules,
  selectedPermissions,
  onChange,
  disabled = false,
}: UserModuleSelectorProps) {
  // Estado para controlar qué grupos están expandidos
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {}
  );

  // Agrupar los módulos disponibles por categoría
  const groupedModules = React.useMemo(() => {
    // Mapeo de IDs a objetos de módulo para búsquedas rápidas
    // const moduleMap = new Map(
    //   availableModules.map((module) => [module.id, module])
    // );

    // Función para determinar la categoría de un módulo basado en su etiqueta
    const findModuleCategory = (moduleLabel: string): string => {
      for (const [category, submodules] of Object.entries(
        moduleGroupsStructure
      )) {
        if (category === moduleLabel) return category;
        if (submodules.includes(moduleLabel)) return category;
      }
      return "Otros"; // Categoría por defecto
    };

    // Organizar los módulos en grupos
    const result: Record<string, AvailableModuleOption[]> = {};

    // Inicializar grupos basados en el orden especificado
    groupOrder.forEach((category) => {
      result[category] = [];
    });

    // Asignar cada módulo a su grupo
    availableModules.forEach((module) => {
      const category = findModuleCategory(module.label);
      if (!result[category]) {
        result[category] = [];
      }
      result[category].push(module);
    });

    return result;
  }, [availableModules]);

  // Determinar si un módulo es principal (grupo) o secundario (subgrupo)
  const isMainModule = (moduleLabel: string): boolean => {
    return Object.keys(moduleGroupsStructure).includes(moduleLabel);
  };

  // Obtener los submódulos para un módulo principal
  const getSubmodules = (mainModuleLabel: string): AvailableModuleOption[] => {
    const childLabels = moduleGroupsStructure[mainModuleLabel] || [];
    return groupedModules[mainModuleLabel].filter((module) =>
      childLabels.includes(module.label)
    );
  };

  // Obtener solo los módulos principales
  const getMainModules = (): AvailableModuleOption[] => {
    return Object.keys(groupedModules)
      .filter((category) =>
        groupedModules[category].some((m) => isMainModule(m.label))
      )
      .flatMap((category) =>
        groupedModules[category].filter((m) => isMainModule(m.label))
      );
  };

  // Manejar la expansión/colapso de un grupo
  const handleToggleExpand = (moduleId: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  // Comprobar si todos los submódulos de un grupo están seleccionados
  const isGroupFullySelected = (
    moduleId: string,
    moduleLabel: string
  ): boolean => {
    if (!isMainModule(moduleLabel))
      return selectedPermissions.includes(moduleId);

    const submodules = getSubmodules(moduleLabel);
    if (submodules.length === 0) return selectedPermissions.includes(moduleId);

    return (
      submodules.every((submodule) =>
        selectedPermissions.includes(submodule.id)
      ) && selectedPermissions.includes(moduleId)
    );
  };

  // Manejar la selección/deselección de un módulo
  const handleToggleModule = (moduleId: string, moduleLabel: string) => {
    if (disabled) return;

    let updatedSelection = [...selectedPermissions];

    // Si es un módulo principal con submódulos
    if (isMainModule(moduleLabel)) {
      const submodules = getSubmodules(moduleLabel);
      const allSelected = isGroupFullySelected(moduleId, moduleLabel);

      if (allSelected) {
        // Deseleccionar el grupo y todos sus submódulos
        updatedSelection = updatedSelection.filter(
          (id) => id !== moduleId && !submodules.some((m) => m.id === id)
        );
      } else {
        // Seleccionar el grupo y todos sus submódulos
        if (!updatedSelection.includes(moduleId)) {
          updatedSelection.push(moduleId);
        }

        submodules.forEach((submodule) => {
          if (!updatedSelection.includes(submodule.id)) {
            updatedSelection.push(submodule.id);
          }
        });
      }
    } else {
      // Módulo individual
      if (updatedSelection.includes(moduleId)) {
        updatedSelection = updatedSelection.filter((id) => id !== moduleId);
      } else {
        updatedSelection.push(moduleId);
      }
    }

    onChange(updatedSelection);
  };

  // Obtener el ícono para un módulo
  const getModuleIcon = (moduleLabel: string): React.ElementType => {
    return labelToIconMap[moduleLabel] || AlertCircle;
  };

  // Verificar si hay submódulos para un módulo principal
  const hasSubmodules = (moduleLabel: string): boolean => {
    return moduleGroupsStructure[moduleLabel]?.length > 0;
  };

  if (!availableModules || availableModules.length === 0) {
    return (
      <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200 text-yellow-700 text-sm flex items-center">
        <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
        <span>
          La licencia asociada no tiene módulos asignados. No se pueden
          seleccionar permisos.
        </span>
      </div>
    );
  }

  // Ordenar los módulos principales según el orden predefinido
  const mainModules = getMainModules().sort((a, b) => {
    const indexA = groupOrder.indexOf(a.label);
    const indexB = groupOrder.indexOf(b.label);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  return (
    <div className="space-y-2">
      {mainModules.map((module) => (
        <div
          key={module.id}
          className="bg-white rounded-md border border-gray-200 overflow-hidden"
        >
          {/* Módulo principal */}
          <div
            className={`flex items-center justify-between p-3 ${
              disabled ? "cursor-not-allowed" : "cursor-pointer"
            }`}
            onClick={() =>
              !disabled && handleToggleModule(module.id, module.label)
            }
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 mr-3">
                <div
                  className={`w-5 h-5 flex items-center justify-center rounded ${
                    selectedPermissions.includes(module.id)
                      ? "bg-blue-600"
                      : "border border-gray-300"
                  }`}
                >
                  {selectedPermissions.includes(module.id) && (
                    <svg
                      className="w-3.5 h-3.5 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5 13L9 17L19 7"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              </div>
              {React.createElement(getModuleIcon(module.label), {
                className: "h-5 w-5 text-blue-500 mr-2.5",
              })}
              <span className="font-medium">{module.label}</span>
            </div>

            {hasSubmodules(module.label) && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!disabled) handleToggleExpand(module.id);
                }}
                className="flex-shrink-0"
                disabled={disabled}
              >
                {expandedGroups[module.id] ? (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                )}
              </button>
            )}
          </div>

          {/* Submódulos (si hay y están expandidos) */}
          {hasSubmodules(module.label) && expandedGroups[module.id] && (
            <div className="border-t border-gray-100">
              {getSubmodules(module.label).map((submodule) => (
                <div
                  key={submodule.id}
                  className={`flex items-center p-3 pl-11 ${
                    disabled ? "cursor-not-allowed" : "cursor-pointer"
                  }`}
                  onClick={() =>
                    !disabled &&
                    handleToggleModule(submodule.id, submodule.label)
                  }
                >
                  <div className="flex-shrink-0 mr-3">
                    <div
                      className={`w-5 h-5 flex items-center justify-center rounded ${
                        selectedPermissions.includes(submodule.id)
                          ? "bg-blue-600"
                          : "border border-gray-300"
                      }`}
                    >
                      {selectedPermissions.includes(submodule.id) && (
                        <svg
                          className="w-3.5 h-3.5 text-white"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M5 13L9 17L19 7"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span>{submodule.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default UserModuleSelector;
