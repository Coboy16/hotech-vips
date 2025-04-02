import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { License } from "../../../../../model/license";
import {
  LicenseFormData,
  createLicenseSchema,
} from "../../schemas/licenseSchema";
import { formatDateForInput } from "../../utils/adapters";

interface UseLicenseFormProps {
  license?: License | null;
  onSave: (formData: LicenseFormData) => void;
  isLoading?: boolean;
}

export function useLicenseForm({
  license,
  onSave,
  isLoading = false,
}: UseLicenseFormProps) {
  // React Hook Form setup
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty, isValid },
    reset,
    watch,
    formState,
  } = useForm<LicenseFormData>({
    resolver: zodResolver(createLicenseSchema),
    mode: "onTouched", // Cambiado a onTouched para evitar validaciones inmediatas
    defaultValues: {
      companyName: license?.companyName || "",
      rnc: license?.rnc || "",
      expirationDate:
        formatDateForInput(license?.expirationDate) ||
        formatDateForInput(new Date()),
      allowedCompanies: license?.allowedCompanies || 1,
      allowedEmployees: license?.allowedEmployees || 100,
      modules: license?.modules || [],
      contactInfo: {
        name: license?.contactInfo?.name || "",
        email: license?.contactInfo?.email || "",
        phone: license?.contactInfo?.phone || "",
      },
      status: license?.status || "active",
      notes: license?.notes || "",
    },
  });

  // Debug: Muestra el estado del formulario
  console.log("License Form state:", {
    isDirty: formState.isDirty,
    isValid: formState.isValid,
    errors: formState.errors,
  });

  // Observar la fecha de expiración para mostrar días restantes
  const watchedExpirationDate = watch("expirationDate");
  const watchedModules = watch("modules");

  // Resetear el formulario si la licencia inicial cambia
  useEffect(() => {
    if (license) {
      reset({
        companyName: license.companyName,
        rnc: license.rnc,
        expirationDate: formatDateForInput(license.expirationDate),
        allowedCompanies: license.allowedCompanies,
        allowedEmployees: license.allowedEmployees,
        modules: license.modules,
        contactInfo: {
          name: license.contactInfo.name,
          email: license.contactInfo.email,
          phone: license.contactInfo.phone,
        },
        status: license.status,
        notes: license.notes || "",
      });
    } else {
      reset({
        companyName: "",
        rnc: "",
        expirationDate: formatDateForInput(new Date()),
        allowedCompanies: 1,
        allowedEmployees: 100,
        modules: [],
        contactInfo: { name: "", email: "", phone: "" },
        status: "active",
        notes: "",
      });
    }
  }, [license, reset]);

  const handleFormSubmit = (data: LicenseFormData) => {
    console.log("Datos del formulario validados:", data);
    onSave(data);
  };

  // Calcular días hasta vencimiento para el indicador visual
  const getDaysUntilExpiration = () => {
    if (!watchedExpirationDate) return null;
    try {
      const expiration = new Date(watchedExpirationDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      expiration.setHours(0, 0, 0, 0);
      const diffTime = expiration.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch {
      return null;
    }
  };

  const getExpirationClass = () => {
    const days = getDaysUntilExpiration();
    if (days === null) return "";
    if (days <= 0) return "text-red-600 font-medium";
    if (days <= 30) return "text-red-500 font-medium";
    if (days <= 90) return "text-yellow-500 font-medium";
    return "text-green-500 font-medium";
  };

  return {
    // React Hook Form
    register,
    control,
    errors,
    isValid,
    isDirty,
    handleSubmit: handleSubmit(handleFormSubmit),

    // Valores observados
    watchedExpirationDate,
    watchedModules,

    // Helpers de expiración
    getDaysUntilExpiration,
    getExpirationClass,

    // Estado
    isLoading,
  };
}
