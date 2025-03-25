import React from "react";
import { useAuth } from "../../../features/auth/contexts/AuthContext";

export const DashboardScreen: React.FC = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Panel de Control</h1>

      {user && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-md font-medium mb-2">Información de usuario</h3>
          <p>
            <strong>Nombre:</strong> {user.usua_nomb}
          </p>
          <p>
            <strong>Correo:</strong> {user.usua_corr}
          </p>
          <p>
            <strong>Rol:</strong> {user.role?.nombre || "No especificado"}
          </p>
        </div>
      )}
    </div>
  );
};

export default DashboardScreen;
