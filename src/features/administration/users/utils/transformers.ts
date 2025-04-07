import { ApiUser, CreateUserDto, Permission, User } from "../types/user";

/**
 * Transforma un usuario de la API al formato de la aplicación
 */
export const transformApiUserToUser = (apiUser: ApiUser): User => {
  if (!apiUser) {
    console.error(
      "[transformApiUserToUser] Error: apiUser es null o undefined"
    );
    // Devolver un objeto de usuario vacío o con valores por defecto MÁS COMPLETO
    return {
      id: "",
      firstName: "",
      lastName: "",
      email: "",
      role: "unknown",
      rol_id: undefined, // FIX: Añadido
      departments: [],
      permissions: {
        approveHours: false,
        modifyChecks: false,
        manageReports: false,
      },
      lastLogin: "",
      status: "inactive",
      startDate: undefined,
      endDate: undefined,
      createdAt: undefined,
      phone: undefined,
      structure_id: null, // FIX: Añadido
      structure_type: null, // FIX: Añadido
      company_license_id: null, // FIX: Añadido
    };
  }

  console.log("[transformApiUserToUser] Datos del ApiUser:", apiUser);

  let firstName = "";
  let lastName = "";
  if (apiUser.usua_nomb) {
    const nameParts = apiUser.usua_nomb.split(" ");
    firstName = nameParts[0] || "";
    lastName = nameParts.slice(1).join(" ") || "";
  }

  const roleName = apiUser.role?.nombre?.toLowerCase() || "unknown";

  // FIX: Extraer estructura de userStructures si existe, si no, de los campos raíz
  const primaryStructure =
    apiUser.userStructures && apiUser.userStructures.length > 0
      ? apiUser.userStructures[0]
      : {
          structure_id: apiUser.structure_id,
          structure_type: apiUser.structure_type,
        };

  // FIX: Mapear 'departments' basado en el tipo de estructura (si existe)
  const departments = primaryStructure?.structure_type
    ? [primaryStructure.structure_type]
    : [];

  // Mapear permisos (lógica simplificada, ajustar si es necesario)
  // Esta parte sigue siendo un placeholder. Necesitarías lógica real basada en IDs/descripciones.
  const permissions: Permission = {
    approveHours: false, // Placeholder
    modifyChecks: false, // Placeholder
    manageReports: false, // Placeholder
    adminAccess: roleName === "admin", // Ejemplo basado en rol
  };
  // Aquí deberías procesar `apiUser.userPermissions` para determinar los valores de `permissions`

  // FIX: Añadir mapeo de los nuevos campos
  return {
    id: apiUser.user_id || "",
    firstName,
    lastName,
    email: apiUser.usua_corr || "",
    role: roleName,
    rol_id: apiUser.rol_id, // FIX: Mapear rol_id
    departments, // Mapeado desde structure_type
    permissions,
    lastLogin: apiUser.usua_fevc || "", // Asumiendo fevc es last login/creation
    status: apiUser.usua_stat ? "active" : "inactive",
    startDate: apiUser.usua_fein,
    endDate: apiUser.usua_feve,
    createdAt: apiUser.usua_fevc, // Asumiendo fevc es creation date
    phone: apiUser.usua_noco,
    structure_id: primaryStructure?.structure_id, // FIX: Mapear structure_id
    structure_type: primaryStructure?.structure_type, // FIX: Mapear structure_type
    company_license_id: apiUser.company_license_id, // FIX: Mapear license_id
    // Campos opcionales/no mapeados actualmente
    avatar: undefined,
    twoFactorEnabled: false, // Podría venir de is_admin_hotech o has_logged_in?
  };
};

/**
 * Mapea los permisos de usuario de la API a la estructura de permisos de la aplicación
 */
export const mapPermissions = (
  userPermissions: Array<{
    permission_id: string;
    permission?: { descripcion?: string };
  }>,
  roleName: string
): Permission => {
  const userPermissionDetails = userPermissions.map((up) =>
    up.permission?.descripcion?.toLowerCase()
  );
  const permissions: Permission = {
    approveHours: userPermissionDetails.includes("aprobar horas"), // AJUSTAR
    modifyChecks: userPermissionDetails.includes("modificar registros"), // AJUSTAR
    manageReports: userPermissionDetails.includes("administrar reportes"), // AJUSTAR
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
