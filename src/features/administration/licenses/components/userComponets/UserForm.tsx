/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  X,
  Save,
  User,
  Mail,
  Lock,
  AlertCircle,
  UserCog,
  Building2,
  RefreshCw,
  Loader2,
  Phone,
  Key, // Icono para permisos
} from "lucide-react";
import {
  userFormValidationSchema,
  UserFormData,
} from "../../schemas/userSchema";
import { StructureSelector } from "../LincensesComponets/StructureSelector";
import { RoleSelector } from "../LincensesComponets/RoleSelector";
import UserModuleSelector, {
  AvailableModuleOption,
} from "./UserModuleSelector"; // <-- Importar Selector y Tipo
import { LicenseInfoForUserForm } from "../../../../../model/user";

// Función para generar una contraseña aleatoria (sin cambios)
const generateRandomPassword = (length = 12) => {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
};

interface UserFormProps {
  user?: any | null; // Podría ser ApiUser si lo defines bien
  onClose: () => void;
  onSave: (formData: UserFormData) => Promise<void>; // Hacerla async para esperar la API
  isLoading?: boolean; // <- Renombrado de isLoading a isSaving en el componente padre, ajustar si es necesario
  licenseInfo: LicenseInfoForUserForm; // Hacerla requerida
  availableModules: AvailableModuleOption[]; // <--- NUEVA PROP
}

