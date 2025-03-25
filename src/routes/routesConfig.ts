/* eslint-disable @typescript-eslint/no-explicit-any */
import { lazy } from "react";
import { menuItems } from "../components/layout/sidebar/config/menuItems";
import UsersScreen from "../features/administration/users/components/UsersScreen";

// Importaciones dinámicas para lazy loading
const DashboardScreen = lazy(
  () => import("../features/dashboard/components/DashboardScreen")
);
const StructureScreen = lazy(
  () =>
    import(
      "../features/system_configuration/companies/components/StructureScreen"
    )
);
const NotFoundPage = lazy(() => import("../pages/NotFound/NotFoundPage"));

// Mapeo de rutas a componentes
const routeComponentMap: Record<string, React.LazyExoticComponent<any>> = {
  "/dashboard": DashboardScreen,
  "/system-config/structure": StructureScreen,
  "/administration/users": UsersScreen,
  // Agregar aquí nuevos mapeos cuando se añadan módulos
};

// Función para generar rutas dinámicamente desde menuItems
export const generateRoutes = () => {
  const routes: Record<string, React.LazyExoticComponent<any>> = {
    ...routeComponentMap,
  };

  // Función recursiva para extraer todas las rutas del menú
  const extractRoutes = (items: typeof menuItems) => {
    items.forEach((item) => {
      // Si no hay un componente específico para esta ruta pero tiene hijos,
      // mapeamos a un componente por defecto o null
      if (!routes[item.path] && !item.children) {
        // Podríamos añadir un componente "en construcción" por defecto
        routes[item.path] = NotFoundPage;
      }

      // Procesar rutas hijas recursivamente
      if (item.children && item.children.length > 0) {
        extractRoutes(item.children);
      }
    });
  };

  extractRoutes(menuItems);
  return routes;
};
