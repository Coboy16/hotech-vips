import React, { useState } from "react";
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
import type { License } from "../types/license";

interface LicenseFormProps {
  license?: License | null;
  onClose: () => void;
  onSave: (formData: Partial<License>) => void;
}

export function LicenseForm({ license, onClose, onSave }: LicenseFormProps) {
  const [formData, setFormData] = useState<Partial<License>>(
    license || {
      companyName: "",
      rnc: "",
      expirationDate: "",
      allowedCompanies: 1,
      allowedEmployees: 100,
      modules: [],
      contactInfo: {
        name: "",
        email: "",
        phone: "",
      },
      status: "active",
    }
  );

  const [activeTab, setActiveTab] = useState("basic"); // "basic" o "contact"

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  // Calcular días hasta vencimiento para el indicador visual
  const getDaysUntilExpiration = () => {
    if (!formData.expirationDate) return null;

    const expirationDate = new Date(formData.expirationDate);
    const today = new Date();
    const diffTime = expirationDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const getExpirationClass = () => {
    const days = getDaysUntilExpiration();
    if (!days) return "";

    if (days <= 30) return "text-red-500 font-medium";
    if (days <= 90) return "text-yellow-500 font-medium";
    return "text-green-500 font-medium";
  };

  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden">
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

      <form onSubmit={handleSubmit} className="p-6">
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
                      Nombre de la empresa
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building2 className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={formData.companyName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            companyName: e.target.value,
                          })
                        }
                        className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      RNC
                    </label>
                    <input
                      type="text"
                      value={formData.rnc}
                      onChange={(e) =>
                        setFormData({ ...formData, rnc: e.target.value })
                      }
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
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
                    Fecha de vencimiento
                  </label>
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
                      Compañías permitidas
                    </label>
                    <div className="relative mt-1">
                      <input
                        type="number"
                        value={formData.allowedCompanies}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            allowedCompanies: parseInt(e.target.value),
                          })
                        }
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        min="1"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Empleados permitidos
                    </label>
                    <div className="relative mt-1">
                      <input
                        type="number"
                        value={formData.allowedEmployees}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            allowedEmployees: parseInt(e.target.value),
                          })
                        }
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        min="1"
                        required
                      />
                    </div>
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
                      <span className="ml-2 text-sm text-gray-700">
                        Inactivo
                      </span>
                    </label>
                  </div>
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
                      Nombre del contacto
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={formData.contactInfo?.name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contactInfo: {
                              ...formData.contactInfo!,
                              name: e.target.value,
                            },
                          })
                        }
                        className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Correo electrónico
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        value={formData.contactInfo?.email}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contactInfo: {
                              ...formData.contactInfo!,
                              email: e.target.value,
                            },
                          })
                        }
                        className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        value={formData.contactInfo?.phone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contactInfo: {
                              ...formData.contactInfo!,
                              phone: e.target.value,
                            },
                          })
                        }
                        className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
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
                    value={formData.notes || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
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

                <div className="mt-4 grid grid-cols-1 gap-3">
                  {[
                    {
                      name: "Control de Tiempo",
                      icon: <Calendar className="w-5 h-5 text-blue-500" />,
                      description: "Gestión de horarios y asistencia",
                    },
                    {
                      name: "Control de Accesos",
                      icon: <Building2 className="w-5 h-5 text-green-500" />,
                      description: "Control de entradas y permisos",
                    },
                    {
                      name: "Control de Comedor",
                      icon: <Users className="w-5 h-5 text-amber-500" />,
                      description: "Administración de servicios alimenticios",
                    },
                    {
                      name: "Control de Capacitación",
                      icon: (
                        <CheckCircle2 className="w-5 h-5 text-purple-500" />
                      ),
                      description: "Gestión de formación del personal",
                    },
                  ].map((module) => (
                    <label
                      key={module.name}
                      className="relative flex p-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:border-blue-400 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center h-5">
                        <input
                          type="checkbox"
                          checked={formData.modules?.includes(module.name)}
                          onChange={(e) => {
                            const modules = formData.modules || [];
                            setFormData({
                              ...formData,
                              modules: e.target.checked
                                ? [...modules, module.name]
                                : modules.filter((m) => m !== module.name),
                            });
                          }}
                          className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>
                      <div className="ml-3 flex items-center">
                        <span className="mr-3">{module.icon}</span>
                        <div>
                          <span className="block text-sm font-medium text-gray-900">
                            {module.name}
                          </span>
                          <span className="block text-xs text-gray-500">
                            {module.description}
                          </span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="mt-8 pt-5 border-t border-gray-200 flex justify-between">
          <div>
            {formData.modules && formData.modules.length === 0 && (
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
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              {license ? "Guardar cambios" : "Crear licencia"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
