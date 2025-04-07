import React from "react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import Modal from "../../../../components/common/modal/Modal";

interface DeleteRoleConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  roleName: string | null;
  isLoading?: boolean;
}

const DeleteRoleConfirmationModal: React.FC<
  DeleteRoleConfirmationModalProps
> = ({ isOpen, onClose, onConfirm, roleName, isLoading }) => {
  const handleConfirm = async () => {
    await onConfirm();
    // El onClose lo maneja el componente padre dependiendo del resultado de onConfirm
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirmar Eliminación"
      maxWidth="max-w-md"
    >
      <div className="p-4 sm:p-6">
        <div className="sm:flex sm:items-start">
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
            <AlertTriangle
              className="h-6 w-6 text-red-600"
              aria-hidden="true"
            />
          </div>
          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Eliminar Rol
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                ¿Estás seguro de que quieres eliminar el rol
                <strong className="px-1">{`"${
                  roleName || "seleccionado"
                }"`}</strong>
                ? Esta acción no se puede deshacer.
              </p>
              {/* Aquí podrías añadir advertencias si el rol está en uso */}
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
        <button
          type="button"
          disabled={isLoading}
          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleConfirm}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="mr-2 h-4 w-4" /> // Opcional: Icono
          )}
          Eliminar
        </button>
        <button
          type="button"
          disabled={isLoading}
          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-50"
          onClick={onClose}
        >
          Cancelar
        </button>
      </div>
    </Modal>
  );
};

export default DeleteRoleConfirmationModal;
