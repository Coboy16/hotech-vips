import React from "react";
import { Link } from "react-router-dom";

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-full flex items-center justify-center bg-gray-100 py-12">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
        <h1 className="text-4xl font-bold text-red-500 mb-4">404</h1>
        <p className="text-xl mb-4">Página no encontrada</p>
        <p className="mb-6 text-gray-600">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>
        <Link to="/" className="text-blue-500 hover:underline">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
