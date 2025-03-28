import React from "react";
import {
  MoreVertical,
  Building2,
  Users,
  Calendar,
  Clock,
  DoorClosed,
  Utensils,
  BarChart2,
  AlignCenter,
  FileEdit,
  AlertTriangle,
  Trash2,
  User,
} from "lucide-react";
import { License } from "../types/license";
import { formatDateDisplay } from "../utils/adapters";

interface LicenseCardProps {
  license: License;
  onCardClick: (license: License) => void;
  onMenuClick: (license: License, e: React.MouseEvent) => void;
  onRenew: (license: License) => void;
  onHistory: (license: License) => void;
  onDelete: (license: License) => void;
  menuOpen?: boolean;
}

const LicenseCard: React.FC<LicenseCardProps> = ({
  license,
  onCardClick,
  onMenuClick,
  onRenew,
  onHistory,
  onDelete,
}) => {
  // Función para obtener el estado de expiración
  const getExpirationStatus = (date: string) => {
    const expirationDate = new Date(date);
    const today = new Date();
    const diffTime = expirationDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 30) return "danger";
    if (diffDays <= 90) return "warning";
    return "success";
  };

  // Función para acortar el ID
  const shortenId = (id: string) => {
    if (id.length > 12) {
      return id.substring(id.length - 12);
    }
    return id;
  };

  // Función para obtener el icono según el nombre del módulo
  const getModuleIcon = (moduleName: string) => {
    switch (moduleName) {
      case "panel_monitoreo":
        return <BarChart2 className="w-5 h-5 text-blue-500" />;
      case "empleados":
        return <Users className="w-5 h-5 text-blue-500" />;
      case "control_tiempo":
        return <Clock className="w-5 h-5 text-blue-500" />;
      case "control_acceso":
        return <DoorClosed className="w-5 h-5 text-blue-500" />;
      case "comedor":
        return <Utensils className="w-5 h-5 text-blue-500" />;
      case "reportes":
        return <AlignCenter className="w-5 h-5 text-blue-500" />;
      default:
        return null;
    }
  };

  // Función para obtener la etiqueta en español de cada módulo
  const getModuleLabel = (moduleName: string): string => {
    const labels: Record<string, string> = {
      panel_monitoreo: "Panel de Monitoreo",
      empleados: "Gestión de Empleados",
      control_tiempo: "Control de Tiempo",
      control_acceso: "Control de Acceso",
      comedor: "Control de Comedor",
      reportes: "Reportes y Estadísticas",
    };

    return labels[moduleName] || moduleName;
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onClick={() => onCardClick(license)}
    >
      {/* Cabecera de la tarjeta */}
      <div className="border-b border-gray-200 p-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 mr-3">
            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-gray-500" />
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 truncate max-w-xs">
            {license.companyName}
          </h3>
        </div>
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMenuClick(license, e);
            }}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
            title="Más acciones"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Cuerpo de la tarjeta */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <p className="text-xs text-gray-500">ID</p>
            <p className="text-sm font-medium truncate">
              {shortenId(license.id)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">RNC</p>
            <p className="text-sm font-medium">{license.rnc}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Contacto</p>
            <div className="flex items-center text-sm">
              <User className="w-3.5 h-3.5 mr-1 text-gray-400" />
              <span className="truncate">
                {license.contactInfo?.name || "Sin contacto"}
              </span>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-500">Vencimiento</p>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                getExpirationStatus(license.expirationDate) === "danger"
                  ? "bg-red-100 text-red-800"
                  : getExpirationStatus(license.expirationDate) === "warning"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              <Calendar className="w-3 h-3 mr-1" />
              {formatDateDisplay(license.expirationDate)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Fila de Compañías y Empleados */}
          <div className="col-span-1">
            <p className="text-xs text-gray-500 mb-1">Compañías</p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {license.usedCompanies}/{license.allowedCompanies}
              </span>
            </div>
          </div>

          <div className="col-span-1">
            <p className="text-xs text-gray-500 mb-1">Empleados</p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {license.activeEmployees}/{license.allowedEmployees}
              </span>
            </div>
          </div>

          {/* Fila de Estado */}
          <div className="col-span-1">
            <p className="text-xs text-gray-500 mb-1">Estado</p>
          </div>

          <div className="col-span-1">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                license.status === "active"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {license.status === "active" ? "Activo" : "Inactivo"}
            </span>
          </div>
        </div>
        <div className="w-full h-3.5"></div>

        <div className="border-t border-gray-100 pt-3">
          <p className="text-xs text-gray-500 mb-2">Módulos</p>
          <div className="flex flex-wrap gap-3">
            {license.moduleNames && license.moduleNames.length > 0 ? (
              license.moduleNames.map((moduleName) => (
                <div
                  key={moduleName}
                  className="tooltip tooltip-bottom"
                  data-tip={getModuleLabel(moduleName)}
                >
                  {getModuleIcon(moduleName)}
                </div>
              ))
            ) : (
              <span className="text-gray-400 text-sm">Sin módulos</span>
            )}
          </div>
        </div>
      </div>

      {/* Pie de la tarjeta */}
      <div
        className="border-t border-gray-200 p-2 bg-gray-50 flex justify-end space-x-1"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCardClick(license);
          }}
          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-gray-200"
          title="Editar licencia"
        >
          <FileEdit className="h-5 w-5 text-blue-500" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRenew(license);
          }}
          className="text-amber-600 hover:text-amber-900 p-1 rounded hover:bg-gray-200"
          title="Renovar licencia"
        >
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onHistory(license);
          }}
          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-gray-200"
          title="Historial de cambios"
        >
          <Clock className="w-5 h-5 text-purple-500" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(license);
          }}
          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-gray-200"
          title="Eliminar licencia"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default LicenseCard;
