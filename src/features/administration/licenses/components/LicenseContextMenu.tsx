import React, { useEffect, useRef } from "react";
import { FileEdit, Trash2, AlertTriangle, Clock } from "lucide-react";
import { License } from "../../../../model/license";

interface LicenseContextMenuProps {
  license: License;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (license: License) => void;
  onDelete?: (license: License) => void;
  onRenew?: (license: License) => void;
  onExport?: (license: License) => void;
  onHistory?: (license: License) => void;
}

const LicenseContextMenu: React.FC<LicenseContextMenuProps> = ({
  license,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onRenew,
  onHistory,
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
          onEdit(license);
          onClose();
        }}
        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
      >
        <FileEdit className="w-4 h-4 mr-2 text-blue-500" />
        Editar licencia
      </button>

      {onRenew && (
        <button
          onClick={() => {
            onRenew(license);
            onClose();
          }}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
        >
          <AlertTriangle className="w-4 h-4 mr-2 text-yellow-500" />
          Renovar licencia
        </button>
      )}

      {onHistory && (
        <button
          onClick={() => {
            onHistory(license);
            onClose();
          }}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
        >
          <Clock className="w-4 h-4 mr-2 text-purple-500" />
          Historial de cambios
        </button>
      )}

      {onDelete && (
        <>
          <div className="border-t border-gray-100 my-1"></div>
          <button
            onClick={() => {
              onDelete(license);
              onClose();
            }}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Eliminar licencia
          </button>
        </>
      )}
    </div>
  );
};

export default LicenseContextMenu;
