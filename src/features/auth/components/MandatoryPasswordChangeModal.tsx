import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Lock, Eye, EyeOff, Save, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";

import { userService } from "../services/userService"; // Ajusta la ruta
import ModalWelcome from "../../../components/common/modal/ModalWelcome";
// Ya no importamos User aquí

// --- Esquema de Validación con Zod (sin cambios) ---
const passwordChangeSchema = z
  .object({
    password: z
      .string()
      .min(5, { message: "La contraseña debe tener al menos 5 caracteres." })
      .max(100, {
        message: "La contraseña no puede exceder los 100 caracteres.",
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;

// --- Props del Componente ---
interface MandatoryPasswordChangeModalProps {
  isOpen: boolean;
  onPasswordChangeSuccess: () => void; // <<<--- Cambiado: Callback sin parámetros
}

export const MandatoryPasswordChangeModal: React.FC<
  MandatoryPasswordChangeModalProps
> = ({
  isOpen,
  onPasswordChangeSuccess, // <<<--- Prop renombrada
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setError,
  } = useForm<PasswordChangeFormData>({
    resolver: zodResolver(passwordChangeSchema),
    mode: "onChange",
  });

  const onSubmit: SubmitHandler<PasswordChangeFormData> = async (data) => {
    setIsSubmitting(true);
    setError("root.apiError", {});

    try {
      const success = await userService.updatePassword(data.password); // <<<--- Llama al servicio (devuelve boolean)

      if (success) {
        // Éxito: Llama al callback para indicar que se completó
        onPasswordChangeSuccess(); // <<<--- Llama al callback de éxito
        reset();
      } else {
        // userService ya mostró el toast de error
        setError("root.apiError", {
          type: "manual",
          message: "No se pudo actualizar la contraseña. Inténtalo de nuevo.",
        });
      }
    } catch (error) {
      console.error("Error inesperado al cambiar contraseña:", error);
      toast.error("Ocurrió un error inesperado.");
      setError("root.apiError", {
        type: "manual",
        message: "Error inesperado del servidor.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resetear formulario si el modal se cierra o abre (sin cambios)
  React.useEffect(() => {
    if (!isOpen) {
      reset();
      setIsSubmitting(false);
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [isOpen, reset]);

  // --- JSX (sin cambios funcionales, solo usa el nuevo nombre de prop si es necesario internamente) ---
  return (
    <ModalWelcome
      isOpen={isOpen}
      onClose={() => {}}
      preventClose={true}
      maxWidth="max-w-lg"
      title="Cambiar Contraseña"
      icon={<Lock className="h-6 w-6 text-blue-500" />}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-1">
        <p className="text-sm text-gray-600">
          Por seguridad, por favor establece una nueva contraseña para tu
          cuenta.
        </p>

        {errors.root?.apiError && (
          <div
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm flex items-center space-x-2"
            role="alert"
          >
            <AlertCircle className="w-5 h-5" />
            <span>{errors.root.apiError.message}</span>
          </div>
        )}

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Nueva Contraseña <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </span>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              {...register("password")}
              className={`input-field pl-10 pr-10 ${
                errors.password ? "border-red-500" : ""
              }`}
              placeholder="Ingresa tu nueva contraseña"
              aria-invalid={errors.password ? "true" : "false"}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
              aria-label={
                showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="error-message">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Confirmar Contraseña <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </span>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              {...register("confirmPassword")}
              className={`input-field pl-10 pr-10 ${
                errors.confirmPassword ? "border-red-500" : ""
              }`}
              placeholder="Vuelve a ingresar la contraseña"
              aria-invalid={errors.confirmPassword ? "true" : "false"}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
              aria-label={
                showConfirmPassword
                  ? "Ocultar contraseña"
                  : "Mostrar contraseña"
              }
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="error-message">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting || !isValid}
            className="w-full flex justify-center items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Guardar Contraseña
              </>
            )}
          </button>
        </div>
      </form>
      <style>{`
          .input-field {
            display: block;
            width: 100%;
            padding-top: 0.5rem;
            padding-bottom: 0.5rem;
            padding-left: 2.5rem;
            padding-right: 2.5rem;
            border-width: 1px;
            border-color: #D1D5DB;
            border-radius: 0.375rem;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            transition: border-color 0.2s, box-shadow 0.2s;
          }
          .input-field:focus {
            outline: none;
            border-color: #3B82F6;
            box-shadow: 0 0 0 2px #BFDBFE;
          }
          .input-field.border-red-500 {
            border-color: #EF4444;
          }
          .input-field.border-red-500:focus {
            box-shadow: 0 0 0 2px #FECACA;
          }
          .error-message {
            color: #EF4444;
            font-size: 0.75rem;
            margin-top: 0.25rem;
          }
        `}</style>
    </ModalWelcome>
  );
};
