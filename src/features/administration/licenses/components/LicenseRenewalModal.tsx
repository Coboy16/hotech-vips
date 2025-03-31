import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Calendar, RotateCw } from "lucide-react";
import { License } from "../../../../model/license"; // Importa desde model
import {
  RenewLicenseFormData,
  renewLicenseSchema,
} from "../schemas/licenseSchema"; // Importa schema y tipo Zod
import { formatDateForInput, formatDateForDisplay } from "../utils/adapters"; // Importa formateadores

interface LicenseRenewalModalProps {
  license: License; // Licencia actual (formato UI)
  onClose: () => void;
  onRenewed: (renewalData: RenewLicenseFormData) => void; // Recibe datos validados por Zod
  isProcessing?: boolean; // Estado de carga
}

export function LicenseRenewalModal({
  license,
  onClose,
  onRenewed,
  isProcessing = false,
}: LicenseRenewalModalProps) {
  // --- React Hook Form Setup ---
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
  } = useForm<RenewLicenseFormData>({
    resolver: zodResolver(renewLicenseSchema),
    mode: "onChange",
    defaultValues: {
      // Calcula fecha de renovación por defecto (1 año desde la actual)
      expirationDate: (() => {
        const currentExpiration = new Date(
          license.expirationDate || new Date()
        );
        currentExpiration.setFullYear(currentExpiration.getFullYear() + 1);
        return formatDateForInput(currentExpiration);
      })(),
      status: license.status || "active",
    },
  });

  // Observar la fecha de expiración seleccionada
  const watchedExpirationDate = watch("expirationDate");

  // Resetear si la licencia cambia (por si acaso se reutiliza el modal)
  useEffect(() => {
    const currentExpiration = new Date(license.expirationDate || new Date());
    const defaultRenewalDate = new Date(currentExpiration);
    defaultRenewalDate.setFullYear(defaultRenewalDate.getFullYear() + 1);

    reset({
      expirationDate: formatDateForInput(defaultRenewalDate),
      status: license.status || "active",
    });
  }, [license, reset]);

  // --- Handlers ---
  const handleFormSubmit = (data: RenewLicenseFormData) => {
    console.log("Datos de renovación validados:", data);
    onRenewed(data); // Llama a la función onRenewed pasada por props
  };

  // --- Cálculos y Helpers para UI ---
  const getDaysUntilCurrentExpiration = () => {
    if (!license.expirationDate) return null;
    try {
      const expiration = new Date(license.expirationDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      expiration.setHours(0, 0, 0, 0); // Comparar solo fechas
      const diffTime = expiration.getTime() - today.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch {
      return null;
    }
  };

  const getCurrentExpirationStatusClass = () => {
    const days = getDaysUntilCurrentExpiration();
    if (days === null) return "";
    if (days <= 0) return "text-red-600 font-medium";
    if (days <= 30) return "text-red-500 font-medium";
    if (days <= 90) return "text-yellow-500 font-medium";
    return "text-green-500 font-medium";
  };

  const getCurrentExpirationMessage = () => {
    const days = getDaysUntilCurrentExpiration();
    if (days === null) return "Fecha de vencimiento inválida";
    if (days < 0) return `Venció hace ${Math.abs(days)} días`;
    if (days === 0) return "Vence hoy";
    if (days <= 30) return `Vence pronto (${days} días)`;
    if (days <= 90) return `Vencimiento próximo (${days} días)`;
    return `${days} días restantes`;
  };

  const getDaysUntilNewExpiration = () => {
    if (!watchedExpirationDate) return null;
    try {
      const expiration = new Date(watchedExpirationDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      expiration.setHours(0, 0, 0, 0); // Comparar solo fechas
      const diffTime = expiration.getTime() - today.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch {
      return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden">
        {/* Encabezado */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-600 p-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <RotateCw className="w-6 h-6" />
              <h2 className="text-xl font-bold">Renovar Licencia</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="text-white hover:bg-blue-700 p-1 rounded-full transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="mt-1 text-blue-100 text-sm">
            Actualiza la fecha de vencimiento y el estado.
          </p>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6">
          {/* Información de la licencia actual */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-2 text-sm">
              Licencia actual
            </h3>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs space-y-1">
              <p>
                <span className="font-medium">Empresa:</span>{" "}
                {license.companyName}
              </p>
              <p>
                <span className="font-medium">ID:</span> {license.id}
              </p>
              <p>
                <span className="font-medium">RNC:</span> {license.rnc}
              </p>
              <p>
                <span className="font-medium">Vence:</span>{" "}
                {formatDateForDisplay(license.expirationDate)}
                <span className={`ml-2 ${getCurrentExpirationStatusClass()}`}>
                  ({getCurrentExpirationMessage()})
                </span>
              </p>
              <p>
                <span className="font-medium">Estado:</span>{" "}
                <span
                  className={`capitalize font-medium ${
                    license.status === "active"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {license.status === "active" ? "Activo" : "Inactivo"}
                </span>
              </p>
            </div>
          </div>

          {/* Formulario de renovación */}
          <div className="space-y-5">
            {/* Nueva Fecha de Vencimiento */}
            <div>
              <label
                htmlFor="expirationDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nueva fecha de vencimiento{" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="expirationDate"
                  type="date"
                  {...register("expirationDate")}
                  className={`input-field pl-10 ${
                    errors.expirationDate ? "border-red-500" : ""
                  }`}
                />
              </div>
              {errors.expirationDate && (
                <p className="error-message">{errors.expirationDate.message}</p>
              )}
              {getDaysUntilNewExpiration() !== null &&
                getDaysUntilNewExpiration()! > 0 && (
                  <p className="text-xs mt-1 text-gray-500">
                    Quedarán {getDaysUntilNewExpiration()} días restantes.
                  </p>
                )}
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-4 mt-1">
                {/* Usamos Controller para manejar el grupo de radio buttons */}
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value="active"
                    {...register("status")} // register funciona bien con radios nativos
                    className="form-radio h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Activo</span>
                </label>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value="inactive"
                    {...register("status")}
                    className="form-radio h-4 w-4 text-red-600 focus:ring-red-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Inactivo</span>
                </label>
              </div>
              {errors.status && (
                <p className="error-message">{errors.status.message}</p>
              )}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isProcessing || !isValid} // Deshabilitar si procesa o si el form no es válido
              className="flex items-center justify-center min-w-[140px] px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <RotateCw className="w-4 h-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <RotateCw className="w-4 h-4 mr-2" />
                  Renovar licencia
                </>
              )}
            </button>
          </div>
        </form>
        {/* CSS Helper (igual que en LicenseForm) */}
        <style>{`
          .input-field {
            display: block;
            width: 100%;
            padding: 0.5rem 0.75rem;
            border: 1px solid #d1d5db;
            border-radius: 0.375rem;
            box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
            transition: border-color 0.2s, box-shadow 0.2s;
          }
          .input-field:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 2px #bfdbfe;
          }
          .input-field.border-red-500 {
            border-color: #ef4444;
          }
          .input-field.border-red-500:focus {
            box-shadow: 0 0 0 2px #fecaca;
          }
          .error-message {
            color: #ef4444;
            font-size: 0.75rem;
            margin-top: 0.25rem;
          }
        `}</style>
      </div>
    </div>
  );
}

export default LicenseRenewalModal;
