import React, { useState, useEffect, useMemo } from "react";
import { Module, Role, ModuleGroupUI, ModuleItemUI } from "../types";
import {
  Check,
  Loader2,
  ChevronRight,
  AlertCircle,
  Users,
  Clock,
  DoorClosed,
  Utensils,
  BarChart2,
  AlignCenter,
  Settings,
  Circle,
} from "lucide-react";

// Mapeos existentes sin cambios
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
  configuracion_sistema: "Configuración del Sistema",
  companias: "Compañías",
  dispositivos: "Dispositivos",
  tipos_empleados: "Tipos de Empleados",
  tipos_acceso: "Tipos de Acceso",
  correo_electronico: "Correo electrónico",
  configuracion_general: "Configuración General",
  perfiles_marcaje: "Perfiles de Marcaje",
  geocerca: "Geocerca",
  modalidad_tiempo: "Modalidad De Tiempo",
  turnos_trabajo: "Turnos de Trabajo",
  administracion: "Administración",
  usuarios: "Usuarios",
  perfiles: "Perfiles",
};

const permissionToIconMap: Record<string, React.ElementType> = {
  panel_monitoreo: BarChart2,
  empleados: Users,
  control_tiempo: Clock,
  control_acceso: DoorClosed,
  comedor: Utensils,
  reportes: AlignCenter,
  configuracion_sistema: Settings,
  administracion: Settings,
};

// Estructura jerárquica sin cambios
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
  administracion: ["usuarios", "perfiles"],
  configuracion_sistema: [
    "companias",
    "dispositivos",
    "tipos_empleados",
    "tipos_acceso",
    "correo_electronico",
    "configuracion_general",
    "perfiles_marcaje",
    "geocerca",
    "modalidad_tiempo",
    "turnos_trabajo",
  ],
};

// Orden deseado sin cambios
const groupOrder = [
  "panel_monitoreo",
  "empleados",
  "control_tiempo",
  "control_acceso",
  "comedor",
  "reportes",
  "administracion",
  "configuracion_sistema",
];

// Props sin cambios
interface RoleFormProps {
  onSubmit: (data: { name: string; moduleIds: string[] }) => Promise<void>;
  onClose: () => void;
  initialData?: Role | null;
  availableModules: Module[];
  isLoading?: boolean;
  isLoadingModules?: boolean;
}

