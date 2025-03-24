import React, {  } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Mientras se verifica la autenticación, mostrar indicador de carga
  if (isLoading) {
    console.log('[PrivateRoute] Mostrando pantalla de carga');
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
    console.log('[PrivateRoute] No autenticado, redirigiendo a /login');
    return <Navigate to="/login" replace />;
  }
  
  // Si está autenticado, mostrar el contenido protegido
  return <>{children}</>;
};

export default PrivateRoute;