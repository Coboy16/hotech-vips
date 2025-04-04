import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { LoadingScreen } from "../../components/common/loading/LoadingScreen";
import { useAuth } from "../../features/auth";

export const HotechGuard: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Mientras se verifica la autenticación
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si no es admin de HoTech, redirigir al dashboard
  if (!user?.is_admin_hotech) {
    return <Navigate to="/dashboard" replace />;
  }

  // Si es admin de HoTech, permitir acceso
  return <Outlet />;
};
