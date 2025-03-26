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
    empleados: true,
    gestion_empleados: true,
    control_tiempo: true,
    planificador_horarios: false,
    gestion_incidencias: true,
    calendario: true,
    control_acceso: true,
    visitantes: true,
    permisos_acceso: false,
    comedor: true,
    reportes: true,
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
