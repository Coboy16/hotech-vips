import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../features/auth/contexts/AuthContext";

interface PublicRouteProps {
  children: React.ReactElement;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Evita renderizar mientras se verifica el estado de autenticación
  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    console.log(
      "[PublicRoute] Usuario autenticado intentando acceder a ruta pública. Redirigiendo a /dashboard"
    );
    return <Navigate to="/dashboard" replace />;
  }

  // Si no está autenticado, permite acceder a la ruta pública (ej. login)
  return children;
};

export default PublicRoute;
