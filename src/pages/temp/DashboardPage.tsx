import React from 'react';
import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../features/auth/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../features/auth/contexts/AuthContext';

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Sesión cerrada correctamente');
      navigate('/login');
    } catch (error) {
      toast.error('Error al cerrar sesión');
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900">Ho-Tech Portal</h1>
          <div className="flex items-center">
            <span className="mr-4">
              Bienvenido, {user?.usua_nomb || 'Usuario'}
            </span>
            <button 
              onClick={handleLogout}
              className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Dashboard</h2>
          <p>Contenido del dashboard aquí...</p>
          
          {user && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-md font-medium mb-2">Información de usuario</h3>
              <p><strong>Nombre:</strong> {user.usua_nomb}</p>
              <p><strong>Correo:</strong> {user.usua_corr}</p>
              <p><strong>Rol:</strong> {user.role?.nombre || 'No especificado'}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};