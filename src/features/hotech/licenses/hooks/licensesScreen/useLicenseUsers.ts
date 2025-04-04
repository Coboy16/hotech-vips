import { useState, useCallback } from "react";
import { toast } from "react-hot-toast";

import { licenseService } from "../../services/licenseService";
import { userService } from "../../services/userService";
import { UserFormData } from "../../schemas/userSchema";
import { formDataToApiCreateDto as userFormDataToApiDto } from "../../utils/userAdapters";
import { License, ApiLicense } from "../../../../../model/license";
import { AvailableModuleOption } from "../../components/userComponets/UserModuleSelector";

export interface UseLicenseUsersProps {
  permissionToLabelMap: Record<string, string>;
}

export function useLicenseUsers({
  permissionToLabelMap,
}: UseLicenseUsersProps) {
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [isLoadingLicenseForUser, setIsLoadingLicenseForUser] = useState(false);
  const [selectedLicenseForUserCreation, setSelectedLicenseForUserCreation] =
    useState<License | null>(null);
  const [modulesForSelectedLicense, setModulesForSelectedLicense] = useState<
    AvailableModuleOption[]
  >([]);
  const [fetchedApiLicenseForUser, setFetchedApiLicenseForUser] =
    useState<ApiLicense | null>(null);

  const prepareModulesFromApiLicense = useCallback(
    (apiLicense: ApiLicense | null): AvailableModuleOption[] => {
      if (!apiLicense || !apiLicense.modules_licence) {
        console.warn(
          `[useLicenseUsers] No se encontraron datos de módulos detallados en la ApiLicense proporcionada (ID: ${apiLicense?.license_id})`
        );
        toast.error("No se pudieron cargar los módulos para esta licencia.");
        return [];
      }

      console.log(
        `[useLicenseUsers] Preparando módulos desde ApiLicense fresca (ID: ${apiLicense.license_id}):`,
        apiLicense.modules_licence
      );

      const modules = apiLicense.modules_licence
        .map((ml) => {
          const moduleInfo = ml.module;
          if (!moduleInfo || !moduleInfo.module_id || !moduleInfo.name) {
            console.warn(
              "[useLicenseUsers] Módulo inválido encontrado en modules_licence:",
              ml
            );
            return null;
          }
          return {
            id: moduleInfo.module_id,
            label: permissionToLabelMap[moduleInfo.name] || moduleInfo.name,
          };
        })
        .filter((mod): mod is AvailableModuleOption => mod !== null);

      console.log(
        "[useLicenseUsers] Módulos preparados para UserForm:",
        modules
      );
      return modules;
    },
    [permissionToLabelMap]
  );

  const handleOpenUserForm = useCallback(
    async (license: License): Promise<boolean> => {
      console.log(
        `[useLicenseUsers] Iniciando apertura de UserForm para licencia UI (ID: ${license.id})`
      );
      setIsLoadingLicenseForUser(true);
      setFetchedApiLicenseForUser(null);
      setModulesForSelectedLicense([]);
      setSelectedLicenseForUserCreation(license);

      try {
        console.log(
          `[useLicenseUsers] Obteniendo datos frescos de API para licencia ${license.id}...`
        );
        const freshApiLicense = await licenseService.getById(license.id);

        if (freshApiLicense) {
          console.log(
            `[useLicenseUsers] Datos frescos de API obtenidos para ${license.id}:`,
            freshApiLicense
          );
          setFetchedApiLicenseForUser(freshApiLicense);

          const availableModules =
            prepareModulesFromApiLicense(freshApiLicense);
          setModulesForSelectedLicense(availableModules);

          setIsLoadingLicenseForUser(false);
          return true;
        } else {
          console.error(
            `[useLicenseUsers] Error: No se pudieron obtener los datos frescos para la licencia ${license.id}.`
          );
          toast.error(
            `Error al cargar los detalles de la licencia ${license.companyName}. No se puede abrir el formulario de usuario.`
          );
          setSelectedLicenseForUserCreation(null);
          setIsLoadingLicenseForUser(false);
          return false;
        }
      } catch (error) {
        console.error(
          `[useLicenseUsers] Error inesperado al obtener datos de licencia ${license.id}:`,
          error
        );
        toast.error("Error inesperado al preparar el formulario de usuario.");
        setSelectedLicenseForUserCreation(null);
        setIsLoadingLicenseForUser(false);
        return false;
      }
    },
    [prepareModulesFromApiLicense]
  );

  const handleCloseUserForm = useCallback(() => {
    setSelectedLicenseForUserCreation(null);
    setModulesForSelectedLicense([]);
    setFetchedApiLicenseForUser(null);
    setIsLoadingLicenseForUser(false);
    console.log("[useLicenseUsers] UserForm cerrado y estado limpiado.");
  }, []);

  const handleSaveUser = useCallback(
    async (formData: UserFormData): Promise<boolean> => {
      if (!fetchedApiLicenseForUser) {
        toast.error(
          "Error: No se ha cargado la información necesaria de la licencia para crear el usuario."
        );
        console.error(
          "[useLicenseUsers] Intento de guardar usuario sin fetchedApiLicenseForUser válido."
        );
        return false;
      }

      setIsSavingUser(true);
      console.log(
        "[useLicenseUsers] Intentando guardar usuario con datos:",
        formData
      );
      console.log(
        "[useLicenseUsers] Usando datos de ApiLicense fresca (ID:",
        fetchedApiLicenseForUser.license_id,
        ") para DTO."
      );

      // ** CAMBIO: Ya no pasamos originalLicenseModules al adaptador **
      // const originalLicenseModules = fetchedApiLicenseForUser.modules_licence || []; // <- No se necesita aquí

      try {
        // Llamar al adaptador SIN el último argumento
        const userDto = userFormDataToApiDto(
          {
            ...formData,
            company_license_id: fetchedApiLicenseForUser.license_id,
          }
          // originalLicenseModules // <- Argumento eliminado
        );

        console.log("[useLicenseUsers] DTO de usuario a enviar:", userDto);

        const newUser = await userService.register(userDto);

        if (newUser) {
          toast.success(`Usuario ${newUser.usua_nomb} creado exitosamente.`);
          console.log("[useLicenseUsers] Usuario creado:", newUser);
          return true;
        } else {
          console.error(
            "[useLicenseUsers] La creación del usuario falló (userService.register devolvió null o error manejado)."
          );
          return false;
        }
      } catch (error) {
        console.error(
          "[useLicenseUsers] Error inesperado al guardar usuario:",
          error
        );
        toast.error("Ocurrió un error inesperado al crear el usuario.");
        return false;
      } finally {
        setIsSavingUser(false);
      }
    },
    [fetchedApiLicenseForUser] // La dependencia ya no incluye originalLicenseModules
  );

  return {
    isSavingUser,
    isLoadingLicenseForUser,
    selectedLicenseForUserCreation,
    modulesForSelectedLicense,
    handleOpenUserForm,
    handleCloseUserForm,
    handleSaveUser,
  };
}
