import React from "react";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../../features/auth/contexts/AuthContext";
import LicensesScreen from "./licenses/LicensesScreen";

export const HomeHotechScreen: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Sesión cerrada correctamente");
      navigate("/login");
    } catch (error) {
      toast.error("Error al cerrar sesión");
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* AppBar */}
      <header className="bg-blue-600 text-white">
        <div className="w-full px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <img
              src="https://i.postimg.cc/jdTNsfWq/Logo-Ho-Tech-Blanco.png"
              alt="HoTech Logo"
              className="h-8 mr-3"
            />
            <h1 className="text-xl font-semibold">Panel de Administración</h1>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-white hover:text-indigo-100 transition-colors"
            title="Cerrar sesión"
          >
            <span>Cerrar sesión</span>
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="flex-1 overflow-auto">
        <LicensesScreen />
      </main>
    </div>
  );
};

export default HomeHotechScreen;
