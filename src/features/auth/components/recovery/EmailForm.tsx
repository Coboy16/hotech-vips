import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import {
  requestOtpSchema,
  RequestOtpFormData,
} from "../../schemas/recoverySchema";

interface EmailFormProps {
  onSubmit: (email: string) => Promise<boolean>;
  isLoading: boolean;
}

export function EmailForm({ onSubmit, isLoading }: EmailFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RequestOtpFormData>({
    resolver: zodResolver(requestOtpSchema),
    defaultValues: { email: "" },
  });

  const handleFormSubmit: SubmitHandler<RequestOtpFormData> = async (data) => {
    await onSubmit(data.email);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div>
        <label
          htmlFor="recovery-email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Correo electrónico
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="recovery-email"
            type="email"
            autoComplete="email"
            {...register("email")}
            className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-offset-1 ${
              errors.email
                ? "border-red-500 ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            } text-gray-900 placeholder-gray-500`}
            placeholder="Ingrese su correo electrónico"
            aria-invalid={errors.email ? "true" : "false"}
            aria-describedby={errors.email ? "email-error" : undefined}
            disabled={isLoading}
          />
        </div>
        {errors.email && (
          <p
            id="email-error"
            className="mt-1 text-xs text-red-600"
            role="alert"
          >
            {errors.email.message}
          </p>
        )}
      </div>

      <p className="text-sm text-gray-600">
        Ingrese su correo electrónico y le enviaremos un código de verificación
        para restablecer su contraseña.
      </p>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#1a56db] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          "Enviar código"
        )}
      </button>
    </form>
  );
}
