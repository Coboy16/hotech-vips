/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from "react";
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
  Key,
  Network,
} from "lucide-react";
import {
  userFormValidationSchema,
  UserFormData,
  StructureType,
} from "../../schemas/userSchema";
import { StructureSelector } from "./StructureSelector";
import { RoleSelector } from "../LincensesComponets/RoleSelector";
import UserModuleSelector, {
  AvailableModuleOption,
} from "./UserModuleSelector";
import {
  LicenseInfoForUserForm,
  ApiStructureTreeResponse, // Ahora este tipo representa el OBJETO DENTRO de data[0]
} from "../../../../../model";
import { structureService } from "../../services/structureService";

// --- Helper Functions ---

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

// **REVISADO:** Función para determinar tipos disponibles.
// Ahora asume que la existencia del objeto `tree` implica que 'company' está disponible.
const getAvailableStructureTypes = (
  tree: ApiStructureTreeResponse | null
): StructureType[] => {
  const availableTypes = new Set<StructureType>();

  // Si el árbol (objeto de licencia con relaciones) existe, 'company' está disponible.
  if (tree?.license_id) {
    availableTypes.add("company");
  } else {
    return []; // Si no hay árbol, no hay tipos.
  }

  // Revisar el array 'companies' DENTRO del árbol para tipos anidados
  tree.companies?.forEach((company) => {
    // Iterar incluso si está vacío, no causa error
    if (company.branches && company.branches.length > 0) {
      availableTypes.add("sede");
      company.branches.forEach((branch) => {
        if (branch.departments && branch.departments.length > 0) {
          availableTypes.add("department");
          branch.departments.forEach((department) => {
            if (department.sections && department.sections.length > 0) {
              availableTypes.add("section");
              department.sections.forEach((section) => {
                if (section.units && section.units.length > 0) {
                  availableTypes.add("unit");
                }
              });
            }
          });
        }
      });
    }
  });

  const order: StructureType[] = [
    "company",
    "sede",
    "department",
    "section",
    "unit",
  ];
  return order.filter((type) => availableTypes.has(type));
};

