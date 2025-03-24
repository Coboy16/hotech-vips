import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth';

/**
 * Componente para rutas privadas
 * Si el usuario no está autenticado, redirige al login
 */
export const PrivateRoute: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  // Si no está autenticado, redirigimos al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Si está autenticado, mostramos el contenido
  return <Outlet />;
};

export default PrivateRoute;