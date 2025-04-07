import React from "react";
import RoleForm from "./RoleForm";
import { Module, Role } from "../types";
import { X, FileText } from "lucide-react";

interface CreateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    moduleIds: string[];
  }) => Promise<Role | null>;
  availableModules: Module[];
  isLoading?: boolean;
  isLoadingModules?: boolean;
}

const CreateRoleModal: React.FC<CreateRoleModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  availableModules,
  isLoading,
  isLoadingModules,
}) => {
  if (!isOpen) return null;

  const handleSubmitForm = async (data: {
    name: string;
    moduleIds: string[];
  }) => {
    const result = await onSubmit(data);
    if (result) {
      // Cierra el modal solo si la creación fue exitosa
      onClose();
    }
    // Si hay error, el servicio/hook ya mostró el toast, el modal permanece abierto
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <div className="bg-blue-500 px-6 py-4 flex items-center justify-between text-white">
            <div className="flex items-center">
              <FileText className="h-6 w-6 mr-3" />
              <div>
                <h3 className="text-lg font-medium">Crear Rol</h3>
                <p className="text-sm text-blue-100 mt-0.5">
                  Crea el rol que mas se adapte a tus necesidades.
                </p>
              </div>
            </div>
            <button
              type="button"
              className="text-white hover:bg-blue-600 rounded-full p-1.5"
              onClick={onClose}
            >
              <span className="sr-only">Cerrar</span>
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Contenido principal con fondo celeste */}
          <div className="bg-blue-50 p-4">
            <RoleForm
              onSubmit={handleSubmitForm}
              onClose={onClose}
              availableModules={availableModules}
              isLoading={isLoading}
              isLoadingModules={isLoadingModules}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRoleModal;
