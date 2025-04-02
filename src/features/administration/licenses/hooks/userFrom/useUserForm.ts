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
    defaultValues: user
      ? undefined // Los valores se establecerán después para el usuario
      : {
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
    if (user) {
      console.warn(
        "Modo edición: Adaptador apiUserToFormData necesita revisión."
      );
      const userStructure = user.userStructures?.[0] || {
        structure_id: user.structure_id,
        structure_type: user.structure_type,
      };
      reset({
        ...user,
        password: "",
        userPermissions:
          user.userPermissions
            ?.map((p: any) => p.module?.module_id)
            .filter(Boolean) || [],
        company_license_id: user.company_license_id || licenseInfo.id,
        structure_type: (userStructure?.structure_type as StructureType) || "",
        structure_id: userStructure?.structure_id || "",
        assignStructureLater: !userStructure?.structure_id,
      });
    }
  }, [user, reset, licenseInfo.id]);

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
