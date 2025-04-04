import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { LoadingScreen } from "../../components/common/loading/LoadingScreen";
import { useAuth } from "../../features/auth/contexts/AuthContext";

export const GuestGuard: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth(); // Obtener user también es útil
  const location = useLocation();

  console.log(
    `[GuestGuard] Path: ${location.pathname}, isLoading: ${isLoading}, isAuthenticated: ${isAuthenticated}`
  );

  if (isLoading) {
    console.log("[GuestGuard] Rendering LoadingScreen");
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    // Decide a dónde redirigir si ya está autenticado
    const redirectTo = user?.is_admin_hotech ? "/home-hotech" : "/dashboard";
    console.log(
      `[GuestGuard] User already authenticated. Redirecting from public route ${location.pathname} to ${redirectTo}.`
    );
    return <Navigate to={redirectTo} replace />;
  }

  // Si no está autenticado, permitir acceso a rutas públicas
  console.log(
    `[GuestGuard] User not authenticated. Allowing access to public route ${location.pathname}`
  );
  return <Outlet />; // Permite renderizar el componente anidado (LoginScreen)
};
