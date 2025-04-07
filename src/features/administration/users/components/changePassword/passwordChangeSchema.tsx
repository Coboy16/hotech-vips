import { useState } from "react";
import {
  X,
  Save,
  Lock,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-hot-toast";

// Esquema de validación con Zod
const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "La contraseña actual es requerida"),
    newPassword: z
      .string()
      .min(8, "La nueva contraseña debe tener al menos 8 caracteres")
      .refine(
        (password) => /[A-Z]/.test(password),
        "Debe incluir al menos una letra mayúscula"
      )
      .refine(
        (password) => /[a-z]/.test(password),
        "Debe incluir al menos una letra minúscula"
      )
      .refine(
        (password) => /[0-9]/.test(password),
        "Debe incluir al menos un número"
      )
      .refine(
        (password) => /[^A-Za-z0-9]/.test(password),
        "Debe incluir al menos un carácter especial"
      ),
    confirmPassword: z.string().min(1, "Confirmar la contraseña es requerido"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

// Tipo para los datos del formulario
type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;

interface PasswordChangeFormProps {
  userId: string;
  onClose: () => void;
  onSubmit: (
    userId: string,
    currentPassword: string,
    newPassword: string
  ) => Promise<boolean>;
}

export function PasswordChangeForm({
  userId,
  onClose,
  onSubmit,
}: PasswordChangeFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Configurar React Hook Form con validación Zod
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PasswordChangeFormData>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Generar contraseña aleatoria
  const handleGeneratePassword = () => {
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let password = "";

    // Asegurar al menos un carácter de cada tipo
    password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)]; // Mayúscula
    password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)]; // Minúscula
    password += "0123456789"[Math.floor(Math.random() * 10)]; // Número
    password += "!@#$%^&*()_+"[Math.floor(Math.random() * 12)]; // Carácter especial

    // Completar la longitud deseada (12 caracteres)
    while (password.length < 12) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }

    // Mezclar los caracteres
    password = password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");

    setValue("newPassword", password);
    setValue("confirmPassword", password);
  };

  // Procesar envío del formulario
  const processSubmit = async (data: PasswordChangeFormData) => {
    setIsSaving(true);
    try {
      const success = await onSubmit(
        userId,
        data.currentPassword,
        data.newPassword
      );
      if (success) {
        toast.success("Contraseña cambiada exitosamente");
        onClose();
      } else {
        toast.error(
          "No se pudo cambiar la contraseña. Verifique sus credenciales."
        );
      }
    } catch (error) {
      console.error("Error al cambiar contraseña:", error);
      toast.error("Error al cambiar la contraseña. Intente nuevamente.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-xl w-full flex flex-col my-auto">
        {/* Encabezado */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-600 p-6 text-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Lock className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Cambiar Contraseña</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="text-white hover:bg-blue-700 p-2 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="mt-2 text-blue-100 max-w-2xl">
            Actualice su contraseña para mantener su cuenta segura.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(processSubmit)}
          className="p-6 overflow-y-auto flex-1"
        >
          <div className="space-y-6">
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
              <h3 className="text-lg font-medium text-blue-800 flex items-center mb-4">
                <Lock className="w-5 h-5 mr-2" />
                Actualizar Contraseña
              </h3>

              {/* Nueva Contraseña */}
              <div className="mb-4">
                <label className="label-form" htmlFor="newPassword">
                  Nueva Contraseña <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-2">
                  <div className="input-container flex-1">
                    <Lock className="input-icon" />
                    <div className="relative flex-1">
                      <input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        {...register("newPassword")}
                        className={`input-field pl-10 pr-10 w-full ${
                          errors.newPassword ? "input-error" : ""
                        }`}
                        placeholder="Ingrese su nueva contraseña"
                        disabled={isSaving}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        disabled={isSaving}
                      >
                        {showNewPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="button-secondary px-3"
                    disabled={isSaving}
                    title="Generar contraseña aleatoria"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="error-message">{errors.newPassword.message}</p>
                )}
              </div>

              {/* Confirmar Contraseña */}
              <div className="mb-4">
                <label className="label-form" htmlFor="confirmPassword">
                  Confirmar Contraseña <span className="text-red-500">*</span>
                </label>
                <div className="input-container">
                  <Lock className="input-icon" />
                  <div className="relative flex-1">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      {...register("confirmPassword")}
                      className={`input-field pl-10 pr-10 w-full ${
                        errors.confirmPassword ? "input-error" : ""
                      }`}
                      placeholder="Confirme su nueva contraseña"
                      disabled={isSaving}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      disabled={isSaving}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
                {errors.confirmPassword && (
                  <p className="error-message">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Requisitos de contraseña */}
              <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Requisitos de la contraseña:
                </p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li className="flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1 text-blue-500" />
                    Mínimo 8 caracteres
                  </li>
                  <li className="flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1 text-blue-500" />
                    Al menos una letra mayúscula
                  </li>
                  <li className="flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1 text-blue-500" />
                    Al menos una letra minúscula
                  </li>
                  <li className="flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1 text-blue-500" />
                    Al menos un número
                  </li>
                  <li className="flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1 text-blue-500" />
                    Al menos un carácter especial
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="button-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="button-primary min-w-[140px]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Cambiar Contraseña
                </>
              )}
            </button>
          </div>
        </form>

        {/* Estilos CSS (mismo estilo del formulario de usuario) */}
        <style>{`
            .label-form { display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.25rem; }
            .input-container { position: relative; display: flex; align-items: center; }
            .input-icon { position: absolute; left: 0.75rem; pointer-events: none; width: 1.25rem; height: 1.25rem; color: #9ca3af; }
            .input-field { display: block; width: 100%; border-radius: 0.375rem; border: 1px solid #d1d5db; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); padding: 0.5rem 0.75rem; font-size: 0.875rem; line-height: 1.25rem; color: #1f2937; background-color: #ffffff; transition: border-color 0.2s, box-shadow 0.2s; }
            .input-field:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 2px #bfdbfe; }
            .input-field:disabled { background-color: #f3f4f6; cursor: not-allowed; color: #9ca3af; }
            .input-field.pl-10 { padding-left: 2.5rem; }
            .input-error { border-color: #ef4444 !important; }
            .input-error:focus { box-shadow: 0 0 0 2px #fecaca; border-color: #ef4444 !important; }
            .error-message { color: #ef4444; font-size: 0.75rem; margin-top: 0.25rem; }
            .button-primary { display: inline-flex; align-items: center; justify-content: center; padding: 0.5rem 1rem; border: 1px solid transparent; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); font-size: 0.875rem; font-weight: 500; color: #ffffff; background-color: #2563eb; transition: background-color 0.2s; }
            .button-primary:hover { background-color: #1d4ed8; }
            .button-primary:focus { outline: none; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5); }
            .button-primary:disabled { opacity: 0.7; cursor: not-allowed; background-color: #60a5fa; }
            .button-secondary { display: inline-flex; align-items: center; justify-content: center; padding: 0.5rem 1rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); font-size: 0.875rem; font-weight: 500; color: #374151; background-color: #ffffff; transition: background-color 0.2s; }
            .button-secondary:hover { background-color: #f9fafb; }
            .button-secondary:focus { outline: none; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5); }
            .button-secondary:disabled { opacity: 0.5; cursor: not-allowed; }
         `}</style>
      </div>
    </div>
  );
}

export default PasswordChangeForm;
