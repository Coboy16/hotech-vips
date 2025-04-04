import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { LoadingScreen } from "../../components/common/loading/LoadingScreen";
import { useAuth } from "../../features/auth";

export const GuestGuard: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Mientras se verifica la autenticación
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Si está autenticado, redirigir según corresponda
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Si no está autenticado, permitir acceso a rutas públicas
  return <Outlet />;
};
