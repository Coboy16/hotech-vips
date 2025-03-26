import React, { useState } from "react";
import { X } from "lucide-react";
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {license ? "Editar Licencia" : "Nueva Licencia"}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">Datos básicos</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombre de la empresa
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) =>
                setFormData({ ...formData, companyName: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              RNC
            </label>
            <input
              type="text"
              value={formData.rnc}
              onChange={(e) =>
                setFormData({ ...formData, rnc: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Fecha de vencimiento
            </label>
            <input
              type="date"
              value={formData.expirationDate}
              onChange={(e) =>
                setFormData({ ...formData, expirationDate: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Compañías permitidas
            </label>
            <input
              type="number"
              value={formData.allowedCompanies}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  allowedCompanies: parseInt(e.target.value),
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              min="1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Empleados permitidos
            </label>
            <input
              type="number"
              value={formData.allowedEmployees}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  allowedEmployees: parseInt(e.target.value),
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              min="1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as "active" | "inactive",
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">
            Información de contacto
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombre del contacto
            </label>
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Correo electrónico
            </label>
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Teléfono
            </label>
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Módulos contratados
            </label>
            <div className="space-y-2">
              {[
                "Control de Tiempo",
                "Control de Accesos",
                "Control de Comedor",
                "Control de Capacitación",
              ].map((module) => (
                <label key={module} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.modules?.includes(module)}
                    onChange={(e) => {
                      const modules = formData.modules || [];
                      setFormData({
                        ...formData,
                        modules: e.target.checked
                          ? [...modules, module]
                          : modules.filter((m) => m !== module),
                      });
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{module}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Notas
            </label>
            <textarea
              value={formData.notes || ""}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Información adicional sobre la licencia..."
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {license ? "Guardar cambios" : "Crear licencia"}
        </button>
      </div>
    </form>
  );
}
