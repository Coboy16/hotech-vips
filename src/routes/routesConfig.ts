/* eslint-disable @typescript-eslint/no-explicit-any */
import { lazy } from "react";
import { menuItems } from "../components/layout/sidebar/config/menuItems";
import { MenuItem } from "../components/layout/sidebar/types";

// Importaciones dinámicas para lazy loading
const DashboardScreen = lazy(
  () => import("../features/dashboard/components/DashboardScreen")
);
const StructureScreen = lazy(
  () => import("../features/system_configuration/companies/StructureScreen")
);
const UsersScreen = lazy(
  () => import("../features/administration/users/UsersScreen")
);

const LicensesScreen = lazy(
  () => import("../features/administration/licenses/LicensesScreen")
);

const NotFoundPage = lazy(() => import("../pages/NotFound/NotFoundPage"));

// Mapeo de rutas a componentes
const routeComponentMap: Record<string, React.LazyExoticComponent<any>> = {
  "/dashboard": DashboardScreen,
  "/system-config/structure": StructureScreen,
  "/administration/users": UsersScreen,
  "/administration/licenses": LicensesScreen,
  // Agregar aquí nuevos mapeos cuando se añadan módulos
};

// Función para obtener los permisos de módulos del usuario actual
const getUserModulePermissions = () => {
  // Esto podría obtenerse desde el localStorage donde guardas el usuario
  try {
    const user = JSON.parse(
      localStorage.getItem("user") || sessionStorage.getItem("user") || "{}"
    );
    return user?.modules || {};
  } catch (error) {
    console.error(
      "[routesConfig] Error obteniendo permisos de módulos:",
      error
    );
    return {};
  }
};

// Función recursiva para verificar si un elemento de menú o sus hijos tienen acceso
const hasAccessToMenuItem = (
  item: MenuItem,
  modulePermissions: Record<string, boolean>
): boolean => {
  // Si es un módulo siempre visible, permitir acceso
  if (item.modulePermission === "always_visible") {
    return true;
  }

  // Verificar si el usuario tiene acceso a este módulo específico
  const hasDirectAccess = modulePermissions[item.modulePermission] !== false;

  // Si no tiene acceso directo y no tiene hijos, denegar acceso
  if (!hasDirectAccess && (!item.children || item.children.length === 0)) {
    return false;
  }

  // Si tiene hijos, verificar si al menos uno es accesible
  if (item.children && item.children.length > 0) {
    return item.children.some((child) =>
      hasAccessToMenuItem(child, modulePermissions)
    );
  }

  return hasDirectAccess;
};

// Función para generar rutas dinámicamente desde menuItems
export const generateRoutes = () => {
  const routes: Record<string, React.LazyExoticComponent<any>> = {
    ...routeComponentMap,
  };

  // Obtener permisos de módulos del usuario actual
  const modulePermissions = getUserModulePermissions();

  // Por ahora, usar permisos estáticos mientras el backend los implementa
  const staticModulePermissions = {
    panel_monitoreo: true,
    empleados: true,
    gestion_empleados: true,
    control_tiempo: true,
    planificador_horarios: false,
    gestion_incidencias: true,
    calendario: true,
    control_acceso: true,
    visitantes: true,
    permisos_acceso: false,
    comedor: true,
    reportes: true,
    reportes_mas_usados: false,
  };

  // Usar permisos estáticos mientras no hay implementación del backend
  const effectivePermissions = {
    ...staticModulePermissions,
    ...modulePermissions,
  };

  // Función recursiva para extraer todas las rutas del menú
  const extractRoutes = (items: typeof menuItems) => {
    items.forEach((item) => {
      // Verificar si el usuario tiene acceso a este módulo
      if (hasAccessToMenuItem(item, effectivePermissions)) {
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
      }
    });
  };

  extractRoutes(menuItems);
  return routes;
};
