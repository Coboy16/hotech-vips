/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";

import {
  userFormValidationSchema,
  UserFormData,
  StructureType,
} from "../../schemas/userSchema";
import { LicenseInfoForUserForm } from "../../../../../model";
import { mapStructureType } from "../../utils/structureTypeMapper";

/**
 * Helper function para generar contraseñas aleatorias
 */
export const generateRandomPassword = (length = 12) => {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
};

interface UseUserFormProps {
  user?: any | null;
  licenseInfo: LicenseInfoForUserForm;
  onSave: (formData: UserFormData) => Promise<void>;
}

export function useUserForm({ user, licenseInfo, onSave }: UseUserFormProps) {
  const [activeTab, setActiveTab] = useState<"basic" | "access" | "structures">(
    "basic"
  );
  const [isSavingInternal, setIsSavingInternal] = useState(false);
  const [isFormReady, setIsFormReady] = useState(false);

  // Inicializar react-hook-form con mode: "onTouched" para evitar validaciones inmediatas
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid, touchedFields },
    watch,
    setValue,
    reset,
    trigger,
  } = useForm<UserFormData>({
    resolver: zodResolver(userFormValidationSchema),
    mode: "onTouched", // Solo validar después de que el usuario interactúe con el campo
    defaultValues: {
      usua_nomb: "",
      usua_corr: "",
      usua_noco: "",
      password: "",
      usua_stat: true,
      rol_id: "",
      structure_type: "",
      structure_id: "",
      assignStructureLater: false,
      userPermissions: [],
      company_license_id: licenseInfo.id,
      usua_fein: undefined,
      usua_fevc: undefined,
      usua_feve: undefined,
    },
  });

  // Resetear/Llenar formulario para edición
  useEffect(() => {
    if (user && !isFormReady) {
      // Solo inicializar si no está listo
      console.log(
        "[useUserForm] Inicializando formulario para edición de usuario:",
        user
      );

      // Extraer la estructura del usuario
      const userStructure = user.userStructures?.[0] || {
        structure_id: user.structure_id,
        structure_type: user.structure_type,
      };

      // Mapear el tipo de estructura para asegurar que sea válido
      const mappedStructureType = mapStructureType(
        userStructure?.structure_type || ""
      );

      // Prepara un objeto con los datos para el formulario
      const formData = {
        // Datos personales - intentar usar campos específicos de la API primero, luego caer a los campos genéricos
        usua_nomb:
          user.usua_nomb ||
          `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        usua_corr: user.usua_corr || user.email || "",
        usua_noco: user.usua_noco || user.phone || "",

        // Campos de control
        password: "", // Siempre vacío en edición
        rol_id: user.rol_id || "",

        // Estado - intentar varios formatos posibles
        usua_stat:
          typeof user.usua_stat === "boolean"
            ? user.usua_stat
            : user.status === "active" ||
              user.usua_stat === "true" ||
              user.usua_stat === true ||
              user.usua_stat === 1 ||
              user.usua_stat === "1",

        // Estructura
        structure_type: mappedStructureType,
        structure_id: userStructure?.structure_id || "",
        assignStructureLater: !userStructure?.structure_id, // true si no hay ID

        // License y permisos
        company_license_id: user.company_license_id || licenseInfo.id,
        userPermissions:
          user.userPermissions
            ?.map((p: any) => p.module?.module_id)
            .filter(Boolean) || [],

        // Fechas
        usua_fein: user.usua_fein || user.startDate,
        usua_fevc: user.usua_fevc || user.createdAt,
        usua_feve: user.usua_feve || user.endDate,
      };

      console.log(
        "[useUserForm] Datos preparados para el formulario:",
        formData
      );

      // Establecer valores en el formulario
      reset(formData);

      // Marcar que el formulario está listo para mostrar
      setIsFormReady(true);
    }
  }, [user?.id, reset, licenseInfo.id, isFormReady]);

  const handleFormSubmit = async (data: UserFormData) => {
    console.log("Datos del formulario validados ANTES de enviar:", data);
    setIsSavingInternal(true);
    try {
      await onSave(data);
    } catch (error) {
      console.error("Error en UserForm al llamar onSave:", error);
      toast.error("Error al guardar el usuario");
    } finally {
      setIsSavingInternal(false);
    }
  };

  const handleGeneratePassword = () => {
    const newPassword = generateRandomPassword();
    setValue("password", newPassword, { shouldValidate: true });
  };

  // Valores observados
  const watchedStructureType = watch("structure_type") as StructureType | "";
  const watchAssignLater = watch("assignStructureLater");

  // Re-validar al cambiar assignStructureLater
  useEffect(() => {
    trigger();
  }, [watchAssignLater, trigger]);

  return {
    // Estado del formulario
    activeTab,
    setActiveTab,
    isSavingInternal,
    isFormReady,

    // React Hook Form
    register,
    control,
    errors,
    isValid,
    touchedFields,
    watch,
    setValue,
    trigger,

    // Valores observados
    watchedStructureType,
    watchAssignLater,

    // Handlers
    handleSubmit: handleSubmit(handleFormSubmit),
    handleGeneratePassword,
  };
}
