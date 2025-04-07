import { ApiUser, CreateUserDto, Permission, User } from "../types/user";

/**
 * Transforma un usuario de la API al formato de la aplicación
 */
// En transformers.ts
export const transformApiUserToUser = (apiUser: ApiUser): User => {
  // Verificar que apiUser existe
  if (!apiUser) {
    console.error(
      "[transformApiUserToUser] Error: apiUser es null o undefined"
    );
    // Devolver un objeto de usuario vacío o con valores por defecto
    return {
      id: "",
      firstName: "",
      lastName: "",
      email: "",
      role: "unknown",
      departments: [],
      permissions: {
        approveHours: false,
        modifyChecks: false,
        manageReports: false,
      },
      lastLogin: "",
      status: "inactive",
    };
  }

  console.log("[transformApiUserToUser] Datos del ApiUser:", apiUser);

  // Procesar el nombre con manejo seguro para null/undefined
  let firstName = "";
  let lastName = "";

  if (apiUser.usua_nomb) {
    const nameParts = apiUser.usua_nomb.split(" ");
    firstName = nameParts[0] || "";
    lastName = nameParts.slice(1).join(" ") || "";
  }

  // Mapear roleName de manera segura
  const roleName = apiUser.role?.nombre?.toLowerCase() || "unknown";

  // Mapear departments de manera segura
  const departments =
    apiUser.userStructures?.map((structure) => structure.structure_type) || [];

  // Mapear permisos de manera segura
  const permissions = {
    approveHours: false,
    modifyChecks: false,
    manageReports: false,
    adminAccess: roleName === "admin",
  };

  // Si hay userPermissions, procesarlos
  if (apiUser.userPermissions && apiUser.userPermissions.length > 0) {
    // Procesar permisos según tu lógica de negocio
  }

  return {
    id: apiUser.user_id || "",
    firstName,
    lastName,
    email: apiUser.usua_corr || "",
    role: roleName,
    departments,
    permissions,
    lastLogin: apiUser.usua_fevc || "",
    status: apiUser.usua_stat ? "active" : "inactive",
    startDate: apiUser.usua_fein,
    endDate: apiUser.usua_feve,
    createdAt: apiUser.usua_fevc,
    // Campos opcionales
    avatar: undefined,
    phone: apiUser.usua_noco,
    twoFactorEnabled: false,
  };
};

/**
 * Mapea los permisos de usuario de la API a la estructura de permisos de la aplicación
 */
export const mapPermissions = (
  userPermissions: Array<{
    permission_id: string;
    permission?: { descripcion?: string }; // Añadir tipo para el objeto anidado si existe
  }>,
  roleName: string // Recibimos el rol
): Permission => {
  const userPermissionDetails = userPermissions.map((up) =>
    up.permission?.descripcion?.toLowerCase()
  );

  // Lógica MEJORADA para mapeo de permisos (AJUSTAR según tus descripciones/IDs reales)
  // Esto es un ejemplo, necesitas adaptarlo a tus nombres/IDs de permisos específicos
  const permissions: Permission = {
    // Ejemplo: buscar por descripción (ajusta las cadenas exactas)
    approveHours: userPermissionDetails.includes("aprobar horas"), // AJUSTAR
    modifyChecks: userPermissionDetails.includes("modificar registros"), // AJUSTAR
    manageReports: userPermissionDetails.includes("administrar reportes"), // AJUSTAR

    // Lógica para adminAccess (ej: si el rol es 'admin' O tiene un permiso específico)
    adminAccess:
      roleName === "admin" ||
      userPermissionDetails.includes("acceso administrador"), // AJUSTAR
  };

  return permissions;
};

/**
 * Transforma un usuario de la aplicación al formato de la API para creación/actualización
 * NOTA: Este transformador está incompleto y necesita ajustes para enviar roles, departamentos (estructuras), etc.
 */
export const transformUserToApiDto = (
  user: Partial<User>
): Partial<CreateUserDto> => {
  // !! IMPORTANTE !!
  // Este mapeo es INCOMPLETO para crear/actualizar.
  // Faltaría mapear:
  // - user.role -> rol_id (necesitarías buscar el ID del rol basado en el nombre)
  // - user.departments -> userStructures (requiere una lógica inversa compleja)
  // - user.permissions -> userPermissions (requiere mapeo inverso a IDs)
  // - El campo `usua_noco` podría necesitar un valor diferente al `user.id` (UUID). Verifica qué espera la API.

  return {
    usua_corr: user.email,
    usua_nomb: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
    // usua_noco: user.id, // <-- CUIDADO: Verifica si la API espera el UUID aquí o un código diferente.
    usua_stat: user.status === "active",
    usua_fein: user.startDate,
    usua_feve: user.endDate,
    // password: user.password // Se añade en el hook useUsers si es creación
    // rol_id: ??? // Necesitas obtener el ID del rol correspondiente a user.role
    // usua_fevc: ??? // Probablemente la API lo asigna automáticamente en creación
  };
};
