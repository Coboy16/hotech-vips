/* eslint-disable @typescript-eslint/no-explicit-any */
import { Controller } from "react-hook-form";
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
  Key,
  Network,
  ChevronRight,
} from "lucide-react";

import { UserFormData, StructureType } from "../../schemas/userSchema";
import { StructureSelector } from "./StructureSelector";
import { RoleSelector } from "./RoleSelector";
import { AvailableModuleOption } from "./UserModuleSelector";
import { LicenseInfoForUserForm } from "../../../../../model";

// Importar hooks personalizados
import { useUserForm } from "../../hooks/userFrom/useUserForm";
import { useStructureTree } from "../../hooks/userFrom/useStructureTree";
import { useFormTabs } from "../../hooks/userFrom/useFormTabs";
import { useEffect, useMemo, useState } from "react";
import { roleService } from "../../services/roleService";
import { mapStructureType } from "../../utils/structureTypeMapper";

interface UserFormProps {
  user?: any | null;
  onClose: () => void;
  onSave: (formData: UserFormData) => Promise<void>;
  licenseInfo: LicenseInfoForUserForm;
  availableModules: AvailableModuleOption[];
}

export function UserForm({
  user,
  onClose,
  onSave,
  licenseInfo,
}: // availableModules,
UserFormProps) {
  const [roleModules, setRoleModules] = useState<AvailableModuleOption[]>([]);

  const formatModuleName = (moduleName: string): string => {
    if (!moduleName) return "Módulo sin nombre";

    // Convertir "panel_monitoreo" a "Panel Monitoreo"
    return moduleName
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Usar hook de pestañas
  const { activeTab, setActiveTab } = useFormTabs<
    "basic" | "access" | "structures"
  >("basic");

  const processedUser = useMemo(() => {
    if (!user) return null;

    return {
      ...user,
      // Si no existe firstName o lastName, extraerlos del nombre completo
      firstName:
        user.firstName || (user.usua_nomb ? user.usua_nomb.split(" ")[0] : ""),
      lastName:
        user.lastName ||
        (user.usua_nomb ? user.usua_nomb.split(" ").slice(1).join(" ") : ""),

      // Si no existe email, usar usua_corr
      email: user.email || user.usua_corr || "",

      // Si no existe phone, usar usua_noco
      phone: user.phone || user.usua_noco || "",

      // Si usua_stat no es booleano, convertirlo
      usua_stat:
        typeof user.usua_stat === "boolean"
          ? user.usua_stat
          : user.status === "active" ||
            user.usua_stat === "true" ||
            user.usua_stat === true ||
            user.usua_stat === 1 ||
            user.usua_stat === "1",

      // Status basado en usua_stat
      status:
        (typeof user.usua_stat === "boolean" && user.usua_stat) ||
        user.usua_stat === "true" ||
        user.usua_stat === true ||
        user.usua_stat === 1 ||
        user.usua_stat === "1"
          ? "active"
          : "inactive",

      // Si structure_type es 'organization', convertirlo a 'company'
      structure_type: user.structure_type
        ? mapStructureType(user.structure_type)
        : "",

      // Si userStructures existe, procesar también ahí
      userStructures: user.userStructures
        ? user.userStructures.map((us: any) => ({
            ...us,
            structure_type: us.structure_type
              ? mapStructureType(us.structure_type)
              : "",
          }))
        : undefined,

      // Asegurar que rol_id exista
      rol_id: user.rol_id || "",
    };
  }, [user]);

  console.log("[UserForm] Usuario procesado:", processedUser);
  // Usar hook de formulario
  const {
    register,
    control,
    errors,
    isValid,
    touchedFields,
    watchedStructureType,
    watchAssignLater,
    handleSubmit,
    handleGeneratePassword,
    isSavingInternal,
    setValue,
    trigger,
    watch,
  } = useUserForm({
    user: processedUser,
    licenseInfo,
    onSave,
  });
  const selectedRoleId = watch("rol_id");

  useEffect(() => {
    console.log(
      `[UserForm] Inicialización - rol_id detectado: ${selectedRoleId}`
    );

    // Solo ejecutar en la primera carga cuando hay un rol seleccionado y no hay módulos cargados
    if (selectedRoleId && roleModules.length === 0) {
      console.log(
        `[UserForm] Cargando módulos iniciales para rol: ${selectedRoleId}`
      );

      // Función para cargar los módulos del rol
      const loadInitialRoleModules = async () => {
        try {
          console.log(
            `[UserForm] Cargando módulos para rol inicial: ${selectedRoleId}`
          );

          // Obtener detalles del rol
          const roleDetails = await roleService.getRoleById(selectedRoleId);

          if (!roleDetails) {
            console.warn(
              "[UserForm] El rol inicial no tiene datos o no existe"
            );
            setRoleModules([]);
            return;
          }

          console.log("[UserForm] Rol inicial recibido:", roleDetails);

          // Verificar si hay módulos en el rol
          if (roleDetails && Array.isArray(roleDetails.rolesModules)) {
            // Transformar al formato que espera el componente
            const formattedModules = roleDetails.rolesModules
              .filter((rm) => rm.module && rm.module.module_id)
              .map((rm) => ({
                id: rm.module.module_id,
                label: formatModuleName(rm.module.name || "Módulo sin nombre"),
              }));

            console.log(
              "[UserForm] Módulos iniciales formateados:",
              formattedModules
            );

            // Actualizar el estado con los módulos
            setRoleModules(formattedModules);

            // Actualizar el campo userPermissions en el formulario
            const moduleIds = formattedModules.map((m) => m.id);
            setValue("userPermissions", moduleIds);
          } else {
            console.warn(
              "[UserForm] El rol inicial no tiene módulos asignados"
            );
            setRoleModules([]);
            setValue("userPermissions", []);
          }
        } catch (error) {
          console.error("[UserForm] Error al cargar módulos iniciales:", error);
          setRoleModules([]);
          setValue("userPermissions", []);
        }
      };

      // Ejecutar la carga de módulos iniciales
      loadInitialRoleModules();
    }
  }, [watch("rol_id"), setValue, roleModules.length]); // Dependencias importantes

  // Usar hook de estructura
  const {
    structureTree,
    isTreeLoading,
    treeError,
    availableTypes,
    structureTypeLabels,
  } = useStructureTree({
    licenseId: licenseInfo.id,
    user,
    setValue,
    trigger,
  });

  // --- Renderizado ---
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden max-h-[95vh] w-full max-w-4xl flex flex-col my-auto">
        {/* Encabezado */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-600 p-6 text-white flex-shrink-0">
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

        {/* Pestañas */}
        <div className="bg-gray-50 border-b border-gray-200 flex-shrink-0">
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
              <span>Acceso</span>
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

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
          {/* Pestaña Info Personal */}
          <div
            className={`${
              activeTab === "basic" ? "block" : "hidden"
            } space-y-6`}
          >
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
                            errors.usua_nomb && touchedFields.usua_nomb
                              ? "input-error"
                              : ""
                          }`}
                          placeholder="Ingrese nombre completo"
                          disabled={isSavingInternal}
                        />
                      </div>
                      {errors.usua_nomb && touchedFields.usua_nomb && (
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
                            errors.usua_corr && touchedFields.usua_corr
                              ? "input-error"
                              : ""
                          }`}
                          placeholder="correo@ejemplo.com"
                          disabled={isSavingInternal}
                        />
                      </div>
                      {errors.usua_corr && touchedFields.usua_corr && (
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
                            errors.usua_noco && touchedFields.usua_noco
                              ? "input-error"
                              : ""
                          }`}
                          placeholder="Ingrese número telefónico"
                          disabled={isSavingInternal}
                        />
                      </div>
                      {errors.usua_noco && touchedFields.usua_noco && (
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
                              errors.password && touchedFields.password
                                ? "input-error"
                                : ""
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
                      {errors.password && touchedFields.password && (
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
                      {errors.usua_stat && touchedFields.usua_stat && (
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

          {/* Pestaña Acceso y Permisos */}
          <div
            className={`${
              activeTab === "access" ? "block" : "hidden"
            } space-y-6`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* --- Columna Rol --- */}
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
                      onChange={async (roleId) => {
                        console.log("[UserForm] Rol seleccionado:", roleId);

                        // Actualizar el campo rol_id en el formulario
                        field.onChange(roleId);

                        // Limpiar los módulos actuales mientras se cargan los nuevos
                        setRoleModules([]);

                        if (roleId) {
                          console.log(
                            `[UserForm] Cargando módulos para el nuevo rol: ${roleId}`
                          );

                          try {
                            // Obtener detalles del rol seleccionado
                            const roleDetails = await roleService.getRoleById(
                              roleId
                            );

                            if (!roleDetails) {
                              console.warn(
                                "[UserForm] El rol seleccionado no tiene datos o no existe"
                              );
                              setRoleModules([]);
                              setValue("userPermissions", []);
                              return;
                            }

                            console.log(
                              "[UserForm] Detalles del rol recibidos:",
                              roleDetails
                            );

                            // Verificar si hay módulos en el rol
                            if (
                              roleDetails &&
                              Array.isArray(roleDetails.rolesModules)
                            ) {
                              // Transformar al formato que espera el componente
                              const formattedModules = roleDetails.rolesModules
                                .filter(
                                  (rm) => rm.module && rm.module.module_id
                                )
                                .map((rm) => ({
                                  id: rm.module.module_id,
                                  label: formatModuleName(
                                    rm.module.name || "Módulo sin nombre"
                                  ),
                                }));

                              console.log(
                                "[UserForm] Módulos del nuevo rol formateados:",
                                formattedModules
                              );

                              // Actualizar el estado con los módulos
                              setRoleModules(formattedModules);

                              // Actualizar el campo userPermissions en el formulario
                              const moduleIds = formattedModules.map(
                                (m) => m.id
                              );
                              setValue("userPermissions", moduleIds);
                            } else {
                              console.warn(
                                "[UserForm] El rol seleccionado no tiene módulos asignados"
                              );
                              setRoleModules([]);
                              setValue("userPermissions", []);
                            }
                          } catch (error) {
                            console.error(
                              "[UserForm] Error al cargar módulos del nuevo rol:",
                              error
                            );
                            setRoleModules([]);
                            setValue("userPermissions", []);
                          }
                        } else {
                          // Si no hay rol seleccionado, limpiamos los módulos
                          console.log(
                            "[UserForm] No hay rol seleccionado, limpiando módulos"
                          );
                          setRoleModules([]);
                          setValue("userPermissions", []);
                        }

                        // Finalmente, validar el campo
                        setValue("rol_id", roleId, { shouldValidate: true });
                      }}
                      disabled={isSavingInternal}
                      className={`input-field ${
                        errors.rol_id && touchedFields.rol_id
                          ? "input-error"
                          : ""
                      }`}
                    />
                  )}
                />
                {errors.rol_id && touchedFields.rol_id && (
                  <p className="error-message">{errors.rol_id.message}</p>
                )}
              </div>

              {/* --- Columna Permisos de Módulo --- */}
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h3 className="text-lg font-medium text-blue-800 flex items-center">
                    <Key className="w-5 h-5 mr-2" />
                    Acceso a Módulos
                  </h3>
                  <div className="mt-4">
                    {watch("rol_id") ? (
                      <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>
                          Módulos asignados según el rol seleccionado. Estos
                          módulos son de solo lectura.
                        </span>
                      </div>
                    ) : (
                      <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>
                          Seleccione un rol para ver los módulos asignados.
                        </span>
                      </div>
                    )}

                    {/* Renderizamos los módulos directamente desde el estado local */}
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {roleModules.length > 0 ? (
                        roleModules.map((module) => (
                          <div
                            key={module.id}
                            className="flex items-center p-3 bg-white border border-gray-200 rounded-md hover:bg-gray-50"
                          >
                            <input
                              type="checkbox"
                              checked={true}
                              onChange={() => {}}
                              disabled={true}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <div className="ml-3 flex items-center justify-between w-full">
                              <div className="text-sm text-gray-700">
                                {module.label}
                              </div>
                              {module.label === "Empleados" ||
                              module.label === "Reportes" ? (
                                <ChevronRight className="h-5 w-5 text-gray-400" />
                              ) : null}
                            </div>
                          </div>
                        ))
                      ) : watch("rol_id") ? (
                        <div className="flex items-center justify-center p-4 text-gray-500 italic">
                          <Loader2 className="w-5 h-5 mr-2 animate-spin text-blue-500" />
                          <span>Cargando módulos...</span>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 italic text-center p-4">
                          Seleccione un rol para ver módulos
                        </div>
                      )}
                    </div>

                    {/* Este campo hidden mantiene los valores en el formulario */}
                    <input type="hidden" {...register("userPermissions")} />

                    {errors.userPermissions &&
                      touchedFields.userPermissions && (
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

          {/* Pestaña Estructuras */}
          <div
            className={`${
              activeTab === "structures" ? "block" : "hidden"
            } space-y-6`}
          >
            {/* Indicador Global de Carga/Error del Árbol */}
            {isTreeLoading && (
              <div className="flex items-center justify-center p-4 border border-blue-200 rounded-md bg-blue-50 text-blue-700">
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                <span>Cargando estructura organizacional...</span>
              </div>
            )}
            {treeError && !isTreeLoading && (
              <div className="flex items-center p-4 border border-red-300 rounded-md bg-red-50 text-red-700">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span>{treeError}</span>
              </div>
            )}

            {/* Contenido de la pestaña */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Columna Izquierda: Info Licencia y TIPO de Estructura */}
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 h-full">
                  <h3 className="text-lg font-medium text-blue-800 flex items-center">
                    <Network className="w-5 h-5 mr-2" />
                    Organización
                  </h3>
                  <div className="mt-4 space-y-4">
                    {/* Info Licencia */}
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
                      <input
                        type="hidden"
                        {...register("company_license_id")}
                      />
                      {errors.company_license_id &&
                        touchedFields.company_license_id && (
                          <p className="error-message">
                            {errors.company_license_id.message}
                          </p>
                        )}
                    </div>

                    {/* Selector de TIPO de estructura */}
                    <div>
                      <label className="label-form">
                        Tipo de estructura
                        {!watchAssignLater && (
                          <span className="text-red-500">*</span>
                        )}
                      </label>
                      <Controller
                        name="structure_type"
                        control={control}
                        render={({ field }) => (
                          <select
                            {...field}
                            value={field.value || ""} // Controlado
                            className={`input-field ${
                              // Mostrar error si existe Y no se asigna más tarde Y el campo fue tocado
                              errors.structure_type &&
                              !watchAssignLater &&
                              touchedFields.structure_type
                                ? "input-error"
                                : ""
                            }`}
                            disabled={
                              isSavingInternal ||
                              watchAssignLater ||
                              isTreeLoading ||
                              !!treeError ||
                              availableTypes.length === 0
                            }
                            onChange={(e) => {
                              const newType = e.target.value as
                                | StructureType
                                | "";
                              console.log(
                                "Tipo estructura cambiado a:",
                                newType
                              );
                              field.onChange(newType);
                              setValue("structure_id", "", {
                                shouldValidate: false,
                              });
                              // Si el nuevo tipo es 'company', auto-seleccionar su ID (license_id)
                              if (
                                newType === "company" &&
                                structureTree?.license_id
                              ) {
                                setValue(
                                  "structure_id",
                                  structureTree.license_id,
                                  { shouldValidate: false }
                                );
                                console.log(
                                  `[UserForm] Auto-seleccionando ID compañía: ${structureTree.license_id}`
                                );
                              }
                            }}
                          >
                            <option value="" disabled>
                              {isTreeLoading
                                ? "Cargando tipos..."
                                : treeError
                                ? "Error al cargar"
                                : availableTypes.length === 0
                                ? "No hay estructuras definidas"
                                : "Seleccione un tipo..."}
                            </option>
                            {availableTypes.map((type) => (
                              <option key={type} value={type}>
                                {structureTypeLabels[type]}
                              </option>
                            ))}
                          </select>
                        )}
                      />
                      {errors.structure_type &&
                        !watchAssignLater &&
                        touchedFields.structure_type && (
                          <p className="error-message">
                            {errors.structure_type.message}
                          </p>
                        )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Columna Derecha: Asignación de Estructura ESPECÍFICA */}
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 h-full">
                  <h3 className="text-lg font-medium text-blue-800 flex items-center">
                    <Building2 className="w-5 h-5 mr-2" />
                    Asignación Específica
                  </h3>
                  <div className="mt-4 space-y-4">
                    {/* Selector de Estructura ESPECÍFICA */}
                    <div>
                      <label className="label-form" htmlFor="structure_id">
                        Estructura específica
                        {/* Requerido si no asigna más tarde Y hay tipo seleccionado */}
                        {!watchAssignLater && watchedStructureType && (
                          <span className="text-red-500">*</span>
                        )}
                      </label>

                      <Controller
                        name="structure_id"
                        control={control}
                        render={({ field }) => (
                          <StructureSelector
                            selectedStructure={field.value || ""}
                            structureType={watchedStructureType}
                            tree={structureTree} // Pasar árbol
                            onChange={(structureId) => {
                              console.log(
                                "ID Estructura específica seleccionada:",
                                structureId
                              );
                              field.onChange(structureId);
                            }}
                            // Deshabilitar si: guarda, asigna más tarde, no hay tipo, carga árbol, error árbol
                            disabled={
                              isSavingInternal ||
                              !watchedStructureType ||
                              watchAssignLater ||
                              isTreeLoading ||
                              !!treeError
                            }
                            className={
                              // Mostrar error si existe Y no se asigna más tarde Y el campo fue tocado
                              errors.structure_id &&
                              !watchAssignLater &&
                              touchedFields.structure_id
                                ? "input-error"
                                : ""
                            }
                          />
                        )}
                      />
                      {errors.structure_id &&
                        !watchAssignLater &&
                        touchedFields.structure_id && (
                          <p className="error-message">
                            {errors.structure_id.message}
                          </p>
                        )}
                      {/* Mensaje si no se ha seleccionado TIPO */}
                      {!watchedStructureType &&
                        !watchAssignLater &&
                        !isTreeLoading &&
                        !treeError && (
                          <p className="text-xs text-gray-500 mt-1">
                            Seleccione primero un tipo de estructura.
                          </p>
                        )}
                      {/* Aviso si se asignará más tarde */}
                      {watchAssignLater && (
                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>
                            El usuario se creará sin estructura asignada.
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Switch para asignar estructura más tarde */}
                    {/* <div className="pt-2">
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
                                // Re-trigger validation when checkbox changes
                                trigger();
                              }}
                              className="sr-only peer"
                              disabled={isSavingInternal}
                            />
                            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            <span className="ms-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                              Asignar estructura más tarde
                            </span>
                          </label>
                        )}
                      />
                    </div> */}
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
              // Deshabilitar si guarda, O si el form no es válido, O si el árbol está cargando
              disabled={isSavingInternal || !isValid || isTreeLoading}
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

        {/* Estilos CSS (sin cambios) */}
        <style>{`
            .label-form { display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.25rem; }
            .input-container { position: relative; display: flex; align-items: center; }
            .input-icon { position: absolute; left: 0.75rem; pointer-events: none; width: 1.25rem; height: 1.25rem; color: #9ca3af; }
            .input-field { display: block; width: 100%; border-radius: 0.375rem; border: 1px solid #d1d5db; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); padding: 0.5rem 0.75rem; font-size: 0.875rem; line-height: 1.25rem; color: #1f2937; background-color: #ffffff; transition: border-color 0.2s, box-shadow 0.2s; }
            .input-field:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 2px #bfdbfe; }
            .input-field:disabled { background-color: #f3f4f6; cursor: not-allowed; color: #9ca3af; } /* Estilo disabled mejorado */
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
