import React from "react";
import SortableTable from "../../../../../components/common/table/SortableTable";
import Pagination from "../../../../../components/common/table/Pagination";
import { LicenseListProps } from "../../types";

const LicenseList: React.FC<LicenseListProps> = ({
  licenses,
  columns,
  isLoading,
  emptyMessage,
  pagination,
  sorting,
  onRowClick,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
        <p className="mt-4 text-gray-600">Cargando licencias...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <SortableTable
        data={licenses}
        columns={columns}
        keyExtractor={(license) => license.id}
        emptyMessage={emptyMessage}
        onRowClick={onRowClick}
        initialSortKey={sorting.sortKey}
        initialSortDirection={sorting.sortDirection}
        onSort={sorting.onSort}
        className="min-w-full divide-y divide-gray-200" // Asegúrate que la tabla ocupe el ancho
      />
      {/* Paginación */}
      {pagination.totalItems > 0 && (
        <div className="p-4 border-t border-gray-200">
          <Pagination
            currentPage={pagination.currentPage}
            totalItems={pagination.totalItems}
            itemsPerPage={pagination.itemsPerPage}
            onPageChange={pagination.onPageChange}
            onItemsPerPageChange={pagination.onItemsPerPageChange}
            itemsPerPageOptions={
              pagination.itemsPerPageOptions || [10, 25, 50, 100]
            }
          />
        </div>
      )}
    </div>
  );
};

export default LicenseList;
