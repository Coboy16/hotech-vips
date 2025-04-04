import React from "react";
import { Navigate } from "react-router-dom";
import { LoadingScreen } from "../components/common/loading/LoadingScreen";
import { useAuth } from "../features/auth/contexts/AuthContext";

export const HomeRedirect: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  console.log(
    `[HomeRedirect] isLoading: ${isLoading}, isAuthenticated: ${isAuthenticated}, User exists: ${!!user}`
  );

  if (isLoading) {
    console.log("[HomeRedirect] Rendering LoadingScreen");
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    console.log("[HomeRedirect] Not authenticated. Redirecting to /login.");
    return <Navigate to="/login" replace />;
  }

  // Este es el punto CRÍTICO
  if (user) {
    // Asegurarse que user no es null
    console.log(
      `[HomeRedirect] User Authenticated. Checking role. is_admin_hotech: ${user.is_admin_hotech}`
    );
    if (user.is_admin_hotech) {
      console.log(
        "[HomeRedirect] User is admin_hotech. Redirecting to /home-hotech."
      );
      return <Navigate to="/home-hotech" replace />;
    } else {
      console.log(
        "[HomeRedirect] User is normal user. Redirecting to /dashboard."
      );
      return <Navigate to="/dashboard" replace />;
    }
  } else {
    // Esto no debería pasar si isAuthenticated es true, pero es una salvaguarda
    console.error(
      "[HomeRedirect] ERROR: Authenticated but user object is null! Redirecting to /login."
    );
    // Podrías intentar forzar un logout aquí o redirigir a login
    // logout(); // Si tienes acceso a logout desde useAuth
    return <Navigate to="/login" replace />;
  }
};

// Asegúrate de tener una exportación nombrada para lazyImport
// export default HomeRedirect; <--- Quita esto si no es necesario
