import React from "react";
import {
  Building2,
  FileEdit,
  MoreVertical,
  AlertTriangle,
  Trash2,
} from "lucide-react";

import { License } from "../../../../../model/license";
import { ColumnDefinition } from "../../../../../components/common/table/SortableTable";
import { useLicenseDisplay } from "./useLicenseDisplay";

interface UseLicenseColumnsProps {
  onEdit: (license: License) => void;
  onRenew: (license: License) => void;
  onDelete: (license: License) => void;
  onContextMenu: (license: License, e: React.MouseEvent) => void;
  contextMenuLicense: License | null;
  renderContextMenu: (license: License) => React.ReactNode;
}

export function useLicenseColumns({
  onEdit,
  onRenew,
  onDelete,
  onContextMenu,
  contextMenuLicense,
  renderContextMenu,
}: UseLicenseColumnsProps) {
  // Usar el hook de display para acceder a las funciones de formato
  const { getModuleIcon, getModuleLabel, formatExpirationDate } =
    useLicenseDisplay();

  // Definición de columnas
  const columns: ColumnDefinition<License>[] = [
    {
      key: "companyName",
      header: "ID/Empresa",
      sortable: true,
      render: (license) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-gray-500" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {license.companyName}
            </div>
            <div className="text-sm text-gray-500">
              {license.id} • RNC: {license.rnc}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "allowedCompanies",
      header: "Compañías",
      sortable: true,
      sortKey: (license) =>
        license.allowedCompanies
          ? license.usedCompanies / license.allowedCompanies
          : 0, // Ordenar por % de uso
      render: (license) => (
        <>
          <div className="text-sm text-gray-900">
            {license.usedCompanies}/{license.allowedCompanies}
          </div>
          {license.allowedCompanies > 0 && (
            <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{
                  width: `${Math.min(
                    100,
                    (license.usedCompanies / license.allowedCompanies) * 100
                  )}%`,
                }}
              />
            </div>
          )}
        </>
      ),
    },
    {
      key: "allowedEmployees",
      header: "Empleados",
      sortable: true,
      sortKey: (license) =>
        license.allowedEmployees
          ? license.activeEmployees / license.allowedEmployees
          : 0,
      render: (license) => (
        <>
          <div className="text-sm text-gray-900">
            {license.activeEmployees}/{license.allowedEmployees}
          </div>
          {license.allowedEmployees > 0 && (
            <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{
                  width: `${Math.min(
                    100,
                    (license.activeEmployees / license.allowedEmployees) * 100
                  )}%`,
                }}
              />
            </div>
          )}
        </>
      ),
    },
    {
      key: "expirationDate",
      header: "Vencimiento",
      sortable: true,
      render: (license) => {
        const { formattedDate, badgeClass } = formatExpirationDate(
          license.expirationDate
        );
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}
          >
            {formattedDate}
          </span>
        );
      },
    },
    {
      key: "moduleNames",
      header: "Módulos",
      sortable: false, // Ordenar por moduleNames sería complejo
      render: (license) => (
        <div className="flex flex-wrap gap-2">
          {license.moduleNames && license.moduleNames.length > 0 ? (
            license.moduleNames.map((moduleName) => (
              <div
                key={moduleName}
                className="relative group"
                title={getModuleLabel(moduleName)}
              >
                {getModuleIcon(moduleName)}
              </div>
            ))
          ) : (
            <span className="text-gray-400 text-xs italic">Sin módulos</span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Estado",
      sortable: true,
      render: (license) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            license.status === "active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {license.status === "active" ? "Activo" : "Inactivo"}
        </span>
      ),
    },
    {
      key: "actions",
      header: " ",
      sortable: false,
      align: "right",
      cellClassName: "stopPropagation", // Evita que el click en acciones active onRowClick
      render: (license) => (
        <div className="flex items-center justify-end space-x-1 relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(license);
            }}
            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
            title="Editar"
          >
            <FileEdit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRenew(license);
            }}
            className="p-1 text-yellow-500 hover:bg-yellow-100 rounded"
            title="Renovar"
          >
            <AlertTriangle className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(license);
            }}
            className="p-1 text-red-500 hover:bg-red-100 rounded"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => onContextMenu(license, e)}
            className="p-1 text-gray-500 hover:bg-gray-100 rounded"
            title="Más acciones"
          >
            <MoreVertical className="h-5 w-5" />
          </button>

          {/* Renderizar menú contextual si es para esta licencia */}
          {contextMenuLicense?.id === license.id && renderContextMenu(license)}
        </div>
      ),
    },
  ];

  return { columns };
}
