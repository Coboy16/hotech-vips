import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../features/auth/contexts/AuthContext";
import { useModulePermissions } from "../../features/auth/contexts";
import { LoadingScreen } from "../../components/common/loading/LoadingScreen";
import { findModulePermissionForPath } from "../utils/modulePermissionUtils";

export const AuthGuard: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { hasModuleAccess } = useModulePermissions();
  const location = useLocation();

  // Mientras se verifica la autenticación
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si es admin de HoTech, redirigir a su vista específica
  if (user?.is_admin_hotech) {
    return <Navigate to="/home-hotech" replace />;
  }

  // Verificar permisos de acceso para la ruta actual
  const modulePermission = findModulePermissionForPath(location.pathname);

  // Si no encontramos un permiso específico, permitir el acceso (podría ser una ruta de sistema)
  if (!modulePermission) {
    return <Outlet />;
  }

  // Verificar si el usuario tiene acceso a este módulo
  if (!hasModuleAccess(modulePermission)) {
    console.log(
      `[AuthGuard] Acceso denegado a ${location.pathname}, redirigiendo a /dashboard`
    );
    return <Navigate to="/dashboard" replace />;
  }

  // Si está autenticado y tiene acceso, permitir la visualización
  return <Outlet />;
};
