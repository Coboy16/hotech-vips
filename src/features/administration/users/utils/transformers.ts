import { ApiUser, CreateUserDto, Permission, User } from "../types/user";

/**
 * Transforma un usuario de la API al formato de la aplicación
 */
export const transformApiUserToUser = (apiUser: ApiUser): User => {
  // Mapeo básico de campos
  const firstName = apiUser.usua_nomb.split(" ")[0] || "";
  const lastName = apiUser.usua_nomb.split(" ").slice(1).join(" ") || "";
  const roleName = apiUser.role?.nombre?.toLowerCase() || "unknown"; // <-- Añadido ?. y valor por defecto

  // Mapear userStructures a departments (usando structure_type como ejemplo)
  const departments =
    apiUser.userStructures?.map((structure) => structure.structure_type) || []; // <-- MODIFICADO

  // Mapear permisos
  const permissions = mapPermissions(apiUser.userPermissions || [], roleName); // <-- Pasamos roleName

  return {
    id: apiUser.user_id,
    firstName: firstName,
    lastName: lastName,
    email: apiUser.usua_corr,
    role: roleName, // <-- Usamos la variable segura
    departments: departments, // <-- Usamos los departments mapeados
    permissions: permissions, // <-- Usamos los permisos mapeados
    lastLogin: apiUser.usua_fevc, // Manteniendo usua_fevc, pero ten en cuenta que no es el último login real
    status: apiUser.usua_stat ? "active" : "inactive",
    startDate: apiUser.usua_fein,
    endDate: apiUser.usua_feve,
    createdAt: apiUser.usua_fevc, // Asumiendo que usua_fevc es la fecha de creación
    // Campos opcionales que no vienen directamente de la API (o no mapeados aún)
    avatar: undefined, // Podrías intentar generar uno basado en iniciales o usar un servicio externo
    phone: undefined, // La API no parece proveerlo
    twoFactorEnabled: false, // La API no parece proveerlo
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
