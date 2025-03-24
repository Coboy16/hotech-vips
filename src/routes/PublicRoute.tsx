import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth';

/**
 * Componente para rutas públicas
 * Si el usuario está autenticado, redirige al dashboard
 */
export const PublicRoute: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  // Si estamos en /login y el usuario está autenticado, redirigimos al dashboard
  if (isAuthenticated && location.pathname === '/login') {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Si no está autenticado o estamos en otra ruta pública, mostramos el contenido
  return <Outlet />;
};

export default PublicRoute;