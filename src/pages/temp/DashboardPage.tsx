// src/pages/Dashboard/DashboardPage.tsx
import React from 'react';

export const DashboardPage: React.FC = () => {

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900">Ho-Tech Portal</h1>
          <div className="flex items-center">
            <span className="mr-4">Bienvenido, COBOY</span>
            <button 
              onClick={() => {}}
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
        </div>
      </main>

      {/* Aquí puedes importar y mostrar el LogoutModal cuando showLogoutModal es true */}
    </div>
  );
};