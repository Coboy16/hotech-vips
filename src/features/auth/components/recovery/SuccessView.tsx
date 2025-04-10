import { CheckCircle } from "lucide-react";

interface SuccessViewProps {
  onClose: () => void;
}

export function SuccessView({ onClose }: SuccessViewProps) {
  return (
    <div className="text-center py-6">
      <div className="mb-6 text-green-500 flex justify-center">
        <CheckCircle className="w-16 h-16" />
      </div>

      <h3 className="text-xl font-medium text-gray-900 mb-4">
        ¡Contraseña actualizada!
      </h3>

      <p className="text-sm text-gray-600 mb-6">
        Su contraseña ha sido actualizada exitosamente. Ahora puede iniciar
        sesión con su nueva contraseña.
      </p>

      <button
        onClick={onClose}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#1a56db] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      >
        Volver al inicio de sesión
      </button>
    </div>
  );
}
