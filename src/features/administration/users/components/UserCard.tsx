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
import UserAvatar from "./UserAvatar";

interface UserCardProps {
  user: User;
  onCardClick: (user: User) => void;
  onMenuClick: (user: User, e: React.MouseEvent) => void;
  roleColors: Record<string, string>;
  getRoleLabel: (role: string) => string;
  onResetPasswordClick: (user: User, e: React.MouseEvent) => void;
  // --- INICIO CAMBIO: Eliminar props no usadas ---
  // users: User[]; // No se pasa ni se usa aquí
  // contextMenuUser: User | null; // No se pasa ni se usa aquí
  // --- FIN CAMBIO ---
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  onCardClick,
  onMenuClick,
  roleColors,
  getRoleLabel,
  onResetPasswordClick,
}) => {
  // --- INICIO CAMBIO: Añadir fallback defensivo para user.role ---
  const safeRole = user?.role ?? "unknown";
  const roleColorClass = roleColors[safeRole] || roleColors.unknown; // Usar fallback y color unknown
  // --- FIN CAMBIO ---

  // Comprobación defensiva por si 'user' llega a ser null/undefined
  if (!user) {
    console.error("UserCard recibió un usuario nulo o undefined.");
    return null; // O renderizar un placeholder/error
  }

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onClick={() => onCardClick(user)}
    >
      {/* Cabecera */}
      <div className="relative bg-gray-50 p-4 flex flex-col items-center border-b border-gray-200">
        {/* Botón de menú */}
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

        <UserAvatar
          firstName={user.firstName}
          lastName={user.lastName}
          avatarUrl={user.avatar}
          size={80}
          className="mb-3 border-2 border-white shadow"
        />

        <h3 className="text-lg font-medium text-gray-900 text-center">
          {user.firstName} {user.lastName}
        </h3>

        <span
          className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColorClass}`}
        >
          {/* Usar getRoleLabel que ya maneja undefined/null */}
          {getRoleLabel(safeRole)}
        </span>
      </div>

      {/* Cuerpo */}
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
              {user.departments && user.departments.length > 0 ? (
                user.departments.map((dept) => (
                  <span
                    key={dept}
                    className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded"
                  >
                    {dept}
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-400 italic">N/A</span>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-1">Permisos</p>
            <div className="flex space-x-2">
              {user.permissions?.approveHours && (
                <div className="tooltip" data-tip="Aprobar horas">
                  <Clock className="w-5 h-5 text-blue-500" />
                </div>
              )}
              {user.permissions?.modifyChecks && (
                <div className="tooltip" data-tip="Modificar registros">
                  <Shield className="w-5 h-5 text-green-500" />
                </div>
              )}
              {user.permissions?.manageReports && (
                <div className="tooltip" data-tip="Administrar reportes">
                  <Building2 className="w-5 h-5 text-amber-500" />
                </div>
              )}
              {!user.permissions ||
                (!user.permissions.approveHours &&
                  !user.permissions.modifyChecks &&
                  !user.permissions.manageReports && (
                    <span className="text-xs text-gray-400 italic">N/A</span>
                  ))}
            </div>
          </div>

          <div className="pt-1">
            <p className="text-xs text-gray-500 mb-1">Último acceso</p>
            <p className="text-sm text-gray-600">
              {user.lastLogin
                ? new Date(user.lastLogin).toLocaleString()
                : "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Pie */}
      <div
        className="border-t border-gray-200 p-2 bg-gray-50 flex justify-between items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Estado */}
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            user.status === "active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {user.status === "active" ? "Activo" : "Inactivo"}
        </span>

        {/* Acciones rápidas */}
        <div className="flex space-x-1">
          <button
            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-gray-100"
            title="Editar usuario"
            onClick={(e) => {
              e.stopPropagation();
              onCardClick(user);
            }}
          >
            <UserCog className="h-5 w-5" />
          </button>
          <button
            className="text-amber-600 hover:text-amber-900 p-1 rounded hover:bg-gray-100"
            title="Restablecer contraseña"
            onClick={(e) => onResetPasswordClick(user, e)}
          >
            <Key className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
