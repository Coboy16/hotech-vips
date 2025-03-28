import React, { useState, useEffect } from "react";
import { X, Calendar, RotateCw, CheckCircle2, AlertCircle } from "lucide-react";
import type { License } from "../types/license";
import { licenseService } from "../services/licenseService";
import { toast } from "react-hot-toast";

interface LicenseRenewalModalProps {
  license: License;
  onClose: () => void;
  onRenewed: (updatedLicense: License) => void;
}

export function LicenseRenewalModal({
  license,
  onClose,
  onRenewed,
}: LicenseRenewalModalProps) {
  // Estado para los datos del formulario
  const [formData, setFormData] = useState({
    expirationDate: "",
    status: license.status,
  });

  // Estado para indicar si se está procesando la renovación
  const [isProcessing, setIsProcessing] = useState(false);

  // Calcula los días restantes hasta la expiración
  const getDaysUntilExpiration = () => {
    const expirationDate = new Date(license.expirationDate);
    const today = new Date();
    const diffTime = expirationDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  // Formateamos la fecha para el input
  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  // Inicializa el formulario cuando se carga el componente
  useEffect(() => {
    // Calculamos una fecha de renovación por defecto (1 año desde la actual)
    const currentExpirationDate = new Date(license.expirationDate);
    const defaultRenewalDate = new Date(currentExpirationDate);
    defaultRenewalDate.setFullYear(defaultRenewalDate.getFullYear() + 1);

    setFormData({
      expirationDate: formatDateForInput(defaultRenewalDate.toISOString()),
      status: license.status,
    });
  }, [license]);

  // Maneja la renovación de la licencia
  const handleRenewal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // La API espera que el status sea un booleano (true para activo, false para inactivo)
      const updateData = {
        expirationDate: formData.expirationDate,
        status: formData.status === "active", // Convertimos el string a boolean
      };

      // Llamamos al servicio para actualizar la licencia
      const updatedLicense = await licenseService.update(
        license.id,
        updateData
      );

      if (updatedLicense) {
        toast.success("Licencia renovada correctamente");
        // Transform API response to match License type
        const transformedLicense: License = {
          ...license,
          expirationDate: formData.expirationDate,
          status: formData.status,
        };
        onRenewed(transformedLicense);
      } else {
        toast.error("Error al renovar la licencia");
      }
    } catch (error) {
      console.error("Error al renovar licencia:", error);
      toast.error("Error al procesar la renovación de la licencia");
    } finally {
      setIsProcessing(false);
    }
  };

  // Determina la clase de color según los días hasta el vencimiento
  const getExpirationStatusClass = () => {
    const days = getDaysUntilExpiration();

    if (days <= 0) return "text-red-500 font-medium";
    if (days <= 30) return "text-red-500 font-medium";
    if (days <= 90) return "text-yellow-500 font-medium";
    return "text-green-500 font-medium";
  };

  // Mensaje descriptivo según el estado de vencimiento
  const getExpirationMessage = () => {
    const days = getDaysUntilExpiration();

    if (days < 0) return `La licencia venció hace ${Math.abs(days)} días`;
    if (days === 0) return "La licencia vence hoy";
    if (days <= 30) return `Vence pronto: ${days} días restantes`;
    if (days <= 90) return `Vencimiento próximo: ${days} días restantes`;
    return `${days} días hasta el vencimiento`;
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden">
        {/* Encabezado con degradado */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <RotateCw className="w-6 h-6" />
              <h2 className="text-xl font-bold">Renovar Licencia</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-white hover:bg-blue-700 p-2 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="mt-2 text-blue-100">
            Actualiza la fecha de vencimiento y el estado de la licencia.
          </p>
        </div>

        <form onSubmit={handleRenewal} className="p-6">
          {/* Información de la licencia */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-3">Licencia actual</h3>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Empresa:</span>{" "}
                {license.companyName}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">ID:</span> {license.id}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">RNC:</span> {license.rnc}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Vencimiento actual:</span>{" "}
                {new Date(license.expirationDate).toLocaleDateString()}
              </p>
              <p className={`text-sm mt-1 ${getExpirationStatusClass()}`}>
                <AlertCircle className="w-4 h-4 inline-block mr-1" />
                {getExpirationMessage()}
              </p>
            </div>
          </div>

          {/* Formulario de renovación */}
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h3 className="text-lg font-medium text-blue-800 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Nueva fecha de vencimiento
              </h3>

              <div className="mt-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    value={formData.expirationDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        expirationDate: e.target.value,
                      })
                    }
                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h3 className="text-lg font-medium text-blue-800 flex items-center">
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Estado
              </h3>

              <div className="mt-4">
                <div className="flex items-center space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={formData.status === "active"}
                      onChange={() =>
                        setFormData({
                          ...formData,
                          status: "active",
                        })
                      }
                      className="form-radio h-5 w-5 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Activo</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="inactive"
                      checked={formData.status === "inactive"}
                      onChange={() =>
                        setFormData({
                          ...formData,
                          status: "inactive",
                        })
                      }
                      className="form-radio h-5 w-5 text-red-600 focus:ring-red-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Inactivo</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              disabled={isProcessing}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              disabled={isProcessing}
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
      </div>
    </div>
  );
}

export default LicenseRenewalModal;
