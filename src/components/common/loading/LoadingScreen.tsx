import React from "react";

export const LoadingScreen: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-100">
    <div className="p-4 bg-white rounded shadow-md">
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span>Cargando...</span>
      </div>
    </div>
  </div>
);
