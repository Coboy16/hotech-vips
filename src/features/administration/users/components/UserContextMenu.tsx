import React, { useEffect, useRef } from "react";
import { UserCog, Key, XCircle, CheckCircle2 } from "lucide-react";
import { User } from "../types/user";

interface UserContextMenuProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (user: User) => void;
  onResetPassword?: (user: User) => void;
  onViewHistory?: (user: User) => void;
  onChangeStatus?: (user: User) => void;
  onExportData?: (user: User) => void;
}

const UserContextMenu: React.FC<UserContextMenuProps> = ({
  user,
  isOpen,
  onClose,
  onEdit,
  onResetPassword,
  onChangeStatus,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar el menú al hacer clic fuera de él
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="absolute z-10 right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 py-1"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => {
          onEdit(user);
          onClose();
        }}
        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
      >
        <UserCog className="w-4 h-4 mr-2 text-blue-500" />
        Editar usuario
      </button>

      {onResetPassword && (
        <button
          onClick={() => {
            onResetPassword(user);
            onClose();
          }}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
        >
          <Key className="w-4 h-4 mr-2 text-amber-500" />
          Restablecer contraseña
        </button>
      )}

      {/* {onViewHistory && (
        <button
          onClick={() => {
            onViewHistory(user);
            onClose();
          }}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
        >
          <History className="w-4 h-4 mr-2 text-indigo-500" />
          Historial de actividad
        </button>
      )} */}

      {/* {onExportData && (
        <button
          onClick={() => {
            onExportData(user);
            onClose();
          }}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
        >
          <FileText className="w-4 h-4 mr-2 text-green-500" />
          Exportar datos
        </button>
      )} */}

      {onChangeStatus && (
        <>
          <div className="border-t border-gray-100 my-1"></div>
          <button
            onClick={() => {
              onChangeStatus(user);
              onClose();
            }}
            className={`w-full text-left px-4 py-2 text-sm flex items-center ${
              user.status === "active"
                ? "text-red-600 hover:bg-red-50"
                : "text-green-600 hover:bg-green-50"
            }`}
          >
            {user.status === "active" ? (
              <>
                <XCircle className="w-4 h-4 mr-2" />
                Desactivar usuario
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Activar usuario
              </>
            )}
          </button>
        </>
      )}
    </div>
  );
};

export default UserContextMenu;
