import { useState, useEffect, useCallback, useMemo } from "react";
import { roleService } from "../services/roleService";
import { moduleService } from "../services/moduleService"; // Necesario para los módulos
import {
  Role,
  RoleKPIsData,
  CreateRoleDto,
  UpdateRoleDto,
  Module,
} from "../types";
import { tokenStorage } from "../../../auth/utils/tokenStorage";

interface UseRolesReturn {
  roles: Role[];
  availableModules: Module[]; // Lista de módulos para los formularios
  kpis: RoleKPIsData;
  isLoading: boolean;
  isLoadingModules: boolean;
  error: string | null;
  fetchRoles: () => Promise<void>;
  addRole: (
    roleData: Omit<CreateRoleDto, "company_license_id">
  ) => Promise<Role | null>; // Omitimos licenseId, lo añadimos aquí
  editRole: (roleId: string, roleData: UpdateRoleDto) => Promise<Role | null>;
  removeRole: (roleId: string) => Promise<boolean>;
  getRoleForEdit: (roleId: string) => Promise<Role | null>; // Para obtener datos antes de abrir modal de edición
}

export const useRoles = (): UseRolesReturn => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [availableModules, setAvailableModules] = useState<Module[]>([]);
  const [kpis, setKpis] = useState<RoleKPIsData>({ totalRoles: 0 });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingModules, setIsLoadingModules] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const licenseId = useMemo(() => tokenStorage.getLicenseId(), []); // Obtener licenseId una vez

  // --- Fetch Módulos ---
  const fetchModules = useCallback(async () => {
    console.log("[useRoles] Iniciando fetch de módulos...");
    setIsLoadingModules(true);
    setError(null);
    try {
      const modulesData = await moduleService.getAllModules();
      setAvailableModules(modulesData);
      console.log("[useRoles] Módulos cargados:", modulesData.length);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Error desconocido al cargar módulos";
      setError(message);
      console.error("[useRoles] Error en fetchModules:", err);
    } finally {
      setIsLoadingModules(false);
    }
  }, []);

  // --- Fetch Roles ---
  const fetchRoles = useCallback(async () => {
    if (!licenseId) {
      setError("No se pudo determinar la licencia para cargar roles.");
      setIsLoading(false);
      console.error("[useRoles] No hay licenseId disponible.");
      return;
    }
    console.log("[useRoles] Iniciando fetch de roles...");
    setIsLoading(true);
    setError(null); // Limpiar error anterior
    try {
      const rolesData = await roleService.getRolesByLicense(licenseId);
      setRoles(rolesData);
      // Calcular KPIs simples
      setKpis({ totalRoles: rolesData.length });
      console.log("[useRoles] Roles cargados:", rolesData.length);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Error desconocido al cargar roles";
      setError(message);
      console.error("[useRoles] Error en fetchRoles:", err);
    } finally {
      setIsLoading(false);
    }
  }, [licenseId]); // Depende de licenseId

  // Efecto inicial para cargar módulos y roles
  useEffect(() => {
    fetchModules();
    fetchRoles();
  }, [fetchModules, fetchRoles]); // Ejecutar cuando las funciones (y sus dependencias) cambien

  // --- Mutaciones (CRUD) ---

  const addRole = useCallback(
    async (
      roleData: Omit<CreateRoleDto, "company_license_id">
    ): Promise<Role | null> => {
      if (!licenseId) {
        setError("No se pudo determinar la licencia para crear el rol.");
        console.error("[useRoles] No hay licenseId para addRole.");
        return null;
      }
      setIsLoading(true); // Podrías tener un isLoading específico para mutaciones
      try {
        const fullRoleData: CreateRoleDto = {
          ...roleData,
          company_license_id: licenseId,
        };
        const newRole = await roleService.createRole(fullRoleData);
        if (newRole) {
          // Opción 1: Refetch (más simple)
          await fetchRoles();
          // Opción 2: Actualizar estado local (más rápido, menos requests)
          // setRoles(prev => [...prev, newRole]);
          // setKpis(prev => ({ ...prev, totalRoles: prev.totalRoles + 1 }));
          return newRole;
        }
        return null;
      } catch (err) {
        // El servicio ya muestra toast, aquí solo logueamos si es necesario
        console.error("[useRoles] Error en addRole:", err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [licenseId, fetchRoles]
  ); // Depende de licenseId y fetchRoles

  const editRole = useCallback(
    async (roleId: string, roleData: UpdateRoleDto): Promise<Role | null> => {
      setIsLoading(true);
      try {
        const updatedRole = await roleService.updateRole(roleId, roleData);
        if (updatedRole) {
          // Opción 1: Refetch
          await fetchRoles();
          // Opción 2: Actualizar estado local
          // setRoles(prev => prev.map(r => r.id === roleId ? updatedRole : r));
          return updatedRole;
        }
        return null;
      } catch (err) {
        console.error("[useRoles] Error en editRole:", err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchRoles]
  ); // Depende de fetchRoles

  const removeRole = useCallback(
    async (roleId: string): Promise<boolean> => {
      setIsLoading(true);
      try {
        const success = await roleService.deleteRole(roleId);
        if (success) {
          // Opción 1: Refetch
          await fetchRoles();
          // Opción 2: Actualizar estado local
          // setRoles(prev => prev.filter(r => r.id !== roleId));
          // setKpis(prev => ({ ...prev, totalRoles: prev.totalRoles - 1 }));
          return true;
        }
        return false;
      } catch (err) {
        console.error("[useRoles] Error en removeRole:", err);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchRoles]
  ); // Depende de fetchRoles

  // Función para obtener datos frescos de un rol antes de editarlo
  const getRoleForEdit = useCallback(
    async (roleId: string): Promise<Role | null> => {
      // No modifica isLoading general, podría tener uno propio si se quiere feedback
      try {
        const roleData = await roleService.getRoleById(roleId);
        return roleData;
      } catch (error) {
        console.error(`[useRoles] Error en getRoleForEdit (${roleId}):`, error);
        // El servicio ya muestra el toast de error
        return null;
      }
    },
    []
  ); // No tiene dependencias que cambien

  return {
    roles,
    availableModules,
    kpis,
    isLoading: isLoading || isLoadingModules, // Combina ambos loadings si quieres un indicador general
    isLoadingModules, // Expone el loading específico si es necesario
    error,
    fetchRoles,
    addRole,
    editRole,
    removeRole,
    getRoleForEdit,
  };
};
