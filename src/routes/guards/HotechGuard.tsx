import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { LoadingScreen } from "../../components/common/loading/LoadingScreen";
import { useAuth } from "../../features/auth/contexts/AuthContext";

export const HotechGuard: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  console.log(
    `[HotechGuard] Path: ${location.pathname}, isLoading: ${isLoading}, isAuthenticated: ${isAuthenticated}`
  );

  if (isLoading) {
    console.log("[HotechGuard] Rendering LoadingScreen");
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    console.log("[HotechGuard] Not authenticated. Redirecting to /login.");
    return <Navigate to="/login" replace />;
  }

  if (!user?.is_admin_hotech) {
    // Usuario normal intentando acceder a ruta de admin
    console.warn(
      `[HotechGuard] Normal user (${user?.user_id}) attempting to access admin route ${location.pathname}. Redirecting to /dashboard.`
    );
    return <Navigate to="/dashboard" replace />;
  }

  // Si es admin Hotech y autenticado
  console.log(
    `[HotechGuard] Admin user (${user.user_id}) granted access to ${location.pathname}`
  );
  return <Outlet />; // Permite renderizar el componente anidado (HomeHotechScreen)
};
