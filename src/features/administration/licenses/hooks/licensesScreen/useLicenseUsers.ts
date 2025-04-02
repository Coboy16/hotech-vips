import { useState, useCallback } from "react";
import { toast } from "react-hot-toast";

import { userService } from "../../services/userService";
import { UserFormData } from "../../schemas/userSchema";
import { formDataToApiCreateDto as userFormDataToApiDto } from "../../utils/userAdapters";
import { License, ApiLicense } from "../../../../../model/license";
import { AvailableModuleOption } from "../../components/userComponets/UserModuleSelector";

export interface UseLicenseUsersProps {
  apiLicensesData: ApiLicense[];
  permissionToLabelMap: Record<string, string>;
}

export function useLicenseUsers({
  apiLicensesData,
  permissionToLabelMap,
}: UseLicenseUsersProps) {
  // Estados para gestión de usuarios
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [selectedLicenseForUserCreation, setSelectedLicenseForUserCreation] =
    useState<License | null>(null);
  const [modulesForSelectedLicense, setModulesForSelectedLicense] = useState<
    AvailableModuleOption[]
  >([]);

  // Preparar módulos para el formulario de usuario
  const prepareModulesForLicense = useCallback(
    (license: License) => {
      // Buscar la licencia original de la API usando el ID de la licencia UI
      const originalApiLicense = apiLicensesData.find(
        (apiLic) => apiLic.license_id === license.id
      );

      if (!originalApiLicense || !originalApiLicense.modules_licence) {
        console.warn(
          `No se encontraron datos de módulos detallados para la licencia ${license.id}`
        );
        return [];
      }

      return originalApiLicense.modules_licence
        .map((ml) => {
          const moduleInfo = ml.module;
          return {
            id: moduleInfo.module_id,
            // Usar el mapa de etiquetas, o el 'name' como fallback, o el ID si todo falla
            label:
              permissionToLabelMap[moduleInfo.name] ||
              moduleInfo.name ||
              moduleInfo.module_id,
          };
        })
        .filter((mod) => mod.id && mod.label); // Asegurar que tenemos ID y Label
    },
    [apiLicensesData, permissionToLabelMap]
  );

  // Abrir formulario de usuario para una licencia específica
  const handleOpenUserForm = useCallback(
    (license: License) => {
      console.log(
        "Abriendo formulario de usuario para licencia:",
        license.id,
        license.companyName
      );
      setSelectedLicenseForUserCreation(license);

      // Preparar módulos disponibles
      const availableModules = prepareModulesForLicense(license);
      console.log("Módulos disponibles para UserForm:", availableModules);
      setModulesForSelectedLicense(availableModules);

      return true; // Indicar que se inició el proceso correctamente
    },
    [prepareModulesForLicense]
  );

  // Cerrar formulario de usuario y limpiar estado
  const handleCloseUserForm = useCallback(() => {
    setSelectedLicenseForUserCreation(null);
    setModulesForSelectedLicense([]);
  }, []);

  // Guardar un nuevo usuario
  const handleSaveUser = useCallback(
    async (formData: UserFormData) => {
      if (!selectedLicenseForUserCreation) {
        toast.error(
          "Error: No se ha especificado la licencia para el usuario."
        );
        return false;
      }

      setIsSavingUser(true);
      console.log("Intentando guardar usuario con datos:", formData);

      // Obtener módulos originales de la licencia
      const originalApiLicense = apiLicensesData.find(
        (apiLic) => apiLic.license_id === selectedLicenseForUserCreation.id
      );

      if (!originalApiLicense) {
        toast.error(
          "Error interno: No se encontraron los datos originales de la licencia."
        );
        setIsSavingUser(false);
        return false;
      }

      // Asegurarse de que modules_licence exista y sea un array (puede ser vacío)
      const originalLicenseModules = originalApiLicense.modules_licence || [];

      try {
        // Pasar módulos al adaptador
        const userDto = userFormDataToApiDto(
          {
            ...formData,
            company_license_id: selectedLicenseForUserCreation.id,
          },
          originalLicenseModules
        );

        console.log("DTO a enviar:", userDto);

        const newUser = await userService.register(userDto);

        if (newUser) {
          toast.success(`Usuario ${newUser.usua_nomb} creado exitosamente.`);
          return true;
        } else {
          console.error(
            "La creación del usuario falló (servicio devolvió null o error manejado)."
          );
          return false;
        }
      } catch (error) {
        console.error("Error inesperado al guardar usuario:", error);
        toast.error("Ocurrió un error inesperado al crear el usuario.");
        return false;
      } finally {
        setIsSavingUser(false);
      }
    },
    [selectedLicenseForUserCreation, apiLicensesData]
  );

  return {
    // Estados
    isSavingUser,
    selectedLicenseForUserCreation,
    modulesForSelectedLicense,

    // Métodos
    handleOpenUserForm,
    handleCloseUserForm,
    handleSaveUser,
    prepareModulesForLicense,
  };
}
