import React from "react";
import {
  MoreVertical,
  Building2,
  Users,
  Calendar,
  CheckCircle2,
  FileEdit,
  AlertTriangle,
} from "lucide-react";
import { License } from "../types/license";

interface LicenseCardProps {
  license: License;
  onCardClick: (license: License) => void;
  onMenuClick: (license: License, e: React.MouseEvent) => void;
  menuOpen?: boolean;
}

const LicenseCard: React.FC<LicenseCardProps> = ({
  license,
  onCardClick,
  onMenuClick,
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

  // Función para obtener el icono según el módulo
  const getModuleIcon = (module: string) => {
    switch (module) {
      case "Control de Tiempo":
        return <CheckCircle2 className="w-5 h-5 text-blue-500" />;
      case "Control de Accesos":
        return <Building2 className="w-5 h-5 text-green-500" />;
      case "Control de Comedor":
        return <Users className="w-5 h-5 text-amber-500" />;
      case "Control de Capacitación":
        return <Calendar className="w-5 h-5 text-purple-500" />;
      default:
        return null;
    }
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
            <p className="text-sm font-medium truncate">{license.id}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">RNC</p>
            <p className="text-sm font-medium">{license.rnc}</p>
          </div>

          <div className="col-span-2">
            <p className="text-xs text-gray-500 mb-1">Compañías</p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {license.usedCompanies}/{license.allowedCompanies}
              </span>
              <div className="w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{
                    width: `${
                      (license.usedCompanies / license.allowedCompanies) * 100
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="col-span-2">
            <p className="text-xs text-gray-500 mb-1">Empleados</p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {license.activeEmployees}/{license.allowedEmployees}
              </span>
              <div className="w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{
                    width: `${
                      (license.activeEmployees / license.allowedEmployees) * 100
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-3">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              getExpirationStatus(license.expirationDate) === "danger"
                ? "bg-red-100 text-red-800"
                : getExpirationStatus(license.expirationDate) === "warning"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            <Calendar className="w-3 h-3 mr-1" />
            {new Date(license.expirationDate).toLocaleDateString()}
          </span>

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

        <div className="border-t border-gray-100 pt-3">
          <p className="text-xs text-gray-500 mb-2">Módulos</p>
          <div className="flex flex-wrap gap-2">
            {license.modules.map((module) => (
              <div key={module} className="tooltip" data-tip={module}>
                {getModuleIcon(module)}
              </div>
            ))}
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
          <FileEdit className="h-5 w-5" />
        </button>
        <button
          className="text-amber-600 hover:text-amber-900 p-1 rounded hover:bg-gray-200"
          title="Renovar licencia"
        >
          <AlertTriangle className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default LicenseCard;
