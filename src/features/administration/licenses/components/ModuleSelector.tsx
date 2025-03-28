import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  Clock,
  Users,
  DoorClosed,
  Utensils,
  BarChart2,
  UserCheck,
  Fingerprint,
  Calendar,
  AlertCircle,
  AlignCenter,
} from "lucide-react";
import { moduleService, Module } from "../services/moduleService";

// Interfaces
interface ModuleGroup {
  id: string;
  label: string;
  permission: string;
  icon: React.ElementType;
  isExpanded: boolean;
  modules: ModuleItem[];
}

interface ModuleItem {
  id: string;
  label: string;
  permission: string;
  isSelected: boolean;
}

interface ModuleSelectorProps {
  selectedModules: string[];
  onChange: (modules: string[]) => void;
}

// Mapeo de permisos a etiquetas legibles
const permissionToLabelMap: Record<string, string> = {
  panel_monitoreo: "Panel de Monitoreo",
  empleados: "Empleados",
  gestion_empleados: "Gestión de Empleados",
  control_tiempo: "Control de Tiempo",
  planificador_horarios: "Planificador de horarios",
  gestion_incidencias: "Gestión de Incidencias",
  calendario: "Calendario",
  control_acceso: "Control de Acceso",
  visitantes: "Visitantes",
  permisos_acceso: "Permisos de Acceso",
  comedor: "Comedor",
  reportes: "Reportes",
  reportes_mas_usados: "Reportes más usados",
};

// Mapeo de permisos a iconos
const permissionToIconMap: Record<string, React.ElementType> = {
  panel_monitoreo: BarChart2,
  empleados: Users,
  gestion_empleados: UserCheck,
  control_tiempo: Clock,
  planificador_horarios: Clock,
  gestion_incidencias: Fingerprint,
  calendario: Calendar,
  control_acceso: DoorClosed,
  visitantes: Users,
  permisos_acceso: UserCheck,
  comedor: Utensils,
  reportes: AlignCenter,
  reportes_mas_usados: Clock,
};

// Definición de estructura de grupos de módulos y sus hijos
const moduleGroupsStructure: Record<string, string[]> = {
  panel_monitoreo: [],
  empleados: ["gestion_empleados"],
  control_tiempo: [
    "planificador_horarios",
    "gestion_incidencias",
    "calendario",
  ],
  control_acceso: ["visitantes", "permisos_acceso"],
  comedor: [],
  reportes: ["reportes_mas_usados"],
};

// Orden de los grupos principales para mostrarlos correctamente
const groupOrder = [
  "panel_monitoreo",
  "empleados",
  "control_tiempo",
  "control_acceso",
  "comedor",
  "reportes",
];

