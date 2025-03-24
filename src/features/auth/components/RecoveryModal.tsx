import React, { useState } from 'react';
import { Mail, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface RecoveryModalProps {
  onClose: () => void;
}

export function RecoveryModal({ onClose }: RecoveryModalProps) {
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoverySuccess, setRecoverySuccess] = useState(false);

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRecovering(true);
    
    try {
      // TODO: Implementar llamada real a API
      await new Promise(resolve => setTimeout(resolve, 1500));
      setRecoverySuccess(true);
      toast.success('Instrucciones enviadas a su correo electrónico');
    } catch (error) {
      console.error('Recovery error:', error);
      toast.error('Error al enviar instrucciones de recuperación');
    } finally {
      setIsRecovering(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Recuperar contraseña
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {!recoverySuccess ? (
          <form onSubmit={handleRecoverySubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                  placeholder="Ingrese su correo electrónico"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isRecovering}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#1a56db] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRecovering ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Enviar instrucciones'
              )}
            </button>
          </form>
        ) : (
          <div className="text-center py-4">
            <div className="mb-4 text-green-500">
              <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Instrucciones enviadas
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Hemos enviado las instrucciones de recuperación a su correo electrónico.
            </p>
            <button
              onClick={onClose}
              className="text-sm text-blue-600 hover:text-blue-700 focus:outline-none focus:underline"
            >
              Volver al inicio de sesión
            </button>
          </div>
        )}
      </div>
    </div>
  );
}