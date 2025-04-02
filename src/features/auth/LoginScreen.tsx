import { useState } from "react";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { RecoveryModal } from "./components/RecoveryModal";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { LoginCredentials } from "./types";

// --- Esquema de Validación con Zod ---
const loginSchema = z.object({
  email: z
    .string({
      required_error: "El correo electrónico es requerido.",
      invalid_type_error: "El correo debe ser texto.",
    })
    .min(1, { message: "El correo electrónico es requerido." }) // No debe estar vacío
    .email({ message: "Por favor, introduce un correo electrónico válido." })
    .max(100, { message: "El correo no puede exceder los 100 caracteres." }) // Límite de longitud
    .trim(), // Elimina espacios al inicio y final
  password: z
    .string({
      required_error: "La contraseña es requerida.",
      invalid_type_error: "La contraseña debe ser texto.",
    })
    .min(1, { message: "La contraseña es requerida." }) // No debe estar vacía
    // Añade aquí reglas más específicas si las tienes (longitud, caracteres especiales, etc.)
    // Ejemplo: .min(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
    .max(100, {
      message: "La contraseña no puede exceder los 100 caracteres.",
    }), // Límite de longitud
  // Zod no valida contra listas de contraseñas comunes, eso sería lógica adicional
  rememberMe: z.boolean().optional(), // Checkbox es opcional
});

// --- Tipo Inferido del Formulario ---
// RHF usará este tipo para el autocompletado y la validación
type LoginFormInputs = z.infer<typeof loginSchema>;