export function UserForm({
  user,
  onClose,
  onSave,
  licenseInfo,
  availableModules, // <--- Recibir prop
}: UserFormProps) {
  const [activeTab, setActiveTab] = useState<"basic" | "access" | "structures">(
    "basic"
  );
  // Usar un estado local para el proceso de guardado iniciado desde ESTE form
  const [isSavingInternal, setIsSavingInternal] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
    watch,
    setValue,
    reset, // Añadir reset
  } = useForm<UserFormData>({
    resolver: zodResolver(userFormValidationSchema),
    mode: "onChange",
    defaultValues: user // Si estamos editando...
      ? undefined // Dejar que useEffect lo llene desde apiUserToFormData
      : {
          // Si estamos creando...
          usua_nomb: "",
          usua_corr: "",
          usua_noco: "",
          password: "",
          usua_stat: true,
          rol_id: "",
          structure_type: "company", // Default type
          structure_id: "", // Default ID vacío
          assignStructureLater: false,
          userPermissions: [], // <--- Default vacío
          company_license_id: licenseInfo.id, // Siempre la de la licencia en contexto
          // Fechas opcionales inicializadas como undefined o string vacío
          usua_fein: undefined,
          usua_fevc: undefined,
          usua_feve: undefined,
        },
  });

  // Efecto para llenar el formulario si estamos en modo edición
  useEffect(() => {
    if (user) {
      // Aquí necesitarías el adaptador inverso si 'user' es ApiUser
      // const formDataFromApi = apiUserToFormData(user, licenseInfo);
      // reset(formDataFromApi);
      console.warn(
        "Modo edición detectado pero adaptador apiUserToFormData no está implementado completamente aquí."
      );
      // Simulación básica si 'user' ya tuviera campos compatibles:
      reset({
        ...user,
        password: "", // Nunca precargar pass
        userPermissions: user.userPermissions || [], // Asegurar array
        company_license_id: user.company_license_id || licenseInfo.id,
        assignStructureLater: !user.structure_id,
      });
    } else {
      // Asegurar que company_license_id se setea correctamente en creación
      setValue("company_license_id", licenseInfo.id);
    }
  }, [user, reset, licenseInfo, setValue]);

  const handleFormSubmit = async (data: UserFormData) => {
    console.log("Datos del formulario validados:", data);
    setIsSavingInternal(true);
    try {
      await onSave(data); // Llama a la función onSave pasada desde LicensesScreen
      // El cierre del modal y mensaje de éxito lo maneja LicensesScreen
    } catch (error) {
      console.error("Error en UserForm al llamar onSave:", error);
      // El toast de error ya debería mostrarse desde onSave/makeRequest
    } finally {
      setIsSavingInternal(false);
    }
  };

  const handleGeneratePassword = () => {
    const newPassword = generateRandomPassword();
    setValue("password", newPassword, { shouldValidate: true });
  };

  const watchedStructureType = watch("structure_type");
  const watchAssignLater = watch("assignStructureLater"); // Observar el switch

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden max-h-[95vh] w-full max-w-4xl flex flex-col my-auto">
        <div className="bg-gradient-to-r from-blue-600 to-blue-600 p-6 text-white flex-shrink-0">
          {/* ... Encabezado sin cambios ... */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <User className="w-8 h-8" />
              <h2 className="text-2xl font-bold">
                {user ? "Editar Usuario" : "Nuevo Usuario"}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isSavingInternal}
              className="text-white hover:bg-blue-700 p-2 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="mt-2 text-blue-100 max-w-2xl">
            {user
              ? "Modifique los detalles del usuario y guarde los cambios."
              : `Complete los campos para crear un nuevo usuario dentro de la licencia ${licenseInfo.name}.`}
          </p>
        </div>
        <div className="bg-gray-50 border-b border-gray-200 flex-shrink-0">
          {/* ... Pestañas sin cambios ... */}
          <div className="flex">
            <button
              className={`py-3 px-6 text-sm font-medium flex items-center space-x-2 ${
                activeTab === "basic"
                  ? "text-blue-600 border-b-2 border-blue-500"
                  : "text-gray-500 hover:text-blue-500"
              }`}
              onClick={() => setActiveTab("basic")}
              type="button"
            >
              <User className="w-4 h-4" />
              <span>Personal</span>
            </button>
            <button
              className={`py-3 px-6 text-sm font-medium flex items-center space-x-2 ${
                activeTab === "access"
                  ? "text-blue-600 border-b-2 border-blue-500"
                  : "text-gray-500 hover:text-blue-500"
              }`}
              onClick={() => setActiveTab("access")}
              type="button"
            >
              <UserCog className="w-4 h-4" />
              <span>Acceso y Permisos</span> {/* Texto actualizado */}
            </button>
            <button
              className={`py-3 px-6 text-sm font-medium flex items-center space-x-2 ${
                activeTab === "structures"
                  ? "text-blue-600 border-b-2 border-blue-500"
                  : "text-gray-500 hover:text-blue-500"
              }`}
              onClick={() => setActiveTab("structures")}
              type="button"
            >
              <Building2 className="w-4 h-4" />
              <span>Estructura</span>
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="p-6 overflow-y-auto flex-1"
        >
          {/* ----- Pestaña Información Personal ----- */}
          <div
            className={`${
              activeTab === "basic" ? "block" : "hidden"
            } space-y-6`}
          >
            {/* ... Contenido de la pestaña Básico con estilos mejorados ... */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Columna Izquierda */}
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h3 className="text-lg font-medium text-blue-800 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Datos Personales
                  </h3>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="label-form" htmlFor="usua_nomb">
                        Nombre completo <span className="text-red-500">*</span>
                      </label>
                      <div className="input-container">
                        <User className="input-icon" />
                        <input
                          id="usua_nomb"
                          type="text"
                          {...register("usua_nomb")}
                          className={`input-field pl-10 ${
                            errors.usua_nomb ? "input-error" : ""
                          }`}
                          placeholder="Ingrese nombre completo"
                          disabled={isSavingInternal}
                        />
                      </div>
                      {errors.usua_nomb && (
                        <p className="error-message">
                          {errors.usua_nomb.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="label-form" htmlFor="usua_corr">
                        Correo electrónico{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="input-container">
                        <Mail className="input-icon" />
                        <input
                          id="usua_corr"
                          type="email"
                          {...register("usua_corr")}
                          className={`input-field pl-10 ${
                            errors.usua_corr ? "input-error" : ""
                          }`}
                          placeholder="correo@ejemplo.com"
                          disabled={isSavingInternal}
                        />
                      </div>
                      {errors.usua_corr && (
                        <p className="error-message">
                          {errors.usua_corr.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="label-form" htmlFor="usua_noco">
                        Teléfono <span className="text-red-500">*</span>
                      </label>
                      <div className="input-container">
                        <Phone className="input-icon" />
                        <input
                          id="usua_noco"
                          type="tel"
                          {...register("usua_noco")}
                          className={`input-field pl-10 ${
                            errors.usua_noco ? "input-error" : ""
                          }`}
                          placeholder="Ingrese número telefónico"
                          disabled={isSavingInternal}
                        />
                      </div>
                      {errors.usua_noco && (
                        <p className="error-message">
                          {errors.usua_noco.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {/* Columna Derecha */}
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h3 className="text-lg font-medium text-blue-800 flex items-center">
                    <Lock className="w-5 h-5 mr-2" />
                    Acceso
                  </h3>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="label-form" htmlFor="password">
                        Contraseña{" "}
                        {!user && <span className="text-red-500">*</span>}
                        {user && (
                          <span className="text-xs text-gray-500">
                            (Opcional en edición)
                          </span>
                        )}
                      </label>
                      <div className="flex space-x-2">
                        <div className="input-container flex-1">
                          <Lock className="input-icon" />
                          <input
                            id="password"
                            type="password"
                            {...register("password")}
                            className={`input-field pl-10 ${
                              errors.password ? "input-error" : ""
                            }`}
                            placeholder={
                              user
                                ? "Dejar en blanco para no cambiar"
                                : "Contraseña para el usuario"
                            }
                            disabled={isSavingInternal}
                            autoComplete="new-password"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleGeneratePassword}
                          className="button-secondary px-3"
                          disabled={isSavingInternal}
                          title="Generar contraseña aleatoria"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>
                      {errors.password && (
                        <p className="error-message">
                          {errors.password.message}
                        </p>
                      )}
                      {!user && (
                        <p className="text-xs text-gray-500 mt-1">
                          Mínimo 8 caracteres. Se pedirá cambiarla al primer
                          inicio de sesión.
                        </p>
                      )}
                      {user && (
                        <p className="text-xs text-gray-500 mt-1">
                          Solo ingrese una contraseña si desea cambiar la
                          actual.
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="label-form">Estado</label>
                      <Controller
                        name="usua_stat"
                        control={control}
                        render={({ field }) => (
                          <div className="flex items-center space-x-4 mt-1">
                            <label className="inline-flex items-center cursor-pointer">
                              <input
                                type="radio"
                                checked={field.value === true}
                                onChange={() => field.onChange(true)}
                                className="form-radio h-4 w-4 text-blue-600 focus:ring-blue-500"
                                disabled={isSavingInternal}
                              />
                              <span className="ml-2 text-sm text-gray-700">
                                Activo
                              </span>
                            </label>
                            <label className="inline-flex items-center cursor-pointer">
                              <input
                                type="radio"
                                checked={field.value === false}
                                onChange={() => field.onChange(false)}
                                className="form-radio h-4 w-4 text-red-600 focus:ring-red-500"
                                disabled={isSavingInternal}
                              />
                              <span className="ml-2 text-sm text-gray-700">
                                Inactivo
                              </span>
                            </label>
                          </div>
                        )}
                      />
                      {errors.usua_stat && (
                        <p className="error-message">
                          {errors.usua_stat.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ----- Pestaña Accesos y Permisos ----- */}
          <div
            className={`${
              activeTab === "access" ? "block" : "hidden"
            } space-y-6`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* --- Columna Rol --- */}
              <div className="space-y-4">
                <div>
                  <label className="label-form" htmlFor="rol_id">
                    Rol asignado <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="rol_id"
                    control={control}
                    render={({ field }) => (
                      <RoleSelector
                        selectedRole={field.value}
                        onChange={(roleId) => field.onChange(roleId)}
                        disabled={isSavingInternal}
                        className={`input-field ${
                          errors.rol_id ? "input-error" : ""
                        }`}
                      />
                    )}
                  />
                  {errors.rol_id && (
                    <p className="error-message">{errors.rol_id.message}</p>
                  )}
                </div>
              </div>

              {/* --- Columna Permisos de Módulo --- */}
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h3 className="text-lg font-medium text-blue-800 flex items-center">
                    <Key className="w-5 h-5 mr-2" />
                    Permisos Específicos
                  </h3>
                  <div className="mt-4">
                    <Controller
                      name="userPermissions"
                      control={control}
                      render={({ field }) => (
                        <UserModuleSelector
                          availableModules={availableModules}
                          selectedPermissions={field.value || []}
                          onChange={(selectedIds) =>
                            field.onChange(selectedIds)
                          }
                          disabled={isSavingInternal}
                        />
                      )}
                    />
                    {errors.userPermissions && (
                      <p className="error-message">
                        {typeof errors.userPermissions.message === "string"
                          ? errors.userPermissions.message
                          : "Error en la selección de permisos."}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ----- Pestaña Estructuras ----- */}
          <div
            className={`${
              activeTab === "structures" ? "block" : "hidden"
            } space-y-6`}
          >
            {/* ... Contenido de la pestaña Estructuras con estilos mejorados ... */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Columna Izquierda */}
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h3 className="text-lg font-medium text-blue-800 flex items-center">
                    <Building2 className="w-5 h-5 mr-2" />
                    Datos de la Licencia
                  </h3>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="label-form">Licencia asociada</label>
                      <div className="p-3 bg-white border border-gray-200 rounded-md">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-800">
                            {licenseInfo.name}
                          </span>
                          <span className="text-sm text-gray-500">
                            Código: {licenseInfo.code} (ID: {licenseInfo.id})
                          </span>
                        </div>
                      </div>
                      {/* Campo oculto para enviar el ID de la licencia */}
                      <input
                        type="hidden"
                        {...register("company_license_id")}
                      />
                      {errors.company_license_id && (
                        <p className="error-message">
                          {errors.company_license_id.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="label-form">
                        Tipo de estructura{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <Controller
                        name="structure_type"
                        control={control}
                        render={({ field }) => (
                          <select
                            {...field}
                            className={`input-field ${
                              errors.structure_type ? "input-error" : ""
                            }`}
                            disabled={isSavingInternal || watchAssignLater}
                            onChange={(e) => {
                              field.onChange(e);
                              setValue("structure_id", "", {
                                shouldValidate: !watchAssignLater,
                              });
                            }}
                          >
                            <option value="" disabled>
                              Seleccione un tipo
                            </option>
                            <option value="company">Compañía</option>
                            <option value="sede">Sede</option>
                            <option value="department">Departamento</option>
                            <option value="section">Sección</option>
                            <option value="unit">Unidad</option>
                          </select>
                        )}
                      />
                      {errors.structure_type && (
                        <p className="error-message">
                          {errors.structure_type.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {/* Columna Derecha */}
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h3 className="text-lg font-medium text-blue-800 flex items-center">
                    <Building2 className="w-5 h-5 mr-2" />
                    Asignación de Estructura
                  </h3>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="label-form" htmlFor="structure_id">
                        Estructura específica{" "}
                        {!watchAssignLater && (
                          <span className="text-red-500">*</span>
                        )}
                      </label>

                      {/* Selector de Estructura */}
                      <div
                        className={
                          watchAssignLater
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }
                      >
                        <Controller
                          name="structure_id"
                          control={control}
                          render={({ field }) => (
                            <StructureSelector
                              selectedStructure={field.value || ""}
                              structureType={watchedStructureType}
                              licenseId={licenseInfo.id}
                              onChange={(structureId) =>
                                field.onChange(structureId)
                              }
                              disabled={
                                isSavingInternal ||
                                !watchedStructureType ||
                                watchAssignLater
                              }
                              className={
                                errors.structure_id && !watchAssignLater
                                  ? "input-error"
                                  : ""
                              }
                            />
                          )}
                        />
                      </div>
                      {/* Mensaje de error específico para structure_id */}
                      {errors.structure_id && !watchAssignLater && (
                        <p className="error-message">
                          {errors.structure_id.message}
                        </p>
                      )}

                      {/* Aviso si se asignará más tarde */}
                      {watchAssignLater && (
                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>
                            El usuario se creará sin estructura asignada. Podrá
                            asignarle una después.
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Switch para asignar estructura más tarde */}
                    <div className="pt-2">
                      <Controller
                        name="assignStructureLater"
                        control={control}
                        render={({ field }) => (
                          <label className="inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={field.value || false}
                              onChange={(e) => {
                                const isChecked = e.target.checked;
                                field.onChange(isChecked);
                                if (isChecked) {
                                  setValue("structure_id", "", {
                                    shouldValidate: false,
                                  });
                                } else {
                                  setValue(
                                    "structure_id",
                                    watch("structure_id"),
                                    {
                                      shouldValidate: true,
                                    }
                                  );
                                }
                              }}
                              className="sr-only peer"
                              disabled={isSavingInternal}
                            />
                            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            <span className="ms-3 text-sm font-medium text-gray-700">
                              Asignar estructura más tarde
                            </span>
                          </label>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="mt-8 pt-5 border-t border-gray-200 flex justify-end space-x-3 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSavingInternal}
              className="button-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSavingInternal || !isValid}
              className="button-primary min-w-[140px]"
            >
              {isSavingInternal ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isSavingInternal
                ? "Guardando..."
                : user
                ? "Guardar cambios"
                : "Crear usuario"}
            </button>
          </div>
        </form>

        {/* Estilos CSS reutilizables para inputs y labels (Ejemplo) */}
        <style>{`
             .label-form {
                 display: block;
                 font-size: 0.875rem; /* text-sm */
                 font-weight: 500; /* font-medium */
                 color: #374151; /* text-gray-700 */
                 margin-bottom: 0.25rem; /* mb-1 */
             }
             .input-container {
                  position: relative;
                  display: flex;
                  align-items: center;
             }
             .input-icon {
                 position: absolute;
                 left: 0.75rem; /* pl-3 */
                 pointer-events: none;
                 width: 1.25rem; /* w-5 */
                 height: 1.25rem; /* h-5 */
                 color: #9ca3af; /* text-gray-400 */
             }
             .input-field {
                 display: block;
                 width: 100%;
                 border-radius: 0.375rem; /* rounded-md */
                 border: 1px solid #d1d5db; /* border-gray-300 */
                 box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); /* shadow-sm */
                 padding: 0.5rem 0.75rem; /* py-2 px-3 */
                 font-size: 0.875rem; /* text-sm */
                 line-height: 1.25rem;
                 color: #1f2937; /* text-gray-900 */
                 background-color: #ffffff; /* bg-white */
                 transition: border-color 0.2s, box-shadow 0.2s;
             }
              .input-field:focus {
                  outline: none;
                  border-color: #3b82f6; /* focus:border-blue-500 */
                  box-shadow: 0 0 0 2px #bfdbfe; /* focus:ring-blue-200 focus:ring-opacity-50 */
              }
              .input-field.pl-10 {
                  padding-left: 2.5rem; /* pl-10 */
              }
              .input-error {
                 border-color: #ef4444; /* border-red-500 */
              }
              .input-error:focus {
                 box-shadow: 0 0 0 2px #fecaca; /* focus:ring-red-200 */
                 border-color: #ef4444;
              }
             .error-message {
                 color: #ef4444; /* text-red-500 */
                 font-size: 0.75rem; /* text-xs */
                 margin-top: 0.25rem; /* mt-1 */
             }
              .button-primary {
                  display: inline-flex;
                  align-items: center;
                  justify-content: center;
                  padding: 0.5rem 1rem; /* px-4 py-2 */
                  border: 1px solid transparent;
                  border-radius: 0.375rem; /* rounded-md */
                  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
                  font-size: 0.875rem; /* text-sm */
                  font-weight: 500; /* font-medium */
                  color: #ffffff; /* text-white */
                  background-color: #2563eb; /* bg-blue-600 */
                  transition: background-color 0.2s;
              }
              .button-primary:hover {
                   background-color: #1d4ed8; /* hover:bg-blue-700 */
              }
              .button-primary:focus {
                   outline: none;
                   box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5); /* focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 */
              }
               .button-primary:disabled {
                   opacity: 0.5;
                   cursor: not-allowed;
               }
              .button-secondary {
                   display: inline-flex;
                   align-items: center;
                   justify-content: center;
                   padding: 0.5rem 1rem;
                   border: 1px solid #d1d5db; /* border-gray-300 */
                   border-radius: 0.375rem;
                   box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
                   font-size: 0.875rem;
                   font-weight: 500;
                   color: #374151; /* text-gray-700 */
                   background-color: #ffffff; /* bg-white */
                   transition: background-color 0.2s;
               }
               .button-secondary:hover {
                    background-color: #f9fafb; /* hover:bg-gray-50 */
               }
               .button-secondary:focus {
                    outline: none;
                   box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
               }
                .button-secondary:disabled {
                   opacity: 0.5;
                   cursor: not-allowed;
                }
         `}</style>
      </div>
    </div>
  );
}
