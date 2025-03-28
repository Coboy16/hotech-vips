import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { licenseService } from "./services/licenseService";
import {
  apiToUiLicense,
  formatDateDisplay,
  uiToApiCreateLicense,
  uiToApiUpdateLicense,
} from "./utils/adapters";
import { LicenseForm } from "./components/LicenseForm";
import type { License } from "./types/license";
import { toast } from "react-hot-toast";

// Componentes reutilizables
import Filters from "../../../components/common/table/Filters";
import SortableTable, {
  ColumnDefinition,
} from "../../../components/common/table/SortableTable";
import Pagination from "../../../components/common/table/Pagination";

// import Filters from "./components/screen_components/Filters";
import LicenseGrid from "./components/LicenseGrid";
import LicenseContextMenu from "./components/LicenseContextMenu";
import LicensesSummary from "./components/LicensesSummary";
import LicenseRenewalModal from "./components/LicenseRenewalModal";
import DeleteLicenseModal from "./components/DeleteLicenseModal";
import LicenseHistoryModal from "./components/LicenseHistoryModal";

export function LicensesScreen() {
  // Estados básicos
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estados para filtrado avanzado
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterModule, setFilterModule] = useState("all");
  const [filterExpiration, setFilterExpiration] = useState("all");

  // Estado para vista y ordenamiento
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [sortKey, setSortKey] = useState<string>("companyName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  //Estados para modal de renovacion
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [licenseToRenew, setLicenseToRenew] = useState<License | null>(null);

  // Estado para menú contextual
  const [contextMenuLicense, setContextMenuLicense] = useState<License | null>(
    null
  );

  // Añadir estos estados en la sección de estados del componente LicensesScreen
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [licenseToDelete, setLicenseToDelete] = useState<License | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [licenseForHistory, setLicenseForHistory] = useState<License | null>(
    null
  );

  // Reemplazar la función handleRenewLicense existente con esta:
  const handleRenewLicense = (license: License) => {
    setLicenseToRenew(license);
    setShowRenewalModal(true);
    // Cerrar el menú contextual si está abierto
    if (contextMenuLicense) {
      setContextMenuLicense(null);
    }
  };

  // Función para manejar cuando una licencia ha sido renovada
  const handleLicenseRenewed = (updatedLicense: License) => {
    // Actualizar la licencia en el estado local
    setLicenses(
      licenses.map((lic) =>
        lic.id === updatedLicense.id ? updatedLicense : lic
      )
    );
    // Cerrar el modal
    setShowRenewalModal(false);
    setLicenseToRenew(null);
  };

  // Cargar licencias al montar el componente
  useEffect(() => {
    loadLicenses();
  }, []);

  // Función para cargar licencias desde la API
  const loadLicenses = async () => {
    setIsLoading(true);
    try {
      const apiLicenses = await licenseService.getAll();
      // Transformar las licencias de la API a nuestro formato interno
      const uiLicenses = apiLicenses.map(apiToUiLicense);
      setLicenses(uiLicenses);
    } catch (error) {
      console.error("Error al cargar licencias:", error);
      toast.error("Error al cargar las licencias");
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar licencias según los criterios seleccionados
  const filteredLicenses = licenses.filter((license) => {
    // Filtro por término de búsqueda
    const matchesSearch =
      license.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      license.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      license.rnc.includes(searchTerm);

    // Filtro por estado
    const matchesStatus =
      filterStatus === "all" || license.status === filterStatus;

    // Filtro por módulo
    const matchesModule =
      filterModule === "all" || license.modules.includes(filterModule);

    // Filtro por vencimiento
    const matchesExpiration =
      filterExpiration === "all" ||
      (() => {
        const expirationDate = new Date(license.expirationDate);
        const today = new Date();
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
      })();

    return matchesSearch && matchesStatus && matchesModule && matchesExpiration;
  });

  // Calcular las licencias paginadas (para la vista de lista)
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLicenses = filteredLicenses.slice(startIndex, endIndex);

  // Opciones de filtro para el componente Filters
  const filterOptions = {
    status: {
      label: "Estado",
      options: [
        { value: "all", label: "Todos los estados" },
        { value: "active", label: "Activo" },
        { value: "inactive", label: "Inactivo" },
      ],
    },

    expiration: {
      label: "Vencimiento",
      options: [
        { value: "all", label: "Proximos a vencer" },
        { value: "danger", label: "Crítico (< 30 días)" },
        { value: "warning", label: "Próximo (< 90 días)" },
        { value: "safe", label: "Seguro (> 90 días)" },
      ],
    },
  };

  // Función para manejar cambios en los filtros
  const handleFilterChange = (filterName: string, value: string) => {
    switch (filterName) {
      case "status":
        setFilterStatus(value);
        break;
      case "module":
        setFilterModule(value);
        break;
      case "expiration":
        setFilterExpiration(value);
        break;
    }
    // Resetear a la primera página cuando cambian los filtros
    setCurrentPage(1);
  };

  // Función para restablecer todos los filtros
  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setFilterModule("all");
    setFilterExpiration("all");
    setCurrentPage(1);
  };

  // Funciones para manejar la edición
  const handleEdit = async (license: License) => {
    try {
      // Opcional: Obtener la licencia más actualizada desde el servidor
      const freshLicense = await licenseService.getById(license.id);

      if (freshLicense) {
        const updatedUiLicense = apiToUiLicense(freshLicense);
        setSelectedLicense(updatedUiLicense);
      } else {
        // Si no se puede obtener del servidor, usar la versión de la lista
        setSelectedLicense(license);
      }

      setShowForm(true);
    } catch (error) {
      console.error("Error al obtener la licencia actualizada:", error);
      // En caso de error, usar la versión disponible
      setSelectedLicense(license);
      setShowForm(true);
    }
  };

  const handleCloseForm = () => {
    setSelectedLicense(null);
    setShowForm(false);
  };

  // Función para guardar una licencia (crear o actualizar)
  const handleSaveLicense = async (formData: Partial<License>) => {
    try {
      if (selectedLicense) {
        // Actualizar licencia existente
        const apiLicenseData = uiToApiUpdateLicense(formData);

        // Log para depuración
        console.log(
          "Datos enviados al servidor para actualizar:",
          apiLicenseData
        );

        const updatedApiLicense = await licenseService.update(
          selectedLicense.id,
          apiLicenseData
        );

        if (updatedApiLicense) {
          // Convertir la respuesta de la API a nuestro formato de UI
          const updatedUiLicense = apiToUiLicense(updatedApiLicense);

          // Log para depuración
          console.log("Licencia actualizada recibida:", updatedUiLicense);

          // Actualizar el estado de licencias con la licencia actualizada
          setLicenses(
            licenses.map((lic) =>
              lic.id === updatedUiLicense.id ? updatedUiLicense : lic
            )
          );

          // Actualizar también la licencia seleccionada para que al reabrir muestre los cambios
          setSelectedLicense(updatedUiLicense);

          toast.success("Licencia actualizada correctamente");
        } else {
          toast.error("Error al actualizar la licencia");
        }
      } else {
        // Crear nueva licencia
        const apiLicenseData = uiToApiCreateLicense(formData);

        // Log para depuración
        console.log("Datos enviados al servidor para crear:", apiLicenseData);

        const newApiLicense = await licenseService.create(apiLicenseData);

        if (newApiLicense) {
          const newUiLicense = apiToUiLicense(newApiLicense);

          // Log para depuración
          console.log("Nueva licencia recibida:", newUiLicense);

          setLicenses([...licenses, newUiLicense]);
          toast.success("Licencia creada correctamente");
        } else {
          toast.error("Error al crear la licencia");
        }
      }
      handleCloseForm();
    } catch (error) {
      console.error("Error al guardar licencia:", error);
      toast.error("Error al procesar la licencia");
    }
  };

  // Funciones para manejar el menú contextual
  const handleOpenContextMenu = (license: License, e: React.MouseEvent) => {
    e.stopPropagation();
    // Cerrar menú si ya está abierto para la misma licencia
    if (contextMenuLicense && contextMenuLicense.id === license.id) {
      setContextMenuLicense(null);
    } else {
      setContextMenuLicense(license);
    }
  };

  const handleCloseContextMenu = () => {
    setContextMenuLicense(null);
  };

  // Función para manejar clic en la licencia
  const handleLicenseClick = (license: License) => {
    handleEdit(license);
  };

  const handleExportLicense = (license: License) => {
    console.log("Exportar datos de licencia:", license.id);
    // Implementar lógica de exportación
    toast("Funcionalidad de exportación en desarrollo", {
      icon: "ℹ️",
      style: {
        background: "#3b82f6",
        color: "#fff",
      },
    });
  };

  const handleLicenseHistory = (license: License) => {
    setLicenseForHistory(license);
    setShowHistoryModal(true);
    // Cerrar el menú contextual si está abierto
    if (contextMenuLicense) {
      setContextMenuLicense(null);
    }
  };

  const handleDeleteLicense = (license: License) => {
    setLicenseToDelete(license);
    setShowDeleteModal(true);
    // Cerrar el menú contextual si está abierto
    if (contextMenuLicense) {
      setContextMenuLicense(null);
    }
  };

  const confirmDeleteLicense = async () => {
    if (!licenseToDelete) return;

    try {
      const success = await licenseService.delete(licenseToDelete.id);

      if (success) {
        setLicenses(licenses.filter((lic) => lic.id !== licenseToDelete.id));
        toast.success("Licencia eliminada correctamente");
      } else {
        toast.error("Error al eliminar la licencia");
      }
    } catch (error) {
      console.error("Error al eliminar licencia:", error);
      toast.error("Error al eliminar la licencia");
    } finally {
      setShowDeleteModal(false);
      setLicenseToDelete(null);
    }
  };

  // Funciones auxiliares para renderizar estados y elementos visuales
  const getExpirationStatus = (date: string) => {
    const expirationDate = new Date(date);
    const today = new Date();
    const diffTime = expirationDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 30) return "danger";
    if (diffDays <= 90) return "warning";
    return "success";
  };

  const getModuleIcon = (moduleName: string) => {
    switch (moduleName) {
      case "panel_monitoreo":
        return <BarChart2 className="w-5 h-5 text-blue-500" />;
      case "empleados":
        return <Users className="w-5 h-5 text-blue-500" />;
      case "control_tiempo":
        return <Clock className="w-5 h-5 text-blue-500" />;
      case "control_acceso":
        return <DoorClosed className="w-5 h-5 text-blue-500" />;
      case "comedor":
        return <Utensils className="w-5 h-5 text-blue-500" />;
      case "reportes":
        return <AlignCenter className="w-5 h-5 text-blue-500" />;
      default:
        return null;
    }
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

  // Definición de columnas para la tabla ordenable
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
      key: "usedCompanies",
      header: "Compañías",
      sortable: true,
      sortKey: (license) => license.usedCompanies / license.allowedCompanies,
      render: (license) => (
        <>
          <div className="text-sm text-gray-900">
            {license.usedCompanies}/{license.allowedCompanies}
          </div>
          <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{
                width: `${
                  (license.usedCompanies / license.allowedCompanies) * 100
                }%`,
              }}
            />
          </div>
        </>
      ),
    },
    {
      key: "activeEmployees",
      header: "Empleados",
      sortable: true,
      sortKey: (license) => license.activeEmployees / license.allowedEmployees,
      render: (license) => (
        <>
          <div className="text-sm text-gray-900">
            {license.activeEmployees}/{license.allowedEmployees}
          </div>
          <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full"
              style={{
                width: `${
                  (license.activeEmployees / license.allowedEmployees) * 100
                }%`,
              }}
            />
          </div>
        </>
      ),
    },
    {
      key: "expirationDate",
      header: "Vencimiento",
      sortable: true,
      render: (license) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            getExpirationStatus(license.expirationDate) === "danger"
              ? "bg-red-100 text-red-800"
              : getExpirationStatus(license.expirationDate) === "warning"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {formatDateDisplay(license.expirationDate)}
        </span>
      ),
    },
    {
      key: "modules",
      header: "Módulos",
      sortable: false,
      render: (license) => (
        <div className="flex space-x-3">
          {license.moduleNames && license.moduleNames.length > 0 ? (
            license.moduleNames.map((moduleName) => (
              <div
                key={moduleName}
                className="relative group"
                aria-label={getModuleLabel(moduleName)}
              >
                {/* Icono del módulo */}
                <div>{getModuleIcon(moduleName)}</div>

                {/* Tooltip personalizado */}
                <div className="absolute z-10 invisible group-hover:visible bg-white text-gray-800 text-xs rounded py-1 px-2 -left-1/2 -bottom-8 whitespace-nowrap opacity-0 group-hover:opacity-100 border border-blue-500 transition-opacity duration-300">
                  {getModuleLabel(moduleName)}
                </div>
              </div>
            ))
          ) : (
            <span className="text-gray-400 text-sm">Sin módulos</span>
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
      header: "Acciones",
      sortable: false,
      align: "right",
      cellClassName: "stopPropagation",
      render: (license) => (
        <div className="flex items-center justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(license);
            }}
            className="text-blue-600 hover:text-blue-900 mr-3"
          >
            <FileEdit className="w-5 h-5" />
          </button>

          <button
            onClick={(e) => handleOpenContextMenu(license, e)}
            className="text-gray-500 hover:text-gray-700"
            title="Más acciones"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
          {contextMenuLicense && contextMenuLicense.id === license.id && (
            <LicenseContextMenu
              license={license}
              isOpen={true}
              onClose={handleCloseContextMenu}
              onEdit={handleEdit}
              onRenew={handleRenewLicense}
              onExport={handleExportLicense}
              onHistory={handleLicenseHistory}
              onDelete={handleDeleteLicense}
            />
          )}
        </div>
      ),
    },
  ];

  // Renderizar menú contextual para la vista de cuadrícula
  const renderContextMenu = (license: License) => (
    <LicenseContextMenu
      license={license}
      isOpen={true}
      onClose={handleCloseContextMenu}
      onEdit={handleEdit}
      onRenew={handleRenewLicense}
      onExport={handleExportLicense}
      onHistory={handleLicenseHistory}
      onDelete={handleDeleteLicense}
    />
  );

  // Función para manejar el cambio de ordenamiento
  const handleSort = (key: string, direction: "asc" | "desc") => {
    setSortKey(key);
    setSortDirection(direction);
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Gestión de Licencias
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Administra las licencias y permisos de las empresas
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Nueva Licencia</span>
          </button>
        </div>

        {/* Mostrar resumen de licencias */}
        <LicensesSummary licenses={licenses} />

        {/* Componente de filtros */}
        <Filters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Buscar por empresa, ID o RNC"
          filterValues={{
            status: filterStatus,
            module: filterModule,
            expiration: filterExpiration,
          }}
          onFilterChange={handleFilterChange}
          filterOptions={filterOptions}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onResetFilters={handleResetFilters}
        />

        {/* Estado de carga */}
        {isLoading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
            <p className="mt-4 text-gray-600">Cargando licencias...</p>
          </div>
        ) : // Contenido principal - Según el modo de vista
        viewMode === "list" ? (
          <div className="bg-white rounded-lg shadow">
            <SortableTable
              data={paginatedLicenses}
              columns={columns}
              keyExtractor={(license) => license.id}
              emptyMessage="No se encontraron licencias con los filtros seleccionados."
              onRowClick={handleLicenseClick}
              initialSortKey={sortKey}
              initialSortDirection={sortDirection}
              onSort={handleSort}
            />

            {/* Paginación para la vista de lista */}
            <div className="p-4 border-t border-gray-200">
              <Pagination
                currentPage={currentPage}
                totalItems={filteredLicenses.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
                itemsPerPageOptions={[10, 25, 50, 100]}
              />
            </div>
          </div>
        ) : (
          <LicenseGrid
            licenses={filteredLicenses}
            onCardClick={handleLicenseClick}
            onMenuClick={handleOpenContextMenu}
            contextMenuLicense={contextMenuLicense}
            renderContextMenu={renderContextMenu}
            emptyMessage="No se encontraron licencias con los filtros seleccionados."
          />
        )}
      </div>

      {/* Modal de formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <LicenseForm
              license={selectedLicense}
              onClose={handleCloseForm}
              onSave={handleSaveLicense}
            />
          </div>
        </div>
      )}

      {/* Modal de renovación de licencia */}
      {showRenewalModal && licenseToRenew && (
        <LicenseRenewalModal
          license={licenseToRenew}
          onClose={() => setShowRenewalModal(false)}
          onRenewed={handleLicenseRenewed}
        />
      )}

      {showDeleteModal && licenseToDelete && (
        <DeleteLicenseModal
          license={licenseToDelete}
          onDelete={confirmDeleteLicense}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}

      {/* Modal de historial de licencia */}
      {showHistoryModal && licenseForHistory && (
        <LicenseHistoryModal
          license={licenseForHistory}
          onClose={() => setShowHistoryModal(false)}
        />
      )}
    </div>
  );
}

export default LicensesScreen;
