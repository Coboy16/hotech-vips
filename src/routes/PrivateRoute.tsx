import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/contexts/AuthContext";
import { useModulePermissions } from "../features/auth/contexts/ModulePermissionsContext";
import { menuItems } from "../components/layout/sidebar/config/menuItems";
import { MenuItem } from "../components/layout/sidebar/types";

interface PrivateRouteProps {
  children: React.ReactNode;
}

const findModulePermissionForPath = (
  path: string,
  items: MenuItem[]
): string | null => {
  for (const item of items) {
    // Verificar si esta es la ruta que buscamos
    if (item.path === path) {
      return item.modulePermission;
    }

    // Verificar en los hijos si existen
    if (item.children && item.children.length > 0) {
      const childPermission = findModulePermissionForPath(path, item.children);
      if (childPermission) {
        return childPermission;
      }
    }
  }

  return null;
};

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { hasModuleAccess } = useModulePermissions();
  const location = useLocation();

  // Mientras se verifica la autenticación, mostrar indicador de carga
  if (isLoading) {
    console.log("[PrivateRoute] Mostrando pantalla de carga");
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-4 bg-white rounded shadow-md">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    console.log("[PrivateRoute] No autenticado, redirigiendo a /login");
    return <Navigate to="/login" replace />;
  }

  // Verificar permisos de acceso para la ruta actual
  const modulePermission = findModulePermissionForPath(
    location.pathname,
    menuItems
  );

  // Si no encontramos un permiso específico, permitir el acceso (podría ser una ruta de sistema)
  if (!modulePermission) {
    return <>{children}</>;
  }

  // Si el módulo siempre es visible, permitir acceso
  if (modulePermission === "always_visible") {
    return <>{children}</>;
  }

  // Verificar si el usuario tiene acceso a este módulo
  if (!hasModuleAccess(modulePermission)) {
    console.log(
      `[PrivateRoute] Acceso denegado a ${location.pathname}, redirigiendo a /dashboard`
    );
    return <Navigate to="/dashboard" replace />;
  }

  // Si está autenticado y tiene acceso, mostrar el contenido protegido
  return <>{children}</>;
};

export default PrivateRoute;
