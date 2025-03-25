import React from 'react';
import { useAuth } from '../../features/auth/contexts/AuthContext';
import { MainLayout } from '../../components/layout/MainLayout';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <MainLayout>
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
    </MainLayout>
  );
};