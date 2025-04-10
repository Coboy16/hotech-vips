import React, { useEffect, useRef } from "react";
import { UserCog, Key, Trash2 } from "lucide-react"; // Añadir Trash2
// import { UserCog, Key, XCircle, CheckCircle2, Trash2 } from "lucide-react"; // Añadir Trash2
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
  onDeleteRequest?: (user: User) => void; // <--- Nueva prop para solicitar eliminación
}

const UserContextMenu: React.FC<UserContextMenuProps> = ({
  user,
  isOpen,
  onClose,
  onEdit,
  onResetPassword,
  // onChangeStatus,
  onDeleteRequest, // <--- Recibir la nueva prop
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

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
      style={{ top: "100%" }}
    >
      {/* --- Opciones existentes --- */}
      <button
        onClick={() => onEdit(user)}
        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
      >
        <UserCog className="w-4 h-4 mr-2 text-blue-500" /> Editar usuario
      </button>
      {onResetPassword && (
        <button
          onClick={() => onResetPassword(user)}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
        >
          <Key className="w-4 h-4 mr-2 text-amber-500" /> Restablecer contraseña
        </button>
      )}

      {/* {onChangeStatus && (
        <>
          <div className="border-t border-gray-100 my-1"></div>
          <button
            onClick={() => onChangeStatus(user)}
            className={`w-full text-left px-4 py-2 text-sm flex items-center ${
              user.usua_stat === true || user.status === "active"
                ? "text-red-600 hover:bg-red-50"
                : "text-green-600 hover:bg-green-50"
            }`}
          >
            {user.usua_stat === true || user.status === "active" ? (
              <>
                {" "}
                <XCircle className="w-4 h-4 mr-2" /> Desactivar{" "}
              </>
            ) : (
              <>
                {" "}
                <CheckCircle2 className="w-4 h-4 mr-2" /> Activar{" "}
              </>
            )}
          </button>
        </>
      )} */}

      {/* --- Nueva opción de Eliminar --- */}
      {onDeleteRequest && (
        <>
          <div className="border-t border-gray-100 my-1"></div>
          <button
            onClick={() => onDeleteRequest(user)} // Llama a la nueva prop
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Eliminar usuario
          </button>
        </>
      )}
      {/* --- Fin Nueva opción --- */}
    </div>
  );
};

export default UserContextMenu;
