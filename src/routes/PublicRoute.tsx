import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '../features/auth';

export const PublicRoute = () => {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) {
    // Puedes mostrar un spinner o componente de carga aquí
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
};