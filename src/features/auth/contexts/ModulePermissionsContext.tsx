import React, { createContext, useContext, ReactNode } from "react";
import { useAuth } from "./AuthContext";

interface ModulePermissionsContextType {
  hasModuleAccess: (modulePermission: string) => boolean;
  modulePermissions: string[];
}

const ModulePermissionsContext = createContext<ModulePermissionsContextType>({
  hasModuleAccess: () => false,
  modulePermissions: [],
});

export const ModulePermissionsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();

  // Obtener todos los módulos a los que el usuario tiene acceso
  const modulePermissions = React.useMemo(() => {
    const moduleNames: string[] = [];

    // Añadir módulos directos del usuario (si existen)
    if (user?.userModule && user.userModule.length > 0) {
      user.userModule.forEach((moduleData) => {
        moduleNames.push(moduleData.module.name);
      });
    }

    // Añadir módulos del rol asignado (si existen)
    if (user?.role?.rolesModules && user.role.rolesModules.length > 0) {
      user.role.rolesModules.forEach((roleModule) => {
        if (!moduleNames.includes(roleModule.module.name)) {
          moduleNames.push(roleModule.module.name);
        }
      });
    }

    console.log("[ModulePermissionsContext] Módulos disponibles:", moduleNames);
    return moduleNames;
  }, [user]);

  // Función para verificar acceso a un módulo específico
  const hasModuleAccess = (modulePermission: string): boolean => {
    // Para debugging

    // Si no hay módulo específico, permitir (para rutas de sistema)
    if (!modulePermission) return true;

    // Permitir acceso a módulos marcados como siempre visibles
    if (modulePermission === "always_visible") return true;

    // Verificar si el módulo está en la lista de permisos
    const hasAccess = modulePermissions.includes(modulePermission);

    return hasAccess;
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
