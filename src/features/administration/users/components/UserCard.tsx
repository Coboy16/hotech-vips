import React from "react";
import {
  MoreVertical,
  Shield,
  Clock,
  Building2,
  Key,
  UserCog,
  Mail,
  Phone,
} from "lucide-react";
import { User } from "../types/user";

interface UserCardProps {
  user: User;
  onCardClick: (user: User) => void;
  onMenuClick: (user: User, e: React.MouseEvent) => void;
  menuOpen?: boolean;
  roleColors: Record<string, string>;
  getRoleLabel: (role: string) => string;
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  onCardClick,
  onMenuClick,
  roleColors,
  getRoleLabel,
}) => {
  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onClick={() => onCardClick(user)}
    >
      {/* Cabecera de la tarjeta */}
      <div className="relative bg-gray-50 p-4 flex flex-col items-center border-b border-gray-200">
        <div className="absolute top-2 right-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMenuClick(user, e);
            }}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
            title="Más acciones"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>

        <img
          src={user.avatar || "https://via.placeholder.com/100"}
          alt={`${user.firstName} ${user.lastName}`}
          className="w-20 h-20 rounded-full object-cover mb-3 border-2 border-white shadow"
        />

        <h3 className="text-lg font-medium text-gray-900 text-center">
          {user.firstName} {user.lastName}
        </h3>

        <span
          className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            roleColors[user.role] || "bg-gray-100 text-gray-800"
          }`}
        >
          {getRoleLabel(user.role)}
        </span>
      </div>

      {/* Cuerpo de la tarjeta */}
      <div className="p-4">
        <div className="space-y-3">
          <div className="flex items-center text-sm">
            <Mail className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-gray-600 truncate">{user.email}</span>
          </div>

          {user.phone && (
            <div className="flex items-center text-sm">
              <Phone className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-gray-600">{user.phone}</span>
            </div>
          )}

          <div className="pt-2">
            <p className="text-xs text-gray-500 mb-1">Departamentos</p>
            <div className="flex flex-wrap gap-1">
              {user.departments.map((dept) => (
                <span
                  key={dept}
                  className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded"
                >
                  {dept}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-1">Permisos</p>
            <div className="flex space-x-2">
              {user.permissions.approveHours && (
                <div className="tooltip" data-tip="Aprobar horas">
                  <Clock className="w-5 h-5 text-blue-500" />
                </div>
              )}
              {user.permissions.modifyChecks && (
                <div className="tooltip" data-tip="Modificar registros">
                  <Shield className="w-5 h-5 text-green-500" />
                </div>
              )}
              {user.permissions.manageReports && (
                <div className="tooltip" data-tip="Administrar reportes">
                  <Building2 className="w-5 h-5 text-amber-500" />
                </div>
              )}
            </div>
          </div>

          <div className="pt-1">
            <p className="text-xs text-gray-500 mb-1">Último acceso</p>
            <p className="text-sm text-gray-600">
              {new Date(user.lastLogin).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Pie de la tarjeta */}
      <div
        className="border-t border-gray-200 p-2 bg-gray-50 flex justify-between items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            user.status === "active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {user.status === "active" ? "Activo" : "Inactivo"}
        </span>

        <div className="flex space-x-1">
          <button
            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-gray-200"
            title="Editar usuario"
            onClick={(e) => {
              e.stopPropagation();
              onCardClick(user);
            }}
          >
            <UserCog className="h-5 w-5" />
          </button>
          <button
            className="text-amber-600 hover:text-amber-900 p-1 rounded hover:bg-gray-200"
            title="Restablecer contraseña"
          >
            <Key className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
