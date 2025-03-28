// src/features/system_configuration/companies/components/NodeForm.tsx
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Briefcase, Building2, Users, FolderTree, Save } from "lucide-react";
import {
  OrganizationalNode,
  NodeType,
} from "../../../../model/organizationalStructure";
import {
  NodeFormData,
  nodeFormSchema,
  NodeFormDefaultValues,
} from "../schemas/nodeSchema"; // Importa schema/tipos Zod
import { useCountries } from "../hooks/useCountries"; // Hook para obtener países

// Configuración de tipos de nodo (podría moverse a un archivo utilitario)
const nodeTypesConfig: Record<
  NodeType,
  { label: string; icon: React.ElementType; parentType?: NodeType }
> = {
  company: { label: "Compañía", icon: Building2 },
  branch: { label: "Sucursal", icon: Building2, parentType: "company" }, // Asumiendo icono Building2 genérico para sucursal
  department: { label: "Departamento", icon: Users, parentType: "branch" },
  section: { label: "Sección", icon: FolderTree, parentType: "department" },
  unit: { label: "Unidad", icon: Briefcase, parentType: "section" },
};

interface NodeFormProps {
  node?: OrganizationalNode | null; // Nodo existente a editar (formato UI)
  parentNode?: OrganizationalNode | null; // Nodo padre si se está creando un hijo
  onClose: () => void;
  onSubmit: (data: NodeFormData, type: NodeType) => void; // Envía datos validados y el tipo
  isLoading?: boolean; // Para deshabilitar botón mientras guarda
}

