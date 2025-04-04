import React from "react";
import { Link } from "react-router-dom";

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-full flex items-center justify-center bg-gray-100 py-12">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
        <img
          src="https://i.postimg.cc/jdTNsfWq/Logo-Ho-Tech-Blanco.png"
          alt="Logo Ho Tech"
          className="mx-auto mb-4 w-32 filter invert-0 brightness-0 contrast-200"
          style={{
            filter:
              "invert(22%) sepia(93%) saturate(1845%) hue-rotate(206deg) brightness(95%) contrast(92%)",
          }}
        />
        <h1 className="text-2xl font-semibold text-blue-500 mb-4">
          Estamos en desarrollo
        </h1>
        <p className="mb-4 text-gray-600">
          Actualmente estamos trabajando en nuevas funcionalidades. Algunas
          páginas pueden no estar disponibles temporalmente.
        </p>
        <Link to="/" className="text-blue-500 hover:underline">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
