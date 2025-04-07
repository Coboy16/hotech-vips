import { useState, useEffect } from "react";
import { AlertTriangle, X, Trash2, Loader2 } from "lucide-react";
import { User } from "../types/user"; // Asegúrate que la ruta es correcta

interface DeleteUserModalProps {
  user: User | null; // Usuario a eliminar
  onConfirmDelete: (email: string) => Promise<void>; // Función que ejecuta la eliminación
  onCancel: () => void; // Función para cerrar el modal
  isDeleting: boolean; // Estado para mostrar loading en el botón
}

const CONFIRMATION_TEXT = "eliminar"; // Palabra clave para confirmar

export function DeleteUserModal({
  user,
  onConfirmDelete,
  onCancel,
  isDeleting,
}: DeleteUserModalProps) {
  const [confirmInput, setConfirmInput] = useState("");
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);

  // Habilitar el botón solo si el texto coincide
  useEffect(() => {
    setIsButtonEnabled(confirmInput.toLowerCase() === CONFIRMATION_TEXT);
  }, [confirmInput]);

  // Resetear input al abrir/cambiar usuario
  useEffect(() => {
    setConfirmInput("");
  }, [user]);

  const handleDeleteClick = async () => {
    if (user && user.email && isButtonEnabled && !isDeleting) {
      await onConfirmDelete(user.email);
      // El cierre del modal lo manejará UsersScreen después de la promesa
    }
  };

  // Si no hay usuario, no mostrar nada o un error (mejor prevenir en UsersScreen)
  if (!user) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-out">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full transform transition-all duration-300 ease-out scale-95 opacity-0 animate-fade-in-scale">
        {/* Animate-fade-in-scale defined in global css or below */}
        <style>{`
          @keyframes fadeInScale {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fade-in-scale { animation: fadeInScale 0.3s ease-out forwards; }
        `}</style>

        <div className="p-6">
          {/* Encabezado */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-7 h-7 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Eliminar Usuario
                </h2>
                <p
                  className="text-sm text-gray-500 truncate"
                  title={user.email}
                >
                  {user.firstName} {user.lastName} ({user.email})
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              disabled={isDeleting}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
              aria-label="Cerrar modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Mensaje de advertencia */}
          <p className="text-sm text-gray-600 mb-4">
            Esta acción es <strong className="text-red-700">permanente</strong>{" "}
            y no se puede deshacer. Se eliminarán todos los datos asociados a
            este usuario.
          </p>

          {/* Input de confirmación */}
          <div className="mb-6">
            <label
              htmlFor="confirmDeleteInput"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Para confirmar, escriba "
              <span className="font-bold">{CONFIRMATION_TEXT}</span>" en el
              campo de abajo:
            </label>
            <input
              type="text"
              id="confirmDeleteInput"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              disabled={isDeleting}
              className={`input-field w-full ${
                !isButtonEnabled && confirmInput.length > 0
                  ? "border-yellow-500 focus:ring-yellow-400 focus:border-yellow-500"
                  : "focus:ring-red-500 focus:border-red-500"
              } disabled:bg-gray-100`}
              placeholder={`Escriba ${CONFIRMATION_TEXT}`}
              autoComplete="off"
            />
            {!isButtonEnabled && confirmInput.length > 0 && (
              <p className="text-xs text-yellow-700 mt-1">
                El texto no coincide.
              </p>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              disabled={isDeleting}
              className="button-secondary disabled:opacity-50"
              type="button"
            >
              Cancelar
            </button>
            <button
              onClick={handleDeleteClick}
              disabled={!isButtonEnabled || isDeleting}
              className="button-danger min-w-[120px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              type="button"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </>
              )}
            </button>
          </div>
        </div>
        {/* Estilos reusados y nuevos */}
        <style>{`
            .input-field { display: block; width: 100%; border-radius: 0.375rem; border: 1px solid #d1d5db; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); padding: 0.5rem 0.75rem; font-size: 0.875rem; line-height: 1.25rem; color: #1f2937; background-color: #ffffff; transition: border-color 0.2s, box-shadow 0.2s; }
            .input-field:focus { outline: none; box-shadow: 0 0 0 2px; }
            .input-field:disabled { background-color: #f3f4f6; cursor: not-allowed; color: #9ca3af; }
            .button-secondary { display: inline-flex; align-items: center; justify-content: center; padding: 0.5rem 1rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); font-size: 0.875rem; font-weight: 500; color: #374151; background-color: #ffffff; transition: background-color 0.2s; }
            .button-secondary:hover { background-color: #f9fafb; }
            .button-secondary:focus { outline: none; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5); }
            .button-secondary:disabled { opacity: 0.5; cursor: not-allowed; }
            .button-danger { display: inline-flex; align-items: center; justify-content: center; padding: 0.5rem 1rem; border: 1px solid transparent; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); font-size: 0.875rem; font-weight: 500; color: #ffffff; background-color: #dc2626; transition: background-color 0.2s; }
            .button-danger:hover { background-color: #b91c1c; }
            .button-danger:focus { outline: none; box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.5); }
            .button-danger:disabled { background-color: #f87171; opacity: 0.7; cursor: not-allowed; }
         `}</style>
      </div>
    </div>
  );
}
