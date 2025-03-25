import React, { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/contexts/AuthContext";

interface PublicRouteProps {
  children: ReactNode;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Si estamos en /login y el usuario está autenticado, redirigimos al dashboard
  if (isAuthenticated && location.pathname === "/login") {
    return <Navigate to="/dashboard" replace />;
  }

  // Si no está autenticado o estamos en otra ruta pública, mostramos el contenido
  return <>{children}</>;
};
