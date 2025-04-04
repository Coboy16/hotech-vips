import React, { useState } from "react";
import {
  Plus,
  Shield,
  Clock,
  Building2,
  Key,
  UserCog,
  XCircle,
  CheckCircle2,
  MoreVertical,
} from "lucide-react";
import { useUsers } from "./hooks/useUsers";
import { User } from "./types/user";

import UsersSummary from "./components/UsersSummary";
import UserGrid from "./components/UserGrid";
import UserContextMenu from "./components/UserContextMenu";
import { UserForm } from "./components/UserForm";
import Filters from "../../../components/common/table/Filters";
import SortableTable, {
  ColumnDefinition,
} from "../../../components/common/table/SortableTable";
import Pagination from "../../../components/common/table/Pagination";
import UserAvatar from "./components/UserAvatar";

export function UsersScreen() {
  // --- Estados (sin cambios) ---
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [sortKey, setSortKey] = useState<string>("firstName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [contextMenuUser, setContextMenuUser] = useState<User | null>(null);

  // --- Hook useUsers (sin cambios) ---
  const {
    users,
    selectedUser,
    loading,
    error,
    loadUsers,
    createUser,
    updateUser,
    updatePassword,
    setSelectedUser,
  } = useUsers();

  // --- Filtrado (con chequeo adicional) ---
  const filteredUsers = users.filter((user) => {
    // --- INICIO CAMBIO ---
    // Chequeo defensivo por si 'user' es undefined/null en el array original
    if (!user) {
      console.warn(
        "Se encontró un usuario nulo/undefined durante el filtrado."
      );
      return false;
    }
    // --- FIN CAMBIO ---

    const matchesSearch =
      `${user.firstName} ${user.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus =
      filterStatus === "all" || user.status === filterStatus;
    const matchesDepartment =
      filterDepartment === "all" ||
      (user.departments && user.departments.includes(filterDepartment));
    return matchesSearch && matchesRole && matchesStatus && matchesDepartment;
  });

  // --- Paginación (sin cambios) ---
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // --- Datos para filtros (sin cambios) ---
  const allDepartments = Array.from(
    new Set(users.flatMap((user) => user?.departments || [])) // Añadir ? por si user es null
  ).sort();
  const roles = Array.from(
    new Set(users.map((user) => user?.role || "unknown"))
  ) // Añadir ? y fallback
    .map((role) => ({
      value: role,
      label:
        role === "unknown"
          ? "Desconocido"
          : role.charAt(0).toUpperCase() + role.slice(1),
    }));
  const filterOptions = {
    role: {
      label: "Rol",
      options: [{ value: "all", label: "Todos los roles" }, ...roles],
    },
    status: {
      label: "Estado",
      options: [
        { value: "all", label: "Todos los estados" },
        { value: "active", label: "Activo" },
        { value: "inactive", label: "Inactivo" },
      ],
    },
    department: {
      label: "Departamento",
      options: [
        { value: "all", label: "Todos los departamentos" },
        ...allDepartments.map((dept) => ({ value: dept, label: dept })),
      ],
    },
  };

  // --- Handlers de Filtros y Formulario (sin cambios relevantes) ---
  const handleFilterChange = (filterName: string, value: string) => {
    switch (filterName) {
      case "role":
        setFilterRole(value);
        break;
      case "status":
        setFilterStatus(value);
        break;
      case "department":
        setFilterDepartment(value);
        break;
    }
    setCurrentPage(1);
  };
  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterRole("all");
    setFilterStatus("all");
    setFilterDepartment("all");
    setCurrentPage(1);
  };
  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setShowForm(true);
    setContextMenuUser(null);
  };
  const handleCloseForm = () => {
    setSelectedUser(null);
    setShowForm(false);
  };
  const handleSubmitForm = async (userData: Partial<User>) => {
    try {
      if (selectedUser) {
        await updateUser(selectedUser.id, userData);
      } else {
        await createUser(userData);
      }
      setShowForm(false);
      loadUsers();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  // --- Handlers de Context Menu y Acciones (sin cambios relevantes) ---
  const handleOpenContextMenu = (user: User, e: React.MouseEvent) => {
    e.stopPropagation();
    setContextMenuUser((prev) => (prev?.id === user.id ? null : user));
  };
  const handleCloseContextMenu = () => {
    setContextMenuUser(null);
  };
  const handleUserClick = (user: User) => {
    handleEdit(user);
  };
  const handleResetPassword = async (user: User) => {
    const tempPassword = Math.random().toString(36).slice(-8);
    const success = await updatePassword(user.id, tempPassword);
    if (success) {
      alert(`Contraseña temporal generada: ${tempPassword}`);
    }
  };
  const handleViewHistory = (user: User) => {
    console.log("Ver historial de:", user.email);
    alert(`Historial de actividad para ${user.firstName} ${user.lastName}`);
  };
  const handleChangeStatus = async (user: User) => {
    const newStatus = user.status === "active" ? "inactive" : "active";
    await updateUser(user.id, { status: newStatus });
    loadUsers();
  };
  const handleExportData = (user: User) => {
    const userJson = JSON.stringify(user, null, 2);
    const blob = new Blob([userJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `user_${user.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // --- Configuración visual (Colores, Labels - sin cambios) ---
  const roleColors: Record<string, string> = {
    admin: "bg-purple-100 text-purple-800",
    supervisor: "bg-blue-100 text-blue-800",
    manager: "bg-green-100 text-green-800",
    user: "bg-gray-100 text-gray-800",
    unknown: "bg-yellow-100 text-yellow-800",
  };
  const getRoleLabel = (role: string) => {
    // Asegurarse de manejar rol undefined/null que podría venir de user?.role
    const safeRole = role ?? "unknown";
    if (safeRole === "unknown") return "Desconocido";
    return safeRole.charAt(0).toUpperCase() + safeRole.slice(1);
  };

  // --- Definición de Columnas (sin cambios) ---
  const columns: ColumnDefinition<User>[] = [
    {
      key: "name",
      header: "Usuario",
      sortable: true,
      sortKey: (user) => `${user.firstName} ${user.lastName}`,
      render: (user) => (
        <div className="flex items-center">
          <UserAvatar
            firstName={user.firstName}
            lastName={user.lastName}
            avatarUrl={user.avatar}
            size={40}
          />
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Rol/Departamentos",
      sortable: true,
      render: (user) => (
        <>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              roleColors[user.role ?? "unknown"] || roleColors.unknown // Usar fallback con ??
            }`}
          >
            {getRoleLabel(user.role)}{" "}
            {/* getRoleLabel ya maneja undefined/null */}
          </span>
          <div className="mt-1 text-sm text-gray-500">
            {user.departments && user.departments.length > 0 ? (
              user.departments.join(", ")
            ) : (
              <span className="italic text-gray-400">N/A</span>
            )}
          </div>
        </>
      ),
    },
    {
      key: "permissions",
      header: "Permisos",
      sortable: false,
      render: (user) => (
        <div className="flex space-x-2">
          {user.permissions?.approveHours && (
            <div className="tooltip" data-tip="Aprobar horas">
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
          )}
          {user.permissions?.modifyChecks && (
            <div className="tooltip" data-tip="Modificar registros">
              <Shield className="w-5 h-5 text-green-500" />
            </div>
          )}
          {user.permissions?.manageReports && (
            <div className="tooltip" data-tip="Administrar reportes">
              <Building2 className="w-5 h-5 text-amber-500" />
            </div>
          )}
          {!user.permissions ||
            (!user.permissions.approveHours &&
              !user.permissions.modifyChecks &&
              !user.permissions.manageReports && (
                <span className="text-gray-400">-</span>
              ))}
        </div>
      ),
    },
    {
      key: "lastLogin",
      header: "Último acceso",
      sortable: true,
      render: (user) => (
        <span className="text-sm text-gray-500">
          {user.lastLogin ? (
            new Date(user.lastLogin).toLocaleString()
          ) : (
            <span className="italic text-gray-400">N/A</span>
          )}
        </span>
      ),
    },
    {
      key: "status",
      header: "Estado",
      sortable: true,
      render: (user) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            user.status === "active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {user.status === "active" ? "Activo" : "Inactivo"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Acciones",
      sortable: false,
      align: "right",
      cellClassName: "stopPropagation",
      render: (user) => (
        <div className="relative flex items-center justify-end space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(user);
            }}
            className="text-blue-600 hover:text-blue-900"
            title="Editar usuario"
          >
            <UserCog className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleResetPassword(user);
            }}
            className="text-amber-600 hover:text-amber-900"
            title="Restablecer contraseña"
          >
            <Key className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleChangeStatus(user);
            }}
            className={`${
              user.status === "active"
                ? "text-red-600 hover:text-red-900"
                : "text-green-600 hover:text-green-900"
            }`}
            title={
              user.status === "active"
                ? "Desactivar usuario"
                : "Activar usuario"
            }
          >
            {user.status === "active" ? (
              <XCircle className="w-5 h-5" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={(e) => handleOpenContextMenu(user, e)}
            className="text-gray-500 hover:text-gray-700"
            title="Más acciones"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
          {contextMenuUser && contextMenuUser.id === user.id && (
            <UserContextMenu
              user={user}
              isOpen={true}
              onClose={handleCloseContextMenu}
              onEdit={(u) => {
                handleEdit(u);
                handleCloseContextMenu();
              }}
              onResetPassword={(u) => {
                handleResetPassword(u);
                handleCloseContextMenu();
              }}
              onViewHistory={(u) => {
                handleViewHistory(u);
                handleCloseContextMenu();
              }}
              onChangeStatus={(u) => {
                handleChangeStatus(u);
                handleCloseContextMenu();
              }}
              onExportData={(u) => {
                handleExportData(u);
                handleCloseContextMenu();
              }}
            />
          )}
        </div>
      ),
    },
  ];

  // --- Renderizado del Context Menu para Grid (sin cambios) ---
  const renderContextMenuForGrid = (user: User) => (
    <UserContextMenu
      user={user}
      isOpen={true}
      onClose={handleCloseContextMenu}
      onEdit={(u) => {
        handleEdit(u);
        handleCloseContextMenu();
      }}
      onResetPassword={(u) => {
        handleResetPassword(u);
        handleCloseContextMenu();
      }}
      onViewHistory={(u) => {
        handleViewHistory(u);
        handleCloseContextMenu();
      }}
      onChangeStatus={(u) => {
        handleChangeStatus(u);
        handleCloseContextMenu();
      }}
      onExportData={(u) => {
        handleExportData(u);
        handleCloseContextMenu();
      }}
    />
  );

  // --- Handler de Sort (sin cambios) ---
  const handleSort = (key: string, direction: "asc" | "desc") => {
    setSortKey(key);
    setSortDirection(direction);
  };

  // --- Renderizado condicional Loading/Error (sin cambios) ---
  if (loading && users.length === 0) {
    return (
      <div className="flex-1 overflow-auto bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Cargando usuarios...</p>
        </div>
      </div>
    );
  }
  if (error && users.length === 0) {
    return (
      <div className="flex-1 overflow-auto bg-gray-50 p-8">
        <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-red-800">
          <h3 className="text-lg font-medium mb-2">
            Error al cargar los usuarios
          </h3>
          <p>{error}</p>
          <button
            onClick={loadUsers}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // --- Renderizado Principal (JSX) ---
  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Gestión de Usuarios
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Administra los usuarios y sus permisos
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedUser(null);
              setShowForm(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Nuevo Usuario</span>
          </button>
        </div>

        {/* Resumen */}
        <UsersSummary users={users} />

        {/* Filtros */}
        <Filters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Buscar por nombre o correo"
          filterValues={{
            role: filterRole,
            status: filterStatus,
            department: filterDepartment,
          }}
          onFilterChange={handleFilterChange}
          filterOptions={filterOptions}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onResetFilters={handleResetFilters}
        />

        {/* Contenido Principal (Tabla o Grid) */}
        {viewMode === "list" ? (
          <div className="bg-white rounded-lg shadow mt-6">
            <SortableTable
              data={paginatedUsers}
              columns={columns}
              keyExtractor={(user) => user.id}
              emptyMessage="No se encontraron usuarios con los filtros seleccionados."
              onRowClick={handleUserClick}
              initialSortKey={sortKey}
              initialSortDirection={sortDirection}
              onSort={handleSort}
            />
            {/* Paginación Lista */}
            {filteredUsers.length > itemsPerPage && (
              <div className="p-4 border-t border-gray-200">
                <Pagination
                  currentPage={currentPage}
                  totalItems={filteredUsers.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={(num) => {
                    setItemsPerPage(num);
                    setCurrentPage(1);
                  }}
                  itemsPerPageOptions={[10, 25, 50, 100]}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="mt-6">
            {/* --- INICIO CAMBIO: Pasar onResetPasswordClick a UserGrid --- */}
            <UserGrid
              users={filteredUsers}
              onCardClick={handleUserClick}
              onMenuClick={handleOpenContextMenu}
              contextMenuUser={contextMenuUser}
              renderContextMenu={renderContextMenuForGrid}
              emptyMessage="No se encontraron usuarios con los filtros seleccionados."
              roleColors={roleColors}
              getRoleLabel={getRoleLabel}
              onResetPasswordClick={(user, e) => {
                // <- Pasar la prop correcta
                e.stopPropagation();
                handleResetPassword(user);
                handleCloseContextMenu();
              }}
            />
            {/* --- FIN CAMBIO --- */}
          </div>
        )}
      </div>

      {/* Modal Formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <UserForm
              user={selectedUser}
              onClose={handleCloseForm}
              onSubmit={handleSubmitForm}
              roles={roles}
              departments={allDepartments}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default UsersScreen;
