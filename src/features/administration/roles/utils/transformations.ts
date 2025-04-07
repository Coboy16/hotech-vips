import {
  ApiRole,
  Role,
  ApiRoleModule,
  Module,
  ApiNestedModule,
} from "../types";

/**
 * Transforma un objeto ApiRole (de la API) a un objeto Role (para el frontend).
 */
export const transformApiRoleToRole = (apiRole: ApiRole): Role => {
  let moduleIds: string[] = [];
  let associatedModules: Module[] = [];

  if (apiRole.rolesModules && Array.isArray(apiRole.rolesModules)) {
    moduleIds = apiRole.rolesModules
      .map((rm: ApiRoleModule) => rm.module?.module_id)
      .filter((id): id is string => !!id); // Filtra IDs nulos o undefined

    associatedModules = apiRole.rolesModules
      .filter(
        (rm): rm is ApiRoleModule & { module: ApiNestedModule } => !!rm.module
      ) // Asegura que module exista
      .map(
        (rm: ApiRoleModule & { module: ApiNestedModule }): Module => ({
          id: rm.module.module_id,
          name: rm.module.name, // Usar el nombre que viene de la API de roles
          apiName: rm.module.name, // Guardar el nombre original si es necesario
        })
      );
  }

  return {
    id: apiRole.rol_id,
    name: apiRole.nombre,
    licenseId: apiRole.company_license_id,
    moduleIds: moduleIds,
    associatedModules: associatedModules,
    createdAt: apiRole.created_at || "",
  };
};

/**
 * Transforma un módulo de la API (GET /modules) a nuestro tipo Module del frontend.
 */
export const transformApiModuleToModule = (
  apiModule: ApiNestedModule
): Module => {
  return {
    id: apiModule.module_id,
    name: apiModule.name, // Asumimos que la API GET /modules devuelve 'name'
    apiName: apiModule.name, // Guardar nombre original
  };
};
