import { AlertTriangle, X } from "lucide-react";
import { License } from "../../../../../model";

interface DeleteLicenseModalProps {
  license: License;
  onDelete: () => void;
  onCancel: () => void;
}

export function DeleteLicenseModal({
  license,
  onDelete,
  onCancel,
}: DeleteLicenseModalProps) {
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Eliminar licencia
              </h2>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Empresa:</span>{" "}
              {license.companyName}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">ID:</span> {license.id}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">RNC:</span> {license.rnc}
            </p>
          </div>

          <p className="text-sm text-gray-500 mb-6">
            ¿Está seguro que desea eliminar esta licencia? Esta acción no se
            puede deshacer y eliminará todos los datos asociados a esta
            licencia.
          </p>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              onClick={onDelete}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeleteLicenseModal;
