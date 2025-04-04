import { menuItems } from "../../components/layout/sidebar/config/menuItems";
import { MenuItem } from "../../components/layout/sidebar/types";

/**
 * Encuentra el permiso de módulo asociado a una ruta
 */
export const findModulePermissionForPath = (
  path: string,
  items: MenuItem[] = menuItems
): string | null => {
  for (const item of items) {
    // Normalizar las rutas para comparar correctamente
    const normalizedItemPath = item.path.endsWith("/")
      ? item.path.slice(0, -1)
      : item.path;

    const normalizedPath = path.endsWith("/") ? path.slice(0, -1) : path;

    // Verificar si esta es la ruta que buscamos
    if (normalizedItemPath === normalizedPath) {
      return item.modulePermission;
    }

    // Verificar en los hijos si existen
    if (item.children && item.children.length > 0) {
      const childPermission = findModulePermissionForPath(path, item.children);
      if (childPermission) {
        return childPermission;
      }
    }
  }

  return null;
};

/**
 * Verifica si un usuario tiene acceso a un elemento del menú
 */
export const hasAccessToMenuItem = (
  item: MenuItem,
  modulePermissions: Record<string, boolean> | string[]
): boolean => {
  // Si es visible siempre, permitir acceso
  if (item.modulePermission === "always_visible") return true;

  // Verificar acceso según tipo de modulePermissions
  let hasDirectAccess = false;

  if (Array.isArray(modulePermissions)) {
    // Si es un array de nombres de módulos
    hasDirectAccess = modulePermissions.includes(item.modulePermission);
  } else {
    // Si es un objeto de booleanos
    hasDirectAccess = !!modulePermissions[item.modulePermission];
  }

  // Si tiene hijos, verificar acceso a alguno de ellos
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

/**
 * Lista de módulos críticos que siempre deberían estar disponibles
 */
export const CRITICAL_MODULES = [
  "panel_monitoreo",
  "administracion",
  "usuarios",
];
