import React from "react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Sidebar } from "./sidebar";
import { useAuth } from "../../features/auth/contexts/AuthContext";

export const MainLayout: React.FC = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleViewChange = (view: string) => {
    navigate(view);
  };

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
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar
        currentView={location.pathname}
        setCurrentView={handleViewChange}
        onLogout={handleLogout}
      />

      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