export function ModuleSelector({
  selectedModules,
  onChange,
}: ModuleSelectorProps) {
  const [moduleGroups, setModuleGroups] = useState<ModuleGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<number, boolean>>(
    {}
  );
  // Módulos disponibles desde la API
  const [availableModules, setAvailableModules] = useState<Module[]>([]);

  // Cargar módulos desde la API - SOLO UNA VEZ al montar el componente
  useEffect(() => {
    const fetchModules = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Usar el servicio de módulos que puede utilizar caché
        const allModules = await moduleService.getAllModules();

        if (allModules.length > 0) {
          setAvailableModules(allModules);
          initializeModuleGroups(allModules, selectedModules);
        } else {
          throw new Error("No se pudieron cargar los módulos");
        }
      } catch (err) {
        console.error("Error al cargar módulos:", err);
        setError(
          "No se pudieron cargar los módulos. Intente nuevamente más tarde."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchModules();
  }, []); // Array vacío para que solo se ejecute al montar el componente

  // Actualizar los grupos de módulos cuando cambian los selectedModules de props
  useEffect(() => {
    console.log("selectedModules actualizados:", selectedModules);
    if (availableModules.length > 0) {
      initializeModuleGroups(availableModules, selectedModules);
    }
  }, [selectedModules]); // Dependencia selectedModules

  // Inicializar los grupos de módulos con los datos de la API
  const initializeModuleGroups = (
    allModules: Module[],
    selectedIds: string[]
  ) => {
    console.log(
      "Inicializando grupos de módulos con seleccionados:",
      selectedIds
    );

    // Crear mapa de nombres de módulos a IDs
    const moduleNameToIdMap = new Map<string, string>();

    allModules.forEach((module) => {
      moduleNameToIdMap.set(module.name, module.module_id);
    });

    // Crear los grupos de módulos
    const groups: ModuleGroup[] = groupOrder
      .filter((permissionName) => moduleNameToIdMap.has(permissionName))
      .map((permissionName) => {
        const childrenPermissions = moduleGroupsStructure[permissionName] || [];

        const moduleId = moduleNameToIdMap.get(permissionName) || "";
        // const isSelected = selectedIds.includes(moduleId);

        return {
          id: moduleId,
          label: permissionToLabelMap[permissionName] || permissionName,
          permission: permissionName,
          icon: permissionToIconMap[permissionName] || AlertCircle,
          isExpanded: false,
          modules: childrenPermissions
            .filter((childPermission) => moduleNameToIdMap.has(childPermission))
            .map((childPermission) => {
              const childId = moduleNameToIdMap.get(childPermission) || "";
              const childSelected = selectedIds.includes(childId);

              return {
                id: childId,
                label: permissionToLabelMap[childPermission] || childPermission,
                permission: childPermission,
                isSelected: childSelected,
              };
            }),
        };
      });

    setModuleGroups(groups);
  };

  // Manejar expansión de un grupo
  const handleToggleGroup = (groupIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();

    setExpandedGroups((prev) => ({
      ...prev,
      [groupIndex]: !prev[groupIndex],
    }));
  };

  // Manejar selección de un grupo principal
  const handleToggleGroupSelection = (groupIndex: number) => {
    const group = moduleGroups[groupIndex];
    const willBeSelected = !selectedModules.includes(group.id);

    let newSelectedModules = [...selectedModules];

    // Añadir o quitar el grupo principal
    if (willBeSelected) {
      if (!newSelectedModules.includes(group.id)) {
        newSelectedModules.push(group.id);
      }
    } else {
      newSelectedModules = newSelectedModules.filter((id) => id !== group.id);
    }

    // Añadir o quitar los submódulos
    if (group.modules && group.modules.length > 0) {
      group.modules.forEach((module) => {
        if (willBeSelected) {
          if (!newSelectedModules.includes(module.id)) {
            newSelectedModules.push(module.id);
          }
        } else {
          newSelectedModules = newSelectedModules.filter(
            (id) => id !== module.id
          );
        }
      });
    }

    // Notificar cambio
    onChange(newSelectedModules);
  };

  // Manejar selección de un submódulo
  const handleToggleModuleSelection = (
    groupIndex: number,
    moduleIndex: number
  ) => {
    const group = moduleGroups[groupIndex];
    const module = group.modules[moduleIndex];
    const willBeSelected = !selectedModules.includes(module.id);

    let newSelectedModules = [...selectedModules];

    if (willBeSelected) {
      if (!newSelectedModules.includes(module.id)) {
        newSelectedModules.push(module.id);
      }
    } else {
      newSelectedModules = newSelectedModules.filter((id) => id !== module.id);
    }

    // Notificar cambio
    onChange(newSelectedModules);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-600">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Log para depuración
  console.log(
    "Renderizando ModuleSelector con selectedModules:",
    selectedModules
  );
  console.log("Grupos de módulos:", moduleGroups);

  return (
    <div className="space-y-4">
      {moduleGroups.map((group, groupIndex) => (
        <div
          key={group.id}
          className="border border-gray-200 rounded-md overflow-hidden"
        >
          <div className="flex items-center justify-between p-3 bg-white hover:bg-gray-50 cursor-pointer">
            <div
              className="flex-1 flex items-center"
              onClick={() => handleToggleGroupSelection(groupIndex)}
            >
              <input
                type="checkbox"
                className="mr-3 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={selectedModules.includes(group.id)}
                onChange={() => {}}
              />
              <span className="mr-3">
                {React.createElement(group.icon, {
                  className: "h-5 w-5 text-blue-500",
                })}
              </span>
              <span className="font-medium">{group.label}</span>
            </div>

            {group.modules.length > 0 && (
              <button
                onClick={(e) => handleToggleGroup(groupIndex, e)}
                className="p-1 rounded-full hover:bg-gray-200"
                type="button"
              >
                {expandedGroups[groupIndex] ? (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-500" />
                )}
              </button>
            )}
          </div>

          {expandedGroups[groupIndex] && group.modules.length > 0 && (
            <div className="bg-gray-50 border-t border-gray-200">
              {group.modules.map((module, moduleIndex) => (
                <div
                  key={module.id}
                  className="flex items-center p-3 pl-10 hover:bg-gray-100 cursor-pointer"
                  onClick={() =>
                    handleToggleModuleSelection(groupIndex, moduleIndex)
                  }
                >
                  <input
                    type="checkbox"
                    className="mr-3 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={selectedModules.includes(module.id)}
                    onChange={() => {}}
                  />
                  <span className="text-sm">{module.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default ModuleSelector;
