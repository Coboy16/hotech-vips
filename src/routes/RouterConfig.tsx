import React from "react";
import { Routes, Route } from "react-router-dom";
import { AuthGuard } from "./guards/AuthGuard";
import { HotechGuard } from "./guards/HotechGuard";
import { GuestGuard } from "./guards/GuestGuard";
import { MainLayout } from "../components/layout/MainLayout";
import { lazyImport } from "./lazyImport";

// Importaciones mediante lazy loading
const { LoginScreen } = lazyImport(
  () => import("../features/auth/LoginScreen"),
  "LoginScreen"
);
const { HomeHotechScreen } = lazyImport(
  () => import("../features/hotech/HomeHotechScreen"),
  "HomeHotechScreen"
);
const { DashboardScreen } = lazyImport(
  () => import("../features/dashboard/DashboardScreen"),
  "default"
);
const { UsersScreen } = lazyImport(
  () => import("../features/administration/users/UsersScreen"),
  "UsersScreen"
);
const { StructureScreen } = lazyImport(
  () => import("../features/system_configuration/companies/StructureScreen"),
  "StructureScreen"
);
const { NotFoundPage } = lazyImport(
  () => import("../pages/NotFound/NotFoundPage"),
  "default"
);

// Componente para redirección basada en tipo de usuario
const HomeRedirect = lazyImport(
  () => import("../features/hotech/HomeHotechScreen"),
  "HomeHotechScreen"
).HomeHotechScreen;

export const RouterConfig: React.FC = () => {
  return (
    <Routes>
      {/* Redirección inteligente basada en rol */}
      <Route path="/" element={<HomeRedirect />} />

      {/* Rutas públicas - solo accesibles si NO estás autenticado */}
      <Route element={<GuestGuard />}>
        <Route path="/login" element={<LoginScreen />} />
      </Route>

      {/* Rutas exclusivas para admin HoTech */}
      <Route element={<HotechGuard />}>
        <Route path="/home-hotech/*" element={<HomeHotechScreen />} />
      </Route>

      {/* Rutas protegidas para usuarios normales */}
      <Route element={<AuthGuard />}>
        <Route element={<MainLayout />}>
          {/* Dashboard */}
          <Route path="/dashboard" element={<DashboardScreen />} />

          {/* Administración */}
          <Route path="/administration/users" element={<UsersScreen />} />

          {/* Configuración */}
          <Route
            path="/system-config/structure"
            element={<StructureScreen />}
          />

          {/* Página 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
};
