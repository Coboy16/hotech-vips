/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import {
  X,
  Calendar,
  Clock,
  User,
  Filter,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from "lucide-react";
import type { License } from "../types/license";

interface LicenseHistoryModalProps {
  license: License;
  onClose: () => void;
}

// Definir interfaces para los datos de historial
interface HistoryChange {
  field: string;
  oldValue: string | number | boolean | null;
  newValue: string | number | boolean | null;
}

interface HistoryEntry {
  id: string;
  timestamp: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  action: "create" | "update" | "renew";
  changes: HistoryChange[];
}

export function LicenseHistoryModal({
  license,
  onClose,
}: LicenseHistoryModalProps) {
  // Datos simulados de historial para la licencia
  const mockHistoryData: HistoryEntry[] = [
    {
      id: "hist-001",
      timestamp: new Date(
        new Date().setDate(new Date().getDate() - 1)
      ).toISOString(),
      user: {
        id: "user-001",
        name: "Juan Pérez",
        email: "juan.perez@empresa.com",
      },
      action: "renew",
      changes: [
        {
          field: "expirationDate",
          oldValue: new Date(
            new Date().setFullYear(new Date().getFullYear() - 1)
          ).toISOString(),
          newValue: license.expirationDate,
        },
        {
          field: "status",
          oldValue: "inactive",
          newValue: "active",
        },
      ],
    },
    {
      id: "hist-002",
      timestamp: new Date(
        new Date().setDate(new Date().getDate() - 30)
      ).toISOString(),
      user: {
        id: "user-002",
        name: "María Gómez",
        email: "maria.gomez@empresa.com",
      },
      action: "update",
      changes: [
        {
          field: "allowedEmployees",
          oldValue: 500,
          newValue: license.allowedEmployees,
        },
        {
          field: "modules",
          oldValue: "Control de Tiempo, Control de Accesos",
          newValue: license.modules.join(", "),
        },
      ],
    },
    {
      id: "hist-003",
      timestamp: new Date(
        new Date().setMonth(new Date().getMonth() - 3)
      ).toISOString(),
      user: {
        id: "user-003",
        name: "Carlos López",
        email: "carlos.lopez@empresa.com",
      },
      action: "create",
      changes: [
        {
          field: "companyName",
          oldValue: null,
          newValue: license.companyName,
        },
        {
          field: "rnc",
          oldValue: null,
          newValue: license.rnc,
        },
        {
          field: "expirationDate",
          oldValue: null,
          newValue: new Date(
            new Date().setFullYear(new Date().getFullYear() - 1)
          ).toISOString(),
        },
        {
          field: "allowedCompanies",
          oldValue: null,
          newValue: license.allowedCompanies,
        },
        {
          field: "allowedEmployees",
          oldValue: null,
          newValue: 500,
        },
        {
          field: "status",
          oldValue: null,
          newValue: "active",
        },
        {
          field: "modules",
          oldValue: null,
          newValue: "Control de Tiempo, Control de Accesos",
        },
      ],
    },
  ];

  // Estado para filtrado
  const [filterAction, setFilterAction] = useState<string>("all");
  const [expandedEntries, setExpandedEntries] = useState<string[]>([]);

  // Filtrar historial según la acción seleccionada
  const filteredHistory = mockHistoryData.filter(
    (entry) => filterAction === "all" || entry.action === filterAction
  );

  // Función para formatear fechas
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Función para formatear valores específicos
  const formatValue = (field: string, value: any) => {
    if (value === null) return "No definido";

    if (field === "expirationDate" && typeof value === "string") {
      return new Date(value).toLocaleDateString("es-ES");
    }

    if (field === "status") {
      if (value === "active" || value === true) return "Activo";
      if (value === "inactive" || value === false) return "Inactivo";
    }

    return value.toString();
  };

  // Función para obtener etiquetas según el tipo de acción
  const getActionLabel = (action: string) => {
    switch (action) {
      case "create":
        return { text: "Creación", class: "bg-green-100 text-green-800" };
      case "update":
        return { text: "Actualización", class: "bg-blue-100 text-blue-800" };
      case "renew":
        return { text: "Renovación", class: "bg-purple-100 text-purple-800" };
      default:
        return { text: action, class: "bg-gray-100 text-gray-800" };
    }
  };

  // Función para obtener nombres de campos en español
  const getFieldLabel = (field: string) => {
    const fieldLabels: Record<string, string> = {
      companyName: "Nombre de empresa",
      rnc: "RNC",
      expirationDate: "Fecha de vencimiento",
      allowedCompanies: "Compañías permitidas",
      allowedEmployees: "Empleados permitidos",
      status: "Estado",
      modules: "Módulos",
      usedCompanies: "Compañías utilizadas",
      activeEmployees: "Empleados activos",
    };

    return fieldLabels[field] || field;
  };

  // Manejar la expansión/colapso de un item de historial
  const toggleExpand = (entryId: string) => {
    setExpandedEntries((prev) =>
      prev.includes(entryId)
        ? prev.filter((id) => id !== entryId)
        : [...prev, entryId]
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full overflow-hidden">
        {/* Encabezado con degradado */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Clock className="w-6 h-6" />
              <h2 className="text-xl font-bold">Historial de Cambios</h2>
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
            Revisa el historial de cambios y renovaciones de la licencia para{" "}
            {license.companyName}.
          </p>
        </div>

        <div className="p-6">
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
            </div>
          </div>

          {/* Filtros */}
          <div className="flex items-center mb-4 space-x-4">
            <div className="flex items-center">
              <Filter className="w-4 h-4 text-gray-500 mr-2" />
              <span className="text-sm text-gray-700">Filtrar por:</span>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setFilterAction("all")}
                className={`px-3 py-1 text-xs rounded-full ${
                  filterAction === "all"
                    ? "bg-blue-100 text-blue-800 font-medium"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilterAction("create")}
                className={`px-3 py-1 text-xs rounded-full ${
                  filterAction === "create"
                    ? "bg-green-100 text-green-800 font-medium"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                Creación
              </button>
              <button
                onClick={() => setFilterAction("update")}
                className={`px-3 py-1 text-xs rounded-full ${
                  filterAction === "update"
                    ? "bg-blue-100 text-blue-800 font-medium"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                Actualización
              </button>
              <button
                onClick={() => setFilterAction("renew")}
                className={`px-3 py-1 text-xs rounded-full ${
                  filterAction === "renew"
                    ? "bg-purple-100 text-purple-800 font-medium"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                Renovación
              </button>
            </div>
          </div>

          {/* Lista de historial */}
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {filteredHistory.length > 0 ? (
              filteredHistory.map((entry) => {
                const actionInfo = getActionLabel(entry.action);
                const isExpanded = expandedEntries.includes(entry.id);

                return (
                  <div
                    key={entry.id}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <div
                      className="p-4 bg-gray-50 flex items-center justify-between cursor-pointer"
                      onClick={() => toggleExpand(entry.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${actionInfo.class}`}
                        >
                          {actionInfo.text}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {formatDate(entry.timestamp)}
                        </span>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <User className="w-4 h-4 mr-1" />
                          {entry.user.name}
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-4 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Cambios realizados:
                        </h4>
                        <div className="space-y-2">
                          {entry.changes.map((change, idx) => (
                            <div
                              key={idx}
                              className="text-sm bg-gray-50 p-2 rounded"
                            >
                              <span className="font-medium">
                                {getFieldLabel(change.field)}:{" "}
                              </span>
                              <div className="flex items-center mt-1 text-xs">
                                <span className="text-gray-500">
                                  {formatValue(change.field, change.oldValue)}
                                </span>
                                <ArrowRight className="w-3 h-3 mx-2 text-gray-400" />
                                <span className="text-blue-600 font-medium">
                                  {formatValue(change.field, change.newValue)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  No se encontraron registros de cambios con el filtro actual.
                </p>
              </div>
            )}
          </div>

          {/* Nota informativa */}
          <div className="mt-6 bg-blue-50 p-3 rounded-lg text-xs text-blue-600 flex items-start">
            <Calendar className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
            <p>
              Este historial muestra los cambios realizados en la licencia a lo
              largo del tiempo. Los cambios incluyen creación, actualizaciones y
              renovaciones de la licencia.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LicenseHistoryModal;
