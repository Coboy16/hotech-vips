import React, { useState, useEffect } from "react";
import RoleForm from "./RoleForm";
import { Module, Role } from "../types";
import { Loader2, FileText, X } from "lucide-react";

interface EditRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    roleId: string,
    data: { name: string; moduleIds: string[] }
  ) => Promise<Role | null>;
  roleIdToEdit: string | null; // ID del rol a editar
  getRoleData: (roleId: string) => Promise<Role | null>; // Función para obtener datos del rol
  availableModules: Module[];
  isLoading?: boolean; // Loading de la operación de submit
  isLoadingModules?: boolean; // Loading de los módulos
}

const EditRoleModal: React.FC<EditRoleModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  roleIdToEdit,
  getRoleData,
  availableModules,
  isLoading,
  isLoadingModules,
}) => {
  const [roleData, setRoleData] = useState<Role | null>(null);
  const [isFetchingData, setIsFetchingData] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && roleIdToEdit) {
      setIsFetchingData(true);
      setFetchError(null);
      setRoleData(null); // Limpiar datos anteriores
      getRoleData(roleIdToEdit)
        .then((data) => {
          if (data) {
            setRoleData(data);
          } else {
            setFetchError(
              "No se pudieron cargar los datos del rol para editar."
            );
            // Podrías cerrar el modal automáticamente o mostrar el error
            // onClose(); // Opcional: cerrar si falla la carga
          }
        })
        .catch(() => {
          setFetchError("Error al cargar los datos del rol.");
        })
        .finally(() => {
          setIsFetchingData(false);
        });
    } else {
      // Resetear cuando se cierra o no hay ID
      setRoleData(null);
      setFetchError(null);
      setIsFetchingData(false);
    }
  }, [isOpen, roleIdToEdit, getRoleData]); // Quitar onClose si no debe re-fetchear al cerrar/abrir

  const handleSubmitForm = async (data: {
    name: string;
    moduleIds: string[];
  }) => {
    if (!roleIdToEdit) return; // Seguridad
    const result = await onSubmit(roleIdToEdit, data);
    if (result) {
      onClose(); // Cerrar si la edición fue exitosa
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          {/* App bar con color azul (blue-500) */}
          <div className="bg-blue-500 px-6 py-4 flex items-center justify-between text-white">
            <div className="flex items-center">
              <FileText className="h-6 w-6 mr-3" />
              <div>
                <h3 className="text-lg font-medium">Editar Rol</h3>
                <p className="text-sm text-blue-100 mt-0.5">
                  Modifica el rol según tus necesidades.
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
            {isFetchingData ? (
              <div className="flex justify-center items-center p-10">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-3 text-gray-600">
                  Cargando datos del rol...
                </span>
              </div>
            ) : fetchError ? (
              <div className="p-4 text-center text-red-600 bg-red-50 rounded border border-red-200">
                {fetchError}
              </div>
            ) : roleData ? (
              <RoleForm
                onSubmit={handleSubmitForm}
                onClose={onClose}
                initialData={roleData}
                availableModules={availableModules}
                isLoading={isLoading}
                isLoadingModules={isLoadingModules}
              />
            ) : (
              // Estado intermedio o si roleData es null después de intentar cargar
              <div className="p-4 text-center text-gray-500">
                No se han podido cargar los datos para la edición.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditRoleModal;
