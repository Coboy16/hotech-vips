import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../features/auth/contexts/AuthContext";
import { useModulePermissions } from "../../features/auth/contexts/ModulePermissionsContext";
import { LoadingScreen } from "../../components/common/loading/LoadingScreen";
import { findModulePermissionForPath } from "../utils/modulePermissionUtils";

export const AuthGuard: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { hasModuleAccess } = useModulePermissions(); // Hook del contexto de permisos
  const location = useLocation();

  console.log(
    `[AuthGuard] Path: ${location.pathname}, isLoading: ${isLoading}, isAuthenticated: ${isAuthenticated}`
  );

  if (isLoading) {
    console.log("[AuthGuard] Rendering LoadingScreen");
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    // GuestGuard ya debería haber manejado esto, pero es una doble verificación
    console.log("[AuthGuard] Not authenticated. Redirecting to /login.");
    return <Navigate to="/login" replace />;
  }

  // Este chequeo es VITAL
  if (user?.is_admin_hotech) {
    // Un admin Hotech NO debería llegar a las rutas protegidas por AuthGuard
    console.warn(
      `[AuthGuard] Admin user (${user.user_id}) detected in normal user route (${location.pathname}). Redirecting to /home-hotech.`
    );
    return <Navigate to="/home-hotech" replace />;
  }

  // Si llegó aquí, es un usuario normal autenticado
  console.log(
    `[AuthGuard] Normal user (${user?.user_id}) accessing ${location.pathname}. Checking permissions...`
  );

  // Manejo especial para el dashboard (asumimos acceso universal para usuarios normales)
  if (location.pathname === "/dashboard") {
    console.log("[AuthGuard] Accessing dashboard. Allowing.");
    return <Outlet />; // Permite renderizar el componente anidado (MainLayout -> DashboardScreen)
  }

  // Verificar permisos para otras rutas normales
  const modulePermission = findModulePermissionForPath(location.pathname);

  if (!modulePermission) {
    // Decide qué hacer si una ruta no tiene permiso definido en menuItems
    // ¿Permitir? ¿Denegar? ¿Mostrar 404?
    console.warn(
      `[AuthGuard] No specific permission found for route: ${location.pathname}. Allowing access (default behavior).`
    );
    // Considera cambiar esto si necesitas seguridad más estricta:
    // return <Navigate to="/dashboard" state={{ message: `Ruta ${location.pathname} no configurada` }} replace />;
    return <Outlet />;
  }

  console.log(
    `[AuthGuard] Route requires permission: ${modulePermission}. Checking user access...`
  );

  if (!hasModuleAccess(modulePermission)) {
    console.log(
      `[AuthGuard] Access DENIED to ${location.pathname} (Requires: ${modulePermission}). Redirecting to /dashboard.`
    );
    return (
      <Navigate
        to="/dashboard"
        state={{ deniedPath: location.pathname }}
        replace
      />
    ); // Opcional: pasar info en state
  }

  // Si pasó todas las verificaciones
  console.log(`[AuthGuard] Access GRANTED to ${location.pathname}`);
  return <Outlet />; // Renderiza el componente anidado (MainLayout -> Componente específico)
};
