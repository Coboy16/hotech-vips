import { menuItems } from "../../components/layout/sidebar/config/menuItems";
import { MenuItem } from "../../components/layout/sidebar/types";

/**
 * Encuentra el permiso de módulo asociado a una ruta específica.
 * Compara paths normalizados (sin / al final).
 */
export const findModulePermissionForPath = (
  path: string,
  items: MenuItem[] = menuItems // Asegúrate que menuItems esté bien definido y exportado
): string | null => {
  const normalizedPath = path.endsWith("/") ? path.slice(0, -1) : path;

  for (const item of items) {
    // Normalizar path del item del menú
    const normalizedItemPath = item.path.endsWith("/")
      ? item.path.slice(0, -1)
      : item.path;

    // Comparación exacta de paths normalizados
    if (normalizedItemPath === normalizedPath) {
      // console.log(`[findModulePermissionForPath] Match found: ${path} -> ${item.modulePermission}`);
      return item.modulePermission;
    }

    // Búsqueda recursiva en hijos
    if (item.children && item.children.length > 0) {
      const childPermission = findModulePermissionForPath(path, item.children);
      if (childPermission) {
        return childPermission;
      }
    }
  }

  // console.log(`[findModulePermissionForPath] No permission found for path: ${path}`);
  return null; // No se encontró permiso para esta ruta exacta
};

/**
 * Verifica si un usuario tiene acceso a un elemento del menú.
 * Esta función NO es usada directamente por los Guards, pero puede ser útil en otros lugares.
 * Los Guards usan `useModulePermissions().hasModuleAccess`.
 */
export const hasAccessToMenuItem = (
  item: MenuItem,
  modulePermissions: Record<string, boolean> | string[] // Puede ser objeto o array
): boolean => {
  if (!item.modulePermission) return true; // Si el item no declara permiso, se asume visible
  if (item.modulePermission === "always_visible") return true;

  let hasDirectAccess = false;
  if (Array.isArray(modulePermissions)) {
    hasDirectAccess = modulePermissions.includes(item.modulePermission);
  } else if (
    typeof modulePermissions === "object" &&
    modulePermissions !== null
  ) {
    hasDirectAccess = !!modulePermissions[item.modulePermission];
  } else {
    console.warn(
      "[hasAccessToMenuItem] modulePermissions no es un array ni un objeto válido:",
      modulePermissions
    );
    return false; // O manejar como prefieras
  }

  // Si tiene hijos, el acceso al padre depende de tener acceso directo O acceso a algún hijo
  if (item.children && item.children.length > 0) {
    const hasAccessToChild = item.children.some((child) =>
      hasAccessToMenuItem(child, modulePermissions)
    );
    return hasDirectAccess || hasAccessToChild;
  }

  return hasDirectAccess;
};
