import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, ArrowLeft } from "lucide-react";
import {
  validateOtpSchema,
  ValidateOtpFormData,
} from "../../schemas/recoverySchema";

interface OtpFormProps {
  email: string;
  onSubmit: (otp: string) => Promise<boolean>;
  onRequestNewCode: () => Promise<boolean>;
  onBack: () => void;
  isLoading: boolean;
}

export function OtpForm({
  email,
  onSubmit,
  onRequestNewCode,
  onBack,
  isLoading,
}: OtpFormProps) {
  const [countdown, setCountdown] = useState(120); // 2 minutos
  const [canResend, setCanResend] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ValidateOtpFormData>({
    resolver: zodResolver(validateOtpSchema),
    defaultValues: { otp_code: "" },
  });

  // Efecto para manejar el countdown
  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  // Formatea el countdown en minutos:segundos
  const formatCountdown = () => {
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // Manejador para solicitar un nuevo código
  const handleResendCode = async () => {
    if (!canResend || isLoading) return;

    const success = await onRequestNewCode();
    if (success) {
      setCountdown(120); // Reiniciar el countdown
      setCanResend(false);
    }
  };

  const handleFormSubmit: SubmitHandler<ValidateOtpFormData> = async (data) => {
    await onSubmit(data.otp_code);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div>
        <label
          htmlFor="otp-code"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Código de verificación
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <KeyRound className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="otp-code"
            type="text"
            maxLength={6}
            {...register("otp_code")}
            className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-offset-1 ${
              errors.otp_code
                ? "border-red-500 ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            } text-gray-900 placeholder-gray-500`}
            placeholder="Ingrese el código de 6 dígitos"
            aria-invalid={errors.otp_code ? "true" : "false"}
            aria-describedby={errors.otp_code ? "otp-error" : undefined}
            disabled={isLoading}
          />
        </div>
        {errors.otp_code && (
          <p id="otp-error" className="mt-1 text-xs text-red-600" role="alert">
            {errors.otp_code.message}
          </p>
        )}
      </div>

      <div className="text-sm text-gray-600 space-y-2">
        <p>
          Hemos enviado un código de verificación a <strong>{email}</strong>.
        </p>
        <p>
          {canResend ? (
            <button
              type="button"
              onClick={handleResendCode}
              disabled={isLoading}
              className="text-blue-600 hover:text-blue-700 focus:outline-none focus:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Enviar nuevo código
            </button>
          ) : (
            <>
              Puede solicitar un nuevo código en:{" "}
              <span className="font-medium">{formatCountdown()}</span>
            </>
          )}
        </p>
      </div>

      <div className="flex flex-col space-y-3">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#1a56db] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            "Verificar código"
          )}
        </button>

        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className="flex items-center justify-center text-sm text-gray-600 hover:text-gray-800 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver
        </button>
      </div>
    </form>
  );
}
