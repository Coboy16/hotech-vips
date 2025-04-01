import React from "react";
import LicenseGrid from "./LicenseGrid"; // Reutiliza el componente que maneja el layout de cuadrícula
import { LicenseGridDisplayProps } from "../../types"; // Importa la interfaz de props

const LicenseGridDisplay: React.FC<LicenseGridDisplayProps> = ({
  licenses,
  isLoading,
  emptyMessage,
  contextMenu,
  onCardClick,
  onMenuClick,
  // Añade las props específicas del menú que LicenseGrid espera
  onRenew,
  onHistory,
  onDelete,
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

  // Pasamos las props al LicenseGrid existente
  // Nota: LicenseGrid ya maneja su propia paginación interna, así que le pasamos los datos completos
  // y él se encarga. Si quisiéramos paginación externa, modificaríamos LicenseGrid.
  // Por ahora, mantenemos la lógica de paginación DENTRO de LicenseGrid.
  return (
    <LicenseGrid
      licenses={licenses} // Pasamos todos los filtrados, LicenseGrid pagina internamente
      onCardClick={onCardClick}
      onMenuClick={onMenuClick}
      contextMenuLicense={contextMenu.contextMenuLicense}
      renderContextMenu={contextMenu.renderContextMenu}
      emptyMessage={emptyMessage}
      // Pasa las funciones del menú directamente a LicenseGrid -> LicenseCard
      onRenew={onRenew}
      onHistory={onHistory}
      onDelete={onDelete}
    />
    // Si LicenseGrid NO manejara paginación interna, la pondríamos aquí:
    /*
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
         // Mapear licenses (paginadas externamente) y renderizar LicenseCard
      </div>
      {pagination.totalItems > 0 && (
        <div className="mt-6">
          <Pagination
            currentPage={pagination.currentPage}
            totalItems={pagination.totalItems}
            itemsPerPage={pagination.itemsPerPage}
            onPageChange={pagination.onPageChange}
            onItemsPerPageChange={pagination.onItemsPerPageChange}
            itemsPerPageOptions={pagination.itemsPerPageOptions || [12, 24, 36]}
          />
        </div>
      )}
      {licenses.length === 0 && !isLoading && (
         <div className="bg-white rounded-lg shadow p-8 text-center">
             <p className="text-gray-500">{emptyMessage}</p>
         </div>
       )}
     </>
     */
  );
};

export default LicenseGridDisplay;
