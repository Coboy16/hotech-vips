import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Suspense, lazy } from "react";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./features/auth/contexts/AuthContext";
import { ModulePermissionsProvider } from "./features/auth/contexts/ModulePermissionsContext";
import { PrivateRoute } from "./routes/PrivateRoute";
import { PublicRoute } from "./routes/PublicRoute";
import { MainLayout } from "./components/layout/MainLayout";
import { generateRoutes } from "./routes/routesConfig";
import React from "react";

// Lazy loading para optimización
const LoginScreen = lazy(
  () => import("./features/auth/components/LoginScreen")
);
const NotFoundPage = lazy(() => import("./pages/NotFound/NotFoundPage"));

// Página con estado de carga
const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-100">
    <div className="p-4 bg-white rounded shadow-md">
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span>Cargando...</span>
      </div>
    </div>
  </div>
);

// Componente principal de la aplicación
function AppContent() {
  // Generar rutas dinámicamente
  const routes = generateRoutes();

  return (
    <Router>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Redirigir la ruta raíz a dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" />} />

          {/* Ruta de login */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginScreen />
              </PublicRoute>
            }
          />

          {/* Rutas protegidas dentro del layout */}
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <MainLayout>
                  <Routes>
                    {/* Generar rutas dinámicamente desde la configuración */}
                    {Object.entries(routes).map(([path, Component]) => (
                      <Route
                        key={path}
                        path={path.replace(/^\//, "")}
                        element={<Component />}
                      />
                    ))}

                    {/* Ruta 404 para rutas no encontradas */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </MainLayout>
              </PrivateRoute>
            }
          />
        </Routes>
      </Suspense>
      <Toaster position="top-right" />
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <ModulePermissionsProvider>
        <AppContent />
      </ModulePermissionsProvider>
    </AuthProvider>
  );
}

export default App;
