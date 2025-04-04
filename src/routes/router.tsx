/* eslint-disable @typescript-eslint/no-explicit-any */
import { Suspense, lazy, ReactNode } from "react";
import { RouteObject, Navigate } from "react-router-dom";
import { PrivateRoute } from "./PrivateRoute";
import { PublicRoute } from "./PublicRoute";
import { MainLayout } from "../components/layout/MainLayout";
import { generateRoutes } from "./routesConfig"; // Genera las rutas dinámicamente según permisos

// --- Lazy Loading de Componentes ---
const LoginScreen = lazy(() => import("../features/auth/LoginScreen"));
const NotFoundPage = lazy(() => import("../pages/NotFound/NotFoundPage"));

// --- Componente de Carga (Usado en Suspense) ---
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

// --- Wrapper para Suspense ---
// Envuelve un componente cargado dinámicamente con un fallback de carga.
const suspenseWrapper = (
  Component: React.LazyExoticComponent<React.ComponentType<any>>
): ReactNode => (
  <Suspense fallback={<LoadingScreen />}>
    <Component />
  </Suspense>
);

// --- Generar Rutas Protegidas Dinámicamente ---
// Obtiene el mapeo de path -> componente desde generateRoutes()
const dynamicRouteComponents = generateRoutes();

// Convierte las rutas dinámicas en un array de objetos RouteObject para React Router
const protectedRoutes: RouteObject[] = Object.entries(dynamicRouteComponents)
  .map(([path, Component]) => {
    // Normaliza los paths eliminando "/" inicial si existe
    const relativePath = path.startsWith("/") ? path.substring(1) : path;
    if (!relativePath || !Component) return null; // Evita rutas inválidas

    return {
      path: relativePath,
      element: suspenseWrapper(Component),
    } as RouteObject;
  })
  .filter((route): route is NonNullable<typeof route> => route !== null); // Filtra rutas nulas

// --- Definición de Rutas ---
const routesConfigArray: RouteObject[] = [
  {
    // Ruta Pública: Login
    path: "/login",
    element: (
      <PublicRoute>
        <Suspense fallback={<LoadingScreen />}>
          <LoginScreen />
        </Suspense>
      </PublicRoute>
    ),
  },
  {
    // Contenedor principal de rutas protegidas dentro de MainLayout
    path: "/",
    element: (
      <PrivateRoute>
        <MainLayout />
      </PrivateRoute>
    ),
    children: [
      {
        // Redirección a /dashboard cuando la URL es exactamente "/"
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      // Inserta aquí todas las rutas protegidas generadas dinámicamente
      ...protectedRoutes,
      {
        // Página 404 dentro del layout principal
        path: "*",
        element: suspenseWrapper(NotFoundPage),
      },
    ],
  },
  // Ruta 404 global (opcional, la interna ya cubre los casos después del login)
  // {
  //   path: "*",
  //   element: suspenseWrapper(NotFoundPage),
  // }
];

export default routesConfigArray;