export function NodeForm({
  node,
  parentNode,
  onClose,
  onSubmit,
  isLoading = false,
}: NodeFormProps) {
  // Determinar el tipo de nodo a crear/editar
  // Si editamos, usamos el tipo del nodo. Si creamos, inferimos del padre o default a 'company'.
  const determineNodeType = (): NodeType => {
    if (node) return node.type; // Editando: usa el tipo existente
    if (parentNode) {
      // Creando hijo: infiere del padre
      const childType = getChildNodeType(parentNode.type);
      return childType || "unit"; // Default a 'unit' si el padre no puede tener hijos (?)
    }
    return "company"; // Creando raíz: es una compañía
  };

  const nodeTypeToHandle = determineNodeType();
  const nodeConfig = nodeTypesConfig[nodeTypeToHandle];

  // Hook para obtener países (solo necesario si creamos/editamos compañía)
  const { countries, loading: loadingCountries } = useCountries();

  // --- React Hook Form Setup ---
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
    watch,
    setValue, // Para establecer el tipo dinámicamente
  } = useForm<NodeFormData>({
    resolver: zodResolver(nodeFormSchema), // Usar el schema Zod combinado
    mode: "onChange",
    defaultValues: (): NodeFormDefaultValues => {
      // Función para calcular valores por defecto
      const defaults: NodeFormDefaultValues = {
        name: node?.name || "",
        type: nodeTypeToHandle, // Establecer el tipo correcto
        status: node?.status || "active",
        code: node?.code || "",
        description: node?.description || "",
        metadata: {
          employeeCount: node?.metadata?.employeeCount ?? 0,
          countryId:
            node?.metadata?.countryId ||
            (countries.length > 0 ? countries[0].pais_iden : ""),
          address: node?.metadata?.address || "",
          contact: {
            managerFullName: node?.metadata?.contact?.managerFullName || "",
            position: node?.metadata?.contact?.position || "",
            email: node?.metadata?.contact?.email || "",
            phone: node?.metadata?.contact?.phone || "",
            extension: node?.metadata?.contact?.extension || "",
            physicalLocation: {
              building:
                node?.metadata?.contact?.physicalLocation?.building || "",
              floor: node?.metadata?.contact?.physicalLocation?.floor || "",
              office: node?.metadata?.contact?.physicalLocation?.office || "",
            },
          },
        },
      };
      return defaults;
    },
  });

  // Establecer el tipo en RHF una vez determinado
  useEffect(() => {
    setValue("type", nodeTypeToHandle);
  }, [nodeTypeToHandle, setValue]);

  // Resetear el formulario si el nodo o padre cambian
  useEffect(() => {
    reset(
      // Función para calcular valores por defecto
      {
        name: node?.name || "",
        type: nodeTypeToHandle, // Usa el tipo determinado
        status: node?.status || "active",
        code: node?.code || "",
        description: node?.description || "",
        metadata: {
          employeeCount: node?.metadata?.employeeCount ?? 0,
          countryId:
            node?.metadata?.countryId ||
            (countries.length > 0 ? countries[0].pais_iden : ""),
          address: node?.metadata?.address || "",
          contact: {
            managerFullName: node?.metadata?.contact?.managerFullName || "",
            position: node?.metadata?.contact?.position || "",
            email: node?.metadata?.contact?.email || "",
            phone: node?.metadata?.contact?.phone || "",
            extension: node?.metadata?.contact?.extension || "",
            physicalLocation: {
              building:
                node?.metadata?.contact?.physicalLocation?.building || "",
              floor: node?.metadata?.contact?.physicalLocation?.floor || "",
              office: node?.metadata?.contact?.physicalLocation?.office || "",
            },
          },
        },
      }
    );
  }, [node, parentNode, nodeTypeToHandle, reset, countries]); // Depende de countries para default countryId

  // --- Handlers ---
  const handleFormSubmit = (data: NodeFormData) => {
    // Asegurarse que el 'type' es correcto antes de enviar
    const finalData = { ...data, type: nodeTypeToHandle };
    console.log(`Submit ${nodeTypeToHandle}:`, finalData);
    onSubmit(finalData, nodeTypeToHandle); // Llama a la prop onSubmit
  };

  // Observar tipo para mostrar campos condicionales
  const watchedType = watch("type", nodeTypeToHandle);

  // --- Renderizado ---
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Encabezado Fijo */}
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center space-x-3">
            {React.createElement(nodeConfig?.icon || Building2, {
              className: "w-6 h-6 text-blue-600",
            })}
            <h2 className="text-xl font-semibold text-gray-900">
              {node
                ? `Editar ${nodeConfig?.label}`
                : `Nuevo ${nodeConfig?.label}`}
              {parentNode && (
                <span className="text-sm text-gray-500 ml-2">
                  (en {parentNode.name})
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Formulario con Scroll */}
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="flex-1 overflow-y-auto p-6"
        >
          <div className="space-y-6">
            {/* --- Datos Generales --- */}
            <fieldset className="border p-4 rounded-md border-gray-200">
              <legend className="text-sm font-medium px-2 text-gray-700">
                Datos Generales
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {/* Nombre */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    {...register("name")}
                    className={`input-field ${
                      errors.name ? "border-red-500" : ""
                    }`}
                  />
                  {errors.name && (
                    <p className="error-message">{errors.name.message}</p>
                  )}
                </div>

                {/* Código / RNC */}
                <div>
                  <label
                    htmlFor="code"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    {watchedType === "company"
                      ? "RNC / Identificación"
                      : "Código"}
                    {watchedType === "company" && (
                      <span className="text-red-500">*</span>
                    )}
                  </label>
                  <input
                    id="code"
                    type="text"
                    {...register("code")} // Zod se encarga de la validación condicional
                    className={`input-field ${
                      errors.code ? "border-red-500" : ""
                    }`}
                  />
                  {errors.code && (
                    <p className="error-message">{errors.code.message}</p>
                  )}
                </div>

                {/* Estado */}
                <div>
                  <label
                    htmlFor="status"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Estado <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="status"
                    {...register("status")}
                    className={`input-field ${
                      errors.status ? "border-red-500" : ""
                    }`}
                  >
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                  </select>
                  {errors.status && (
                    <p className="error-message">{errors.status.message}</p>
                  )}
                </div>

                {/* País (Solo para Compañía) */}
                {watchedType === "company" && (
                  <div>
                    <label
                      htmlFor="metadata.countryId"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      País <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="metadata.countryId"
                      {...register("metadata.countryId")}
                      className={`input-field ${
                        errors.metadata?.countryId ? "border-red-500" : ""
                      }`}
                      disabled={loadingCountries}
                    >
                      {loadingCountries ? (
                        <option value="">Cargando...</option>
                      ) : countries.length === 0 ? (
                        <option value="">No hay países</option>
                      ) : (
                        <>
                          <option value="">Seleccione un país</option>
                          {countries.map((country) => (
                            <option
                              key={country.pais_iden}
                              value={country.pais_iden}
                            >
                              {country.pais_desc}
                            </option>
                          ))}
                        </>
                      )}
                    </select>
                    {errors.metadata?.countryId && (
                      <p className="error-message">
                        {errors.metadata.countryId.message}
                      </p>
                    )}
                  </div>
                )}

                {/* Dirección (Solo para Sucursal) */}
                {watchedType === "branch" && (
                  <div className="md:col-span-2">
                    <label
                      htmlFor="metadata.address"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Dirección
                    </label>
                    <input
                      id="metadata.address"
                      type="text"
                      {...register("metadata.address")}
                      className={`input-field ${
                        errors.metadata?.address ? "border-red-500" : ""
                      }`}
                    />
                    {errors.metadata?.address && (
                      <p className="error-message">
                        {errors.metadata.address.message}
                      </p>
                    )}
                  </div>
                )}

                {/* Descripción */}
                <div className="md:col-span-2">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Descripción
                  </label>
                  <textarea
                    id="description"
                    rows={2}
                    {...register("description")}
                    className={`input-field ${
                      errors.description ? "border-red-500" : ""
                    }`}
                  />
                  {errors.description && (
                    <p className="error-message">
                      {errors.description.message}
                    </p>
                  )}
                </div>
              </div>
            </fieldset>

            {/* --- Información de Contacto --- */}
            <fieldset className="border p-4 rounded-md border-gray-200">
              <legend className="text-sm font-medium px-2 text-gray-700">
                Información de Contacto (Opcional)
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {/* Nombre Responsable */}
                <div>
                  <label
                    htmlFor="metadata.contact.managerFullName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Nombre Responsable
                  </label>
                  <input
                    id="metadata.contact.managerFullName"
                    type="text"
                    {...register("metadata.contact.managerFullName")}
                    className={`input-field ${
                      errors.metadata?.contact?.managerFullName
                        ? "border-red-500"
                        : ""
                    }`}
                  />
                  {errors.metadata?.contact?.managerFullName && (
                    <p className="error-message">
                      {errors.metadata.contact.managerFullName.message}
                    </p>
                  )}
                </div>
                {/* Cargo */}
                <div>
                  <label
                    htmlFor="metadata.contact.position"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Cargo
                  </label>
                  <input
                    id="metadata.contact.position"
                    type="text"
                    {...register("metadata.contact.position")}
                    className={`input-field ${
                      errors.metadata?.contact?.position ? "border-red-500" : ""
                    }`}
                  />
                  {errors.metadata?.contact?.position && (
                    <p className="error-message">
                      {errors.metadata.contact.position.message}
                    </p>
                  )}
                </div>
                {/* Email */}
                <div>
                  <label
                    htmlFor="metadata.contact.email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email
                  </label>
                  <input
                    id="metadata.contact.email"
                    type="email"
                    {...register("metadata.contact.email")}
                    className={`input-field ${
                      errors.metadata?.contact?.email ? "border-red-500" : ""
                    }`}
                  />
                  {errors.metadata?.contact?.email && (
                    <p className="error-message">
                      {errors.metadata.contact.email.message}
                    </p>
                  )}
                </div>
                {/* Teléfono */}
                <div>
                  <label
                    htmlFor="metadata.contact.phone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Teléfono
                  </label>
                  <input
                    id="metadata.contact.phone"
                    type="tel"
                    {...register("metadata.contact.phone")}
                    className={`input-field ${
                      errors.metadata?.contact?.phone ? "border-red-500" : ""
                    }`}
                  />
                  {errors.metadata?.contact?.phone && (
                    <p className="error-message">
                      {errors.metadata.contact.phone.message}
                    </p>
                  )}
                </div>
                {/* Extensión */}
                <div>
                  <label
                    htmlFor="metadata.contact.extension"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Extensión
                  </label>
                  <input
                    id="metadata.contact.extension"
                    type="text"
                    {...register("metadata.contact.extension")}
                    className={`input-field ${
                      errors.metadata?.contact?.extension
                        ? "border-red-500"
                        : ""
                    }`}
                  />
                  {errors.metadata?.contact?.extension && (
                    <p className="error-message">
                      {errors.metadata.contact.extension.message}
                    </p>
                  )}
                </div>
              </div>
            </fieldset>

            {/* --- Ubicación Física --- */}
            <fieldset className="border p-4 rounded-md border-gray-200">
              <legend className="text-sm font-medium px-2 text-gray-700">
                Ubicación Física (Opcional)
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                {/* Edificio */}
                <div>
                  <label
                    htmlFor="metadata.contact.physicalLocation.building"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Edificio
                  </label>
                  <input
                    id="metadata.contact.physicalLocation.building"
                    type="text"
                    {...register("metadata.contact.physicalLocation.building")}
                    className={`input-field ${
                      errors.metadata?.contact?.physicalLocation?.building
                        ? "border-red-500"
                        : ""
                    }`}
                  />
                  {errors.metadata?.contact?.physicalLocation?.building && (
                    <p className="error-message">
                      {
                        errors.metadata.contact.physicalLocation.building
                          .message
                      }
                    </p>
                  )}
                </div>
                {/* Piso */}
                <div>
                  <label
                    htmlFor="metadata.contact.physicalLocation.floor"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Piso
                  </label>
                  <input
                    id="metadata.contact.physicalLocation.floor"
                    type="text"
                    {...register("metadata.contact.physicalLocation.floor")}
                    className={`input-field ${
                      errors.metadata?.contact?.physicalLocation?.floor
                        ? "border-red-500"
                        : ""
                    }`}
                  />
                  {errors.metadata?.contact?.physicalLocation?.floor && (
                    <p className="error-message">
                      {errors.metadata.contact.physicalLocation.floor.message}
                    </p>
                  )}
                </div>
                {/* Oficina */}
                <div>
                  <label
                    htmlFor="metadata.contact.physicalLocation.office"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Oficina
                  </label>
                  <input
                    id="metadata.contact.physicalLocation.office"
                    type="text"
                    {...register("metadata.contact.physicalLocation.office")}
                    className={`input-field ${
                      errors.metadata?.contact?.physicalLocation?.office
                        ? "border-red-500"
                        : ""
                    }`}
                  />
                  {errors.metadata?.contact?.physicalLocation?.office && (
                    <p className="error-message">
                      {errors.metadata.contact.physicalLocation.office.message}
                    </p>
                  )}
                </div>
              </div>
            </fieldset>

            {/* --- Otros Metadatos --- */}
            <fieldset className="border p-4 rounded-md border-gray-200">
              <legend className="text-sm font-medium px-2 text-gray-700">
                Otros Datos (Opcional)
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {/* Cantidad Empleados */}
                <div>
                  <label
                    htmlFor="metadata.employeeCount"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Cantidad Empleados
                  </label>
                  <input
                    id="metadata.employeeCount"
                    type="number"
                    min="0"
                    {...register("metadata.employeeCount")}
                    className={`input-field ${
                      errors.metadata?.employeeCount ? "border-red-500" : ""
                    }`}
                  />
                  {errors.metadata?.employeeCount && (
                    <p className="error-message">
                      {errors.metadata.employeeCount.message}
                    </p>
                  )}
                </div>
                {/* Puedes añadir más campos de metadata aquí si es necesario */}
              </div>
            </fieldset>
          </div>

          {/* Placeholder para evitar que los botones fijos tapen contenido */}
          <div className="h-16"></div>
        </form>

        {/* Botones de Acción Fijos */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end space-x-3 sticky bottom-0 bg-white z-10">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button" // Cambiado a button, el submit se maneja con onClick
            onClick={handleSubmit(handleFormSubmit)} // Llama a RHF handleSubmit aquí
            disabled={isLoading || !isValid || !isDirty} // Deshabilitar si carga, no es válido o no ha cambiado
            className="flex items-center justify-center min-w-[150px] px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isLoading
              ? "Guardando..."
              : node
              ? "Guardar cambios"
              : `Crear ${nodeConfig?.label}`}
          </button>
        </div>

        {/* Estilos CSS (igual que en LicenseForm) */}
        <style>{`
          .input-field {
            display: block;
            width: 100%;
            padding: 0.5rem 0.75rem;
            border: 1px solid #d1d5db;
            border-radius: 0.375rem;
            box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
            transition: border-color 0.2s, box-shadow 0.2s;
          }
          .input-field:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 2px #bfdbfe;
          }
          .input-field.border-red-500 {
            border-color: #ef4444;
          }
          .input-field.border-red-500:focus {
            box-shadow: 0 0 0 2px #fecaca;
          }
          .error-message {
            color: #ef4444;
            font-size: 0.75rem;
            margin-top: 0.25rem;
          }
        `}</style>
      </div>
    </div>
  );
}
