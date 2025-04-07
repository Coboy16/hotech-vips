import React, { useState, useMemo, useCallback } from "react";
import { Plus, Edit, Loader2 } from "lucide-react";

// Componentes específicos de Roles
import RoleKPIs from "./components/RoleKPIs";
import RolesGrid from "./components/RolesGrid";
import CreateRoleModal from "./components/CreateRoleModal";
import EditRoleModal from "./components/EditRoleModal";
import DeleteRoleConfirmationModal from "./components/DeleteRoleConfirmationModal";

// Hook y Tipos
import { useRoles } from "./hooks/useRoles";
import { Role } from "./types";
import Filters from "../../../components/common/table/Filters";
import Pagination from "../../../components/common/table/Pagination";
import SortableTable, {
  ColumnDefinition,
} from "../../../components/common/table/SortableTable";

const RolesScreen: React.FC = () => {
  // --- Hook de datos ---
  const {
    roles,
    availableModules,
    kpis,
    isLoading,
    isLoadingModules,
    error,
    addRole,
    editRole,
    removeRole,
    getRoleForEdit,
  } = useRoles();

  // --- Estados de UI ---
  const [searchTerm, setSearchTerm] = useState("");
  const [filterValues, setFilterValues] = useState<{ [key: string]: string }>(
    {}
  ); // Para futuros filtros
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Estados para Modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRoleForEdit, setSelectedRoleForEdit] = useState<string | null>(
    null
  );
  const [selectedRoleForDelete, setSelectedRoleForDelete] =
    useState<Role | null>(null);
  const [isMutating, setIsMutating] = useState(false); // Estado de carga para operaciones CUD

  // --- Lógica de Filtrado y Paginación ---
  const filteredRoles = useMemo(() => {
    return roles.filter(
      (role) => role.name.toLowerCase().includes(searchTerm.toLowerCase())
      // Añadir más lógica de filtrado si se implementan filtros en `filterValues`
    );
  }, [roles, searchTerm /*, filterValues */]);

  const paginatedRoles = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredRoles.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRoles, currentPage, itemsPerPage]);

  // --- Handlers ---
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Resetear a la primera página al buscar
  };

  const handleFilterChange = (filterName: string, value: string) => {
    setFilterValues((prev) => ({ ...prev, [filterName]: value }));
    setCurrentPage(1); // Resetear página al cambiar filtro
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterValues({});
    setCurrentPage(1);
    setViewMode("list");
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (numItems: number) => {
    setItemsPerPage(numItems);
    setCurrentPage(1);
  };

  // Handlers para Modales
  const handleOpenCreateModal = () => setIsCreateModalOpen(true);
  const handleCloseCreateModal = () => setIsCreateModalOpen(false);

  const handleOpenEditModal = (roleId: string) => {
    setSelectedRoleForEdit(roleId);
    setIsEditModalOpen(true);
  };
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedRoleForEdit(null); // Limpiar selección al cerrar
  };

  const handleOpenDeleteModal = (role: Role) => {
    setSelectedRoleForDelete(role);
    setIsDeleteModalOpen(true);
  };
  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedRoleForDelete(null); // Limpiar selección al cerrar
  };

  // Handlers para operaciones CUD
  const handleCreateRole = useCallback(
    async (data: { name: string; moduleIds: string[] }) => {
      setIsMutating(true);
      const result = await addRole({
        nombre: data.name,
        modules: data.moduleIds,
      }); // addRole viene del hook useRoles
      setIsMutating(false);
      return result; // Devuelve el rol creado o null
    },
    [addRole]
  );

  const handleUpdateRole = useCallback(
    async (roleId: string, data: { name: string; moduleIds: string[] }) => {
      setIsMutating(true);
      const result = await editRole(roleId, {
        nombre: data.name,
        modules: data.moduleIds,
      }); // editRole viene del hook
      setIsMutating(false);
      return result; // Devuelve el rol actualizado o null
    },
    [editRole]
  );

  const handleDeleteRole = useCallback(async () => {
    if (!selectedRoleForDelete) return;
    setIsMutating(true);
    const success = await removeRole(selectedRoleForDelete.id); // removeRole viene del hook
    setIsMutating(false);
    if (success) {
      handleCloseDeleteModal(); // Cierra el modal de confirmación si fue exitoso
    }
    // Si falla, el modal permanece abierto y el servicio/hook mostró toast
  }, [removeRole, selectedRoleForDelete]);

  // --- Definición de Columnas para la Tabla ---
  const columns: ColumnDefinition<Role>[] = useMemo(
    () => [
      {
        key: "name",
        header: "Nombre del Rol",
        render: (role: Role) => (
          <span className="font-medium text-gray-900">{role.name}</span>
        ),
        sortable: true,
        className: "w-1/3", // Ajusta ancho según necesites
      },
      {
        key: "modules",
        header: "Módulos Asignados",
        // Renderiza el número de módulos. Podrías mostrar nombres si los obtienes/mapeas.
        render: (role: Role) => (
          <span className="text-sm text-gray-500">
            {role.moduleIds.length} Módulo(s)
          </span>
        ),
        sortable: false, // O sort por número de módulos: sortKey: (role) => role.moduleIds.length
        align: "center",
        className: "w-1/6",
      },
      {
        key: "createdAt",
        header: "Fecha de Creación",
        render: (role: Role) => {
          // Formatear la fecha para mostrarla de manera amigable
          const date = new Date(role.createdAt);
          return (
            <span className="text-sm text-gray-500">
              {date.toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </span>
          );
        },
        sortable: true,
        sortKey: (role) => new Date(role.createdAt).getTime(), // Para ordenar correctamente por fecha
        align: "center",
        className: "w-1/6", // Asignamos un cuarto del ancho
      },
      {
        key: "actions",
        header: "Acciones",
        render: (role: Role) => (
          <div className="flex space-x-2 justify-end">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleOpenEditModal(role.id);
              }}
              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100"
              title="Editar Rol"
            >
              <Edit className="h-4 w-4" />
            </button>
            {/* <button
              onClick={(e) => {
                e.stopPropagation();
                handleOpenDeleteModal(role);
              }}
              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100"
              title="Eliminar Rol"
            >
              <Trash2 className="h-4 w-4" />
            </button> */}
          </div>
        ),
        align: "right",
        cellClassName: "stopPropagation", // Evita que onRowClick se dispare en las acciones
        className: "w-1/6",
      },
    ],
    []
  );

  // --- Renderizado ---
  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-0">
        <div className="p-4 md:p-6 lg:p-8">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Gestión de Roles
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Administra los roles y permisos de los usuarios.
              </p>
            </div>
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Nuevo Rol
            </button>
          </header>

          {/* KPIs */}
          <RoleKPIs
            kpiData={kpis}
            isLoading={isLoading && roles.length === 0}
          />

          {/* Filtros */}
          <Filters
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Buscar por nombre de rol..."
            filterValues={filterValues}
            onFilterChange={handleFilterChange}
            filterOptions={{}}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onResetFilters={handleResetFilters}
          />

          {/* Contenido principal: tabla o grid */}
          {isLoading && roles.length === 0 ? (
            <div className="p-6 text-center text-gray-500 bg-white shadow overflow-hidden sm:rounded-lg mt-6 flex items-center justify-center">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Cargando
              roles...
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-600 bg-red-50 shadow overflow-hidden sm:rounded-lg mt-6">
              Error al cargar los roles: {error}
            </div>
          ) : filteredRoles.length === 0 && !isLoading ? (
            <div className="p-6 text-center text-gray-500 bg-white shadow overflow-hidden sm:rounded-lg mt-6">
              No se encontraron roles{" "}
              {searchTerm ? "que coincidan con la búsqueda" : ""}.
            </div>
          ) : (
            <>
              {viewMode === "list" ? (
                // Vista de tabla
                <div className="bg-white shadow overflow-hidden sm:rounded-lg mt-6">
                  <SortableTable
                    data={paginatedRoles}
                    columns={columns}
                    keyExtractor={(role) => role.id}
                    emptyMessage="No hay roles para mostrar."
                  />
                </div>
              ) : (
                // Vista de cuadrícula
                <div className="mt-6">
                  <RolesGrid
                    roles={paginatedRoles}
                    onEdit={handleOpenEditModal}
                    onDelete={handleOpenDeleteModal}
                  />
                </div>
              )}
            </>
          )}

          {/* Paginación - fuera de ambas vistas para mantenerla visible */}
          {filteredRoles.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalItems={filteredRoles.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          )}

          {/* Modales */}
          <CreateRoleModal
            isOpen={isCreateModalOpen}
            onClose={handleCloseCreateModal}
            onSubmit={handleCreateRole}
            availableModules={availableModules}
            isLoading={isMutating}
            isLoadingModules={isLoadingModules}
          />

          <EditRoleModal
            isOpen={isEditModalOpen}
            onClose={handleCloseEditModal}
            onSubmit={handleUpdateRole}
            roleIdToEdit={selectedRoleForEdit}
            getRoleData={getRoleForEdit} // Pasa la función para obtener datos
            availableModules={availableModules}
            isLoading={isMutating}
            isLoadingModules={isLoadingModules}
          />

          <DeleteRoleConfirmationModal
            isOpen={isDeleteModalOpen}
            onClose={handleCloseDeleteModal}
            onConfirm={handleDeleteRole}
            roleName={selectedRoleForDelete?.name || null}
            isLoading={isMutating}
          />
        </div>
      </div>
    </div>
  );
};

export default RolesScreen;
