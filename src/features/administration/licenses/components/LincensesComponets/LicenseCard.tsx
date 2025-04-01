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
  CheckCircle,
  XCircle,
  Info,
} from "lucide-react";
import { License } from "../../../../../model/license"; // Importa desde model
import { formatDateForDisplay } from "../../utils/adapters"; // Importa formateador

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
  // onHistory,
  onDelete,
}) => {
  // Función para obtener el estado de expiración
  const getExpirationStatus = () => {
    if (!license.expirationDate) return { status: "unknown", days: null };
    try {
      const expiration = new Date(license.expirationDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      expiration.setHours(0, 0, 0, 0); // Comparar solo fechas
      const diffTime = expiration.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) return { status: "danger", days: diffDays }; // Vencido o vence hoy
      if (diffDays <= 30) return { status: "danger", days: diffDays };
      if (diffDays <= 90) return { status: "warning", days: diffDays };
      return { status: "success", days: diffDays };
    } catch {
      return { status: "unknown", days: null };
    }
  };

  const expirationInfo = getExpirationStatus();

  // Función para acortar el ID si es necesario
  const shortenId = (id: string, length = 12) => {
    return id.length > length ? `...${id.slice(-length)}` : id;
  };

  // Función para obtener el icono según el nombre del módulo principal
  const getModuleIcon = (moduleName: string) => {
    const iconMap: Record<string, React.ElementType> = {
      panel_monitoreo: BarChart2,
      empleados: Users,
      control_tiempo: Clock,
      control_acceso: DoorClosed,
      comedor: Utensils,
      reportes: AlignCenter,
    };
    return iconMap[moduleName] || Info; // Icono por defecto
  };

  // Función para obtener la etiqueta en español de cada módulo principal
  const getModuleLabel = (moduleName: string): string => {
    const labels: Record<string, string> = {
      panel_monitoreo: "Monitoreo",
      empleados: "Empleados",
      control_tiempo: "Tiempo",
      control_acceso: "Acceso",
      comedor: "Comedor",
      reportes: "Reportes",
    };
    return labels[moduleName] || moduleName;
  };

  // Clases CSS para el estado de expiración
  const expirationBadgeClass = () => {
    switch (expirationInfo.status) {
      case "danger":
        return "bg-red-100 text-red-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "success":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer flex flex-col h-full" // Added flex flex-col h-full
      onClick={() => onCardClick(license)}
    >
      {/* Cabecera */}
      <div className="border-b border-gray-200 p-3 flex justify-between items-start">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-gray-500" />
          </div>
          <div className="overflow-hidden">
            <h3
              className="text-base font-medium text-gray-900 truncate"
              title={license.companyName}
            >
              {license.companyName}
            </h3>
            <p className="text-xs text-gray-500 truncate" title={license.id}>
              ID: {shortenId(license.id, 8)} • RNC: {license.rnc}
            </p>
          </div>
        </div>
        <div className="relative flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMenuClick(license, e);
            }}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
            title="Más acciones"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Cuerpo */}
      <div className="p-3 flex-grow">
        {" "}
        {/* Added flex-grow */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3 text-xs">
          {/* Contacto */}
          <div
            className="flex items-center text-gray-600 truncate"
            title={license.contactInfo.name}
          >
            <User className="w-3.5 h-3.5 mr-1.5 text-gray-400 flex-shrink-0" />
            <span className="truncate">{license.contactInfo.name || "-"}</span>
          </div>
          {/* Vencimiento */}
          <div className="flex justify-end">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium ${expirationBadgeClass()}`}
            >
              <Calendar className="w-3 h-3 mr-1" />
              {formatDateForDisplay(license.expirationDate) || "N/A"}
            </span>
          </div>
          {/* Compañías */}
          <div>
            <p className="text-gray-500 mb-0.5">Compañías</p>
            <div className="flex items-center">
              <span className="font-medium text-gray-800">
                {license.usedCompanies}
              </span>
              <span className="text-gray-500">/{license.allowedCompanies}</span>
              {/* Barra de progreso simple */}
              <div className="ml-2 w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500"
                  style={{
                    width: `${Math.min(
                      100,
                      (license.usedCompanies / license.allowedCompanies) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
          {/* Empleados */}
          <div>
            <p className="text-gray-500 mb-0.5">Empleados</p>
            <div className="flex items-center">
              <span className="font-medium text-gray-800">
                {license.activeEmployees}
              </span>
              <span className="text-gray-500">/{license.allowedEmployees}</span>
              <div className="ml-2 w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500"
                  style={{
                    width: `${Math.min(
                      100,
                      (license.activeEmployees / license.allowedEmployees) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        {/* Módulos */}
        <div className="border-t border-gray-100 pt-2">
          <p className="text-xs text-gray-500 mb-1.5">Módulos</p>
          <div className="flex flex-wrap gap-2">
            {license.moduleNames && license.moduleNames.length > 0 ? (
              license.moduleNames.map((moduleName) => {
                const Icon = getModuleIcon(moduleName);
                const label = getModuleLabel(moduleName);
                return (
                  <div
                    key={moduleName}
                    className="relative group flex items-center"
                    title={label}
                  >
                    <Icon className="w-4 h-4 text-blue-600" />
                    {/* Tooltip (opcional, si title no es suficiente) */}
                    {/* <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block whitespace-nowrap bg-black text-white text-xs rounded py-1 px-2">{label}</span> */}
                  </div>
                );
              })
            ) : (
              <span className="text-gray-400 text-xs italic">Sin módulos</span>
            )}
          </div>
        </div>
      </div>

      {/* Pie */}
      <div
        className="border-t border-gray-200 p-2 bg-gray-50 flex justify-between items-center mt-auto" // Added mt-auto
        onClick={(e) => e.stopPropagation()}
      >
        {/* Estado Activo/Inactivo */}
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            license.status === "active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {license.status === "active" ? (
            <CheckCircle className="w-3 h-3 mr-1" />
          ) : (
            <XCircle className="w-3 h-3 mr-1" />
          )}
          {license.status === "active" ? "Activo" : "Inactivo"}
        </span>

        {/* Botones de Acción Rápida */}
        <div className="flex space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCardClick(license);
            }}
            className="text-blue-500 hover:bg-blue-100 p-1 rounded"
            title="Editar"
          >
            <FileEdit className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRenew(license);
            }}
            className="text-yellow-500 hover:bg-yellow-100 p-1 rounded"
            title="Renovar"
          >
            <AlertTriangle className="w-4 h-4" />
          </button>
          {/* <button
            onClick={(e) => {
              e.stopPropagation();
              onHistory(license);
            }}
            className="text-purple-500 hover:bg-purple-100 p-1 rounded"
            title="Historial"
          >
            <Clock className="w-4 h-4" />
          </button> */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(license);
            }}
            className="text-red-500 hover:bg-red-100 p-1 rounded"
            title="Eliminar"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LicenseCard;
