import { Plus } from "lucide-react";

// Importaciones de componentes presentacionales
import Filters from "../../../components/common/table/Filters";
import LicensesSummary from "./components/LincensesComponets/LicensesSummary";
import LicenseContextMenu from "./components/LincensesComponets/LicenseContextMenu";
import LicenseList from "./components/LincensesComponets/LicenseList";
import LicenseGridDisplay from "./components/LincensesComponets/LicenseGridDisplay";

// Importaciones de modales
import { LicenseForm } from "./components/LincensesComponets/LicenseForm";
import LicenseRenewalModal from "./components/LincensesComponets/LicenseRenewalModal";
import DeleteLicenseModal from "./components/LincensesComponets/DeleteLicenseModal";

// Hook personalizado principal que maneja toda la lógica
import { useLicensesContainer } from "./hooks/licensesScreen/useLicensesContainer";

export function LicensesScreen() {
  // Usar nuestro hook principal que integra toda la lógica
  const {
    // Estados de licencias y datos
    licenses,
    isLoading,
    error,

    // Estados de filtros y vista
    searchTerm,
    setSearchTerm,
    filterStatus,
    filterExpiration,
    viewMode,
    setViewMode,

    // Paginación y ordenamiento
    currentPage,
    itemsPerPage,
    sortKey,
    sortDirection,

    // Métodos de filtrado y datos
    getFilteredLicenses,
    handleFilterChange,
    handleResetFilters,
    getSortedAndFilteredLicenses,
    getPaginatedLicenses,
    setCurrentPage,
    setItemsPerPage,
    setSortKey,
    setSortDirection,

    // Columnas para la tabla
    columns,

    // Modales
    licenseFormModal,
    renewalModal,
    deleteModal,
    // historyModal,
    // userFormModal,

    // Menú contextual
    contextMenu,

    // Usuarios
    // licenseUsers,

    // Estado de procesamiento
    isSaving,
    isProcessing,

    // Handlers principales
    handleCreateNew,
    handleEdit,
    handleSaveLicense,
    handleOpenRenewModal,
    handleRenewLicense,
    handleOpenDeleteModal,
    confirmDeleteLicense,
    handleExportLicense,

    // Handlers de usuario
    handleOpenUserForm,
    // handleSaveUser,
  } = useLicensesContainer();

  // Obtener licencias filtradas y ordenadas
  const filteredLicenses = getFilteredLicenses();
  const sortedLicenses = getSortedAndFilteredLicenses(columns);
  const paginatedLicensesForList = getPaginatedLicenses(sortedLicenses);

  // Handlers de interfaz de usuario
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

  const handleViewModeChange = (mode: "list" | "grid") => {
    setViewMode(mode);
  };

  // Renderizado del componente
  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-4 sm:p-8">
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
            expiration: filterExpiration,
          }}
          onFilterChange={handleFilterChange}
          filterOptions={{
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
            licenses={paginatedLicensesForList}
            columns={columns}
            isLoading={isLoading && licenses.length === 0}
            emptyMessage="No se encontraron licencias con los filtros aplicados."
            pagination={{
              currentPage,
              totalItems: filteredLicenses.length,
              itemsPerPage,
              onPageChange: handlePageChange,
              onItemsPerPageChange: handleItemsPerPageChange,
            }}
            sorting={{ sortKey, sortDirection, onSort: handleSort }}
            onRowClick={handleEdit}
          />
        ) : (
          <LicenseGridDisplay
            licenses={filteredLicenses}
            isLoading={isLoading && licenses.length === 0}
            emptyMessage="No se encontraron licencias con los filtros aplicados."
            pagination={{
              currentPage: 1,
              totalItems: filteredLicenses.length,
              itemsPerPage: 12,
              onPageChange: () => {},
              onItemsPerPageChange: () => {},
            }}
            contextMenu={{
              contextMenuLicense: contextMenu.contextItem,
              renderContextMenu: (license) => (
                <LicenseContextMenu
                  license={license}
                  isOpen={true}
                  onClose={contextMenu.closeMenu}
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
            onMenuClick={contextMenu.openMenu}
            onRenew={handleOpenRenewModal}
            onHistory={() => {}} // No-op function for unimplemented history feature
            onDelete={handleOpenDeleteModal}
          />
        )}
      </div>

      {/* --- Modales --- */}
      {licenseFormModal.isOpen && (
        <LicenseForm
          license={licenseFormModal.data}
          onClose={licenseFormModal.close}
          onSave={handleSaveLicense}
          isLoading={isSaving}
        />
      )}

      {renewalModal.isOpen && renewalModal.data && (
        <LicenseRenewalModal
          license={renewalModal.data}
          onClose={renewalModal.close}
          onRenewed={handleRenewLicense}
          isProcessing={isProcessing}
        />
      )}

      {deleteModal.isOpen && deleteModal.data && (
        <DeleteLicenseModal
          license={deleteModal.data}
          onDelete={confirmDeleteLicense}
          onCancel={deleteModal.close}
        />
      )}

      {/* {historyModal.isOpen && historyModal.data && (
        <LicenseHistoryModal
          license={historyModal.data}
          onClose={historyModal.close}
        />
      )} */}

      {/* --- Modal de Formulario de Usuario --- */}
      {/* {userFormModal.isOpen && licenseUsers.selectedLicenseForUserCreation && (
        <UserForm
          onClose={() => {
            userFormModal.close();
            licenseUsers.handleCloseUserForm();
          }}
          onSave={handleSaveUser}
          licenseInfo={{
            id: licenseUsers.selectedLicenseForUserCreation.id,
            name: licenseUsers.selectedLicenseForUserCreation.companyName,
            code: licenseUsers.selectedLicenseForUserCreation.rnc,
          }}
          availableModules={licenseUsers.modulesForSelectedLicense}
        />
      )} */}
    </div>
  );
}

export default LicensesScreen;
