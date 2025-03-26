import React, { createContext, useContext, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { ModulesPermissions } from "../types/auth";

interface ModulePermissionsContextType {
  hasModuleAccess: (modulePermission: string) => boolean;
  modulePermissions: ModulesPermissions | null;
}

const ModulePermissionsContext = createContext<ModulePermissionsContextType>({
  hasModuleAccess: () => false,
  modulePermissions: null,
});

export const ModulePermissionsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();

  // Por defecto, usar datos estáticos hasta que el backend proporcione los permisos reales
  const staticModulePermissions: ModulesPermissions = {
    panel_monitoreo: true,
    empleados: false,
    gestion_empleados: false,
    control_tiempo: false,
    planificador_horarios: false,
    gestion_incidencias: false,
    calendario: false,
    control_acceso: false,
    visitantes: false,
    permisos_acceso: true,
    comedor: false,
    reportes: false,
    reportes_mas_usados: false,
  };

  // Usar los permisos del usuario si existen, o los estáticos si no
  const modulePermissions = user?.modules || staticModulePermissions;

  const hasModuleAccess = (modulePermission: string): boolean => {
    // Ciertos módulos siempre están visibles (admin, configuración del sistema)
    if (modulePermission === "always_visible") {
      return true;
    }

    // Verificar si el módulo existe y está habilitado
    return modulePermissions
      ? !!modulePermissions[modulePermission as keyof ModulesPermissions]
      : false;
  };

  return (
    <ModulePermissionsContext.Provider
      value={{ hasModuleAccess, modulePermissions }}
    >
      {children}
    </ModulePermissionsContext.Provider>
  );
};

export const useModulePermissions = () => useContext(ModulePermissionsContext);
