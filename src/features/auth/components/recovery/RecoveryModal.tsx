import { X } from "lucide-react";
import { useRecovery } from "../../hooks/useRecovery";
import { RecoveryStep } from "../../types/recovery";
import { EmailForm } from "./../recovery/EmailForm";
import { OtpForm } from "./../recovery/OtpForm";
import { NewPasswordForm } from "./../recovery/NewPasswordForm";
import { SuccessView } from "./../recovery/SuccessView";

interface RecoveryModalProps {
  onClose: () => void;
}

export function RecoveryModal({ onClose }: RecoveryModalProps) {
  const {
    state,
    requestOtp,
    validateOtp,
    resetPassword,
    resetRecoveryProcess,
  } = useRecovery();

  // Función para obtener el título del modal según el paso actual
  const getModalTitle = () => {
    switch (state.step) {
      case RecoveryStep.EMAIL_ENTRY:
        return "Recuperar contraseña";
      case RecoveryStep.OTP_ENTRY:
        return "Verificar código";
      case RecoveryStep.NEW_PASSWORD:
        return "Nueva contraseña";
      case RecoveryStep.SUCCESS:
        return "Proceso completado";
      default:
        return "Recuperar contraseña";
    }
  };

  // Función para mostrar el contenido apropiado según el paso actual
  const renderContent = () => {
    switch (state.step) {
      case RecoveryStep.EMAIL_ENTRY:
        return <EmailForm onSubmit={requestOtp} isLoading={state.isLoading} />;
      case RecoveryStep.OTP_ENTRY:
        return (
          <OtpForm
            email={state.email}
            onSubmit={validateOtp}
            onRequestNewCode={() => requestOtp(state.email)}
            onBack={() => resetRecoveryProcess()}
            isLoading={state.isLoading}
          />
        );
      case RecoveryStep.NEW_PASSWORD:
        return (
          <NewPasswordForm
            onSubmit={resetPassword}
            isLoading={state.isLoading}
          />
        );
      case RecoveryStep.SUCCESS:
        return <SuccessView onClose={onClose} />;
      default:
        return <EmailForm onSubmit={requestOtp} isLoading={state.isLoading} />;
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {getModalTitle()}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
            aria-label="Cerrar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Contenido dinámico según el paso actual */}
        {renderContent()}
      </div>
    </div>
  );
}