const RoleForm: React.FC<RoleFormProps> = ({
  onSubmit,
  onClose,
  initialData,
  availableModules,
  isLoading = false,
  isLoadingModules = false,
}) => {
  const [name, setName] = useState<string>("");
  const [selectedModuleIds, setSelectedModuleIds] = useState<Set<string>>(
    new Set()
  );
  const [nameError, setNameError] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {}
  );

  // Lógica para mapear módulos disponibles (sin cambios)
  const availableModulesMap = useMemo(() => {
    const map = new Map<string, Module>();
    availableModules.forEach((m) => {
      if (m.apiName) {
        map.set(m.apiName, m);
      }
    });
    return map;
  }, [availableModules]);

  // Construcción de la estructura de módulos (sin cambios)
  const structuredModules: ModuleGroupUI[] = useMemo(() => {
    const groups: ModuleGroupUI[] = [];

    for (const groupPermission of groupOrder) {
      const groupModule = availableModulesMap.get(groupPermission);

      if (groupModule) {
        const childrenPermissions =
          moduleGroupsStructure[groupPermission] || [];
        const childModulesUI: ModuleItemUI[] = [];

        for (const childPermission of childrenPermissions) {
          const childModule = availableModulesMap.get(childPermission);
          if (childModule) {
            childModulesUI.push({
              id: childModule.id,
              label: permissionToLabelMap[childPermission] || childModule.name,
              permission: childPermission,
            });
          }
        }

        groups.push({
          id: groupModule.id,
          label: permissionToLabelMap[groupPermission] || groupModule.name,
          permission: groupPermission,
          icon: permissionToIconMap[groupPermission] || AlertCircle,
          isExpanded: !!expandedGroups[groupModule.id],
          modules: childModulesUI,
        });
      }
    }
    return groups;
  }, [availableModulesMap, expandedGroups]);

  // Efectos y handlers (sin cambios en lógica)
  useEffect(() => {
    setName(initialData?.name || "");
    setSelectedModuleIds(new Set(initialData?.moduleIds || []));
    setNameError(null);
  }, [initialData]);

  const handleToggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const handleToggleGroupSelection = (group: ModuleGroupUI) => {
    const groupChildrenIds = group.modules.map((m) => m.id);
    const allIdsInGroup = [group.id, ...groupChildrenIds];
    const isCurrentlySelected = selectedModuleIds.has(group.id);

    setSelectedModuleIds((prevSelectedIds) => {
      const nextSelectedIds = new Set(prevSelectedIds);
      if (isCurrentlySelected) {
        allIdsInGroup.forEach((id) => nextSelectedIds.delete(id));
      } else {
        allIdsInGroup.forEach((id) => nextSelectedIds.add(id));
      }
      return nextSelectedIds;
    });
  };

  const handleToggleModuleSelection = (moduleId: string) => {
    setSelectedModuleIds((prevSelectedIds) => {
      const nextSelectedIds = new Set(prevSelectedIds);
      if (nextSelectedIds.has(moduleId)) {
        nextSelectedIds.delete(moduleId);
      } else {
        nextSelectedIds.add(moduleId);
      }
      return nextSelectedIds;
    });
  };

  const validateForm = (): boolean => {
    if (!name.trim()) {
      setNameError("El nombre del rol es requerido.");
      return false;
    }
    setNameError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || isLoading) {
      return;
    }
    await onSubmit({
      name: name.trim(),
      moduleIds: Array.from(selectedModuleIds),
    });
  };

  // UI mejorada con layout similar a la imagen de referencia
  return (
    <div>
      {/* Sección de datos de contacto */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <Circle className="h-5 w-5 text-blue-500 mr-2" />
          <h2 className="text-base font-medium text-gray-700">Datos del Rol</h2>
        </div>

        <div className="bg-white rounded-md p-4 shadow-sm">
          <div className="mb-4">
            <label
              htmlFor="roleName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nombre del Rol <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="roleName"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError(null);
              }}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                nameError ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Ej: Administrador de RRHH"
              disabled={isLoading}
            />
            {nameError && (
              <p className="mt-1 text-xs text-red-500">{nameError}</p>
            )}
          </div>
        </div>
      </div>

      {/* Sección de módulos contratados */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <Circle className="h-5 w-5 text-blue-500 mr-2" />
          <h2 className="text-base font-medium text-gray-700">Módulos</h2>
        </div>

        <div className="bg-white rounded-md p-4 shadow-sm">
          {isLoadingModules ? (
            <div className="flex items-center justify-center text-gray-500 py-6">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Cargando módulos
              disponibles...
            </div>
          ) : availableModules.length === 0 ? (
            <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200 text-yellow-700 text-sm">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                <span>
                  No se encontraron módulos configurados en el sistema.
                </span>
              </div>
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {structuredModules.map((group) => (
                <div
                  key={group.id}
                  className="border border-gray-200 rounded-md overflow-hidden bg-white"
                >
                  {/* Cabecera del grupo */}
                  <div className="flex items-center justify-between hover:bg-gray-50">
                    {/* Checkbox */}
                    <div className="pl-3 pr-2">
                      <input
                        type="checkbox"
                        id={`group-${group.id}`}
                        checked={selectedModuleIds.has(group.id)}
                        onChange={() => handleToggleGroupSelection(group)}
                        className="h-4 w-4 text-blue-500 focus:ring-blue-400 border-gray-300 rounded"
                      />
                    </div>

                    {/* Etiqueta con icono */}
                    <div
                      className="flex-1 py-3 flex items-center cursor-pointer"
                      onClick={() => handleToggleGroupSelection(group)}
                    >
                      <span className="mr-2 text-gray-500">
                        {React.createElement(group.icon, {
                          className: "h-5 w-5",
                        })}
                      </span>
                      <span className="text-sm font-medium text-gray-700">
                        {group.label}
                      </span>
                    </div>

                    {/* Chevron para expandir */}
                    {group.modules.length > 0 && (
                      <button
                        onClick={() => handleToggleGroup(group.id)}
                        className="pr-4 py-3"
                        type="button"
                      >
                        <ChevronRight
                          className={`h-5 w-5 text-gray-400 transition-transform ${
                            group.isExpanded ? "transform rotate-90" : ""
                          }`}
                        />
                      </button>
                    )}
                  </div>

                  {/* Submódulos expandibles */}
                  {group.isExpanded && group.modules.length > 0 && (
                    <div className="border-t border-gray-100">
                      {group.modules.map((module) => (
                        <div
                          key={module.id}
                          className="flex items-center pl-8 pr-4 py-3 hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            id={`module-${module.id}`}
                            checked={selectedModuleIds.has(module.id)}
                            onChange={() =>
                              handleToggleModuleSelection(module.id)
                            }
                            className="h-4 w-4 text-blue-500 focus:ring-blue-400 border-gray-300 rounded mr-3"
                          />
                          <label
                            htmlFor={`module-${module.id}`}
                            className="text-sm text-gray-700 cursor-pointer"
                          >
                            {module.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading || isLoadingModules}
          className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Check className="mr-2 h-4 w-4" />
          )}
          {initialData ? "Guardar cambios" : "Crear Rol"}
        </button>
      </div>
    </div>
  );
};
export default RoleForm;
