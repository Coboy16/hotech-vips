/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Building2,
  Users,
  FileEdit,
  MoreVertical,
  BarChart2,
  Clock,
  DoorClosed,
  Utensils,
  AlignCenter,
  AlertTriangle,
  Trash2,
} from "lucide-react";
import { toast } from "react-hot-toast";

// Importaciones de Servicios y Tipos (desde model)
import { licenseService } from "./services/licenseService";
import { moduleService } from "./services/moduleService"; // Importa moduleService
import { License, ApiLicense } from "../../../model/license";
import { ModuleFromApi } from "../../../model/module";
import {
  apiToUiLicense,
  formatDateForDisplay,
  licenseFormDataToApiCreateDto,
  licenseFormDataToApiUpdateDto,
  renewalFormDataToApiDto,
  // extractMainModules,
} from "./utils/adapters";
import { LicenseFormData, RenewLicenseFormData } from "./schemas/licenseSchema"; // Importa tipos Zod

// Importaciones de Componentes Presentacionales y Comunes
import Filters from "../../../components/common/table/Filters"; // Ajusta la ruta si es necesario
import { ColumnDefinition } from "../../../components/common/table/SortableTable"; // Ajusta la ruta
import LicensesSummary from "./components/LincensesComponets/LicensesSummary";
import LicenseContextMenu from "./components/LincensesComponets/LicenseContextMenu";
import LicenseList from "./components/LincensesComponets/LicenseList"; // Nuevo componente presentacional
import LicenseGridDisplay from "./components/LincensesComponets/LicenseGridDisplay"; // Nuevo componente presentacional

// Importaciones de Modales
import { LicenseForm } from "./components/LincensesComponets/LicenseForm";
import LicenseRenewalModal from "./components/LincensesComponets/LicenseRenewalModal";
import DeleteLicenseModal from "./components/LincensesComponets/DeleteLicenseModal";
// import LicenseHistoryModal from "./components/LicenseHistoryModal";
import { UserForm } from "./components/userComponets/UserForm";
import { formDataToApiCreateDto as userFormDataToApiDto } from "./utils/userAdapters";
import { UserFormData } from "./schemas/userSchema";
import { userService } from "./services/userService";
import { AvailableModuleOption } from "./components/userComponets/UserModuleSelector";

const permissionToLabelMap: Record<string, string> = {
  panel_monitoreo: "Panel de Monitoreo",
  empleados: "Empleados",
  gestion_empleados: "Gestión de Empleados",
  control_tiempo: "Control de Tiempo",
  planificador_horarios: "Planificador de horarios",
  gestion_incidencias: "Gestión de Incidencias",
  calendario: "Calendario",
  control_acceso: "Control de Acceso",
  visitantes: "Visitantes",
  permisos_acceso: "Permisos de Acceso",
  comedor: "Comedor",
  reportes: "Reportes",
  reportes_mas_usados: "Reportes más usados",
  // Añade aquí CUALQUIER otro 'name' de módulo que tu API pueda devolver
};