// --- Componente LoginScreen ---
export function LoginScreen() {
  const navigate = useNavigate();
  // Obtiene la función de login y el estado de carga del contexto de autenticación
  const { login, isLoading: isAuthLoading } = useAuth();
  // Estado local para el modal de recuperación y visibilidad de contraseña
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // --- Configuración de React Hook Form ---
  const {
    register, // Función para registrar inputs
    handleSubmit, // Función para envolver el manejador de envío
    formState: { errors, isSubmitting }, // Estado del formulario: errores de validación y si se está enviando
    setError, // Función para establecer errores manualmente (ej. desde la API)
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema), // Usa Zod para validar
    defaultValues: {
      // Valores iniciales del formulario
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  // --- Manejador de Envío del Formulario ---
  // Se ejecuta SOLO si la validación de Zod es exitosa
  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    console.log("[LoginScreen] Datos del formulario validados:", {
      email: data.email,
      rememberMe: data.rememberMe,
    }); // No loguear contraseña

    const credentials: LoginCredentials = {
      email: data.email,
      password: data.password,
      rememberMe: data.rememberMe,
    };

    try {
      // Llama a la función de login del contexto/servicio
      const result = await login(credentials);

      if (result.success) {
        toast.success("Inicio de sesión exitoso");
        navigate("/dashboard", { replace: true }); // Redirige al dashboard
      } else {
        // Si el login falla (credenciales incorrectas, etc.)
        const errorMessage =
          result.error || "Error de autenticación desconocido.";
        toast.error(errorMessage);
        // Opcional: Establecer errores en campos específicos si la API lo indica
        if (
          errorMessage.toLowerCase().includes("correo") ||
          errorMessage.toLowerCase().includes("usuario")
        ) {
          setError("email", { type: "manual", message: errorMessage });
        } else if (errorMessage.toLowerCase().includes("contraseña")) {
          setError("password", { type: "manual", message: errorMessage });
        } else {
          // Error general no asociado a un campo específico
          setError("root.serverError", {
            type: "manual",
            message: errorMessage,
          });
        }
      }
    } catch (error) {
      // Captura errores inesperados en la llamada a login
      console.error(
        "[LoginScreen] Error inesperado durante el proceso de login:",
        error
      );
      toast.error("Ocurrió un error inesperado. Inténtalo de nuevo.");
      setError("root.unexpectedError", {
        type: "manual",
        message: "Error inesperado en el servidor.",
      });
    }
  };

  // Combina el estado de carga de la API con el estado de envío del formulario
  const isProcessing = isAuthLoading || isSubmitting;

  return (
    // --- Estructura JSX Principal (sin cambios) ---
    <div className="relative w-screen h-screen flex items-center justify-center bg-gradient-to-b from-blue-500 to-blue-700 overflow-hidden">
      {/* Fondo animado (sin cambios) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* SVG de ondas */}
        <svg
          className="absolute w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          viewBox="0 0 1440 800"
        >
          {/* Defs y Paths de las ondas (como estaban) */}
          <defs>
            <style>{`.wave{position:absolute;left:0;width:200%;height:100%;transform-origin:0% 50%;}.wave-1{fill:#3B82F6;opacity:0.3;animation:wave 25s linear infinite;}.wave-2{fill:#2563EB;opacity:0.4;animation:wave 20s linear infinite;}.wave-3{fill:#1D4ED8;opacity:0.3;animation:wave 15s linear infinite;}.wave-4{fill:#1E40AF;opacity:0.2;animation:wave 30s linear infinite;}.wave-5{fill:#1E3A8A;opacity:0.1;animation:wave 35s linear infinite;}@keyframes wave{0%{transform:translateX(0);}100%{transform:translateX(-50%);}}`}</style>
          </defs>
          <path
            className="wave wave-1"
            d="M0 300 Q 360 200, 720 300 Q 1080 400, 1440 300 Q 1800 200, 2160 300 Q 2520 400, 2880 300 L 2880 800 L 0 800 Z"
          />
          <path
            className="wave wave-2"
            d="M0 400 Q 360 300, 720 400 Q 1080 500, 1440 400 Q 1800 300, 2160 400 Q 2520 500, 2880 400 L 2880 800 L 0 800 Z"
          />
          <path
            className="wave wave-3"
            d="M0 500 Q 360 400, 720 500 Q 1080 600, 1440 500 Q 1800 400, 2160 500 Q 2520 600, 2880 500 L 2880 800 L 0 800 Z"
          />
          <path
            className="wave wave-4"
            d="M0 600 Q 360 500, 720 600 Q 1080 700, 1440 600 Q 1800 500, 2160 600 Q 2520 700, 2880 600 L 2880 800 L 0 800 Z"
          />
          <path
            className="wave wave-5"
            d="M0 700 Q 360 600, 720 700 Q 1080 800, 1440 700 Q 1800 600, 2160 700 Q 2520 800, 2880 700 L 2880 800 L 0 800 Z"
          />
        </svg>
      </div>

      {/* Contenedor del Formulario */}
      <div className="relative z-10 bg-white shadow-xl rounded-lg p-8 w-full max-w-md mx-4 my-8">
        <div className="flex flex-col items-center">
          {/* Logo y Título (sin cambios) */}
          <div className="mb-8 text-center logo-container">
            <img
              src="https://ho-tech.com/wp-content/uploads/2020/06/HoTech-Logo_Mesa-de-trabajo-1-copy.png"
              alt="VIPS Presencia Logo"
              className="w-32 mx-auto mb-4 filter drop-shadow-lg"
            />
            <h1 className="text-2xl font-semibold text-gray-900">
              VIPS Presencia
            </h1>
          </div>

          {/* --- Formulario Gestionado por RHF --- */}
          {/* handleSubmit previene el envío si hay errores de validación */}
          <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-5">
            {/* Mostrar errores generales del servidor (no asociados a un campo) */}
            {errors.root?.serverError && (
              <div
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm"
                role="alert"
              >
                {errors.root.serverError.message}
              </div>
            )}
            {errors.root?.unexpectedError && (
              <div
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm"
                role="alert"
              >
                {errors.root.unexpectedError.message}
              </div>
            )}

            {/* Campo Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Correo Electrónico
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </span>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  // Registra el input con RHF, Zod maneja la validación
                  {...register("email")}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-lg shadow-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                    errors.email
                      ? "border-red-500 ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                  placeholder="usuario@ejemplo.com"
                  aria-invalid={errors.email ? "true" : "false"}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  disabled={isProcessing} // Deshabilitar mientras carga/envía
                />
              </div>
              {/* Mensaje de error específico para email */}
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

            {/* Campo Contraseña */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Contraseña
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  // Registra el input con RHF
                  {...register("password")}
                  className={`block w-full pl-10 pr-10 py-2 border rounded-lg shadow-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                    errors.password
                      ? "border-red-500 ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                  placeholder="Ingresa tu contraseña"
                  aria-invalid={errors.password ? "true" : "false"}
                  aria-describedby={
                    errors.password ? "password-error" : undefined
                  }
                  disabled={isProcessing}
                />
                {/* Botón para mostrar/ocultar contraseña */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                  disabled={isProcessing}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Eye className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </div>
              {/* Mensaje de error específico para contraseña */}
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

            {/* Opciones: Recordar Sesión y Olvidó Contraseña */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  type="checkbox"
                  // Registra el input con RHF
                  {...register("rememberMe")}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                  disabled={isProcessing}
                />
                <label
                  htmlFor="rememberMe"
                  className="ml-2 block text-gray-700"
                >
                  Recordar mi sesión
                </label>
              </div>
              <button
                type="button"
                onClick={() => !isProcessing && setShowRecoveryModal(true)} // Evita abrir modal si está procesando
                className="font-medium text-blue-600 hover:text-blue-700 focus:outline-none focus:underline disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isProcessing}
              >
                ¿Olvidó su contraseña?
              </button>
            </div>

            {/* Botón de Envío */}
            <button
              type="submit"
              disabled={isProcessing} // Deshabilitado si está cargando o enviando
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#1a56db] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <span className="flex items-center">
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
                  Procesando...
                </span>
              ) : (
                "Ingresar"
              )}
            </button>

            {/* Mensaje de prueba (Opcional, quitar en producción) */}
            <div className="text-center text-xs text-gray-500 pt-2">
              <p>
                (Demo: <strong>admin@gmail.com</strong> / <strong>12345</strong>
                )
              </p>
            </div>
          </form>
        </div>

        {/* Nombre de la empresa (sin cambios) */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">Ho-Tech del Caribe</p>
        </div>
      </div>

      {/* Modal de recuperación (sin cambios) */}
      {showRecoveryModal && (
        <RecoveryModal onClose={() => setShowRecoveryModal(false)} />
      )}
    </div>
  );
}

export default LoginScreen; // Exportación por defecto si es necesario
