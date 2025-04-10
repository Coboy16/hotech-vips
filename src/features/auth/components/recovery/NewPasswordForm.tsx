import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Eye, EyeOff } from "lucide-react";
import {
  resetPasswordSchema,
  ResetPasswordFormData,
} from "../../schemas/recoverySchema";

interface NewPasswordFormProps {
  onSubmit: (newPassword: string) => Promise<boolean>;
  isLoading: boolean;
}

export function NewPasswordForm({ onSubmit, isLoading }: NewPasswordFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirm_password: "",
    },
  });

  const handleFormSubmit: SubmitHandler<ResetPasswordFormData> = async (
    data
  ) => {
    await onSubmit(data.password);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Campo Nueva Contraseña */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Nueva contraseña
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            {...register("password")}
            className={`block w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-offset-1 ${
              errors.password
                ? "border-red-500 ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            } text-gray-900 placeholder-gray-500`}
            placeholder="Ingrese su nueva contraseña"
            aria-invalid={errors.password ? "true" : "false"}
            aria-describedby={errors.password ? "password-error" : undefined}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
            aria-label={
              showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
            }
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Eye className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
        {errors.password && (
          <p
            id="password-error"
            className="mt-1 text-xs text-red-600"
            role="alert"
          >
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Campo Confirmar Contraseña */}
      <div>
        <label
          htmlFor="confirm-password"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Confirmar contraseña
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            {...register("confirm_password")}
            className={`block w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-offset-1 ${
              errors.confirm_password
                ? "border-red-500 ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            } text-gray-900 placeholder-gray-500`}
            placeholder="Confirme su nueva contraseña"
            aria-invalid={errors.confirm_password ? "true" : "false"}
            aria-describedby={
              errors.confirm_password ? "confirm-password-error" : undefined
            }
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
            aria-label={
              showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"
            }
            disabled={isLoading}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Eye className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
        {errors.confirm_password && (
          <p
            id="confirm-password-error"
            className="mt-1 text-xs text-red-600"
            role="alert"
          >
            {errors.confirm_password.message}
          </p>
        )}
      </div>

      <div className="text-sm text-gray-600">
        <p>Cree una contraseña segura que no utilice en otros sitios.</p>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#1a56db] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          "Actualizar contraseña"
        )}
      </button>
    </form>
  );
}
