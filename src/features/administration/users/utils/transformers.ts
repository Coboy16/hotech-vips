import { ApiUser, CreateUserDto, Permission, User } from "../types/user";

/**
 * Transforma un usuario de la API al formato de la aplicación
 */
export const transformApiUserToUser = (apiUser: ApiUser): User => {
  // Mapeo básico de campos
  return {
    id: apiUser.user_id,
    firstName: apiUser.usua_nomb.split(" ")[0] || "",
    lastName: apiUser.usua_nomb.split(" ").slice(1).join(" ") || "",
    email: apiUser.usua_corr,
    role: apiUser.role?.nombre.toLowerCase() || "user",
    departments: [], // La API no retorna departamentos, se manejaría con lógica adicional
    // Mapeo de permisos basado en userPermissions
    permissions: mapPermissions(apiUser.userPermissions || []),
    lastLogin: apiUser.usua_fevc, // Usar fecha de creación como último login si no hay dato específico
    status: apiUser.usua_stat ? "active" : "inactive",
    startDate: apiUser.usua_fein,
    endDate: apiUser.usua_feve,
    createdAt: apiUser.usua_fevc,
    // Campos opcionales que no vienen directamente de la API
    avatar: undefined,
    phone: undefined,
    twoFactorEnabled: false,
  };
};

/**
 * Mapea los permisos de usuario de la API a la estructura de permisos de la aplicación
 */
export const mapPermissions = (
  userPermissions: Array<{ permission_id: string }>
): Permission => {
  // Lógica simplificada para mapeo de permisos basado en IDs
  // En un caso real, obtendrías el detalle de cada permiso y harías un mapeo más preciso
  const permissionIds = userPermissions.map((up) => up.permission_id);

  return {
    approveHours: permissionIds.includes("approve-hours-permission-id"),
    modifyChecks: permissionIds.includes("modify-checks-permission-id"),
    manageReports: permissionIds.includes("manage-reports-permission-id"),
    adminAccess: permissionIds.length > 0, // Consideramos que tiene acceso admin si tiene algún permiso
  };
};

/**
 * Transforma un usuario de la aplicación al formato de la API para creación/actualización
 */
export const transformUserToApiDto = (
  user: Partial<User>
): Partial<CreateUserDto> => {
  return {
    usua_corr: user.email,
    usua_nomb: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
    usua_noco: user.id, // Opcional: podrías manejar de otra forma el código de usuario
    usua_stat: user.status === "active",
    usua_fein: user.startDate,
    usua_feve: user.endDate,
    // Los demás campos los manejarías según tu lógica de negocio
  };
};
