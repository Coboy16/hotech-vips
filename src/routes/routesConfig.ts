/* eslint-disable @typescript-eslint/no-explicit-any */
import { lazy } from "react";
import { menuItems } from "../components/layout/sidebar/config/menuItems";
import { MenuItem } from "../components/layout/sidebar/types";

const DashboardScreen = lazy(
  () => import("../features/dashboard/DashboardScreen")
);
const StructureScreen = lazy(
  () => import("../features/system_configuration/companies/StructureScreen")
);
const UsersScreen = lazy(
  () => import("../features/administration/users/UsersScreen")
);

const NotFoundPage = lazy(() => import("../pages/NotFound/NotFoundPage"));

const routeComponentMap: Record<string, React.LazyExoticComponent<any>> = {
  dashboard: DashboardScreen,
  "system-config/structure": StructureScreen,
  "administration/users": UsersScreen,
};

const getUserModulePermissions = () => {
  const sessionUser = sessionStorage.getItem("user_data");
  const localUser = localStorage.getItem("user_data");
  const userString = sessionUser || localUser;

  if (!userString) return {};

  try {
    const user = JSON.parse(userString);
    return user?.modules || {};
  } catch (error) {
    console.error("[routesConfig] Error parseando datos de usuario:", error);
    return {};
  }
};

const hasAccessToMenuItem = (
  item: MenuItem,
  modulePermissions: Record<string, boolean>
): boolean => {
  if (item.modulePermission === "always_visible") return true;

  const hasDirectAccess = modulePermissions[item.modulePermission] === true;

  if (item.children && item.children.length > 0) {
    return (
      hasDirectAccess ||
      item.children.some((child) =>
        hasAccessToMenuItem(child, modulePermissions)
      )
    );
  }

  return hasDirectAccess;
};

export const generateRoutes = (): Record<
  string,
  React.LazyExoticComponent<any>
> => {
  const accessibleRoutes: Record<string, React.LazyExoticComponent<any>> = {};
  const modulePermissions = getUserModulePermissions();

  const staticModulePermissionsFallback = {
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

  const effectivePermissions = {
    ...staticModulePermissionsFallback,
    ...modulePermissions,
  };

  console.log("[routesConfig] Permisos efectivos:", effectivePermissions);

  const extractAndFilterRoutes = (items: MenuItem[]) => {
    items.forEach((item) => {
      if (hasAccessToMenuItem(item, effectivePermissions)) {
        const relativePath = item.path.startsWith("/")
          ? item.path.substring(1)
          : item.path;

        const component = routeComponentMap[relativePath];

        if (component) {
          accessibleRoutes[relativePath] = component;
          console.log(
            `[routesConfig] Mapeando ruta accesible: ${relativePath}`
          );
        } else if (!item.children || item.children.length === 0) {
          console.warn(
            `[routesConfig] No se encontró componente para la ruta: ${relativePath}. Usando NotFound.`
          );
          accessibleRoutes[relativePath] = NotFoundPage;
        }

        if (item.children && item.children.length > 0) {
          extractAndFilterRoutes(item.children);
        }
      } else {
        console.log(`[routesConfig] Acceso denegado para: ${item.path}`);
      }
    });
  };

  extractAndFilterRoutes(menuItems);
  console.log(
    "[routesConfig] Rutas accesibles generadas:",
    Object.keys(accessibleRoutes)
  );
  return accessibleRoutes;
};
