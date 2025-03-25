import React, { useState } from "react";
import UserCard from "./UserCard";
import { User } from "../types/user";
import Pagination from "../../../../components/common/table/Pagination";

interface UserGridProps {
  users: User[];
  onCardClick: (user: User) => void;
  onMenuClick: (user: User, e: React.MouseEvent) => void;
  contextMenuUser: User | null;
  renderContextMenu?: (user: User) => React.ReactNode;
  emptyMessage?: string;
  roleColors: Record<string, string>;
  getRoleLabel: (role: string) => string;
}

const UserGrid: React.FC<UserGridProps> = ({
  users,
  onCardClick,
  onMenuClick,
  contextMenuUser,
  renderContextMenu,
  emptyMessage = "No se encontraron usuarios con los filtros seleccionados.",
  roleColors,
  getRoleLabel,
}) => {
  // Estado para la paginación
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(12); // Opciones: 6, 12, 24, 36

  // Calcular los usuarios que se mostrarán en la página actual
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = users.slice(startIndex, endIndex);

  // Manejar cambio de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll al inicio de la cuadrícula
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Manejar cambio de elementos por página
  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1); // Resetear a la primera página
  };

  return (
    <div>
      {users.length > 0 ? (
        <>
          {/* Cuadrícula de tarjetas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedUsers.map((user) => (
              <div key={user.id} className="relative">
                <UserCard
                  user={user}
                  onCardClick={onCardClick}
                  onMenuClick={onMenuClick}
                  menuOpen={contextMenuUser?.id === user.id}
                  roleColors={roleColors}
                  getRoleLabel={getRoleLabel}
                />
                {/* Renderizar menú contextual si existe y está abierto para este usuario */}
                {contextMenuUser &&
                  contextMenuUser.id === user.id &&
                  renderContextMenu &&
                  renderContextMenu(user)}
              </div>
            ))}
          </div>

          {/* Paginación */}
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalItems={users.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              itemsPerPageOptions={[6, 12, 24, 36]} // Opciones específicas para la vista de cuadrícula
            />
          </div>
        </>
      ) : (
        // Mensaje cuando no hay usuarios
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      )}
    </div>
  );
};

export default UserGrid;