const structureTypeLabels: Record<StructureType, string> = {
  company: "Compañía",
  sede: "Sede",
  department: "Departamento",
  section: "Sección",
  unit: "Unidad",
};

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
  availableModules,
}: UserFormProps) {
  const [activeTab, setActiveTab] = useState<"basic" | "access" | "structures">(
    "basic"
  );
  const [isSavingInternal, setIsSavingInternal] = useState(false);
  const [structureTree, setStructureTree] =
    useState<ApiStructureTreeResponse | null>(null);
  const [isTreeLoading, setIsTreeLoading] = useState(true);
  const [treeError, setTreeError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
    watch,
    setValue,
    reset,
    trigger,
  } = useForm<UserFormData>({
    resolver: zodResolver(userFormValidationSchema),
    mode: "onChange", // Validar al cambiar, importante para selects dependientes
    defaultValues: user
      ? undefined
      : {
          usua_nomb: "",
          usua_corr: "",
          usua_noco: "",
          password: "",
          usua_stat: true,
          rol_id: "",
          structure_type: "",
          structure_id: "",
          assignStructureLater: false,
          userPermissions: [],
          company_license_id: licenseInfo.id,
          usua_fein: undefined,
          usua_fevc: undefined,
          usua_feve: undefined,
        },
  });

  // Cargar Árbol de Estructura
  useEffect(() => {
    let isMounted = true; // Flag para evitar setear estado si el componente se desmonta
    const fetchTree = async () => {
      if (!licenseInfo.id) {
        setIsTreeLoading(false);
        setTreeError("ID de Licencia no disponible.");
        return;
      }
      console.log(
        `[UserForm] Iniciando carga de árbol para licencia: ${licenseInfo.id}`
      );
      setIsTreeLoading(true);
      setTreeError(null);
      setStructureTree(null);
      try {
        // structureService.getStructureTree ahora devuelve el objeto directamente (o null)
        const treeData = await structureService.getStructureTree(
          licenseInfo.id
        );
        console.log("[UserForm] Árbol recibido:", treeData);
        if (isMounted) {
          setStructureTree(treeData); // Guardar el objeto (o null)

          // Lógica para setear tipo por defecto DESPUÉS de cargar el árbol
          if (!user && treeData) {
            // Solo en creación y si el árbol cargó
            const availableTypes = getAvailableStructureTypes(treeData);
            console.log(
              "[UserForm] Tipos disponibles detectados:",
              availableTypes
            );
            if (availableTypes.length === 1) {
              console.log(
                `[UserForm] Estableciendo tipo por defecto a: ${availableTypes[0]}`
              );
              // Usar setValue para actualizar el form state
              setValue("structure_type", availableTypes[0], {
                shouldValidate: true,
              });
              // Si el único tipo es company, pre-seleccionar su ID (license_id)
              if (availableTypes[0] === "company") {
                setValue("structure_id", treeData.license_id, {
                  shouldValidate: true,
                });
                console.log(
                  `[UserForm] Pre-seleccionando ID de compañía: ${treeData.license_id}`
                );
              }
            } else {
              console.log(
                "[UserForm] Múltiples o ningún tipo disponible, requiere selección."
              );
              setValue("structure_type", "", { shouldValidate: true }); // Forzar selección
              setValue("structure_id", "", { shouldValidate: false }); // Limpiar ID
            }
          } else if (!user && !treeData) {
            // Caso: Creación pero el árbol vino null o vacío
            console.warn(
              "[UserForm] Árbol de estructura no encontrado o vacío para la licencia."
            );
            setValue("structure_type", "", { shouldValidate: true });
            setValue("structure_id", "", { shouldValidate: false });
          }
          // Trigger validation after setting default type/id
          trigger();
        }
      } catch (err) {
        console.error("[UserForm] Error al cargar árbol de estructura:", err);
        if (isMounted) {
          setTreeError("No se pudo cargar la estructura organizacional.");
        }
      } finally {
        if (isMounted) {
          setIsTreeLoading(false);
          console.log("[UserForm] Carga de árbol finalizada.");
        }
      }
    };

    fetchTree();

    return () => {
      isMounted = false; // Cleanup: marcar como desmontado
    };
    // Dependencias: Ejecutar solo cuando cambie el ID de la licencia
  }, [licenseInfo.id, user, setValue, trigger]); // Añadir trigger

  // Resetear/Llenar formulario para edición
  useEffect(() => {
    if (user) {
      console.warn(
        "Modo edición: Adaptador apiUserToFormData necesita revisión."
      );
      const userStructure = user.userStructures?.[0] || {
        structure_id: user.structure_id,
        structure_type: user.structure_type,
      };
      reset({
        ...user, // Cuidado con sobrescribir IDs/tipos si el árbol no ha cargado
        password: "",
        userPermissions:
          user.userPermissions
            ?.map((p: any) => p.module?.module_id)
            .filter(Boolean) || [],
        company_license_id: user.company_license_id || licenseInfo.id,
        // Inicializar con datos del usuario, pero pueden ser sobreescritos por la carga del árbol si es necesario validar
        structure_type: (userStructure?.structure_type as StructureType) || "",
        structure_id: userStructure?.structure_id || "",
        assignStructureLater: !userStructure?.structure_id,
      });
    }
    // No resetear en modo creación aquí para no interferir con la carga del árbol
  }, [user, reset, licenseInfo.id]);

  const handleFormSubmit = async (data: UserFormData) => {
    console.log("Datos del formulario validados ANTES de enviar:", data);
    setIsSavingInternal(true);
    try {
      await onSave(data);
    } catch (error) {
      console.error("Error en UserForm al llamar onSave:", error);
    } finally {
      setIsSavingInternal(false);
    }
  };

  const handleGeneratePassword = () => {
    const newPassword = generateRandomPassword();
    setValue("password", newPassword, { shouldValidate: true });
  };

  const watchedStructureType = watch("structure_type") as StructureType | "";
  const watchAssignLater = watch("assignStructureLater");

  // Recalcular tipos disponibles memoizado
  const availableTypes = useMemo(
    () => getAvailableStructureTypes(structureTree),
    [structureTree]
  );

  // Re-validar al cambiar assignStructureLater
  useEffect(() => {
    trigger(); // Revalida todo el formulario, incluyendo las reglas de superRefine
  }, [watchAssignLater, trigger]);

  // --- Renderizado ---
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden max-h-[95vh] w-full max-w-4xl flex flex-col my-auto">
        {/* Encabezado y Pestañas (sin cambios visuales) */}
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
              <span>Acceso y Permisos</span>
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
          {/* Pestaña Info Personal (sin cambios) */}
          <div
            className={`${
              activeTab === "basic" ? "block" : "hidden"
            } space-y-6`}
          >
            {/* ... Contenido ... */}
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

          {/* Pestaña Acceso y Permisos (sin cambios) */}
          <div
            className={`${
              activeTab === "access" ? "block" : "hidden"
            } space-y-6`}
          >
            {/* ... Contenido ... */}
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

          {/* ----- Pestaña Estructuras (MODIFICADA) ----- */}
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

            {/* Contenido de la pestaña (solo si no hay error) */}
            {/* Renderizar incluso si isTreeLoading es true para que los selects existan pero estén disabled */}
            {/* {!treeError && ( */}
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
                      {errors.company_license_id && (
                        <p className="error-message">
                          {errors.company_license_id.message}
                        </p>
                      )}
                    </div>

                    {/* Selector de TIPO de estructura (Dinámico) */}
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
                              // Mostrar error si existe Y no se asigna más tarde
                              errors.structure_type && !watchAssignLater
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
                                shouldValidate: !watchAssignLater,
                              });
                              // Si el nuevo tipo es 'company', auto-seleccionar su ID (license_id)
                              if (
                                newType === "company" &&
                                structureTree?.license_id
                              ) {
                                setValue(
                                  "structure_id",
                                  structureTree.license_id,
                                  { shouldValidate: !watchAssignLater }
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
                      {errors.structure_type && !watchAssignLater && (
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

                      {/* El div wrapper es menos crucial aquí si el disabled del select funciona */}
                      {/* <div className={`${watchAssignLater || !watchedStructureType || isTreeLoading || !!treeError ? "opacity-50 cursor-not-allowed" : ""}`}> */}
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
                              // Mostrar error si existe Y no se asigna más tarde
                              errors.structure_id && !watchAssignLater
                                ? "input-error"
                                : ""
                            }
                          />
                        )}
                      />
                      {/* </div> */}
                      {errors.structure_id && !watchAssignLater && (
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
                                // Re-trigger validation when checkbox changes
                                trigger();
                              }}
                              className="sr-only peer"
                              // Deshabilitar si carga árbol o hay error? Puede ser confuso. Mejor permitir cambiarlo.
                              disabled={
                                isSavingInternal /*|| isTreeLoading || !!treeError*/
                              }
                            />
                            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            <span className="ms-3 text-sm font-medium text-gray-700 dark:text-gray-300">
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
            {/* )} Fin del condicional !treeError (removido para mostrar disabled selects) */}
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