export function LicensesScreen() {
  // --- Estados del Contenedor ---
  const [licenses, setLicenses] = useState<License[]>([]); // Licencias en formato UI
  const [apiLicensesData, setApiLicensesData] = useState<ApiLicense[]>([]); // <-- GUARDAR DATA ORIGINAL API
  const [, setAllModules] = useState<ModuleFromApi[]>([]); // Módulos disponibles Globales
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado UI: Filtros, Vista, Paginación
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterExpiration, setFilterExpiration] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [sortKey, setSortKey] = useState<string>("companyName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Estado UI: Modales y Menú Contextual
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedLicenseForEdit, setSelectedLicenseForEdit] =
    useState<License | null>(null);
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [licenseToRenew, setLicenseToRenew] = useState<License | null>(null);
  const [isRenewing, setIsRenewing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [licenseToDelete, setLicenseToDelete] = useState<License | null>(null);
  // const [showHistoryModal, setShowHistoryModal] = useState(false);
  // const [licenseForHistory, setLicenseForHistory] = useState<License | null>(null); // Comentado si no se usa
  const [contextMenuLicense, setContextMenuLicense] = useState<License | null>(
    null
  );

  // --- NUEVO: Estados para UserForm ---
  const [showUserFormModal, setShowUserFormModal] = useState(false);
  const [selectedLicenseForUserCreation, setSelectedLicenseForUserCreation] =
    useState<License | null>(null);
  const [modulesForSelectedLicense, setModulesForSelectedLicense] = useState<
    AvailableModuleOption[]
  >([]); // Estado para módulos
  const [isSavingUser, setIsSavingUser] = useState(false);

  // --- Handlers UserForm ---
  const handleSaveUser = async (formData: UserFormData) => {
    if (!selectedLicenseForUserCreation) {
      toast.error("Error: No se ha especificado la licencia para el usuario.");
      return;
    }
    setIsSavingUser(true);
    console.log("Intentando guardar usuario con datos:", formData);

    // --- OBTENER MÓDULOS ORIGINALES DE LA LICENCIA ---
    // Necesitamos los datos de `modules_licence` de la ApiLicense original
    const originalApiLicense = apiLicensesData.find(
      (apiLic) => apiLic.license_id === selectedLicenseForUserCreation.id
    );

    if (!originalApiLicense) {
      toast.error(
        "Error interno: No se encontraron los datos originales de la licencia."
      );
      setIsSavingUser(false);
      return;
    }
    // Asegurarse de que modules_licence exista y sea un array (puede ser vacío)
    const originalLicenseModules = originalApiLicense.modules_licence || [];
    // --- FIN OBTENER MÓDULOS ---

    try {
      // --- PASAR MÓDULOS AL ADAPTADOR ---
      const userDto = userFormDataToApiDto(
        {
          ...formData,
          company_license_id: selectedLicenseForUserCreation.id,
        },
        originalLicenseModules // <-- Pasar el array original
      );
      // --- FIN PASAR MÓDULOS ---

      console.log("DTO a enviar:", userDto); // Log antes de enviar

      const newUser = await userService.register(userDto);

      if (newUser) {
        toast.success(`Usuario ${newUser.usua_nomb} creado exitosamente.`);
        setShowUserFormModal(false);
        setSelectedLicenseForUserCreation(null);
        setModulesForSelectedLicense([]);
      } else {
        console.error(
          "La creación del usuario falló (servicio devolvió null o error manejado)."
        );
        // Mantener modal abierto
      }
    } catch (error) {
      console.error("Error inesperado al guardar usuario:", error);
      toast.error("Ocurrió un error inesperado al crear el usuario.");
      // Mantener modal abierto
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleOpenUserForm = (license: License) => {
    console.log(
      "Abriendo formulario de usuario para licencia:",
      license.id,
      license.companyName
    );
    setSelectedLicenseForUserCreation(license);

    // --- Preparar Módulos Disponibles ---
    // Buscar la licencia original de la API usando el ID de la licencia UI
    const originalApiLicense = apiLicensesData.find(
      (apiLic) => apiLic.license_id === license.id
    );

    if (!originalApiLicense || !originalApiLicense.modules_licence) {
      console.warn(
        `No se encontraron datos de módulos detallados para la licencia ${license.id}`
      );
      setModulesForSelectedLicense([]); // Poner vacío si no hay módulos
    } else {
      const availableModules = originalApiLicense.modules_licence
        .map((ml) => {
          const moduleInfo = ml.module;
          return {
            id: moduleInfo.module_id,
            // Usar el mapa de etiquetas, o el 'name' como fallback, o el ID si todo falla
            label:
              permissionToLabelMap[moduleInfo.name] ||
              moduleInfo.name ||
              moduleInfo.module_id,
          };
        })
        .filter((mod) => mod.id && mod.label); // Asegurar que tenemos ID y Label

      console.log(
        "Módulos disponibles extraídos para UserForm:",
        availableModules
      );
      setModulesForSelectedLicense(availableModules);
    }

    setShowUserFormModal(true);
    setContextMenuLicense(null);
  };

  // --- Carga de Datos ---
  const loadLicensesAndModules = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Cargar módulos globales primero (usa caché interna)
      const modulesData = await moduleService.getAllModules();
      setAllModules(modulesData);

      // Cargar licencias (datos crudos de API)
      const apiLicenses = await licenseService.getAll();
      setApiLicensesData(apiLicenses); // <-- GUARDAR DATOS CRUDOS

      // Transformar a formato UI para mostrar
      const uiLicenses = apiLicenses.map((apiLic) => apiToUiLicense(apiLic));
      setLicenses(uiLicenses);
    } catch (err) {
      console.error("Error al cargar datos iniciales:", err);
      setError("Error al cargar datos. Intente recargar la página.");
      toast.error("Error al cargar datos.");
    } finally {
      setIsLoading(false);
    }
  }, []); // No necesita dependencias si solo se llama una vez

  useEffect(() => {
    loadLicensesAndModules();
  }, [loadLicensesAndModules]);

  // --- Lógica de Filtrado y Ordenamiento (Sin cambios relevantes) ---
  const filteredLicenses = licenses.filter((license) => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    const matchesSearch =
      license.companyName.toLowerCase().includes(lowerSearchTerm) ||
      license.id.toLowerCase().includes(lowerSearchTerm) ||
      license.rnc.includes(searchTerm);

    const matchesStatus =
      filterStatus === "all" || license.status === filterStatus;

    const matchesExpiration =
      filterExpiration === "all" ||
      (() => {
        if (!license.expirationDate) return false;
        try {
          const expirationDate = new Date(license.expirationDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          expirationDate.setHours(0, 0, 0, 0); // Comparar solo fechas
          const diffTime = expirationDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          switch (filterExpiration) {
            case "danger":
              return diffDays <= 30;
            case "warning":
              return diffDays > 30 && diffDays <= 90;
            case "safe":
              return diffDays > 90;
            default:
              return true;
          }
        } catch {
          return false;
        }
      })();

    return matchesSearch && matchesStatus && matchesExpiration;
  });

  // --- Definición de Columnas para la Tabla ---
  const columns: ColumnDefinition<License>[] = [
    {
      key: "companyName",
      header: "ID/Empresa",
      sortable: true,
      render: (license) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-gray-500" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {license.companyName}
            </div>
            <div className="text-sm text-gray-500">
              {license.id} • RNC: {license.rnc}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "allowedCompanies",
      header: "Compañías",
      sortable: true,
      sortKey: (license) =>
        license.allowedCompanies
          ? license.usedCompanies / license.allowedCompanies
          : 0, // Ordenar por % de uso
      render: (license) => (
        <>
          <div className="text-sm text-gray-900">
            {license.usedCompanies}/{license.allowedCompanies}
          </div>
          {license.allowedCompanies > 0 && (
            <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{
                  width: `${Math.min(
                    100,
                    (license.usedCompanies / license.allowedCompanies) * 100
                  )}%`,
                }}
              />
            </div>
          )}
        </>
      ),
    },
    {
      key: "allowedEmployees",
      header: "Empleados",
      sortable: true,
      sortKey: (license) =>
        license.allowedEmployees
          ? license.activeEmployees / license.allowedEmployees
          : 0,
      render: (license) => (
        <>
          <div className="text-sm text-gray-900">
            {license.activeEmployees}/{license.allowedEmployees}
          </div>
          {license.allowedEmployees > 0 && (
            <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{
                  width: `${Math.min(
                    100,
                    (license.activeEmployees / license.allowedEmployees) * 100
                  )}%`,
                }}
              />
            </div>
          )}
        </>
      ),
    },
    {
      key: "expirationDate",
      header: "Vencimiento",
      sortable: true,
      render: (license) => {
        const status = getExpirationStatus(license.expirationDate);
        const badgeClass =
          status === "danger"
            ? "bg-red-100 text-red-800"
            : status === "warning"
            ? "bg-yellow-100 text-yellow-800"
            : status === "success"
            ? "bg-green-100 text-green-800"
            : "bg-gray-100 text-gray-800";
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}
          >
            {formatDateForDisplay(license.expirationDate) || "N/A"}
          </span>
        );
      },
    },
    {
      key: "moduleNames",
      header: "Módulos",
      sortable: false, // Ordenar por moduleNames sería complejo
      render: (license) => (
        <div className="flex flex-wrap gap-2">
          {license.moduleNames && license.moduleNames.length > 0 ? (
            license.moduleNames.map((moduleName) => (
              <div
                key={moduleName}
                className="relative group"
                title={getModuleLabel(moduleName)}
              >
                {getModuleIcon(moduleName)}
              </div>
            ))
          ) : (
            <span className="text-gray-400 text-xs italic">Sin módulos</span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Estado",
      sortable: true,
      render: (license) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            license.status === "active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {license.status === "active" ? "Activo" : "Inactivo"}
        </span>
      ),
    },
    {
      key: "actions",
      header: " ",
      sortable: false,
      align: "right",
      cellClassName: "stopPropagation", // Evita que el click en acciones active onRowClick
      render: (license) => (
        <div className="flex items-center justify-end space-x-1 relative">
          {" "}
          {/* Relative para el menú contextual */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(license);
            }}
            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
            title="Editar"
          >
            <FileEdit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleOpenRenewModal(license);
            }}
            className="p-1 text-yellow-500 hover:bg-yellow-100 rounded"
            title="Renovar"
          >
            <AlertTriangle className="w-4 h-4" />
          </button>
          {/* <button
            onClick={(e) => {
              e.stopPropagation();
              handleOpenHistoryModal(license);
            }}
            className="p-1 text-purple-500 hover:bg-purple-100 rounded"
            title="Historial"
          >
            <Clock className="w-4 h-4" />
          </button> */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleOpenDeleteModal(license);
            }}
            className="p-1 text-red-500 hover:bg-red-100 rounded"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => handleOpenContextMenu(license, e)}
            className="p-1 text-gray-500 hover:bg-gray-100 rounded"
            title="Más acciones"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
          {/* Renderizar menú contextual si es para esta licencia */}
          {contextMenuLicense?.id === license.id && (
            <LicenseContextMenu
              license={license}
              isOpen={true}
              onClose={handleCloseContextMenu}
              onEdit={handleEdit}
              onRenew={handleOpenRenewModal}
              onExport={handleExportLicense}
              // onHistory={handleOpenHistoryModal}
              onDelete={handleOpenDeleteModal}
              onOpenUserForm={handleOpenUserForm}
            />
          )}
        </div>
      ),
    },
  ];
  // Ordenamiento (aplicado antes de paginar para la lista)
  const sortedLicenses = [...filteredLicenses].sort((a, b) => {
    const column = columns.find((col) => col.key === sortKey);
    if (!column?.sortable) return 0;

    let valueA: any;
    let valueB: any;
    const sortKeyPath = column.sortKey || sortKey;

    if (typeof sortKeyPath === "function") {
      valueA = sortKeyPath(a);
      valueB = sortKeyPath(b);
    } else {
      // Acceder a propiedades anidadas si es necesario (ej: contactInfo.name)
      const keys = sortKeyPath.split(".");
      valueA = keys.reduce(
        (obj, key) => obj?.[key as keyof typeof obj],
        a as any
      );
      valueB = keys.reduce(
        (obj, key) => obj?.[key as keyof typeof obj],
        b as any
      );
    }

    // Comparación
    if (valueA === valueB) return 0;
    if (valueA == null) return sortDirection === "asc" ? -1 : 1; // nulls primero o último
    if (valueB == null) return sortDirection === "asc" ? 1 : -1;

    if (typeof valueA === "string" && typeof valueB === "string") {
      return sortDirection === "asc"
        ? valueA.localeCompare(valueB, undefined, { sensitivity: "base" })
        : valueB.localeCompare(valueA, undefined, { sensitivity: "base" });
    }

    // Comparación numérica o de fechas (asumiendo que las fechas ya son comparables)
    const comparison = valueA < valueB ? -1 : 1;
    return sortDirection === "asc" ? comparison : -comparison;
  });

  // Paginación (para la vista de lista)
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLicensesForList = sortedLicenses.slice(startIndex, endIndex);

  // --- Handlers de UI ---
  const handleFilterChange = (filterName: string, value: string) => {
    // Mapea el nombre del filtro al estado correspondiente
    const setters: Record<
      string,
      React.Dispatch<React.SetStateAction<string>>
    > = {
      status: setFilterStatus,
      // module: setFilterModule,
      expiration: setFilterExpiration,
    };
    if (setters[filterName]) {
      setters[filterName](value);
      setCurrentPage(1); // Resetear paginación al cambiar filtros
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    // setFilterModule("all");
    setFilterExpiration("all");
    setCurrentPage(1);
    setSortKey("companyName"); // Resetear ordenamiento
    setSortDirection("asc");
  };

  const handleViewModeChange = (mode: "list" | "grid") => {
    setViewMode(mode);
    // Podrías ajustar itemsPerPage según la vista si quieres
    // setItemsPerPage(mode === 'list' ? 10 : 12);
    // setCurrentPage(1);
  };

  const handleSort = (key: string, direction: "asc" | "desc") => {
    setSortKey(key);
    setSortDirection(direction);
    setCurrentPage(1); // Resetear paginación al ordenar
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Resetear a la primera página
  };

  // --- Handlers de Acciones CRUD ---
  const handleCreateNew = () => {
    setSelectedLicenseForEdit(null); // Asegura modo creación
    setShowFormModal(true);
  };

  const handleEdit = async (license: License) => {
    // Opcional: Recargar datos frescos antes de editar
    setIsLoading(true); // Mostrar indicador de carga brevemente
    const freshApiLicense = await licenseService.getById(license.id);
    setIsLoading(false);

    if (freshApiLicense) {
      setSelectedLicenseForEdit(apiToUiLicense(freshApiLicense));
    } else {
      toast.error(
        "No se pudo cargar la información actualizada de la licencia."
      );
      setSelectedLicenseForEdit(license); // Usar la data existente si falla la recarga
    }
    setShowFormModal(true); // Asegúrate de que esto esté activando la visualización del modal
    setContextMenuLicense(null); // Cerrar menú contextual si estaba abierto
  };

  const handleSaveLicense = async (formData: LicenseFormData) => {
    setIsSaving(true);
    try {
      let result: ApiLicense | null = null;
      let successMessage = "";

      if (selectedLicenseForEdit) {
        // --- Actualización ---
        console.log(
          "Actualizando licencia:",
          selectedLicenseForEdit.id,
          formData
        );
        const updateDto = licenseFormDataToApiUpdateDto(formData);
        result = await licenseService.update(
          selectedLicenseForEdit.id,
          updateDto
        );
        successMessage = "Licencia actualizada correctamente";
      } else {
        // --- Creación ---
        console.log("Creando licencia:", formData);
        const createDto = licenseFormDataToApiCreateDto(formData);
        result = await licenseService.create(createDto);
        successMessage = "Licencia creada correctamente";
      }

      if (result) {
        const updatedUiLicense = apiToUiLicense(result);
        // Actualizar el estado local
        setLicenses((prevLicenses) => {
          const index = prevLicenses.findIndex(
            (l) => l.id === updatedUiLicense.id
          );
          if (index > -1) {
            // Reemplazar existente
            const newLicenses = [...prevLicenses];
            newLicenses[index] = updatedUiLicense;
            return newLicenses;
          } else {
            // Añadir nueva
            return [...prevLicenses, updatedUiLicense];
          }
        });
        toast.success(successMessage);
        setShowFormModal(false); // Cerrar modal al guardar
      } else {
        // El servicio ya debería haber mostrado un toast de error
        console.error("Falló la operación de guardado.");
        // Mantener el modal abierto para que el usuario corrija
      }
    } catch (error) {
      // Error inesperado (no manejado por makeRequest/interceptor)
      console.error("Error inesperado al guardar licencia:", error);
      toast.error("Ocurrió un error inesperado al guardar.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenRenewModal = (license: License) => {
    setLicenseToRenew(license);
    setShowRenewalModal(true);
    setContextMenuLicense(null);
  };

  const handleRenewLicense = async (renewalData: RenewLicenseFormData) => {
    if (!licenseToRenew) return;
    setIsRenewing(true);
    try {
      const renewDto = renewalFormDataToApiDto(renewalData);
      const result = await licenseService.renew(licenseToRenew.id, renewDto); // Usa el método renew

      if (result) {
        const renewedUiLicense = apiToUiLicense(result);
        // Actualizar estado local
        setLicenses((prev) =>
          prev.map((lic) =>
            lic.id === renewedUiLicense.id ? renewedUiLicense : lic
          )
        );
        toast.success("Licencia renovada correctamente");
        setShowRenewalModal(false);
        setLicenseToRenew(null);
      } else {
        // El servicio ya mostró el error
      }
    } catch (error) {
      console.error("Error inesperado al renovar licencia:", error);
      toast.error("Ocurrió un error inesperado al renovar.");
    } finally {
      setIsRenewing(false);
    }
  };

  const handleOpenDeleteModal = (license: License) => {
    setLicenseToDelete(license);
    setShowDeleteModal(true);
    setContextMenuLicense(null);
  };

  const confirmDeleteLicense = async () => {
    if (!licenseToDelete) return;
    setIsLoading(true); // Podría usar un estado isDeleting si prefieres
    try {
      const success = await licenseService.delete(licenseToDelete.id);
      if (success) {
        setLicenses((prev) =>
          prev.filter((lic) => lic.id !== licenseToDelete!.id)
        );
        toast.success("Licencia eliminada correctamente");
        setShowDeleteModal(false);
        setLicenseToDelete(null);
      } else {
        // El servicio ya mostró el error
      }
    } catch (error) {
      console.error("Error inesperado al eliminar licencia:", error);
      toast.error("Ocurrió un error inesperado al eliminar.");
    } finally {
      setIsLoading(false);
    }
  };

  // const handleOpenHistoryModal = (license: License) => {
  //   setLicenseForHistory(license);
  //   setShowHistoryModal(true);
  //   setContextMenuLicense(null);
  // };

  const handleExportLicense = (license: License) => {
    console.log("Exportar datos de licencia:", license.id);
    toast("Funcionalidad de exportación no implementada", { icon: "ℹ️" });
    setContextMenuLicense(null);
  };

  // --- Handlers Menú Contextual ---
  const handleOpenContextMenu = (license: License, e: React.MouseEvent) => {
    e.stopPropagation();
    setContextMenuLicense((prev) => (prev?.id === license.id ? null : license));
  };

  const handleCloseContextMenu = () => {
    setContextMenuLicense(null);
  };

  // --- Helpers para Renderizado (Iconos, Tooltips, etc.) ---
  const getModuleIcon = (moduleName: string) => {
    const iconMap: Record<string, React.ElementType> = {
      panel_monitoreo: BarChart2,
      empleados: Users,
      control_tiempo: Clock,
      control_acceso: DoorClosed,
      comedor: Utensils,
      reportes: AlignCenter,
    };
    return React.createElement(iconMap[moduleName] || AlertTriangle, {
      className: "w-5 h-5 text-blue-500",
    });
  };

  const getModuleLabel = (moduleName: string): string => {
    const labels: Record<string, string> = {
      panel_monitoreo: "Panel de Monitoreo",
      empleados: "Empleados",
      control_tiempo: "Control de Tiempo",
      control_acceso: "Control de Acceso",
      comedor: "Comedor",
      reportes: "Reportes",
    };
    return labels[moduleName] || moduleName;
  };

  const getExpirationStatus = (
    dateString: string | undefined
  ): "danger" | "warning" | "success" | "unknown" => {
    if (!dateString) return "unknown";
    try {
      const expirationDate = new Date(dateString);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      expirationDate.setHours(0, 0, 0, 0); // Comparar solo fechas
      const diffTime = expirationDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 30) return "danger";
      if (diffDays <= 90) return "warning";
      return "success";
    } catch {
      return "unknown";
    }
  };

  // --- Renderizado del Contenedor ---
  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-4 sm:p-8">
        {" "}
        {/* Padding ajustado */}
        {/* Encabezado y Botón de Crear */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
              Gestión de Licencias
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Administra las licencias y permisos.
            </p>
          </div>
          <button
            onClick={handleCreateNew}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm sm:text-base"
          >
            <Plus className="w-5 h-5" />
            <span>Nueva Licencia</span>
          </button>
        </div>
        {/* Resumen */}
        <LicensesSummary licenses={licenses} />
        {/* Filtros */}
        <Filters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Buscar por empresa, ID o RNC..."
          filterValues={{
            status: filterStatus,
            expiration: filterExpiration /*, module: filterModule*/,
          }}
          onFilterChange={handleFilterChange}
          filterOptions={{
            // Define opciones directamente aquí o impórtalas
            status: {
              label: "Estado",
              options: [
                { value: "all", label: "Todos" },
                { value: "active", label: "Activo" },
                { value: "inactive", label: "Inactivo" },
              ],
            },
            expiration: {
              label: "Vencimiento",
              options: [
                { value: "all", label: "Todos" },
                { value: "danger", label: "Crítico (<30d)" },
                { value: "warning", label: "Próximo (31-90d)" },
                { value: "safe", label: "Seguro (>90d)" },
              ],
            },
            // module: { label: "Módulo", options: [{ value: "all", label: "Todos" }, /* ...opciones de módulos... */] }
          }}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          onResetFilters={handleResetFilters}
        />
        {/* Indicador de Error General */}
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        {/* Contenido Principal: Lista o Cuadrícula */}
        {viewMode === "list" ? (
          <LicenseList
            licenses={paginatedLicensesForList} // Pasa las licencias paginadas y ordenadas
            columns={columns}
            isLoading={isLoading && licenses.length === 0} // Muestra loading solo en carga inicial
            emptyMessage="No se encontraron licencias con los filtros aplicados."
            pagination={{
              currentPage,
              totalItems: filteredLicenses.length,
              itemsPerPage,
              onPageChange: handlePageChange,
              onItemsPerPageChange: handleItemsPerPageChange,
            }}
            sorting={{ sortKey, sortDirection, onSort: handleSort }}
            onRowClick={handleEdit} // Acción al hacer clic en la fila
          />
        ) : (
          <LicenseGridDisplay
            licenses={filteredLicenses} // Pasa todas las filtradas, Grid pagina internamente
            isLoading={isLoading && licenses.length === 0}
            emptyMessage="No se encontraron licencias con los filtros aplicados."
            pagination={{
              // Aunque Grid pagine internamente, podrías necesitar estos datos si cambias la lógica
              currentPage: 1, // El grid maneja su propia página
              totalItems: filteredLicenses.length,
              itemsPerPage: 12, // Valor por defecto del grid
              onPageChange: () => {}, // No necesario si el grid pagina solo
              onItemsPerPageChange: () => {}, // No necesario
            }}
            contextMenu={{
              contextMenuLicense,
              // Función para renderizar el menú contextual
              renderContextMenu: (license) => (
                <LicenseContextMenu
                  license={license}
                  isOpen={true}
                  onClose={handleCloseContextMenu}
                  onEdit={handleEdit}
                  onRenew={handleOpenRenewModal}
                  onExport={handleExportLicense}
                  // onHistory={handleOpenHistoryModal}
                  onDelete={handleOpenDeleteModal}
                  onOpenUserForm={handleOpenUserForm}
                />
              ),
            }}
            onCardClick={handleEdit}
            onMenuClick={handleOpenContextMenu}
            // Pasa handlers para acciones rápidas de la tarjeta
            onRenew={handleOpenRenewModal}
            onHistory={() => {}} // No-op function for unimplemented history feature
            onDelete={handleOpenDeleteModal}
          />
        )}
      </div>

      {/* --- Modales --- */}
      {showFormModal && (
        <LicenseForm
          license={selectedLicenseForEdit}
          onClose={() => setShowFormModal(false)}
          onSave={handleSaveLicense}
          isLoading={isSaving} // Pasa el estado de carga
        />
      )}

      {showRenewalModal && licenseToRenew && (
        <LicenseRenewalModal
          license={licenseToRenew}
          onClose={() => setShowRenewalModal(false)}
          onRenewed={handleRenewLicense}
          isProcessing={isRenewing} // Pasa el estado de carga
        />
      )}

      {showDeleteModal && licenseToDelete && (
        <DeleteLicenseModal
          license={licenseToDelete}
          onDelete={confirmDeleteLicense}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}

      {/* {showHistoryModal && licenseForHistory && (
        <LicenseHistoryModal
          license={licenseForHistory}
          onClose={() => setShowHistoryModal(false)}
        />
      )} */}

      {/* --- NUEVO: Modal de Formulario de Usuario --- */}
      {showUserFormModal && selectedLicenseForUserCreation && (
        <UserForm
          // user={null} // Siempre para creación en este flujo
          onClose={() => {
            setShowUserFormModal(false);
            setSelectedLicenseForUserCreation(null); // Limpiar al cerrar
          }}
          onSave={handleSaveUser} // Handler que llama al servicio
          isLoading={isSavingUser} // Estado de carga específico
          licenseInfo={{
            // Pasar info de la licencia seleccionada
            id: selectedLicenseForUserCreation.id,
            name: selectedLicenseForUserCreation.companyName,
            code: selectedLicenseForUserCreation.rnc, // Usar RNC como código o ajustar si hay otro
          }}
          availableModules={modulesForSelectedLicense}
        />
      )}
    </div>
  );
}

export default LicensesScreen;
