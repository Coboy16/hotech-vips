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
  Key,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-hot-toast";

// Esquema de validación con Zod (SIN CONTRASEÑA ACTUAL)
const passwordResetSchema = z // Renombrado para claridad
  .object({
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
    path: ["confirmPassword"], // Aplicar error al campo de confirmación
  });

// Tipo para los datos del formulario (SIN CONTRASEÑA ACTUAL)
type PasswordResetFormData = z.infer<typeof passwordResetSchema>;

interface PasswordChangeFormProps {
  userId: string | null; // Hacerlo nullable por si acaso
  onClose: () => void;
  // onSubmit ahora solo necesita userId y newPassword
  onSubmit: (userId: string, newPassword: string) => Promise<boolean>;
}

export function PasswordChangeForm({
  // Nombre del componente se mantiene por ahora
  userId,
  onClose,
  onSubmit,
}: PasswordChangeFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Configurar React Hook Form con el NUEVO esquema de validación Zod
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PasswordResetFormData>({
    // Usar el nuevo tipo
    resolver: zodResolver(passwordResetSchema), // Usar el nuevo schema
    defaultValues: {
      // No hay currentPassword
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Generar contraseña aleatoria (sin cambios)
  const handleGeneratePassword = () => {
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let password = "";
    password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
    password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
    password += "0123456789"[Math.floor(Math.random() * 10)];
    password += "!@#$%^&*()_+"[Math.floor(Math.random() * 12)];
    while (password.length < 12) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    password = password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");
    setValue("newPassword", password, { shouldValidate: true }); // Validar al generar
    setValue("confirmPassword", password, { shouldValidate: true }); // Validar al generar
  };

  // Procesar envío del formulario (SIN CONTRASEÑA ACTUAL)
  const processSubmit = async (data: PasswordResetFormData) => {
    // Validar que userId existe antes de proceder
    if (!userId) {
      toast.error("Error: No se ha especificado un usuario.");
      console.error("Error en PasswordChangeForm: userId es null.");
      return;
    }

    setIsSaving(true);
    try {
      // Llamar a onSubmit solo con userId y newPassword
      const success = await onSubmit(userId, data.newPassword);
      if (success) {
        toast.success("Contraseña restablecida exitosamente");
        onClose();
      } else {
        // El hook useUsers ya muestra un toast de error si falla la API
        // toast.error("No se pudo restablecer la contraseña."); // Opcional: mensaje genérico adicional
      }
    } catch (error) {
      console.error("Error al restablecer contraseña:", error);
      toast.error("Error al procesar la solicitud de restablecimiento.");
    } finally {
      setIsSaving(false);
    }
  };

  // Si no hay userId, no mostrar el formulario (o mostrar un mensaje)
  if (!userId) {
    // Podrías retornar null o un mensaje indicando que no se seleccionó usuario
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 shadow-xl text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-medium mb-4">Error</p>
          <p className="text-gray-600 mb-6">
            No se ha seleccionado ningún usuario para restablecer la contraseña.
          </p>
          <button onClick={onClose} className="button-secondary">
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-xl w-full flex flex-col my-auto">
        {/* Encabezado */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-600 p-6 text-white flex-shrink-0">
          {" "}
          {/* Cambiado color a ámbar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Key className="w-8 h-8" /> {/* Cambiado icono */}
              <h2 className="text-2xl font-bold">
                Restablecer Contraseña
              </h2>{" "}
              {/* Cambiado título */}
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="text-white hover:bg-amber-700 p-2 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="mt-2 text-amber-100 max-w-2xl">
            Establezca una nueva contraseña para el usuario seleccionado.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(processSubmit)}
          className="p-6 overflow-y-auto flex-1"
        >
          <div className="space-y-6">
            <div className="bg-amber-50 p-6 rounded-lg border border-amber-100">
              {" "}
              {/* Cambiado color */}
              <h3 className="text-lg font-medium text-amber-800 flex items-center mb-4">
                <Lock className="w-5 h-5 mr-2" />
                Nueva Contraseña
              </h3>
              {/* Campo Contraseña Actual ELIMINADO */}
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
                        placeholder="Ingrese la nueva contraseña"
                        disabled={isSaving}
                        autoComplete="new-password" // Sugerir no guardar
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        disabled={isSaving}
                        tabIndex={-1} // Evitar que sea focusable
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
                    title="Generar contraseña aleatoria segura"
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
                      placeholder="Confirme la nueva contraseña"
                      disabled={isSaving}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      disabled={isSaving}
                      tabIndex={-1}
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
              {/* Requisitos de contraseña (sin cambios) */}
              <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Requisitos de la contraseña:
                </p>
                <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                  <li>Mínimo 8 caracteres</li>
                  <li>Al menos una letra mayúscula</li>
                  <li>Al menos una letra minúscula</li>
                  <li>Al menos un número</li>
                  <li>Al menos un carácter especial (!@#$%^&*()_+)</li>
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
              className="button-primary bg-amber-600 hover:bg-amber-700 min-w-[180px]" /* Color botón primario */
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Restablecer Contraseña
                </>
              )}
            </button>
          </div>
        </form>

        {/* Estilos CSS (sin cambios estructurales, pero puedes ajustar colores si quieres) */}
        <style>{`
            .label-form { display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.25rem; }
            .input-container { position: relative; display: flex; align-items: center; }
            .input-icon { position: absolute; left: 0.75rem; pointer-events: none; width: 1.25rem; height: 1.25rem; color: #9ca3af; }
            .input-field { display: block; width: 100%; border-radius: 0.375rem; border: 1px solid #d1d5db; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); padding: 0.5rem 0.75rem; font-size: 0.875rem; line-height: 1.25rem; color: #1f2937; background-color: #ffffff; transition: border-color 0.2s, box-shadow 0.2s; }
            .input-field:focus { outline: none; border-color: #f59e0b; box-shadow: 0 0 0 2px #fcd34d; } /* Focus color ámbar */
            .input-field:disabled { background-color: #f3f4f6; cursor: not-allowed; color: #9ca3af; }
            .input-field.pl-10 { padding-left: 2.5rem; }
            .input-field.pr-10 { padding-right: 2.5rem; } /* Asegurar padding derecho para el icono del ojo */
            .input-error { border-color: #ef4444 !important; }
            .input-error:focus { box-shadow: 0 0 0 2px #fecaca; border-color: #ef4444 !important; }
            .error-message { color: #ef4444; font-size: 0.75rem; margin-top: 0.25rem; }
            .button-primary { display: inline-flex; align-items: center; justify-content: center; padding: 0.5rem 1rem; border: 1px solid transparent; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); font-size: 0.875rem; font-weight: 500; color: #ffffff; background-color: #d97706; transition: background-color 0.2s; } /* Color base ámbar */
            .button-primary:hover { background-color: #b45309; } /* Hover ámbar más oscuro */
            .button-primary:focus { outline: none; box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.5); } /* Focus ámbar */
            .button-primary:disabled { opacity: 0.7; cursor: not-allowed; background-color: #f59e0b; } /* Disabled ámbar */
            .button-secondary { display: inline-flex; align-items: center; justify-content: center; padding: 0.5rem 1rem; border: 1px solid #d1d5db; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); font-size: 0.875rem; font-weight: 500; color: #374151; background-color: #ffffff; transition: background-color 0.2s; }
            .button-secondary:hover { background-color: #f9fafb; }
            .button-secondary:focus { outline: none; box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.5); } /* Focus ámbar */
            .button-secondary:disabled { opacity: 0.5; cursor: not-allowed; }
         `}</style>
      </div>
    </div>
  );
}

// Exportar como default si es necesario, o mantener export nombrado
export default PasswordChangeForm;
