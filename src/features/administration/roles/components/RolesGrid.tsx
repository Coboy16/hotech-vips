import React from "react";
import { Edit } from "lucide-react";
import { Role } from "../types";

interface RolesGridProps {
  roles: Role[];
  onEdit: (roleId: string) => void;
  onDelete: (role: Role) => void;
}

const RolesGrid: React.FC<RolesGridProps> = ({ roles, onEdit }) => {
  if (roles.length === 0) {
    return (
      <div className="text-center p-8 bg-white rounded-lg shadow">
        No hay roles para mostrar.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {roles.map((role) => (
        <div
          key={role.id}
          className="bg-white rounded-lg shadow overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="bg-blue-500 h-2" aria-hidden="true"></div>
          <div className="p-4">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-gray-900 truncate mb-2">
                {role.name}
              </h3>
              <div className="flex space-x-1">
                <button
                  onClick={() => onEdit(role.id)}
                  className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-100"
                  title="Editar Rol"
                >
                  <Edit className="h-4 w-4" />
                </button>
                {/* <button
                  onClick={() => onDelete(role)}
                  className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-100"
                  title="Eliminar Rol"
                >
                  <Trash2 className="h-4 w-4" />
                </button> */}
              </div>
            </div>

            <div className="mt-2 text-sm text-gray-500">
              <p>Módulos: {role.moduleIds.length}</p>
              <p className="mt-1">
                Creado:{" "}
                {new Date(role.createdAt).toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </p>
            </div>

            {/* Módulos en chips */}
            {role.associatedModules && role.associatedModules.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {role.associatedModules.slice(0, 3).map((module) => (
                  <span
                    key={module.id}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {module.name}
                  </span>
                ))}
                {role.associatedModules.length > 3 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                    +{role.associatedModules.length - 3} más
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RolesGrid;
