import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  X,
  Save,
  Building2,
  Users,
  Calendar,
  CheckCircle2,
  Mail,
  Phone,
  User,
  FileText,
  AlertCircle,
} from "lucide-react";
import { License } from "../../../../model/license";
import { LicenseFormData, createLicenseSchema } from "../schemas/licenseSchema";
import { ModuleSelector } from "./ModuleSelector";
import { formatDateForInput } from "../utils/adapters";

interface LicenseFormProps {
  license?: License | null;
  onClose: () => void;
  onSave: (formData: LicenseFormData) => void;
  isLoading?: boolean;
}

export function LicenseForm({
  license,
  onClose,
  onSave,
  isLoading = false,
}: LicenseFormProps) {
  // Estado para manejar las pestañas
  const [activeTab, setActiveTab] = useState<"basic" | "contact">("basic");

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
    formState,
  } = useForm<LicenseFormData>({
    resolver: zodResolver(createLicenseSchema),
    mode: "onChange",
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
  console.log("Form state:", {
    isDirty: formState.isDirty,
    isValid: formState.isValid,
    errors: formState.errors,
  });

  // Observar la fecha de expiración para mostrar días restantes
  const watchedExpirationDate = watch("expirationDate");

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden max-h-[95vh] w-full max-w-4xl flex flex-col">
        {/* Encabezado con degradado */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Building2 className="w-8 h-8" />
              <h2 className="text-2xl font-bold">
                {license ? "Editar Licencia" : "Nueva Licencia"}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-white hover:bg-blue-700 p-2 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="mt-2 text-blue-100 max-w-2xl">
            {license
              ? "Modifique los detalles de la licencia y guarde los cambios cuando termine."
              : "Complete todos los campos requeridos para crear una nueva licencia en el sistema."}
          </p>
        </div>

        {/* Pestañas de navegación */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="flex">
            <button
              className={`py-4 px-6 font-medium flex items-center space-x-2 ${
                activeTab === "basic"
                  ? "text-blue-600 border-b-2 border-blue-500"
                  : "text-gray-500 hover:text-blue-500"
              }`}
              onClick={() => setActiveTab("basic")}
            >
              <Building2 className="w-5 h-5" />
              <span>Información Básica</span>
            </button>
            <button
              className={`py-4 px-6 font-medium flex items-center space-x-2 ${
                activeTab === "contact"
                  ? "text-blue-600 border-b-2 border-blue-500"
                  : "text-gray-500 hover:text-blue-500"
              }`}
              onClick={() => setActiveTab("contact")}
            >
              <User className="w-5 h-5" />
              <span>Información de Contacto</span>
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="p-6 overflow-y-auto flex-1"
        >
          {/* Información Básica */}
          <div className={activeTab === "basic" ? "block" : "hidden"}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h3 className="text-lg font-medium text-blue-800 flex items-center">
                    <Building2 className="w-5 h-5 mr-2" />
                    Datos de la Empresa
                  </h3>

                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre de la empresa{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Building2 className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          {...register("companyName")}
                          className={`pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                            errors.companyName ? "border-red-500" : ""
                          }`}
                        />
                      </div>
                      {errors.companyName && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.companyName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        RNC <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        {...register("rnc")}
                        className={`block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                          errors.rnc ? "border-red-500" : ""
                        }`}
                      />
                      {errors.rnc && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.rnc.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h3 className="text-lg font-medium text-blue-800 flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Vencimiento
                  </h3>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de vencimiento{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        {...register("expirationDate")}
                        className={`pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                          errors.expirationDate ? "border-red-500" : ""
                        }`}
                      />
                    </div>
                    {errors.expirationDate && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.expirationDate.message}
                      </p>
                    )}
                    {getDaysUntilExpiration() !== null && (
                      <p className={`text-sm mt-2 ${getExpirationClass()}`}>
                        {getDaysUntilExpiration()! <= 0
                          ? "¡La licencia ha vencido!"
                          : `${getDaysUntilExpiration()} días hasta el vencimiento`}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h3 className="text-lg font-medium text-blue-800 flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Límites de Licencia
                  </h3>

                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Compañías permitidas{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative mt-1">
                        <input
                          type="number"
                          min="1"
                          {...register("allowedCompanies")}
                          className={`block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                            errors.allowedCompanies ? "border-red-500" : ""
                          }`}
                        />
                      </div>
                      {errors.allowedCompanies && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.allowedCompanies.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Empleados permitidos{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative mt-1">
                        <input
                          type="number"
                          min="1"
                          {...register("allowedEmployees")}
                          className={`block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                            errors.allowedEmployees ? "border-red-500" : ""
                          }`}
                        />
                      </div>
                      {errors.allowedEmployees && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.allowedEmployees.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h3 className="text-lg font-medium text-blue-800 flex items-center">
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Estado
                  </h3>

                  <div className="mt-4">
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <div className="flex items-center space-x-4">
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              {...field}
                              value="active"
                              checked={field.value === "active"}
                              className="form-radio h-5 w-5 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              Activo
                            </span>
                          </label>
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              {...field}
                              value="inactive"
                              checked={field.value === "inactive"}
                              className="form-radio h-5 w-5 text-red-600 focus:ring-red-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              Inactivo
                            </span>
                          </label>
                        </div>
                      )}
                    />
                    {errors.status && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.status.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Información de Contacto */}
          <div className={activeTab === "contact" ? "block" : "hidden"}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h3 className="text-lg font-medium text-blue-800 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Datos de Contacto
                  </h3>

                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre del contacto{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          {...register("contactInfo.name")}
                          className={`pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                            errors.contactInfo?.name ? "border-red-500" : ""
                          }`}
                        />
                      </div>
                      {errors.contactInfo?.name && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.contactInfo.name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Correo electrónico{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          {...register("contactInfo.email")}
                          className={`pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                            errors.contactInfo?.email ? "border-red-500" : ""
                          }`}
                        />
                      </div>
                      {errors.contactInfo?.email && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.contactInfo.email.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          {...register("contactInfo.phone")}
                          className={`pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                            errors.contactInfo?.phone ? "border-red-500" : ""
                          }`}
                        />
                      </div>
                      {errors.contactInfo?.phone && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.contactInfo.phone.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h3 className="text-lg font-medium text-blue-800 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Notas
                  </h3>

                  <div className="mt-4">
                    <textarea
                      {...register("notes")}
                      rows={5}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Información adicional sobre la licencia..."
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h3 className="text-lg font-medium text-blue-800 flex items-center">
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Módulos contratados
                  </h3>

                  <div className="mt-4">
                    <Controller
                      name="modules"
                      control={control}
                      render={({ field }) => (
                        <ModuleSelector
                          selectedModules={field.value || []}
                          onChange={(selectedModuleIds) =>
                            field.onChange(selectedModuleIds)
                          }
                        />
                      )}
                    />
                    {errors.modules && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.modules.message}
                      </p>
                    )}
                    {watch("modules")?.length === 0 && (
                      <div className="flex items-center text-yellow-600 mt-3">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        <span className="text-sm">
                          No se ha seleccionado ningún módulo
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="mt-8 pt-5 border-t border-gray-200 flex justify-between">
            <div>
              {watch("modules")?.length === 0 && (
                <div className="flex items-center text-yellow-600">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <span className="text-sm">
                    No se ha seleccionado ningún módulo
                  </span>
                </div>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading
                  ? "Guardando..."
                  : license
                  ? "Guardar cambios"
                  : "Crear licencia"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LicenseForm;
