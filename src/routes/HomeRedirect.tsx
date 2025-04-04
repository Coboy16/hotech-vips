import React from "react";
import { Navigate } from "react-router-dom";
import { LoadingScreen } from "../components/common/loading/LoadingScreen";
import { useAuth } from "../features/auth";

export const HomeRedirect: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.is_admin_hotech) {
    return <Navigate to="/home-hotech" replace />;
  }

  return <Navigate to="/dashboard" replace />;
};

export default HomeRedirect;
