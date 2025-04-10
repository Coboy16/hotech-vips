import React, { useMemo, useState } from "react";
import {
  Plus,
  Shield,
  Clock,
  Building2,
  Key,
  UserCog,
  // XCircle,
  // CheckCircle2,
  MoreVertical,
} from "lucide-react";
import { useUsers } from "./hooks/useUsers";
import { User, UserFormData } from "./types/user";

import UsersSummary from "./components/UsersSummary";
import UserGrid from "./components/UserGrid";
import UserContextMenu from "./components/UserContextMenu";
import { UserForm } from "./components/userComponets/UserForm";
import Filters from "../../../components/common/table/Filters";
import SortableTable, {
  ColumnDefinition,
} from "../../../components/common/table/SortableTable";
import Pagination from "../../../components/common/table/Pagination";
import UserAvatar from "./components/UserAvatar";
import { tokenStorage } from "../../auth/utils/tokenStorage";
import { LicenseInfoForUserForm } from "../../../model/user";
import toast from "react-hot-toast";
import PasswordChangeForm from "./components/changePassword/passwordChangeSchema";
import { DeleteUserModal } from "./components/DeleteUserModal";

export function UsersScreen() {
  // --- Estados (sin cambios) ---
  const [availableModules] = useState([]);

  const licenseInfo: LicenseInfoForUserForm = useMemo(() => {
    return {
      id: tokenStorage.getLicenseId() || "",
      name: "", // Podrías querer obtener el nombre de la licencia también
      code: "", // Podrías querer obtener el código también
    };
  }, []);

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

  // --- Estados para el reseteo de contraseña ---
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false); // Estado de carga para delete

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
    deleteUserByEmail,
  } = useUsers();

  // --- Filtrado (MODIFICADO para excluir delete@delete.com) ---
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Primero excluimos usuarios con email delete@delete.com
      if (!user || user.email === "delete@delete.com") {
        return false;
      }

      // Luego aplicamos el resto de los filtros
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
  }, [users, searchTerm, filterRole, filterStatus, filterDepartment]);

  // --- Paginación (sin cambios) ---
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // --- Datos para filtros (sin cambios) ---
  const allDepartments = Array.from(
    new Set(users.flatMap((user) => user?.departments || []))
  ).sort();
  const roles = Array.from(
    new Set(users.map((user) => user?.role || "unknown"))
  ).map((role) => ({
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

  // --- Handler Submit Formulario Creación/Edición (sin cambios) ---
  const handleNewFormSubmit = async (formData: UserFormData) => {
    try {
      console.log("[UsersScreen] Datos del formulario recibidos:", formData);
      if (!formData.rol_id) {
        console.error("[UsersScreen] Error: rol_id es requerido.");
        toast.error("Error: Debe seleccionar un rol para el usuario");
        return;
      }
      const userData = {
        password: formData.password || undefined,
        usua_corr: formData.usua_corr,
        usua_noco: formData.usua_noco || "000000000",
        usua_nomb: formData.usua_nomb,
        usua_fevc: formData.usua_fevc || new Date().toISOString(),
        usua_fein: formData.usua_fein || new Date().toISOString(),
        usua_feve:
          formData.usua_feve ||
          new Date(
            new Date().setFullYear(new Date().getFullYear() + 1)
          ).toISOString(),
        usua_stat: formData.usua_stat === undefined ? true : formData.usua_stat,
        rol_id: formData.rol_id,
        company_license_id:
          formData.company_license_id ||
          licenseInfo.id ||
          tokenStorage.getLicenseId(),
        structure_id: formData.structure_id || tokenStorage.getStructureId(),
        structure_type: formData.structure_type || "company",
        modules: formData.userPermissions,
      };
      console.log("[UsersScreen] Datos completos a enviar:", userData);
      let result;
      if (selectedUser) {
        // Si hay contraseña, incluirla, sino, excluirla del objeto a enviar
        const updateData = { ...userData };
        if (!updateData.password) {
          delete updateData.password; // No enviar password si está vacío en edición
        }
        result = await updateUser(selectedUser.id, updateData);
      } else {
        // Para creación, la contraseña es obligatoria (o debería tener un default)
        if (!userData.password) {
          userData.password = "Temporal123!"; // O generar una segura
          console.warn(
            "[UsersScreen] Contraseña no provista para nuevo usuario, usando default."
          );
          toast("Se asignó una contraseña temporal.", {
            icon: "ℹ️",
          });
        }
        result = await createUser(userData);
      }
      if (result) {
        toast.success(
          selectedUser
            ? "Usuario actualizado con éxito"
            : "Usuario creado con éxito"
        );
        setShowForm(false);
        loadUsers();
      }
    } catch (error) {
      console.error("[UsersScreen] Error al procesar el formulario:", error);
      toast.error("Error al procesar la solicitud");
    }
  };

  const handleConfirmDelete = async (email: string) => {
    if (!email) {
      toast.error("Error: Email de usuario no encontrado.");
      return;
    }
    console.log(`[UsersScreen] Confirmando eliminación para: ${email}`);
    setIsDeletingUser(true);
    try {
      const success = await deleteUserByEmail(email);
      if (success) {
        handleCancelDelete();
      } else {
        setIsDeletingUser(false);
      }
    } catch (error) {
      console.error("[UsersScreen] Error durante handleConfirmDelete:", error);
      toast.error("Ocurrió un error inesperado al eliminar.");
      setIsDeletingUser(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
    setIsDeletingUser(false);
  };

  // --- Handlers de Filtros y Formulario ---
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
    setViewMode("list"); // Resetear a modo de lista al restablecer filtros
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

  // --- Handlers de Context Menu y Acciones ---
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

  const handleOpenResetPasswordModal = (user: User) => {
    console.log(
      `[UsersScreen] Iniciando reseteo de contraseña para: ${user.email} (ID: ${user.id})`
    );
    if (user && user.id) {
      setSelectedUserId(user.id);
      setShowPasswordForm(true);
      setContextMenuUser(null);
    } else {
      console.error(
        "[UsersScreen] Intento de restablecer contraseña sin usuario válido."
      );
      toast.error(
        "No se pudo identificar al usuario para restablecer la contraseña."
      );
    }
  };

  const handleChangeStatus = async (user: User) => {
    const newStatus = user.status === "active" ? "inactive" : "active";
    await updateUser(user.id, { usua_stat: newStatus === "active" });
    loadUsers();
    setContextMenuUser(null);
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
    const safeRole = role ?? "unknown";
    if (safeRole === "unknown") return "Desconocido";
    return safeRole.charAt(0).toUpperCase() + safeRole.slice(1);
  };

  // --- Definición de Columnas ---
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
              roleColors[user.role ?? "unknown"] || roleColors.unknown
            }`}
          >
            {getRoleLabel(user.role)}
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
          {(!user.permissions ||
            (!user.permissions.approveHours &&
              !user.permissions.modifyChecks &&
              !user.permissions.manageReports)) && (
            <span className="text-gray-400">-</span>
          )}
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
            user.status
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {user.status ? "Activo" : "Inactivo"}
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
          {/* Botón Editar */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(user);
            }}
            className="text-blue-600 hover:text-blue-900"
            title="Editar usuario"
          >
            {" "}
            <UserCog className="w-5 h-5" />{" "}
          </button>

          {/* Botón Restablecer Contraseña */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleOpenResetPasswordModal(user);
            }}
            className="text-amber-600 hover:text-amber-900"
            title="Restablecer contraseña"
          >
            {" "}
            <Key className="w-5 h-5" />{" "}
          </button>

          {/* Botón Activar/Desactivar */}
          {/* <button
            onClick={(e) => {
              e.stopPropagation();
              handleChangeStatus(user);
            }}
            className={`${
              user.status
                ? "text-red-600 hover:text-red-900"
                : "text-green-600 hover:text-green-900"
            }`}
            title={user.status ? "Desactivar usuario" : "Activar usuario"}
          >
            {user.status ? (
              <XCircle className="w-5 h-5" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
          </button> */}

          {/* Botón Más Acciones (Context Menu) */}
          <button
            onClick={(e) => handleOpenContextMenu(user, e)}
            className="text-gray-500 hover:text-gray-700"
            title="Más acciones"
          >
            {" "}
            <MoreVertical className="h-5 w-5" />{" "}
          </button>

          {/* Renderizado Condicional del Context Menu */}
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
                handleOpenResetPasswordModal(u);
                handleCloseContextMenu();
              }}
              onChangeStatus={(u) => {
                handleChangeStatus(u);
                handleCloseContextMenu();
              }}
              onDeleteRequest={(u) => {
                setUserToDelete(u);
                setShowDeleteModal(true);
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
        handleOpenResetPasswordModal(u);
        handleCloseContextMenu();
      }}
      onChangeStatus={(u) => {
        handleChangeStatus(u);
        handleCloseContextMenu();
      }}
      onDeleteRequest={(u) => {
        setUserToDelete(u);
        setShowDeleteModal(true);
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
            {" "}
            <Plus className="w-5 h-5" /> <span>Nuevo Usuario</span>{" "}
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
                e.stopPropagation();
                handleOpenResetPasswordModal(user);
              }}
            />
          </div>
        )}
      </div>

      {/* Modal Formulario Creación/Edición */}
      {showForm && (
        <UserForm
          user={selectedUser}
          onClose={handleCloseForm}
          onSave={handleNewFormSubmit}
          licenseInfo={licenseInfo}
          availableModules={availableModules || []}
        />
      )}

      {/* Modal Formulario Reseteo Contraseña */}
      {showPasswordForm && (
        <PasswordChangeForm
          userId={selectedUserId}
          onClose={() => {
            setShowPasswordForm(false);
            setSelectedUserId(null);
          }}
          onSubmit={async (userId, newPassword) => {
            const success = await updatePassword(userId, newPassword);
            return success;
          }}
        />
      )}
      {showDeleteModal && (
        <DeleteUserModal
          user={userToDelete}
          onConfirmDelete={handleConfirmDelete}
          onCancel={handleCancelDelete}
          isDeleting={isDeletingUser}
        />
      )}
    </div>
  );
}

export default UsersScreen;
