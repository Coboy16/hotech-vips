import React, { Suspense } from "react"; // Suspense para lazy loading
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthGuard } from "./guards/AuthGuard";
import { HotechGuard } from "./guards/HotechGuard";
import { GuestGuard } from "./guards/GuestGuard";
import { MainLayout } from "../components/layout/MainLayout";
import { lazyImport } from "./lazyImport";
import { LoadingScreen } from "../components/common/loading/LoadingScreen"; // Para Suspense fallback

// --- Componentes Lazy ---
// Nota: lazyImport asume exportaciones NOMBRADAS. Si algún componente usa 'export default',
// deberás ajustar la llamada a lazyImport o el componente mismo.

// Login
const { LoginScreen } = lazyImport(
  () => import("../features/auth/LoginScreen"),
  "LoginScreen" // Nombre de la exportación nombrada
);
// Home Hotech
const { HomeHotechScreen } = lazyImport(
  () => import("../features/hotech/HomeHotechScreen"),
  "HomeHotechScreen" // Nombre de la exportación nombrada
);
// Dashboard
const { DashboardScreen } = lazyImport(
  () => import("../features/dashboard/DashboardScreen"),
  "DashboardScreen" // Nombre de la exportación nombrada
);
// Users
const { UsersScreen } = lazyImport(
  () => import("../features/administration/users/UsersScreen"),
  "UsersScreen" // Nombre de la exportación nombrada
);

const { RolesScreen } = lazyImport(
  () => import("../features/administration/roles/index"),
  "RolesScreen" // Nombre de la exportación nombrada
);
// Structure
const { StructureScreen } = lazyImport(
  () => import("../features/system_configuration/companies/StructureScreen"),
  "StructureScreen" // Nombre de la exportación nombrada
);
// Not Found
const { NotFoundPage } = lazyImport(
  // Asumimos exportación nombrada aquí también
  () => import("../pages/NotFound/NotFoundPage"),
  "NotFoundPage" // Nombre de la exportación nombrada (ajusta si es default)
);
// Home Redirect (para la ruta raíz)
const { HomeRedirect } = lazyImport(
  () => import("./HomeRedirect"), // Importa el componente HomeRedirect real
  "HomeRedirect" // Nombre de la exportación nombrada
);

// --- Wrapper de Suspense ---
// Helper para no repetir Suspense en cada Route
const SuspenseWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <Suspense fallback={<LoadingScreen />}>{children}</Suspense>;

export const RouterConfig: React.FC = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <SuspenseWrapper>
            <HomeRedirect />
          </SuspenseWrapper>
        }
      />
      {/* 2. Rutas Públicas (Solo si NO está autenticado) */}
      <Route element={<GuestGuard />}>
        {" "}
        {/* GuestGuard envuelve rutas públicas */}
        <Route
          path="/login"
          element={
            <SuspenseWrapper>
              <LoginScreen />
            </SuspenseWrapper>
          }
        />
        {/* Otras rutas públicas aquí si las hubiera */}
      </Route>
      {/* 3. Rutas Exclusivas HoTech Admin (Solo si es admin Hotech AUTENTICADO) */}
      <Route element={<HotechGuard />}>
        {" "}
        {/* HotechGuard envuelve rutas de admin */}
        {/* Estas rutas NO usan MainLayout general */}
        <Route
          path="/home-hotech" // Ruta específica base
          element={
            <SuspenseWrapper>
              <HomeHotechScreen />
            </SuspenseWrapper>
          }
        />
        <Route
          path="/home-hotech/*"
          element={<Navigate to="/home-hotech" replace />}
        />
      </Route>
      {/* 4. Rutas Protegidas Usuario Normal (Autenticado, NO Hotech Admin, con permisos) */}
      <Route element={<AuthGuard />}>
        {" "}
        {/* AuthGuard envuelve rutas de usuario normal */}
        {/* Estas rutas SÍ usan MainLayout */}
        <Route element={<MainLayout />}>
          {" "}
          <Route index element={<Navigate to="/dashboard" replace />} />
          {/* Dashboard */}
          <Route
            path="/dashboard"
            element={
              <SuspenseWrapper>
                <DashboardScreen />
              </SuspenseWrapper>
            }
          />
          {/* Administración */}
          <Route
            path="/administration/users"
            element={
              <SuspenseWrapper>
                <UsersScreen />
              </SuspenseWrapper>
            }
          />
          {/* Configuración */}
          <Route
            path="/system-config/structure"
            element={
              <SuspenseWrapper>
                <StructureScreen />
              </SuspenseWrapper>
            }
          />
          <Route
            path="/administration/perfil"
            element={
              <SuspenseWrapper>
                <RolesScreen />
              </SuspenseWrapper>
            }
          />
          <Route
            path="*"
            element={
              <SuspenseWrapper>
                <NotFoundPage />
              </SuspenseWrapper>
            }
          />
        </Route>{" "}
      </Route>{" "}
      <Route
        path="*"
        element={
          <SuspenseWrapper>
            <NotFoundPage />
          </SuspenseWrapper>
        }
      />
    </Routes>
  );
};
